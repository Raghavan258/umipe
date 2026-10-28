"""Plots for the chest X-ray baseline experiment."""

import os

import matplotlib
import numpy as np

matplotlib.use("Agg")
import matplotlib.pyplot as plt


def save_history_plots(history: list[dict], output_dir: str) -> None:
    """Save loss, accuracy, and macro-F1 curves."""
    os.makedirs(output_dir, exist_ok=True)
    epochs = [row["epoch"] for row in history]
    _line_plot(
        epochs,
        [row["train_loss"] for row in history],
        [row["val_loss"] for row in history],
        "Loss",
        os.path.join(output_dir, "loss_curve.png"),
    )
    _line_plot(
        epochs,
        [row["train_acc"] for row in history],
        [row["val_acc"] for row in history],
        "Accuracy",
        os.path.join(output_dir, "accuracy_curve.png"),
    )
    _line_plot(
        epochs,
        [row["val_macro_f1"] for row in history],
        None,
        "Validation macro-F1",
        os.path.join(output_dir, "macro_f1_curve.png"),
    )


def save_confusion_matrix(matrix: list, class_names: list[str], path: str, title: str) -> None:
    """Save a labeled confusion matrix image."""
    array = np.asarray(matrix)
    figure, axis = plt.subplots(figsize=(6, 5))
    image = axis.imshow(array, cmap="Blues")
    figure.colorbar(image, ax=axis)
    axis.set_xticks(range(len(class_names)), class_names)
    axis.set_yticks(range(len(class_names)), class_names)
    axis.set_xlabel("Predicted")
    axis.set_ylabel("True")
    axis.set_title(title)
    for row in range(array.shape[0]):
        for column in range(array.shape[1]):
            axis.text(column, row, int(array[row, column]), ha="center", va="center")
    figure.tight_layout()
    figure.savefig(path, dpi=150)
    plt.close(figure)


def save_roc_curve(labels, pneumonia_probs, path: str, auc: float | None) -> None:
    """Save an ROC curve for the pneumonia class."""
    from sklearn.metrics import roc_curve

    figure, axis = plt.subplots(figsize=(6, 5))
    if auc is None:
        axis.set_title("ROC unavailable")
    else:
        fpr, tpr, _thresholds = roc_curve(labels, pneumonia_probs)
        axis.plot(fpr, tpr, label=f"AUC = {auc:.4f}")
        axis.plot([0, 1], [0, 1], linestyle="--")
        axis.legend(loc="lower right")
        axis.set_title("ROC curve (positive class: PNEUMONIA)")
    axis.set_xlabel("False positive rate")
    axis.set_ylabel("True positive rate")
    figure.tight_layout()
    figure.savefig(path, dpi=150)
    plt.close(figure)


def _line_plot(epochs, first, second, ylabel: str, path: str) -> None:
    figure, axis = plt.subplots(figsize=(7, 4))
    axis.plot(epochs, first, label="train" if second is not None else ylabel)
    if second is not None:
        axis.plot(epochs, second, label="validation")
        axis.legend()
    axis.set_xlabel("Epoch")
    axis.set_ylabel(ylabel)
    axis.grid(True, linestyle="--", alpha=0.4)
    figure.tight_layout()
    figure.savefig(path, dpi=150)
    plt.close(figure)
