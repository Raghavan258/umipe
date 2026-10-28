"""Tests for the chest X-ray baseline."""

import io
import os

import numpy as np
import pytest
import torch
from fastapi.testclient import TestClient
from PIL import Image

import config
from api.inference import load_xray_model, reset_model_cache
from api.server import app
from preprocessing.xray_preprocessing import load_rgb_uint8, preprocess_for_inference
from training.dataset import ChestXrayDataset
from training.metrics import classification_metrics
from training.models import build_model
from training.splits import build_manifest, patient_id_from_name


@pytest.fixture
def client(monkeypatch, tmp_path):
    uploads = tmp_path / "uploads"
    processed = tmp_path / "processed"
    predictions = tmp_path / "predictions"
    experiment = tmp_path / "experiment"
    for directory in (uploads, processed, predictions, experiment):
        directory.mkdir()
    monkeypatch.setattr(config, "UPLOADS_DIR", str(uploads))
    monkeypatch.setattr(config, "PROCESSED_DIR", str(processed))
    monkeypatch.setattr(config, "PREDICTIONS_DIR", str(predictions))
    monkeypatch.setattr(config, "EXPERIMENT_DIR", str(experiment))
    monkeypatch.setattr(config, "MODEL_SAVE_PATH", str(tmp_path / "missing.pth"))
    reset_model_cache()
    return TestClient(app)


def test_class_mapping_is_canonical():
    assert config.CLASS_NAMES == ["NORMAL", "PNEUMONIA"]
    assert config.CLASS_TO_INDEX["NORMAL"] == 0
    assert config.CLASS_TO_INDEX["PNEUMONIA"] == 1


def test_softmax_outputs_are_a_probability_distribution():
    model = build_model("mobilenet_v3_small", config.NUM_CLASSES, pretrained=False)
    model.eval()
    images = torch.rand(2, 3, *config.IMAGE_SIZE)
    with torch.no_grad():
        probabilities = torch.softmax(model(images), dim=1)
    assert probabilities.shape == (2, 2)
    assert torch.allclose(probabilities.sum(dim=1), torch.ones(2), atol=1e-5)


def test_missing_checkpoint_does_not_predict(tmp_path, monkeypatch):
    monkeypatch.setattr(config, "MODEL_SAVE_PATH", str(tmp_path / "missing.pth"))
    monkeypatch.setattr(config, "EXPERIMENT_DIR", str(tmp_path))
    reset_model_cache()
    loaded, model, checkpoint = load_xray_model()
    assert loaded is False
    assert model is None
    assert checkpoint is None


def test_incompatible_checkpoint_does_not_predict(tmp_path, monkeypatch):
    path = tmp_path / "bad.pth"
    torch.save({"class_names": ["A", "B"], "architecture": "mobilenet_v3_small", "model_state": {}}, path)
    monkeypatch.setattr(config, "MODEL_SAVE_PATH", str(path))
    monkeypatch.setattr(config, "EXPERIMENT_DIR", str(tmp_path / "empty"))
    os.makedirs(config.EXPERIMENT_DIR, exist_ok=True)
    reset_model_cache()
    loaded, _model, _checkpoint = load_xray_model()
    assert loaded is False


def test_training_and_inference_preprocessing_match(tmp_path):
    image = np.random.randint(0, 255, (90, 70, 3), dtype=np.uint8)
    path = tmp_path / "sample.jpg"
    Image.fromarray(image).save(path)
    dataset = ChestXrayDataset(str(tmp_path), [{"relative_path": "sample.jpg", "label": 0}], augment=False)
    tensor, label = dataset[0]
    inferred = preprocess_for_inference(str(path))
    assert label == 0
    assert tensor.shape == inferred.shape == (3, *config.IMAGE_SIZE)
    assert np.allclose(tensor.numpy(), inferred, atol=1e-5)


def test_png_and_jpeg_load_as_rgb(tmp_path):
    for name, fmt in (("scan.png", "PNG"), ("scan.jpg", "JPEG")):
        path = tmp_path / name
        Image.fromarray(np.zeros((12, 10, 3), dtype=np.uint8)).save(path, format=fmt)
        rgb, metadata = load_rgb_uint8(str(path))
        assert rgb.shape == (12, 10, 3)
        assert metadata["source_format"] in {".png", ".jpg"}


def test_invalid_upload_is_rejected(client):
    text = client.post("/api/predict/xray", files={"file": ("note.txt", b"hello", "text/plain")})
    corrupt = client.post("/api/predict/xray", files={"file": ("bad.jpg", b"not-an-image", "image/jpeg")})
    assert text.status_code == 400
    assert corrupt.status_code == 400


def test_api_reports_missing_model_without_a_fake_score(client):
    buffer = io.BytesIO()
    Image.fromarray(np.zeros((16, 16, 3), dtype=np.uint8)).save(buffer, format="PNG")
    response = client.post(
        "/api/predict/xray",
        files={"file": ("xray.png", buffer.getvalue(), "image/png")},
    )
    body = response.json()
    assert response.status_code == 200
    assert body["model_loaded"] is False
    assert body["predictions"] == []
    assert body["predicted_class"] is None
    assert body["probabilities_are_calibrated"] is False
    assert body["preprocessing_status"] == "ok"
    assert body["preprocessing_steps"]
    assert "Model not trained yet" not in body["model_message"]


def test_metric_report_uses_the_canonical_labels():
    labels = [0, 0, 1, 1]
    predictions = [0, 1, 1, 1]
    probabilities = np.array([[0.8, 0.2], [0.4, 0.6], [0.3, 0.7], [0.1, 0.9]])
    metrics = classification_metrics(labels, predictions, probabilities, config.CLASS_NAMES)
    assert metrics["accuracy"] == pytest.approx(0.75)
    assert metrics["per_class"]["NORMAL"]["support"] == 2
    assert metrics["per_class"]["PNEUMONIA"]["support"] == 2
    assert metrics["confusion_matrix"] == [[1, 1], [0, 2]]
    assert 0.0 <= metrics["roc_auc_pneumonia"] <= 1.0


def test_manifest_keeps_test_patients_out_of_train(tmp_path, monkeypatch):
    monkeypatch.setattr(config, "VAL_FRACTION", 0.5)
    _write_split_image(tmp_path, "train", "NORMAL", "IM-0001-0001.jpeg")
    _write_split_image(tmp_path, "train", "NORMAL", "IM-0002-0001.jpeg")
    _write_split_image(tmp_path, "train", "PNEUMONIA", "person10_bacteria_1.jpeg")
    _write_split_image(tmp_path, "train", "PNEUMONIA", "person11_bacteria_1.jpeg")
    _write_split_image(tmp_path, "train", "PNEUMONIA", "person12_virus_1.jpeg")
    _write_split_image(tmp_path, "train", "NORMAL", "IM-0003-0001.jpeg")
    _write_split_image(tmp_path, "test", "NORMAL", "IM-0001-0002.jpeg")
    _write_split_image(tmp_path, "test", "PNEUMONIA", "person99_bacteria_1.jpeg")
    _write_split_image(tmp_path, "val", "NORMAL", "IM-9000-0001.jpeg")
    _write_split_image(tmp_path, "val", "PNEUMONIA", "person80_virus_1.jpeg")
    manifest = build_manifest(str(tmp_path))
    train_patients = {row["patient_id"] for row in manifest["records"]["train"]}
    val_patients = {row["patient_id"] for row in manifest["records"]["val"]}
    assert "im-0001" not in train_patients | val_patients
    assert manifest["class_names"] == ["NORMAL", "PNEUMONIA"]
    assert patient_id_from_name("person10_bacteria_1.jpeg") == "person10"


def _write_split_image(root, split, class_name, filename):
    folder = root / split / class_name
    folder.mkdir(parents=True, exist_ok=True)
    image = np.random.randint(0, 255, (8, 8, 3), dtype=np.uint8)
    Image.fromarray(image).save(folder / filename)
