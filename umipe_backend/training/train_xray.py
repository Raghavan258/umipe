"""
UMIPE Backend - Chest X-Ray Classifier Training

Model: DenseNet-121 backbone (ImageNet-pretrained), fine-tuned as a
multi-label classifier (sigmoid output per pathology, since a single
X-ray can show multiple findings at once — this is NOT single-label
softmax classification).

Usage:
    python train_xray.py --train data/splits/train.csv --val data/splits/val.csv \
                          --epochs 30 --batch-size 32 --lr 1e-4
"""

import argparse
import os
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision.models import densenet121, DenseNet121_Weights
from sklearn.metrics import roc_auc_score
import numpy as np

from dataset import ChestXrayDataset


def build_model(num_classes: int) -> nn.Module:
    model = densenet121(weights=DenseNet121_Weights.IMAGENET1K_V1)
    in_features = model.classifier.in_features
    model.classifier = nn.Sequential(
        nn.Linear(in_features, num_classes),
        # NOTE: sigmoid applied via BCEWithLogitsLoss instead, for numerical stability
    )
    return model


def train_one_epoch(model, loader, optimizer, criterion, device):
    model.train()
    running_loss = 0.0
    for imgs, labels in loader:
        imgs, labels = imgs.to(device), labels.to(device)

        optimizer.zero_grad()
        outputs = model(imgs)
        loss = criterion(outputs, labels)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * imgs.size(0)
    return running_loss / len(loader.dataset)


@torch.no_grad()
def validate(model, loader, criterion, device):
    model.eval()
    running_loss = 0.0
    all_labels, all_probs = [], []

    for imgs, labels in loader:
        imgs, labels = imgs.to(device), labels.to(device)
        outputs = model(imgs)
        loss = criterion(outputs, labels)
        running_loss += loss.item() * imgs.size(0)

        probs = torch.sigmoid(outputs).cpu().numpy()
        all_probs.append(probs)
        all_labels.append(labels.cpu().numpy())

    all_probs = np.concatenate(all_probs)
    all_labels = np.concatenate(all_labels)

    # per-class AUC, skipping classes with no positive examples in this batch
    aucs = []
    for c in range(all_labels.shape[1]):
        if len(np.unique(all_labels[:, c])) > 1:
            aucs.append(roc_auc_score(all_labels[:, c], all_probs[:, c]))
    mean_auc = float(np.mean(aucs)) if aucs else float("nan")

    return running_loss / len(loader.dataset), mean_auc


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--train", required=True)
    parser.add_argument("--val", required=True)
    parser.add_argument("--epochs", type=int, default=30)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=1e-4)
    parser.add_argument("--checkpoint-dir", default="checkpoints")
    parser.add_argument("--patience", type=int, default=5, help="early stopping patience")
    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    os.makedirs(args.checkpoint_dir, exist_ok=True)

    train_ds = ChestXrayDataset(args.train, split="train")
    val_ds = ChestXrayDataset(args.val, split="val")
    train_loader = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True, num_workers=4)
    val_loader = DataLoader(val_ds, batch_size=args.batch_size, shuffle=False, num_workers=4)

    model = build_model(train_ds.num_classes).to(device)
    criterion = nn.BCEWithLogitsLoss()  # multi-label -> per-class binary cross-entropy
    optimizer = torch.optim.Adam(model.parameters(), lr=args.lr, weight_decay=1e-5)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="max", factor=0.5, patience=2)

    best_auc = -1.0
    epochs_no_improve = 0

    for epoch in range(1, args.epochs + 1):
        train_loss = train_one_epoch(model, train_loader, optimizer, criterion, device)
        val_loss, val_auc = validate(model, val_loader, criterion, device)
        scheduler.step(val_auc)

        print(f"Epoch {epoch:03d} | train_loss={train_loss:.4f} "
              f"| val_loss={val_loss:.4f} | val_mean_AUC={val_auc:.4f}")

        # checkpoint only when validation AUC improves (not train loss —
        # train loss will keep dropping from overfitting long after val stalls)
        if val_auc > best_auc:
            best_auc = val_auc
            epochs_no_improve = 0
            torch.save({
                "epoch": epoch,
                "model_state": model.state_dict(),
                "val_auc": val_auc,
                "label_cols": train_ds.label_cols,
            }, os.path.join(args.checkpoint_dir, "best_model.pt"))
            print(f"  -> new best model saved (val_AUC={val_auc:.4f})")
        else:
            epochs_no_improve += 1
            if epochs_no_improve >= args.patience:
                print(f"Early stopping at epoch {epoch} (no improvement for {args.patience} epochs)")
                break

    print(f"Training complete. Best val AUC: {best_auc:.4f}")


if __name__ == "__main__":
    main()
