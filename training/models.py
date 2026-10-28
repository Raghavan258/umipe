"""Model constructors for the chest X-ray baseline."""

import torch.nn as nn
from torchvision.models import (
    DenseNet121_Weights,
    MobileNet_V3_Small_Weights,
    densenet121,
    mobilenet_v3_small,
)


def build_model(architecture: str, num_classes: int, pretrained: bool) -> nn.Module:
    """Build a two-class classifier. Pretrained loading fails loudly."""
    if architecture == "mobilenet_v3_small":
        return _mobilenet_v3_small(num_classes, pretrained)
    if architecture == "densenet121":
        return _densenet121(num_classes, pretrained)
    raise ValueError(f"Unsupported architecture: {architecture}")


def _mobilenet_v3_small(num_classes: int, pretrained: bool) -> nn.Module:
    model = _load_mobilenet(pretrained)
    in_features = model.classifier[-1].in_features
    model.classifier[-1] = nn.Linear(in_features, num_classes)
    return model


def _load_mobilenet(pretrained: bool) -> nn.Module:
    if not pretrained:
        return mobilenet_v3_small(weights=None)
    try:
        weights = MobileNet_V3_Small_Weights.IMAGENET1K_V1
        return mobilenet_v3_small(weights=weights)
    except Exception as exc:
        raise RuntimeError(
            "ImageNet weights for MobileNetV3-Small could not be downloaded. "
            "Training was not started from random initialization."
        ) from exc


def _densenet121(num_classes: int, pretrained: bool) -> nn.Module:
    model = _load_densenet(pretrained)
    in_features = model.classifier.in_features
    model.classifier = nn.Linear(in_features, num_classes)
    return model


def _load_densenet(pretrained: bool) -> nn.Module:
    if not pretrained:
        return densenet121(weights=None)
    try:
        weights = DenseNet121_Weights.IMAGENET1K_V1
        return densenet121(weights=weights)
    except Exception as exc:
        raise RuntimeError(
            "ImageNet weights for DenseNet-121 could not be downloaded. "
            "Training was not started from random initialization."
        ) from exc
