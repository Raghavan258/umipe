"""Classification metrics for the two-class chest X-ray baseline."""

import numpy as np
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    precision_recall_fscore_support,
    roc_auc_score,
)


def classification_metrics(labels, predictions, probabilities, class_names: list[str]) -> dict:
    """Compute accuracy, per-class scores, macro-F1, and ROC-AUC."""
    labels = np.asarray(labels)
    predictions = np.asarray(predictions)
    probabilities = np.asarray(probabilities)
    precision, recall, f1, support = precision_recall_fscore_support(
        labels,
        predictions,
        labels=list(range(len(class_names))),
        zero_division=0,
    )
    per_class = {
        name: {
            "precision": float(precision[index]),
            "recall": float(recall[index]),
            "f1": float(f1[index]),
            "support": int(support[index]),
        }
        for index, name in enumerate(class_names)
    }
    matrix = confusion_matrix(labels, predictions, labels=list(range(len(class_names))))
    pred_counts = np.bincount(predictions, minlength=len(class_names))
    return {
        "accuracy": float(accuracy_score(labels, predictions)),
        "macro_f1": float(np.mean(f1)),
        "per_class": per_class,
        "confusion_matrix": matrix.tolist(),
        "class_support": {name: int(support[i]) for i, name in enumerate(class_names)},
        "prediction_counts": {name: int(pred_counts[i]) for i, name in enumerate(class_names)},
        "roc_auc_pneumonia": _roc_auc(labels, probabilities),
        "positive_class": "PNEUMONIA",
    }


def _roc_auc(labels: np.ndarray, probabilities: np.ndarray) -> float | None:
    if probabilities.ndim != 2 or probabilities.shape[1] < 2:
        return None
    if len(np.unique(labels)) < 2:
        return None
    return float(roc_auc_score(labels, probabilities[:, 1]))
