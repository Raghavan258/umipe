"""One-epoch training and validation steps."""

import numpy as np
import torch
import torch.nn as nn
from sklearn.metrics import accuracy_score
from torch.amp import autocast
from torch.utils.data import DataLoader
from tqdm import tqdm

from training.metrics import classification_metrics


def use_cuda_amp(device: torch.device) -> bool:
    """Mixed precision is enabled only on CUDA."""
    return device.type == "cuda"


def train_one_epoch(
    model: nn.Module,
    loader: DataLoader,
    optimizer: torch.optim.Optimizer,
    criterion: nn.Module,
    scaler,
    device: torch.device,
    epoch: int,
    num_epochs: int,
) -> tuple[float, float]:
    """Train for one epoch and return mean loss and accuracy."""
    model.train()
    totals = {"loss": 0.0, "correct": 0, "count": 0}
    amp = use_cuda_amp(device)
    progress = tqdm(loader, desc=f"Epoch {epoch:02d}/{num_epochs:02d} [Train]", leave=False)
    for batch_index, (images, labels) in enumerate(progress):
        _train_batch(model, images, labels, optimizer, criterion, scaler, device, amp, totals, batch_index)
        progress.set_postfix({"loss": f"{totals['loss'] / max(totals['count'], 1):.4f}"})
    return totals["loss"] / totals["count"], totals["correct"] / totals["count"]


def _train_batch(model, images, labels, optimizer, criterion, scaler, device, amp, totals, batch_index) -> None:
    try:
        images, labels = images.to(device), labels.to(device)
        optimizer.zero_grad(set_to_none=True)
        with autocast(device_type=device.type, enabled=amp):
            logits = model(images)
            loss = criterion(logits, labels)
        _apply_gradients(loss, optimizer, scaler, amp)
    except RuntimeError as exc:
        raise RuntimeError(f"Training failed on batch {batch_index}") from exc
    totals["loss"] += float(loss.item()) * images.size(0)
    totals["correct"] += int((logits.argmax(dim=1) == labels).sum().item())
    totals["count"] += int(labels.size(0))


def _apply_gradients(loss, optimizer, scaler, amp: bool) -> None:
    if amp:
        scaler.scale(loss).backward()
        scaler.step(optimizer)
        scaler.update()
        return
    loss.backward()
    optimizer.step()


@torch.no_grad()
def validate_one_epoch(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    device: torch.device,
    class_names: list[str],
    epoch: int,
    num_epochs: int,
) -> dict:
    """Validation forward pass. Does not read the test split."""
    model.eval()
    losses, labels_all, preds_all, probs_all = [], [], [], []
    amp = use_cuda_amp(device)
    progress = tqdm(loader, desc=f"Epoch {epoch:02d}/{num_epochs:02d} [Val]", leave=False)
    for images, labels in progress:
        logits, loss = _forward_loss(model, images, labels, criterion, device, amp)
        probabilities = torch.softmax(logits, dim=1)
        losses.append(float(loss.item()) * images.size(0))
        labels_all.extend(labels.numpy())
        preds_all.extend(probabilities.argmax(dim=1).cpu().numpy())
        probs_all.extend(probabilities.cpu().numpy())
    labels_np = np.asarray(labels_all)
    metrics = classification_metrics(labels_np, np.asarray(preds_all), np.asarray(probs_all), class_names)
    metrics["loss"] = float(sum(losses) / max(len(loader.dataset), 1))
    metrics["accuracy_check"] = float(accuracy_score(labels_np, np.asarray(preds_all)))
    return metrics


def _forward_loss(model, images, labels, criterion, device, amp: bool):
    images = images.to(device)
    labels = labels.to(device)
    with autocast(device_type=device.type, enabled=amp):
        logits = model(images)
        loss = criterion(logits, labels)
    return logits, loss
