"""
PyTorch Dataset for chest X-ray multi-label classification.

Expects a CSV manifest with columns:
    filepath, label_1, label_2, ..., label_N   (multi-hot, 0/1 per pathology)

Example (CheXpert / NIH-ChestXray14 style):
    filepath,Atelectasis,Cardiomegaly,Effusion,Pneumonia,...
    data/raw/train/00001.png,0,1,0,0,...

Splitting strategy (do this ONCE, before anything else, and freeze it):
    70% train / 15% val / 15% test, split by PATIENT ID (not by image),
    so the same patient's images never leak across splits.
"""

import os
import pandas as pd
import numpy as np
from torch.utils.data import Dataset
import torch

import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from preprocessing.xray_preprocessing import (
    load_image, to_grayscale, resize_image, denoise,
    apply_clahe, normalize, augment, to_model_input,
)


class ChestXrayDataset(Dataset):
    def __init__(self, manifest_csv: str, image_size=(224, 224), split="train"):
        self.df = pd.read_csv(manifest_csv)
        self.image_size = image_size
        self.split = split  # "train" -> augmentation on, "val"/"test" -> off
        self.label_cols = [c for c in self.df.columns if c != "filepath"]

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        img = load_image(row["filepath"])
        img = to_grayscale(img)
        img = resize_image(img, self.image_size)
        img = denoise(img)
        img = apply_clahe(img)
        img = normalize(img, mode="minmax")

        if self.split == "train":
            img = augment(img)  # ONLY at train time — never for val/test

        img = to_model_input(img, channels=3)          # (H, W, 3)
        img = np.transpose(img, (2, 0, 1))              # -> (3, H, W) for PyTorch

        label = row[self.label_cols].values.astype(np.float32)

        return torch.from_numpy(img).float(), torch.from_numpy(label)

    @property
    def num_classes(self):
        return len(self.label_cols)


def make_splits(full_manifest_csv: str, out_dir: str, patient_id_col="patient_id",
                 train_frac=0.70, val_frac=0.15, seed=42):
    """
    Splits by patient ID (not by row) to avoid data leakage, then writes
    train.csv / val.csv / test.csv to out_dir.
    """
    df = pd.read_csv(full_manifest_csv)
    patients = df[patient_id_col].unique()
    rng = np.random.default_rng(seed)
    rng.shuffle(patients)

    n = len(patients)
    n_train = int(n * train_frac)
    n_val = int(n * val_frac)

    train_ids = set(patients[:n_train])
    val_ids = set(patients[n_train:n_train + n_val])
    test_ids = set(patients[n_train + n_val:])

    os.makedirs(out_dir, exist_ok=True)
    df[df[patient_id_col].isin(train_ids)].to_csv(os.path.join(out_dir, "train.csv"), index=False)
    df[df[patient_id_col].isin(val_ids)].to_csv(os.path.join(out_dir, "val.csv"), index=False)
    df[df[patient_id_col].isin(test_ids)].to_csv(os.path.join(out_dir, "test.csv"), index=False)

    print(f"Split {n} patients -> train={len(train_ids)} val={len(val_ids)} test={len(test_ids)}")
