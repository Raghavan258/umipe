"""
UMIPE Backend API — serves the preprocessing + inference pipeline over HTTP
so the React frontend (UploadSection.jsx) can call it instead of only
doing client-side DICOM parsing.

Run:
    pip install fastapi uvicorn python-multipart pydicom torch torchvision --break-system-packages
    uvicorn api.server:app --reload --port 8000

Endpoints:
    POST /api/predict/xray
        multipart/form-data, field name "file" -> a .dcm/.dicom/.png/.jpg chest X-ray
        returns JSON: { modality, predictions: [{label, probability}, ...],
                         preprocessing_steps: [{step, image_base64}, ...] }

    GET  /api/health
        returns {"status": "ok"}

Notes:
    - If no trained checkpoint exists yet at CHECKPOINT_PATH, this falls back
      to returning the preprocessing steps + placeholder predictions so the
      frontend integration can be built and tested before training finishes.
    - CORS is open here for local dev — restrict allow_origins in production.
"""

import os
import io
import base64
import tempfile

import numpy as np
import cv2
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from preprocessing.xray_preprocessing import (
    load_image, to_grayscale, resize_image, denoise,
    apply_clahe, normalize, to_model_input, _to_uint8,
)

CHECKPOINT_PATH = os.environ.get("UMIPE_CHECKPOINT", "training/checkpoints/best_model.pt")

app = FastAPI(title="UMIPE Backend API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this to your frontend origin in production
    allow_methods=["*"],
    allow_headers=["*"],
)

_model = None
_label_cols = None
_device = None


def _try_load_model():
    """Lazy-load the trained model if a checkpoint exists. Returns True/False."""
    global _model, _label_cols, _device
    if _model is not None:
        return True
    if not os.path.exists(CHECKPOINT_PATH):
        return False
    try:
        import torch
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "training"))
        from train_xray import build_model

        _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        ckpt = torch.load(CHECKPOINT_PATH, map_location=_device)
        _label_cols = ckpt["label_cols"]
        _model = build_model(len(_label_cols)).to(_device)
        _model.load_state_dict(ckpt["model_state"])
        _model.eval()
        return True
    except Exception as e:
        print(f"Could not load model checkpoint: {e}")
        return False


class PredictionItem(BaseModel):
    label: str
    probability: float


class PreprocessStep(BaseModel):
    step: str
    image_base64: str


class PredictResponse(BaseModel):
    modality: str
    model_loaded: bool
    predictions: list[PredictionItem]
    preprocessing_steps: list[PreprocessStep]


@app.get("/api/health")
def health():
    return {"status": "ok"}


def _encode_png(img: np.ndarray) -> str:
    viewable = _to_uint8(img) if img.dtype != np.uint8 else img
    success, buf = cv2.imencode(".png", viewable)
    if not success:
        raise RuntimeError("PNG encoding failed")
    return base64.b64encode(buf.tobytes()).decode("utf-8")


@app.post("/api/predict/xray", response_model=PredictResponse)
async def predict_xray(file: UploadFile = File(...)):
    name = file.name if hasattr(file, "name") else file.filename
    suffix = os.path.splitext(file.filename)[1].lower()
    if suffix not in (".dcm", ".dicom", ".png", ".jpg", ".jpeg"):
        raise HTTPException(status_code=400, detail="Unsupported file type")

    raw_bytes = await file.read()

    # Write to a temp file since our loaders work off disk paths
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(raw_bytes)
        tmp_path = tmp.name

    try:
        steps = []

        if suffix in (".dcm", ".dicom"):
            from preprocessing.xray_preprocessing import load_dicom
            img, _meta = load_dicom(tmp_path)
        else:
            img = load_image(tmp_path)

        steps.append(PreprocessStep(step="raw_input", image_base64=_encode_png(img)))

        img = to_grayscale(img)
        steps.append(PreprocessStep(step="grayscale", image_base64=_encode_png(img)))

        img = resize_image(img, (224, 224))
        steps.append(PreprocessStep(step="resized", image_base64=_encode_png(img)))

        img = denoise(img)
        steps.append(PreprocessStep(step="denoised", image_base64=_encode_png(img)))

        img = apply_clahe(img)
        steps.append(PreprocessStep(step="clahe_enhanced", image_base64=_encode_png(img)))

        img_norm = normalize(img, mode="minmax")
        steps.append(PreprocessStep(step="normalized", image_base64=_encode_png(img_norm)))

        model_input = to_model_input(img_norm, channels=3)

        model_loaded = _try_load_model()
        if model_loaded:
            import torch
            tensor = torch.from_numpy(np.transpose(model_input, (2, 0, 1))).unsqueeze(0).float().to(_device)
            with torch.no_grad():
                probs = torch.sigmoid(_model(tensor)).cpu().numpy()[0]
            predictions = [
                PredictionItem(label=label, probability=float(p))
                for label, p in sorted(zip(_label_cols, probs), key=lambda x: -x[1])
            ]
        else:
            # No trained checkpoint yet — placeholder so the frontend can be
            # wired up and tested end-to-end before training is finished.
            predictions = [
                PredictionItem(label="Model not trained yet", probability=0.0)
            ]

        return PredictResponse(
            modality="XRAY",
            model_loaded=model_loaded,
            predictions=predictions,
            preprocessing_steps=steps,
        )
    finally:
        os.unlink(tmp_path)
