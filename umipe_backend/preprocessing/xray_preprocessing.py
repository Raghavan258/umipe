"""
UMIPE Backend - Chest X-Ray Preprocessing Pipeline
====================================================

Standard preprocessing chain used before feeding a chest X-ray into a
classification model (DenseNet-121 / CheXNet / TorchXRayVision).

Pipeline order (this order matters):
    1. Load & decode          (DICOM or PNG/JPG -> raw pixel array)
    2. Grayscale normalize    (handle photometric interpretation / channels)
    3. Resize                 (to model input size, e.g. 224x224)
    4. Denoise                (mild Gaussian/median filter - sensor noise)
    5. CLAHE contrast enhance (bring out lung/rib detail)
    6. Intensity normalize    (scale to [0,1] or z-score for the model)
    7. (train-time only) Augment (rotation/flip/brightness jitter)
    8. Tensor-ready output    (HWC float32 array, model-agnostic)

Each step is exposed as its own function so it can be called individually,
chained, and — critically — visualized at every stage (see demo/run_pipeline_demo.py).
"""

import numpy as np
import cv2

# ---------------------------------------------------------------------------
# Step 1: Load & decode
# ---------------------------------------------------------------------------
def load_image(path: str) -> np.ndarray:
    """
    Load an image from disk. Supports standard image formats (PNG/JPG).
    For DICOM (.dcm) files, use load_dicom() instead — the frontend's
    dicomUtils.js already extracts pixel data + metadata on the client side;
    this is the server-side equivalent for files that arrive as raw DICOM.
    """
    img = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    if img is None:
        raise FileNotFoundError(f"Could not read image at {path}")
    return img


def load_dicom(path: str) -> tuple[np.ndarray, dict]:
    """
    Load a DICOM file and return (pixel_array, metadata_dict).
    Requires pydicom (pip install pydicom).
    Applies rescale slope/intercept if present (CT) and windowing if present.
    """
    import pydicom
    ds = pydicom.dcmread(path)
    arr = ds.pixel_array.astype(np.float32)

    slope = float(getattr(ds, "RescaleSlope", 1))
    intercept = float(getattr(ds, "RescaleIntercept", 0))
    arr = arr * slope + intercept

    metadata = {
        "modality": getattr(ds, "Modality", None),
        "patient_id": getattr(ds, "PatientID", None),
        "rows": getattr(ds, "Rows", None),
        "columns": getattr(ds, "Columns", None),
        "window_center": getattr(ds, "WindowCenter", None),
        "window_width": getattr(ds, "WindowWidth", None),
    }
    return arr, metadata


# ---------------------------------------------------------------------------
# Step 2: Grayscale normalize
# ---------------------------------------------------------------------------
def to_grayscale(img: np.ndarray) -> np.ndarray:
    """Collapse to single-channel grayscale regardless of source format."""
    if img.ndim == 3:
        if img.shape[2] == 4:
            img = cv2.cvtColor(img, cv2.COLOR_BGRA2GRAY)
        elif img.shape[2] == 3:
            img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        else:
            img = img[:, :, 0]
    return img


# ---------------------------------------------------------------------------
# Step 3: Resize
# ---------------------------------------------------------------------------
def resize_image(img: np.ndarray, size: tuple[int, int] = (224, 224)) -> np.ndarray:
    """Resize to the model's expected input resolution."""
    return cv2.resize(img, size, interpolation=cv2.INTER_AREA)


# ---------------------------------------------------------------------------
# Step 4: Denoise
# ---------------------------------------------------------------------------
def denoise(img: np.ndarray, method: str = "gaussian") -> np.ndarray:
    """
    Mild denoising to remove sensor/quantization noise without
    destroying fine pathology detail (nodules, fine opacities).
    """
    if method == "gaussian":
        return cv2.GaussianBlur(img, (3, 3), 0)
    elif method == "median":
        return cv2.medianBlur(img, 3)
    elif method == "nlm":
        img8 = _to_uint8(img)
        return cv2.fastNlMeansDenoising(img8, h=7)
    raise ValueError(f"Unknown denoise method: {method}")


# ---------------------------------------------------------------------------
# Step 5: CLAHE contrast enhancement
# ---------------------------------------------------------------------------
def apply_clahe(img: np.ndarray, clip_limit: float = 2.0, tile_grid: tuple = (8, 8)) -> np.ndarray:
    """
    Contrast Limited Adaptive Histogram Equalization — the standard
    contrast-boosting step for chest X-rays. Pulls out rib/lung texture
    and subtle opacities that are washed out in raw exposures, without
    the noise amplification of global histogram equalization.
    """
    img8 = _to_uint8(img)
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid)
    return clahe.apply(img8)


# ---------------------------------------------------------------------------
# Step 6: Intensity normalize
# ---------------------------------------------------------------------------
def normalize(img: np.ndarray, mode: str = "minmax") -> np.ndarray:
    """
    Scale pixel intensities into a model-ready range.
      - 'minmax'  -> [0, 1] float32   (use for models trained from scratch)
      - 'zscore'  -> mean 0, std 1    (use for ImageNet-pretrained backbones)
    """
    img = img.astype(np.float32)
    if mode == "minmax":
        lo, hi = img.min(), img.max()
        return (img - lo) / (hi - lo + 1e-8)
    elif mode == "zscore":
        return (img - img.mean()) / (img.std() + 1e-8)
    raise ValueError(f"Unknown normalize mode: {mode}")


# ---------------------------------------------------------------------------
# Step 7 (train-time only): Augmentation
# ---------------------------------------------------------------------------
def augment(img: np.ndarray, rng: np.random.Generator = None) -> np.ndarray:
    """
    Light, clinically-safe augmentation. Avoid heavy geometric distortion —
    it can invalidate pathology location/shape. Used ONLY during training,
    never at inference/test time.
    """
    rng = rng or np.random.default_rng()

    # small rotation (+/- 7 degrees)
    angle = rng.uniform(-7, 7)
    h, w = img.shape[:2]
    M = cv2.getRotationMatrix2D((w / 2, h / 2), angle, 1.0)
    img = cv2.warpAffine(img, M, (w, h), borderMode=cv2.BORDER_REFLECT)

    # horizontal flip (50% chance) — safe for frontal chest X-rays
    if rng.random() < 0.5:
        img = cv2.flip(img, 1)

    # brightness/contrast jitter
    alpha = rng.uniform(0.9, 1.1)   # contrast
    beta = rng.uniform(-0.05, 0.05)  # brightness
    img = np.clip(img * alpha + beta, 0, 1 if img.max() <= 1.0 else 255)

    return img


# ---------------------------------------------------------------------------
# Step 8: Tensor-ready output
# ---------------------------------------------------------------------------
def to_model_input(img: np.ndarray, channels: int = 3) -> np.ndarray:
    """
    Final step: ensure correct channel count (most pretrained CNNs like
    DenseNet-121 expect 3 channels even for grayscale medical images)
    and float32 dtype, shape (H, W, C).
    """
    if img.ndim == 2 and channels == 3:
        img = np.stack([img] * 3, axis=-1)
    return img.astype(np.float32)


# ---------------------------------------------------------------------------
# Convenience: run the full inference-time pipeline in one call
# ---------------------------------------------------------------------------
def preprocess_for_inference(path: str, size=(224, 224)) -> np.ndarray:
    img = load_image(path)
    img = to_grayscale(img)
    img = resize_image(img, size)
    img = denoise(img)
    img = apply_clahe(img)
    img = normalize(img, mode="minmax")
    img = to_model_input(img)
    return img


def _to_uint8(img: np.ndarray) -> np.ndarray:
    img = img.astype(np.float32)
    if img.max() <= 1.0:
        img = img * 255.0
    return np.clip(img, 0, 255).astype(np.uint8)
