"""Train the chest X-ray MobileNetV3-Small baseline."""

import argparse
import json
import os
import random
import time
from datetime import datetime, timezone

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from torch.amp import GradScaler

import config
from training.dataset import class_weights, make_dataloader
from training.engine import train_one_epoch, use_cuda_amp, validate_one_epoch
from training.models import build_model
from training.plots import save_history_plots
from training.splits import load_or_create_manifest


def set_seed(seed: int) -> None:
    """Seed Python, NumPy, and PyTorch."""
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


def parse_args() -> argparse.Namespace:
    """Command-line options for one training run."""
    parser = argparse.ArgumentParser(description="Train the UMIPE chest X-ray baseline")
    parser.add_argument("--epochs", type=int, default=config.NUM_EPOCHS)
    parser.add_argument("--batch-size", type=int, default=config.BATCH_SIZE)
    parser.add_argument("--lr", type=float, default=config.LEARNING_RATE)
    parser.add_argument("--data-dir", type=str, default=config.DATASET_DIR)
    parser.add_argument("--model", type=str, default=config.MODEL_ARCH)
    parser.add_argument("--resume", action="store_true")
    parser.add_argument("--allow-random-init", action="store_true")
    return parser.parse_args()


def main() -> None:
    """Run training and save the best validation checkpoint."""
    args = parse_args()
    set_seed(config.SEED)
    os.makedirs(config.EXPERIMENT_DIR, exist_ok=True)
    manifest = load_or_create_manifest(args.data_dir, config.EXPERIMENT_DIR)
    _write_run_config(args, manifest)
    records = manifest["records"]
    loaders = {
        "train": make_dataloader(args.data_dir, records["train"], args.batch_size, True, True),
        "val": make_dataloader(args.data_dir, records["val"], args.batch_size, False, False),
    }
    model = build_model(args.model, config.NUM_CLASSES, pretrained=not args.allow_random_init)
    model = model.to(config.DEVICE)
    state = _initial_state(model, loaders["train"].dataset.records, args)
    _log(f"Device: {config.DEVICE}. Selection metric: {config.SELECTION_METRIC}.")
    started = time.perf_counter()
    try:
        _run_epochs(model, loaders, state, args)
    except Exception as exc:
        _write_json("training_error.json", {"error": str(exc)})
        raise
    elapsed = time.perf_counter() - started
    save_history_plots(state["history"], config.EXPERIMENT_DIR)
    _write_json("training_summary.json", _summary(state, elapsed, args))
    print(f"Best {config.SELECTION_METRIC}: {state['best_score']:.4f}")


def _initial_state(model, train_records, args) -> dict:
    weights = class_weights(train_records).to(config.DEVICE)
    optimizer = torch.optim.Adam(model.parameters(), lr=args.lr, weight_decay=config.WEIGHT_DECAY)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="max", factor=0.5, patience=1)
    state = {
        "optimizer": optimizer,
        "scheduler": scheduler,
        "criterion": nn.CrossEntropyLoss(weight=weights),
        "scaler": GradScaler("cuda", enabled=use_cuda_amp(config.DEVICE)),
        "start_epoch": 1,
        "best_score": float("-inf"),
        "history": [],
        "epochs_without_improvement": 0,
    }
    if args.resume and os.path.exists(config.LATEST_CHECKPOINT_PATH):
        _restore_latest(model, state)
    return state


def _restore_latest(model, state) -> None:
    checkpoint = torch.load(config.LATEST_CHECKPOINT_PATH, map_location=config.DEVICE, weights_only=False)
    model.load_state_dict(checkpoint["model_state"])
    state["optimizer"].load_state_dict(checkpoint["optimizer_state"])
    state["start_epoch"] = int(checkpoint["epoch"]) + 1
    state["best_score"] = float(checkpoint.get("best_val_macro_f1", float("-inf")))
    state["history"] = list(checkpoint.get("history", []))
    print(f"Resumed at epoch {state['start_epoch']}")


def _run_epochs(model, loaders, state, args) -> None:
    for epoch in range(state["start_epoch"], args.epochs + 1):
        epoch_started = time.perf_counter()
        train_loss, train_acc = train_one_epoch(
            model, loaders["train"], state["optimizer"], state["criterion"],
            state["scaler"], config.DEVICE, epoch, args.epochs,
        )
        metrics = validate_one_epoch(
            model, loaders["val"], state["criterion"], config.DEVICE,
            config.CLASS_NAMES, epoch, args.epochs,
        )
        state["scheduler"].step(metrics["macro_f1"])
        row = _history_row(epoch, train_loss, train_acc, metrics, state, epoch_started)
        state["history"].append(row)
        _save_latest(model, state, epoch, args)
        _maybe_save_best(model, state, metrics, epoch, args)
        _write_history_csv(state["history"])
        print(
            f"Epoch {epoch:02d} train_loss={train_loss:.4f} val_macro_f1={metrics['macro_f1']:.4f} "
            f"val_acc={metrics['accuracy']:.4f}"
        )
        if state["epochs_without_improvement"] >= config.EARLY_STOP_PATIENCE:
            print(f"Early stopping at epoch {epoch}")
            break


def _history_row(epoch, train_loss, train_acc, metrics, state, epoch_started) -> dict:
    return {
        "epoch": epoch,
        "train_loss": train_loss,
        "train_acc": train_acc,
        "val_loss": metrics["loss"],
        "val_acc": metrics["accuracy"],
        "val_macro_f1": metrics["macro_f1"],
        "val_roc_auc_pneumonia": metrics["roc_auc_pneumonia"],
        "lr": state["optimizer"].param_groups[0]["lr"],
        "epoch_seconds": time.perf_counter() - epoch_started,
    }


def _save_latest(model, state, epoch: int, args) -> None:
    payload = _checkpoint_body(model, epoch, state["best_score"], args, state["history"])
    payload["optimizer_state"] = state["optimizer"].state_dict()
    torch.save(payload, config.LATEST_CHECKPOINT_PATH)


def _maybe_save_best(model, state, metrics, epoch: int, args) -> None:
    score = float(metrics["macro_f1"])
    if score <= state["best_score"]:
        state["epochs_without_improvement"] += 1
        return
    state["best_score"] = score
    state["epochs_without_improvement"] = 0
    payload = _checkpoint_body(model, epoch, score, args, state["history"])
    torch.save(payload, config.MODEL_SAVE_PATH)
    torch.save(payload, os.path.join(config.EXPERIMENT_DIR, "best_checkpoint.pth"))
    print(f"Saved best checkpoint ({config.SELECTION_METRIC}={score:.4f})")


def _checkpoint_body(model, epoch: int, best_score: float, args, history: list) -> dict:
    return {
        "model_state": model.state_dict(),
        "architecture": args.model,
        "class_names": list(config.CLASS_NAMES),
        "class_to_index": dict(config.CLASS_TO_INDEX),
        "image_size": list(config.IMAGE_SIZE),
        "normalization": {"mean": list(config.IMAGENET_MEAN), "std": list(config.IMAGENET_STD)},
        "seed": config.SEED,
        "pretrained_initialization": not args.allow_random_init,
        "selection_metric": config.SELECTION_METRIC,
        "best_val_macro_f1": best_score,
        "epoch": epoch,
        "history": history,
        "probabilities_are_calibrated": False,
    }


def _summary(state, elapsed: float, args) -> dict:
    return {
        "architecture": args.model,
        "epochs_completed": len(state["history"]),
        "best_val_macro_f1": state["best_score"],
        "training_duration_seconds": elapsed,
        "device": str(config.DEVICE),
        "pretrained_initialization": not args.allow_random_init,
        "selection_metric": config.SELECTION_METRIC,
        "seed": config.SEED,
    }


def _write_run_config(args, manifest) -> None:
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    payload = {
        "timestamp_utc": stamp,
        "args": vars(args),
        "class_names": list(config.CLASS_NAMES),
        "image_size": list(config.IMAGE_SIZE),
        "normalization": {"mean": list(config.IMAGENET_MEAN), "std": list(config.IMAGENET_STD)},
        "seed": config.SEED,
        "selection_metric": config.SELECTION_METRIC,
        "device": str(config.DEVICE),
        "split_counts": manifest["counts"],
        "split_policy": manifest["policy"],
    }
    _write_json(f"run_config_{stamp}.json", payload)


def _write_history_csv(history: list[dict]) -> None:
    frame = pd.DataFrame(history)
    frame.to_csv(os.path.join(config.EXPERIMENT_DIR, "training_history.csv"), index=False)


def _write_json(name: str, payload: dict) -> None:
    path = os.path.join(config.EXPERIMENT_DIR, name)
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2)


def _log(message: str) -> None:
    print(message)


if __name__ == "__main__":
    main()
