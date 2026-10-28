"""Chest X-ray datasets that share inference preprocessing."""

import os
from typing import Dict

import cv2
import numpy as np
import torch
from torch.utils.data import DataLoader, Dataset

import config
from preprocessing.xray_preprocessing import load_rgb_uint8, normalize_rgb_uint8


class ChestXrayDataset(Dataset):
    """Load manifest records and apply the shared RGB preprocessing path."""

    def __init__(self, dataset_dir: str, records: list[dict], augment: bool = False):
        self.dataset_dir = dataset_dir
        self.records = records
        self.augment = augment

    def __len__(self) -> int:
        return len(self.records)

    def __getitem__(self, index: int):
        record = self.records[index]
        path = os.path.join(self.dataset_dir, record["relative_path"])
        try:
            image, _metadata = load_rgb_uint8(path)
        except (FileNotFoundError, ValueError) as exc:
            raise RuntimeError(f"Invalid image in batch item: {path}") from exc
        if self.augment:
            image = augment_rgb(image)
        tensor = torch.from_numpy(normalize_rgb_uint8(image))
        return tensor, int(record["label"])


def augment_rgb(image: np.ndarray) -> np.ndarray:
    """Light train-only geometry augmentation on uint8 RGB."""
    if torch.rand(1).item() < 0.5:
        image = np.ascontiguousarray(image[:, ::-1])
    angle = float(torch.rand(1).item() * 20.0 - 10.0)
    height, width = image.shape[:2]
    matrix = cv2.getRotationMatrix2D((width / 2, height / 2), angle, 1.0)
    return cv2.warpAffine(
        image, matrix, (width, height), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT
    )


def class_weights(records: list[dict]) -> torch.Tensor:
    """Inverse-frequency weights fit on the training split only."""
    labels = [int(record["label"]) for record in records]
    counts = np.bincount(labels, minlength=config.NUM_CLASSES).astype(np.float32)
    weights = counts.sum() / (config.NUM_CLASSES * np.maximum(counts, 1.0))
    return torch.tensor(weights, dtype=torch.float32)


def make_dataloader(
    dataset_dir: str,
    records: list[dict],
    batch_size: int,
    shuffle: bool,
    augment: bool,
) -> DataLoader:
    """Build one dataloader. Workers stay at zero for Windows stability."""
    generator = torch.Generator()
    generator.manual_seed(config.SEED)
    return DataLoader(
        ChestXrayDataset(dataset_dir, records, augment=augment),
        batch_size=batch_size,
        shuffle=shuffle,
        num_workers=config.NUM_WORKERS,
        pin_memory=torch.cuda.is_available(),
        generator=generator if shuffle else None,
    )


def get_dataloaders(
    dataset_dir: str,
    manifest: dict,
    batch_size: int = config.BATCH_SIZE,
) -> Dict[str, DataLoader]:
    """Train, validation, and test loaders. Test is available but not for selection."""
    records = manifest["records"]
    return {
        "train": make_dataloader(dataset_dir, records["train"], batch_size, True, True),
        "val": make_dataloader(dataset_dir, records["val"], batch_size, False, False),
        "test": make_dataloader(dataset_dir, records["test"], batch_size, False, False),
    }
