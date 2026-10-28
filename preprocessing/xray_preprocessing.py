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
"""

import os

import numpy as np
import cv2

import config


# ---------------------------------------------------------------------------
# Step 1: Load & decode
# ---------------------------------------------------------------------------
def load_image(path: str) -> np.ndarray:
    """
    Load an image from disk. Supports standard image formats (PNG/JPG).
    For DICOM (.dcm) files, use load_dicom().
    """
    img = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    if img is None:
        raise FileNotFoundError(f"Could not read image at {path}")
    return img


def load_dicom(path: str) -> tuple[np.ndarray, dict]:
    """
    Load a DICOM file and return (pixel_array, metadata_dict).
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
    destroying fine pathology detail.
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
    Contrast Limited Adaptive Histogram Equalization — contrast-boosting
    step for chest X-rays.
    """
    img8 = _to_uint8(img)
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid)
    return clahe.apply(img8)


# ---------------------------------------------------------------------------
# Step 6: Intensity normalize
# ---------------------------------------------------------------------------
def normalize(img: np.ndarray, mode: str = "minmax") -> np.ndarray:
    """Scale pixel intensities into a model-ready range."""
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
    """Clinically-safe light augmentation."""
    rng = rng or np.random.default_rng()

    angle = rng.uniform(-7, 7)
    h, w = img.shape[:2]
    M = cv2.getRotationMatrix2D((w / 2, h / 2), angle, 1.0)
    img = cv2.warpAffine(img, M, (w, h), borderMode=cv2.BORDER_REFLECT)

    if rng.random() < 0.5:
        img = cv2.flip(img, 1)

    alpha = rng.uniform(0.9, 1.1)
    beta = rng.uniform(-0.05, 0.05)
    img = np.clip(img * alpha + beta, 0, 1 if img.max() <= 1.0 else 255)

    return img


# ---------------------------------------------------------------------------
# Step 8: Tensor-ready output
# ---------------------------------------------------------------------------
def to_model_input(img: np.ndarray, channels: int = 3) -> np.ndarray:
    """Ensure 3 channels and float32 dtype, shape (H, W, C)."""
    if img.ndim == 2 and channels == 3:
        img = np.stack([img] * 3, axis=-1)
    return img.astype(np.float32)


def preprocess_for_inference(path: str, size=None) -> np.ndarray:
    """Canonical model input: resize and ImageNet normalization, CHW float32.

    CLAHE and denoising stay available as separate functions. They are not
    part of the trained baseline, so inference does not apply them.
    """
    rgb, _metadata = load_rgb_uint8(path)
    return normalize_rgb_uint8(rgb, image_size=size or config.IMAGE_SIZE)


def load_rgb_uint8(path: str) -> tuple[np.ndarray, dict]:
    """Load PNG, JPEG, or DICOM as RGB uint8 plus source metadata."""
    if not os.path.isfile(path):
        raise FileNotFoundError(f"Image not found: {path}")
    suffix = os.path.splitext(path)[1].lower()
    if suffix in {".dcm", ".dicom"}:
        gray, metadata = _dicom_to_uint8(path)
        rgb = np.stack([gray, gray, gray], axis=-1)
        return rgb, metadata
    if suffix not in {".png", ".jpg", ".jpeg"}:
        raise ValueError(f"Unsupported image type: {suffix or 'unknown'}")
    rgb = _read_raster_rgb(path)
    metadata = {"filename": os.path.basename(path), "source_format": suffix}
    return rgb, metadata


def normalize_rgb_uint8(
    image: np.ndarray,
    image_size: tuple[int, int] = config.IMAGE_SIZE,
    mean: tuple[float, float, float] = config.IMAGENET_MEAN,
    std: tuple[float, float, float] = config.IMAGENET_STD,
) -> np.ndarray:
    """Resize an RGB uint8 image and apply ImageNet normalization. Returns CHW."""
    if image.ndim != 3 or image.shape[2] != 3:
        raise ValueError("Expected an RGB image with shape (H, W, 3)")
    height, width = image_size
    resized = cv2.resize(image, (width, height), interpolation=cv2.INTER_AREA)
    array = resized.astype(np.float32) / 255.0
    array = (array - np.array(mean, dtype=np.float32)) / np.array(std, dtype=np.float32)
    return np.transpose(array, (2, 0, 1))


def resize_rgb(image: np.ndarray, image_size: tuple[int, int] = config.IMAGE_SIZE) -> np.ndarray:
    """Resize RGB uint8 to the model spatial size."""
    height, width = image_size
    return cv2.resize(image, (width, height), interpolation=cv2.INTER_AREA)


def _read_raster_rgb(path: str) -> np.ndarray:
    image = cv2.imread(path, cv2.IMREAD_UNCHANGED)
    if image is None:
        raise ValueError(f"Could not decode image: {path}")
    if image.ndim == 2:
        image = np.stack([image, image, image], axis=-1)
    elif image.shape[2] == 4:
        image = cv2.cvtColor(image, cv2.COLOR_BGRA2RGB)
    else:
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    if image.dtype != np.uint8:
        image = _scale_array_to_uint8(image)
    return image


def _dicom_to_uint8(path: str) -> tuple[np.ndarray, dict]:
    try:
        import pydicom
    except ImportError as exc:
        raise ValueError("DICOM support requires pydicom") from exc
    dataset = pydicom.dcmread(path)
    pixels = dataset.pixel_array.astype(np.float32)
    slope = float(getattr(dataset, "RescaleSlope", 1) or 1)
    intercept = float(getattr(dataset, "RescaleIntercept", 0) or 0)
    pixels = pixels * slope + intercept
    photometric = str(getattr(dataset, "PhotometricInterpretation", "MONOCHROME2"))
    if photometric == "MONOCHROME1":
        pixels = pixels.max() - pixels
    pixels = _apply_window(pixels, dataset)
    metadata = {
        "filename": os.path.basename(path),
        "source_format": os.path.splitext(path)[1].lower(),
        "modality": _json_safe(getattr(dataset, "Modality", None)),
        "patient_id": _json_safe(getattr(dataset, "PatientID", None)),
        "rows": _json_safe(getattr(dataset, "Rows", None)),
        "columns": _json_safe(getattr(dataset, "Columns", None)),
        "photometric_interpretation": photometric,
        "window_center": _json_safe(getattr(dataset, "WindowCenter", None)),
        "window_width": _json_safe(getattr(dataset, "WindowWidth", None)),
        "rescale_slope": slope,
        "rescale_intercept": intercept,
    }
    return _scale_array_to_uint8(pixels), metadata


def _apply_window(pixels: np.ndarray, dataset) -> np.ndarray:
    center = getattr(dataset, "WindowCenter", None)
    width = getattr(dataset, "WindowWidth", None)
    if center is None or width is None:
        low, high = np.percentile(pixels, [0.5, 99.5])
        return np.clip(pixels, low, high)
    center_value = float(np.array(center).reshape(-1)[0])
    width_value = float(np.array(width).reshape(-1)[0])
    low = center_value - (width_value / 2.0)
    high = center_value + (width_value / 2.0)
    return np.clip(pixels, low, high)


def _scale_array_to_uint8(image: np.ndarray) -> np.ndarray:
    image = image.astype(np.float32)
    low, high = float(image.min()), float(image.max())
    scaled = (image - low) / (high - low + 1e-8)
    return np.clip(scaled * 255.0, 0, 255).astype(np.uint8)


def _json_safe(value):
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    if isinstance(value, (list, tuple)):
        return [_json_safe(item) for item in value]
    try:
        return [float(item) for item in value]
    except (TypeError, ValueError):
        return str(value)


def _to_uint8(img: np.ndarray) -> np.ndarray:
    img = img.astype(np.float32)
    if img.max() <= 1.0:
        img = img * 255.0
    return np.clip(img, 0, 255).astype(np.uint8)
