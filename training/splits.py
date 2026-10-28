"""Frozen train, validation, and test manifests for the chest X-ray baseline."""

import hashlib
import json
import os
import re
from collections import Counter

import numpy as np
from sklearn.model_selection import train_test_split

import config

_PATIENT_ID = re.compile(r"(person\d+|IM-\d+)", re.IGNORECASE)
_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".dcm", ".dicom"}
MANIFEST_NAME = "split_manifest.json"


def patient_id_from_name(filename: str) -> str | None:
    """Extract a patient token from a Kermany-style filename."""
    match = _PATIENT_ID.search(os.path.basename(filename))
    if match is None:
        return None
    return match.group(1).lower()


def load_or_create_manifest(dataset_dir: str, experiment_dir: str) -> dict:
    """Reuse a saved split. Create one only when no manifest exists."""
    path = os.path.join(experiment_dir, MANIFEST_NAME)
    if os.path.exists(path):
        with open(path, encoding="utf-8") as handle:
            return json.load(handle)
    manifest = build_manifest(dataset_dir)
    os.makedirs(experiment_dir, exist_ok=True)
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(manifest, handle, indent=2)
    return manifest


def build_manifest(dataset_dir: str) -> dict:
    """Hold out the official test set and stratify validation from train."""
    official_train = _read_split(dataset_dir, "train")
    official_test = _read_split(dataset_dir, "test")
    official_val = _read_split(dataset_dir, "val")
    test_patients = _patient_ids(official_test)
    kept, excluded = _exclude_overlapping_patients(official_train, test_patients)
    kept, excluded_dupes = _exclude_duplicate_bytes(dataset_dir, kept, official_test)
    train_records, val_records = _stratify(kept, config.VAL_FRACTION, config.SEED)
    _assert_disjoint(train_records, val_records, official_test)
    return _manifest_document(
        official_train, official_val, official_test, train_records, val_records, excluded, excluded_dupes, test_patients
    )


def _manifest_document(official_train, official_val, official_test, train_records, val_records, excluded, excluded_dupes, test_patients) -> dict:
    return {
        "val_fraction": config.VAL_FRACTION,
        "class_names": list(config.CLASS_NAMES),
        "policy": (
            "Official test is held out. Official val is unused because it has "
            "too few images for model selection. Validation is a stratified "
            "subset of official train. Train files whose patient id also "
            "appears in the official test set are excluded from training, "
            "as are exact duplicate files."
        ),
        "counts": {
            "official_train": _count(official_train),
            "official_val_unused": _count(official_val),
            "official_test": _count(official_test),
            "train": _count(train_records),
            "val": _count(val_records),
            "test": _count(official_test),
            "excluded_patient_overlap": _count(excluded),
            "excluded_duplicate_bytes": _count(excluded_dupes),
        },
        "patient_overlap_train_test": len(test_patients & _patient_ids(official_train)),
        "unparsed_patient_ids": _unparsed(official_train + official_test + official_val),
        "records": {
            "train": train_records,
            "val": val_records,
            "test": official_test,
            "excluded_patient_overlap": excluded,
            "excluded_duplicate_bytes": excluded_dupes,
            "unused_official_val": official_val,
        },
    }


def _read_split(dataset_dir: str, split: str) -> list[dict]:
    records = []
    for class_name in config.CLASS_NAMES:
        folder = os.path.join(dataset_dir, split, class_name)
        if not os.path.isdir(folder):
            raise FileNotFoundError(f"Missing class folder: {folder}")
        records.extend(_records_in_folder(dataset_dir, folder, class_name))
    return records


def _records_in_folder(dataset_dir: str, folder: str, class_name: str) -> list[dict]:
    records = []
    for name in sorted(os.listdir(folder)):
        path = os.path.join(folder, name)
        if not os.path.isfile(path):
            continue
        if os.path.splitext(name)[1].lower() not in _IMAGE_EXTENSIONS:
            continue
        relative = os.path.relpath(path, dataset_dir).replace("\\", "/")
        records.append({
            "relative_path": relative,
            "class_name": class_name,
            "label": config.CLASS_TO_INDEX[class_name],
            "patient_id": patient_id_from_name(name),
        })
    return records


def _exclude_overlapping_patients(records: list[dict], test_patients: set[str]) -> tuple[list, list]:
    kept, excluded = [], []
    for record in records:
        patient_id = record["patient_id"]
        if patient_id and patient_id in test_patients:
            excluded.append(record)
        else:
            kept.append(record)
    return kept, excluded


def _exclude_duplicate_bytes(dataset_dir: str, records: list[dict], test_records: list[dict]) -> tuple[list, list]:
    seen = {_file_md5(dataset_dir, record) for record in test_records}
    kept, excluded = [], []
    for record in records:
        digest = _file_md5(dataset_dir, record)
        if digest in seen:
            excluded.append(record)
            continue
        seen.add(digest)
        kept.append(record)
    return kept, excluded


def _file_md5(dataset_dir: str, record: dict) -> str:
    path = os.path.join(dataset_dir, record["relative_path"])
    digest = hashlib.md5()
    with open(path, "rb") as handle:
        digest.update(handle.read())
    return digest.hexdigest()


def _stratify(records: list[dict], val_fraction: float, seed: int) -> tuple[list, list]:
    labels = [record["label"] for record in records]
    indices = np.arange(len(records))
    train_idx, val_idx = train_test_split(
        indices,
        test_size=val_fraction,
        random_state=seed,
        stratify=labels,
    )
    train_records = [records[index] for index in sorted(train_idx)]
    val_records = [records[index] for index in sorted(val_idx)]
    return train_records, val_records


def _patient_ids(records: list[dict]) -> set[str]:
    return {record["patient_id"] for record in records if record["patient_id"]}


def _count(records: list[dict]) -> dict:
    counts = Counter(record["class_name"] for record in records)
    return {name: int(counts.get(name, 0)) for name in config.CLASS_NAMES} | {
        "total": len(records)
    }


def _unparsed(records: list[dict]) -> int:
    return sum(record["patient_id"] is None for record in records)


def _assert_disjoint(*groups: list[dict]) -> None:
    seen = set()
    for group in groups:
        paths = {record["relative_path"] for record in group}
        if seen & paths:
            raise RuntimeError("Split leakage: the same file is in more than one split")
        seen |= paths
