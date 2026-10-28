# UMIPE

Chest X-ray research prototype that trains, evaluates, and serves a two-class classifier (`NORMAL` vs `PNEUMONIA`) with one shared preprocessing path from the training loop to the API.

This is an engineering baseline, not a clinical product. The held-out test result is reported below without threshold tuning.

## Why this repo is structured this way

Most image demos report the best validation number. This one treats the official test set as sealed.

- **Patient leakage is measured, then removed from training.** 264 patient ids appear in both the official train and test folders. Those 551 training files are excluded before the model is fit. 22 exact duplicate files are excluded as well.
- **Validation is not the 16-image official `val/` folder.** That split is too small for model selection. A stratified 15% validation split is taken from the remaining training images with seed 42. The manifest is frozen in `outputs/experiments/xray_baseline/split_manifest.json`.
- **Train and inference share one tensor path.** RGB conversion, 224×224 resize, and ImageNet normalization. CLAHE and denoising exist as optional helpers and are not applied to the trained model.
- **The checkpoint carries its own contract.** Class order, architecture, input size, normalization, seed, and whether ImageNet weights were actually loaded.
- **A missing checkpoint cannot invent a score.** The API returns `model_loaded: false` and an empty prediction list.
- **The test threshold was not adjusted.** Validation macro-F1 selected the checkpoint. The test set was scored once.

Stack: React 19, Vite, Tailwind, FastAPI, PyTorch, torchvision MobileNetV3-Small, scikit-learn. Training ran on CPU.

## Result

ImageNet-initialized MobileNetV3-Small, two-logit head, `CrossEntropyLoss` with training-split class weights, softmax at inference. Device: CPU. Seed: 42. Learning rate: `1e-3`. Batch size: 32. Epochs completed: 5. Selection metric: validation macro-F1. Checkpoint epoch: 5. Pretrained initialization: confirmed (`IMAGENET1K_V1`).

Training duration: **1509.4 s** (25.2 min). Batched test inference: **35.43 ms/image**.

### Validation, used only for selection

| Epoch | Train loss | Train acc | Val loss | Val acc | Val macro-F1 | Val ROC-AUC | Seconds |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 0.1456 | 0.9445 | 0.6436 | 0.8465 | 0.7522 | 0.9970 | 285.2 |
| 2 | 0.0719 | 0.9729 | 0.1661 | 0.9541 | 0.9387 | 0.9941 | 284.3 |
| 3 | 0.0524 | 0.9820 | 0.1176 | 0.9641 | 0.9524 | 0.9991 | 326.6 |
| 4 | 0.0521 | 0.9800 | 0.1081 | 0.9570 | 0.9423 | 0.9986 | 309.8 |
| 5 | 0.0434 | 0.9820 | 0.0860 | 0.9670 | **0.9564** | 0.9990 | 302.6 |

Best validation macro-F1: **0.9564**. Best validation accuracy: **0.9670**.

### Held-out official test, scored once

624 images. Support: NORMAL 234, PNEUMONIA 390. Positive class for ROC-AUC: PNEUMONIA. Probabilities are not calibrated.

| Metric | Value |
| --- | ---: |
| Accuracy | 0.6811 |
| Macro-F1 | 0.5310 |
| ROC-AUC | 0.9292 |

| Class | Precision | Recall | F1 | Support |
| --- | ---: | ---: | ---: | ---: |
| NORMAL | 0.9730 | 0.1538 | 0.2657 | 234 |
| PNEUMONIA | 0.6627 | 0.9974 | 0.7963 | 390 |

Confusion matrix, rows = true `[NORMAL, PNEUMONIA]`, columns = predicted in the same order:

```text
[[36, 198],
 [ 1, 389]]
```

Prediction counts: NORMAL 37, PNEUMONIA 587.

The validation split looks like the training pool. The official test set does not. Argmax then misses most NORMAL cases even though the scores still rank the classes (ROC-AUC 0.929). That gap is the result. It was not patched by picking a test-set threshold.

Plots and the machine-readable report live in `outputs/experiments/xray_baseline/`:

- `training_history.csv`, `loss_curve.png`, `accuracy_curve.png`, `macro_f1_curve.png`
- `test_metrics.json`, `test_report.txt`, `test_confusion_matrix.png`, `test_roc_curve.png`
- `best_checkpoint.pth` and `models/xray/mobilenet_v3_small.pth`

## Data

Images are not in this repository. The local run used the public pediatric chest X-ray collection associated with Kermany et al., laid out as `train/`, `val/`, and `test/` with `NORMAL` and `PNEUMONIA` folders. Follow that dataset's license and citation. Default path: `UMIPE_DATASET_DIR` or `C:\Users\hp\Downloads\archive\chest_xray`.

Official counts on the inspected copy (all `.jpeg`, 0 unreadable files, 0 filenames without a patient token):

| Split | NORMAL | PNEUMONIA | Total | Role in this run |
| --- | ---: | ---: | ---: | --- |
| Official train | 1341 | 3875 | 5216 | Source pool |
| Official val | 8 | 8 | 16 | Unused. Too small to select a model |
| Official test | 234 | 390 | 624 | Sealed evaluation |

After exclusions:

| Split | NORMAL | PNEUMONIA | Total |
| --- | ---: | ---: | ---: |
| Train | 1059 | 2887 | 3946 |
| Validation | 187 | 510 | 697 |
| Test | 234 | 390 | 624 |
| Excluded, patient overlap | 94 | 457 | 551 |
| Excluded, duplicate bytes | 1 | 21 | 22 |

Class index is fixed: `NORMAL` = 0, `PNEUMONIA` = 1.

## Layout

```text
api/                  FastAPI app and checkpoint loader
preprocessing/        Shared X-ray load and ImageNet normalization
training/             Split manifest, MobileNetV3-Small, training loop
evaluation/           One-shot test report
models/xray/          Saved baseline weights
outputs/experiments/  Metrics, curves, frozen split
src/                  React research interface
tests/                Class map, softmax, missing checkpoint, API shape
```

`umipe_backend/` is an earlier copy. The root packages above are the ones to run.

The interface labels CT, MRI, and the other named medical models as planned. The running path is this chest X-ray baseline.

## Run

```bash
python -m pip install -r requirements.txt
npm install
```

PyTorch is pinned to the CPU wheel index in `requirements.txt`.

```bash
python -m training.train_xray --epochs 5 --batch-size 32 --lr 0.001
python -m training.train_xray --resume
python -m evaluation.evaluate --checkpoint models/xray/mobilenet_v3_small.pth
python -m uvicorn api.server:app --reload --port 8000
npm run dev
python -m pytest tests -q
```

`POST /api/predict/xray` accepts PNG, JPEG, and DICOM. A compatible checkpoint returns `model_name`, `predicted_class`, and both class probabilities. `probabilities_are_calibrated` is false.

## Limits

- Test performance on this pediatric dataset does not establish safety or generalization to hospitals or other populations.
- Softmax scores were not calibrated.
- DICOM inputs are windowed, then passed through the JPEG-trained normalization, so those scores can shift.
- DenseNet-121 is an optional `--model` flag. It was not the trained run.
- No external site test and no reader study.
