# Chest X-Ray Models Directory

The Phase 1 baseline checkpoint is saved here after a successful training run:

`models/xray/mobilenet_v3_small.pth`

A copy is also written to `outputs/experiments/xray_baseline/best_checkpoint.pth`.
The inference server loads one of those files. If neither exists, the API returns `model_loaded: false` and does not invent a score.

DenseNet-121 remains an optional architecture (`python -m training.train_xray --model densenet121`) and is not the default experiment.

