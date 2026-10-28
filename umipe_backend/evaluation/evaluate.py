"""
UMIPE Backend - Final Evaluation on the HELD-OUT TEST SET

Run this exactly ONCE, after training + validation-based model selection
are completely finished. The test set must never influence any decision
made during training (no peeking, no early stopping on it, no threshold
tuning on it before this point).

Usage:
    python evaluate.py --checkpoint checkpoints/best_model.pt --test data/splits/test.csv
"""

import argparse
import os
import sys
import torch
import numpy as np
import matplotlib.pyplot as plt
from torch.utils.data import DataLoader
from sklearn.metrics import (
    roc_auc_score, roc_curve, confusion_matrix,
    precision_recall_fscore_support, classification_report,
)

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "training"))
from dataset import ChestXrayDataset
from train_xray import build_model


def run_inference(model, loader, device):
    model.eval()
    all_probs, all_labels = [], []
    with torch.no_grad():
        for imgs, labels in loader:
            imgs = imgs.to(device)
            probs = torch.sigmoid(model(imgs)).cpu().numpy()
            all_probs.append(probs)
            all_labels.append(labels.numpy())
    return np.concatenate(all_probs), np.concatenate(all_labels)


def evaluate(checkpoint_path: str, test_csv: str, out_dir="evaluation/results", threshold=0.5):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    os.makedirs(out_dir, exist_ok=True)

    ckpt = torch.load(checkpoint_path, map_location=device)
    label_cols = ckpt["label_cols"]

    test_ds = ChestXrayDataset(test_csv, split="test")
    test_loader = DataLoader(test_ds, batch_size=32, shuffle=False, num_workers=4)

    model = build_model(len(label_cols)).to(device)
    model.load_state_dict(ckpt["model_state"])

    probs, labels = run_inference(model, test_loader, device)
    preds = (probs >= threshold).astype(int)

    # ---- per-class report ----
    report_lines = []
    per_class_auc = {}
    for i, cls in enumerate(label_cols):
        if len(np.unique(labels[:, i])) > 1:
            auc = roc_auc_score(labels[:, i], probs[:, i])
        else:
            auc = float("nan")
        per_class_auc[cls] = auc

        p, r, f1, _ = precision_recall_fscore_support(
            labels[:, i], preds[:, i], average="binary", zero_division=0
        )
        report_lines.append(f"{cls:<20} AUC={auc:.3f}  Precision={p:.3f}  Recall={r:.3f}  F1={f1:.3f}")

    mean_auc = float(np.nanmean(list(per_class_auc.values())))

    report_text = "\n".join([
        "=== UMIPE Chest X-Ray Test Set Evaluation ===",
        f"Test set size: {len(test_ds)} images",
        f"Mean AUC across classes: {mean_auc:.4f}",
        "",
        *report_lines,
    ])
    print(report_text)
    with open(os.path.join(out_dir, "test_report.txt"), "w") as f:
        f.write(report_text)

    # ---- ROC curves ----
    plt.figure(figsize=(7, 6))
    for i, cls in enumerate(label_cols):
        if len(np.unique(labels[:, i])) > 1:
            fpr, tpr, _ = roc_curve(labels[:, i], probs[:, i])
            plt.plot(fpr, tpr, label=f"{cls} (AUC={per_class_auc[cls]:.2f})")
    plt.plot([0, 1], [0, 1], "k--", linewidth=1)
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title("Test Set ROC Curves — UMIPE Chest X-Ray Classifier")
    plt.legend(fontsize=8)
    plt.tight_layout()
    plt.savefig(os.path.join(out_dir, "roc_curves.png"), dpi=140)
    plt.close()

    # ---- confusion matrices (one per class, since this is multi-label) ----
    n = len(label_cols)
    cols = 4
    rows = int(np.ceil(n / cols))
    fig, axes = plt.subplots(rows, cols, figsize=(3.5 * cols, 3.5 * rows))
    axes = np.array(axes).reshape(-1)
    for i, cls in enumerate(label_cols):
        cm = confusion_matrix(labels[:, i], preds[:, i])
        axes[i].imshow(cm, cmap="Blues")
        axes[i].set_title(cls, fontsize=10)
        for (r, c), val in np.ndenumerate(cm):
            axes[i].text(c, r, str(val), ha="center", va="center")
        axes[i].set_xticks([0, 1]); axes[i].set_yticks([0, 1])
    for ax in axes[n:]:
        ax.axis("off")
    fig.suptitle("Per-Class Confusion Matrices — Test Set")
    fig.tight_layout()
    fig.savefig(os.path.join(out_dir, "confusion_matrices.png"), dpi=140)
    plt.close(fig)

    print(f"\nSaved: {out_dir}/test_report.txt, roc_curves.png, confusion_matrices.png")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--checkpoint", required=True)
    parser.add_argument("--test", required=True)
    parser.add_argument("--threshold", type=float, default=0.5)
    args = parser.parse_args()
    evaluate(args.checkpoint, args.test, threshold=args.threshold)
