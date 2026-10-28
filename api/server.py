"""
UMIPE Backend Server — api/server.py
=====================================
FastAPI HTTP Server exposing endpoints for medical scan preprocessing and inference.
"""

import os
import shutil
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import config
from api.inference import run_xray_pipeline

app = FastAPI(
    title="UMIPE Medical AI Preprocessing & Inference API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    metadata: dict | None = None
    prediction: dict | None = None
    model_name: str | None = None
    predicted_class: str | None = None
    class_probabilities: dict | None = None
    preprocessing_status: str = "ok"
    probabilities_are_calibrated: bool = False
    model_message: str | None = None


@app.get("/api/health")
def health():
    from api.inference import resolve_checkpoint

    checkpoint = resolve_checkpoint()
    return {
        "status": "ok",
        "device": str(config.DEVICE),
        "checkpoint": checkpoint,
        "checkpoint_present": checkpoint is not None,
        "uploads_dir": config.UPLOADS_DIR,
        "processed_dir": config.PROCESSED_DIR,
        "predictions_dir": config.PREDICTIONS_DIR,
    }


@app.post("/api/predict/xray", response_model=PredictResponse)
async def predict_xray(file: UploadFile = File(...)):
    filename = os.path.basename(file.filename or "upload")
    suffix = os.path.splitext(filename)[1].lower()
    if suffix not in (".dcm", ".dicom", ".png", ".jpg", ".jpeg"):
        raise HTTPException(status_code=400, detail="Unsupported file format")

    upload_path = os.path.join(config.UPLOADS_DIR, filename)
    with open(upload_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        result = run_xray_pipeline(upload_path, filename)
        return PredictResponse(**result)
    except (ValueError, FileNotFoundError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Processing failed: {exc}") from exc
