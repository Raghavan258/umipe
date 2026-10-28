"""Shared configuration for the chest X-ray baseline."""

import os

import torch

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATASET_DIR = os.environ.get(
    "UMIPE_DATASET_DIR",
    r"C:\Users\hp\Downloads\archive\chest_xray",
)

CLASS_NAMES = ["NORMAL", "PNEUMONIA"]
CLASS_TO_INDEX = {name: index for index, name in enumerate(CLASS_NAMES)}
NUM_CLASSES = len(CLASS_NAMES)

MODEL_ARCH = os.environ.get("UMIPE_MODEL", "mobilenet_v3_small")
IMAGE_SIZE = (224, 224)
IMAGENET_MEAN = (0.485, 0.456, 0.406)
IMAGENET_STD = (0.229, 0.224, 0.225)
BATCH_SIZE = int(os.environ.get("UMIPE_BATCH_SIZE", "32"))
NUM_EPOCHS = int(os.environ.get("UMIPE_EPOCHS", "5"))
LEARNING_RATE = float(os.environ.get("UMIPE_LR", "0.001"))
WEIGHT_DECAY = 1e-5
VAL_FRACTION = 0.15
SELECTION_METRIC = "val_macro_f1"
EARLY_STOP_PATIENCE = 2
NUM_WORKERS = 0
SEED = 42
PREDICTION_THRESHOLD = 0.5

DEVICE = torch.device(
    os.environ.get("UMIPE_DEVICE", "cuda" if torch.cuda.is_available() else "cpu")
)

MODEL_DIR = os.path.join(BASE_DIR, "models", "xray")
MODEL_SAVE_PATH = os.path.join(MODEL_DIR, "mobilenet_v3_small.pth")
OUTPUT_DIR = os.path.join(BASE_DIR, "outputs")
EXPERIMENT_DIR = os.path.join(OUTPUT_DIR, "experiments", "xray_baseline")
LATEST_CHECKPOINT_PATH = os.path.join(EXPERIMENT_DIR, "latest_checkpoint.pth")
TRAINING_OUTPUT_DIR = os.path.join(OUTPUT_DIR, "training")
EVALUATION_OUTPUT_DIR = os.path.join(OUTPUT_DIR, "evaluation")
EVAL_RESULTS_DIR = os.path.join(BASE_DIR, "evaluation", "results")
UPLOADS_DIR = os.path.join(OUTPUT_DIR, "uploads")
PROCESSED_DIR = os.path.join(OUTPUT_DIR, "processed")
PREDICTIONS_DIR = os.path.join(OUTPUT_DIR, "predictions")

for _directory in (
    MODEL_DIR,
    OUTPUT_DIR,
    EXPERIMENT_DIR,
    TRAINING_OUTPUT_DIR,
    EVALUATION_OUTPUT_DIR,
    EVAL_RESULTS_DIR,
    UPLOADS_DIR,
    PROCESSED_DIR,
    PREDICTIONS_DIR,
):
    os.makedirs(_directory, exist_ok=True)
