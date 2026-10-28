"""Checkpoint loading and chest X-ray inference."""

import base64
import json
import os

import cv2
import numpy as np
import torch

import config
from preprocessing.xray_preprocessing import (
    load_rgb_uint8,
    normalize_rgb_uint8,
    resize_rgb,
    to_grayscale,
)
from training.models import build_model

_model = None
_checkpoint = None
_load_error = None

_UNAVAILABLE = (
    "No compatible chest X-ray checkpoint is available. No prediction was produced."
)


def reset_model_cache() -> None:
    """Clear the cached model so tests can change checkpoints."""
    global _model, _checkpoint, _load_error
    _model = None
    _checkpoint = None
    _load_error = None


def resolve_checkpoint() -> str | None:
    """Return the configured checkpoint, then the experiment copy."""
    candidates = (
        config.MODEL_SAVE_PATH,
        os.path.join(config.EXPERIMENT_DIR, "best_checkpoint.pth"),
    )
    for path in candidates:
        if path and os.path.isfile(path):
            return path
    return None


def load_xray_model():
    """Load the saved two-class checkpoint. Failures stay non-predictive."""
    global _model, _checkpoint, _load_error
    if _model is not None:
        return True, _model, _checkpoint
    path = resolve_checkpoint()
    if path is None:
        _load_error = f"Checkpoint not found. Expected {config.MODEL_SAVE_PATH}."
        return False, None, None
    try:
        checkpoint = _read_checkpoint(path)
        model = build_model(checkpoint["architecture"], len(checkpoint["class_names"]), pretrained=False)
        model.load_state_dict(checkpoint["model_state"])
        model.to(config.DEVICE).eval()
    except (OSError, RuntimeError, ValueError, KeyError) as exc:
        _load_error = f"Incompatible checkpoint at {path}: {exc}"
        return False, None, None
    _model = model
    _checkpoint = checkpoint
    _load_error = None
    return True, model, checkpoint


def run_xray_pipeline(file_path: str, filename: str) -> dict:
    """Preprocess one chest X-ray and score it when a checkpoint is compatible."""
    rgb, metadata = load_rgb_uint8(file_path)
    steps = _preview_steps(rgb)
    processed_path = _save_processed(rgb, filename)
    prediction = _predict(rgb)
    payload = _response(filename, metadata, processed_path, steps, prediction)
    _write_prediction(filename, payload)
    return payload


def _read_checkpoint(path: str) -> dict:
    checkpoint = torch.load(path, map_location=config.DEVICE, weights_only=False)
    if checkpoint.get("class_names") != list(config.CLASS_NAMES):
        raise ValueError("Checkpoint class_names do not match the canonical mapping")
    saved_mean = checkpoint.get("normalization", {}).get("mean")
    saved_std = checkpoint.get("normalization", {}).get("std")
    if saved_mean is None or not np.allclose(saved_mean, config.IMAGENET_MEAN):
        raise ValueError("Checkpoint normalization does not match ImageNet settings")
    if saved_std is None or not np.allclose(saved_std, config.IMAGENET_STD):
        raise ValueError("Checkpoint normalization does not match ImageNet settings")
    return checkpoint


def _predict(rgb: np.ndarray) -> dict:
    loaded, model, checkpoint = load_xray_model()
    if not loaded:
        return _unavailable_prediction()
    tensor = torch.from_numpy(normalize_rgb_uint8(rgb)).unsqueeze(0).to(config.DEVICE)
    with torch.no_grad():
        probabilities = torch.softmax(model(tensor), dim=1)[0].cpu().numpy()
    return _prediction_payload(checkpoint, probabilities)


def _unavailable_prediction() -> dict:
    return {
        "model_loaded": False,
        "model_name": None,
        "predicted_class": None,
        "predictions": [],
        "class_probabilities": {},
        "model_message": _load_error or _UNAVAILABLE,
        "probabilities_are_calibrated": False,
    }


def _prediction_payload(checkpoint: dict, probabilities: np.ndarray) -> dict:
    class_names = list(checkpoint["class_names"])
    pairs = [
        {"label": name, "probability": float(probabilities[index])}
        for index, name in enumerate(class_names)
    ]
    winner = max(pairs, key=lambda item: item["probability"])
    return {
        "model_loaded": True,
        "model_name": checkpoint.get("architecture"),
        "predicted_class": winner["label"],
        "predictions": pairs,
        "class_probabilities": {item["label"]: item["probability"] for item in pairs},
        "model_message": "Uncalibrated softmax probabilities from the research baseline.",
        "probabilities_are_calibrated": False,
    }


def _preview_steps(rgb: np.ndarray) -> list[dict]:
    gray = to_grayscale(rgb)
    resized = resize_rgb(rgb)
    return [
        {"step": "raw_input", "image_base64": _encode_png(rgb)},
        {"step": "grayscale", "image_base64": _encode_png(gray)},
        {"step": "resized", "image_base64": _encode_png(resized)},
    ]


def _response(filename, metadata, processed_path, steps, prediction) -> dict:
    stored = {
        "modality": "XRAY",
        "model_loaded": prediction["model_loaded"],
        "predictions": prediction["predictions"],
        "predicted_class": prediction["predicted_class"],
        "model_name": prediction["model_name"],
    }
    return {
        "modality": "XRAY",
        "model_loaded": prediction["model_loaded"],
        "model_name": prediction["model_name"],
        "predicted_class": prediction["predicted_class"],
        "predictions": prediction["predictions"],
        "class_probabilities": prediction["class_probabilities"],
        "preprocessing_steps": steps,
        "preprocessing_status": "ok",
        "probabilities_are_calibrated": False,
        "model_message": prediction["model_message"],
        "metadata": {
            "filename": os.path.basename(filename),
            "processed_image_path": processed_path,
            **metadata,
        },
        "prediction": stored,
    }


def _save_processed(rgb: np.ndarray, filename: str) -> str:
    stem = os.path.splitext(os.path.basename(filename))[0]
    path = os.path.join(config.PROCESSED_DIR, f"{stem}_processed.png")
    bgr = cv2.cvtColor(resize_rgb(rgb), cv2.COLOR_RGB2BGR)
    if not cv2.imwrite(path, bgr):
        raise RuntimeError(f"Could not write processed image: {path}")
    return path


def _write_prediction(filename: str, payload: dict) -> None:
    stem = os.path.splitext(os.path.basename(filename))[0]
    path = os.path.join(config.PREDICTIONS_DIR, f"{stem}_prediction.json")
    stored = {
        "modality": payload["modality"],
        "model_loaded": payload["model_loaded"],
        "model_name": payload["model_name"],
        "predicted_class": payload["predicted_class"],
        "predictions": payload["predictions"],
        "model_message": payload["model_message"],
        "probabilities_are_calibrated": False,
    }
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(stored, handle, indent=2)


def _encode_png(image: np.ndarray) -> str:
    view = image
    if image.ndim == 2:
        view = image
    elif image.shape[2] == 3:
        view = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    success, buffer = cv2.imencode(".png", view)
    if not success:
        raise RuntimeError("PNG encoding failed")
    return base64.b64encode(buffer.tobytes()).decode("utf-8")
