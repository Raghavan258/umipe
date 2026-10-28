"""
Runs the full preprocessing pipeline on a sample image ONE STEP AT A TIME,
saving the output after every single change to demo/pipeline_steps/.
Also builds a single side-by-side grid image so you can see the whole
pipeline's progression at a glance: demo/pipeline_grid.png

Usage:
    python run_pipeline_demo.py path/to/image.png
    python run_pipeline_demo.py                      # uses the synthetic phantom
"""

import sys
import os
import cv2
import numpy as np
import matplotlib.pyplot as plt

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from preprocessing.xray_preprocessing import (
    load_image, to_grayscale, resize_image, denoise,
    apply_clahe, normalize, to_model_input, _to_uint8,
)

STEPS_DIR = os.path.join(os.path.dirname(__file__), "pipeline_steps")
os.makedirs(STEPS_DIR, exist_ok=True)


def save_step(name: str, img: np.ndarray, index: int):
    """Save the image after this step, normalized to uint8 for viewing."""
    viewable = _to_uint8(img) if img.dtype != np.uint8 else img
    out_path = os.path.join(STEPS_DIR, f"{index:02d}_{name}.png")
    cv2.imwrite(out_path, viewable)
    print(f"  [{index}] {name:<22} shape={img.shape}  dtype={img.dtype}  -> saved to {out_path}")
    return viewable


def run(image_path: str = None):
    if image_path is None:
        image_path = os.path.join(os.path.dirname(__file__), "sample_chest_xray_phantom.png")

    print(f"Running preprocessing pipeline on: {image_path}\n")

    results = []  # (label, viewable_uint8_image)

    # Step 0: raw load
    img = load_image(image_path)
    results.append(("0. Raw input", save_step("raw_input", img, 0)))

    # Step 1: grayscale normalize
    img = to_grayscale(img)
    results.append(("1. Grayscale", save_step("grayscale", img, 1)))

    # Step 2: resize to model input size
    img = resize_image(img, (224, 224))
    results.append(("2. Resized 224x224", save_step("resized", img, 2)))

    # Step 3: denoise
    img = denoise(img, method="gaussian")
    results.append(("3. Denoised", save_step("denoised", img, 3)))

    # Step 4: CLAHE contrast enhancement
    img = apply_clahe(img)
    results.append(("4. CLAHE enhanced", save_step("clahe", img, 4)))

    # Step 5: intensity normalize [0,1]
    img_norm = normalize(img, mode="minmax")
    results.append(("5. Normalized [0,1]", save_step("normalized", img_norm, 5)))

    # Step 6: final model-ready tensor shape (3-channel)
    model_input = to_model_input(img_norm, channels=3)
    results.append(("6. Model-ready (3ch)", save_step("model_ready", model_input, 6)))

    build_grid(results)
    print(f"\nAll {len(results)} step images saved in: {STEPS_DIR}")
    print("Grid comparison saved to: demo/pipeline_grid.png")


def build_grid(results):
    n = len(results)
    cols = 4
    rows = int(np.ceil(n / cols))
    fig, axes = plt.subplots(rows, cols, figsize=(4 * cols, 4.2 * rows))
    axes = np.array(axes).reshape(-1)

    for ax, (label, img) in zip(axes, results):
        cmap = "gray" if img.ndim == 2 else None
        ax.imshow(img, cmap=cmap)
        ax.set_title(label, fontsize=12)
        ax.axis("off")

    for ax in axes[len(results):]:
        ax.axis("off")

    fig.suptitle("UMIPE Chest X-Ray Preprocessing Pipeline — Step by Step", fontsize=15, y=1.02)
    fig.tight_layout()
    fig.savefig(os.path.join(os.path.dirname(__file__), "pipeline_grid.png"),
                dpi=140, bbox_inches="tight")
    plt.close(fig)


if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else None
    run(path)
