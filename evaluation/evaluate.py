"""Evaluate the selected chest X-ray checkpoint once on the held-out test set."""

import argparse
import json
import os
import time

import numpy as np
import torch
from torch.amp import autocast
from tqdm import tqdm

import config
from training.engine import use_cuda_amp
from training.metrics import classification_metrics
from training.models import build_model
from training.plots import save_confusion_matrix, save_roc_curve
from training.splits import load_or_create_manifest
from training.dataset import make_dataloader

_LIMITATIONS = [
    "This is a research prototype, not a clinically validated diagnostic system.",
    "Test performance on this dataset does not establish safety or generalization to hospitals or other populations.",
    "The Kermany chest X-ray collection is pediatric and class-imbalanced, so scores can shift on adult or differently labeled data.",
    "Patient identifiers overlap the official train and test folders. Overlapping patients were removed from training, but the test distribution still reflects that source.",
    "Class probabilities are softmax scores. They were not calibrated.",
    "JPEG training images and DICOM uploads can differ in intensity mapping.",
]


def parse_args() -> argparse.Namespace:
    """Evaluation command-line options."""
    parser = argparse.ArgumentParser(description="Evaluate the UMIPE chest X-ray baseline")
    parser.add_argument("--checkpoint", type=str, default=config.MODEL_SAVE_PATH)
    parser.add_argument("--data-dir", type=str, default=config.DATASET_DIR)
    return parser.parse_args()


def main() -> None:
    """Evaluate the frozen checkpoint and write metrics plus plots."""
    args = parse_args()
    report = evaluate(args.checkpoint, args.data_dir, config.EXPERIMENT_DIR)
    print(json.dumps({key: report[key] for key in ("accuracy", "macro_f1", "roc_auc_pneumonia")}, indent=2))


def evaluate(checkpoint_path: str, dataset_dir: str, output_dir: str) -> dict:
    """Run one test-set evaluation and save the report."""
    if not os.path.exists(checkpoint_path):
        raise FileNotFoundError(f"Checkpoint not found: {checkpoint_path}")
    checkpoint = torch.load(checkpoint_path, map_location=config.DEVICE, weights_only=False)
    _require_compatible(checkpoint)
    model = build_model(checkpoint["architecture"], len(checkpoint["class_names"]), pretrained=False)
    model.load_state_dict(checkpoint["model_state"])
    model = model.to(config.DEVICE)
    model.eval()
    manifest = load_or_create_manifest(dataset_dir, output_dir)
    loader = make_dataloader(dataset_dir, manifest["records"]["test"], config.BATCH_SIZE, False, False)
    labels, predictions, probabilities, latency_ms = _collect(model, loader)
    metrics = classification_metrics(labels, predictions, probabilities, checkpoint["class_names"])
    metrics.update(_context(checkpoint_path, checkpoint, latency_ms, manifest, len(labels)))
    os.makedirs(output_dir, exist_ok=True)
    _write_reports(output_dir, metrics, labels, probabilities)
    return metrics


def _collect(model, loader) -> tuple[np.ndarray, np.ndarray, np.ndarray, float]:
    labels, predictions, probabilities = [], [], []
    amp = use_cuda_amp(config.DEVICE)
    started = time.perf_counter()
    with torch.no_grad():
        for images, batch_labels in tqdm(loader, desc="Test", leave=False):
            images = images.to(config.DEVICE)
            with autocast(device_type=config.DEVICE.type, enabled=amp):
                logits = model(images)
            probs = torch.softmax(logits, dim=1).cpu().numpy()
            labels.extend(batch_labels.numpy())
            predictions.extend(probs.argmax(axis=1))
            probabilities.extend(probs)
    elapsed = time.perf_counter() - started
    count = max(len(labels), 1)
    return np.asarray(labels), np.asarray(predictions), np.asarray(probabilities), (elapsed / count) * 1000.0


def _context(checkpoint_path, checkpoint, latency_ms: float, manifest: dict, test_count: int) -> dict:
    summary_path = os.path.join(config.EXPERIMENT_DIR, "training_summary.json")
    duration = None
    if os.path.exists(summary_path):
        with open(summary_path, encoding="utf-8") as handle:
            duration = json.load(handle).get("training_duration_seconds")
    return {
        "checkpoint": checkpoint_path,
        "architecture": checkpoint["architecture"],
        "test_images": test_count,
        "inference_latency_ms_per_image": latency_ms,
        "training_duration_seconds": duration,
        "split_counts": manifest["counts"],
        "patient_overlap_train_test_before_exclusion": manifest.get("patient_overlap_train_test"),
        "probabilities_are_calibrated": False,
        "limitations": _LIMITATIONS,
    }


def _write_reports(output_dir: str, metrics: dict, labels, probabilities) -> None:
    path = os.path.join(output_dir, "test_metrics.json")
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(metrics, handle, indent=2)
    save_confusion_matrix(
        metrics["confusion_matrix"],
        config.CLASS_NAMES,
        os.path.join(output_dir, "test_confusion_matrix.png"),
        "Held-out test confusion matrix",
    )
    pneumonia_probs = probabilities[:, 1] if len(probabilities) else []
    save_roc_curve(
        labels,
        pneumonia_probs,
        os.path.join(output_dir, "test_roc_curve.png"),
        metrics["roc_auc_pneumonia"],
    )
    with open(os.path.join(output_dir, "test_report.txt"), "w", encoding="utf-8") as handle:
        handle.write(_report_text(metrics))


def _report_text(metrics: dict) -> str:
    lines = [
        "UMIPE chest X-ray baseline — held-out test report",
        "This is not a clinical validation.",
        f"Accuracy: {metrics['accuracy']:.4f}",
        f"Macro-F1: {metrics['macro_f1']:.4f}",
        f"ROC-AUC (PNEUMONIA): {metrics['roc_auc_pneumonia']}",
        f"Support: {metrics['class_support']}",
        f"Prediction counts: {metrics['prediction_counts']}",
        f"Confusion matrix: {metrics['confusion_matrix']}",
        f"Latency ms/image: {metrics['inference_latency_ms_per_image']:.3f}",
        f"Training duration seconds: {metrics['training_duration_seconds']}",
        "Per-class:",
    ]
    for name, scores in metrics["per_class"].items():
        lines.append(f"  {name}: {scores}")
    lines.extend(metrics["limitations"])
    return "\n".join(lines) + "\n"


def _require_compatible(checkpoint: dict) -> None:
    if checkpoint.get("class_names") != list(config.CLASS_NAMES):
        raise ValueError("Checkpoint class mapping does not match config.CLASS_NAMES")
    if "model_state" not in checkpoint or "architecture" not in checkpoint:
        raise ValueError("Checkpoint is missing model_state or architecture")


if __name__ == "__main__":
    main()
