"""
Generates a SYNTHETIC chest-X-ray-style phantom image purely so the
preprocessing pipeline has something to run on for this demo.

Replace this with real files from your dataset folder
(e.g. data/raw/*.png or *.dcm) once you wire up actual training data —
this script's only job is to make the pipeline visualization runnable
without needing a real patient image.
"""

import numpy as np
import cv2


def generate_phantom(size=(512, 512), seed=7) -> np.ndarray:
    rng = np.random.default_rng(seed)
    h, w = size
    img = np.full((h, w), 30, dtype=np.float32)  # dark background

    # rib cage / thoracic cavity (bright oval)
    cv2.ellipse(img, (w // 2, h // 2), (w // 2 - 40, h // 2 - 30), 0, 0, 360, 90, -1)

    # two lung fields (darker, since lungs are air-filled -> low density)
    cv2.ellipse(img, (w // 2 - 110, h // 2 + 10), (95, 150), 10, 0, 360, 40, -1)
    cv2.ellipse(img, (w // 2 + 110, h // 2 + 10), (95, 150), -10, 0, 360, 40, -1)

    # spine (bright vertical strip)
    cv2.rectangle(img, (w // 2 - 15, 60), (w // 2 + 15, h - 60), 140, -1)

    # ribs (faint arcs)
    for i in range(8):
        y = 120 + i * 35
        cv2.ellipse(img, (w // 2, y), (170, 22), 0, 200, 340, 100, 2)

    # clavicles
    cv2.line(img, (w // 2 - 150, 90), (w // 2 - 40, 60), 130, 6)
    cv2.line(img, (w // 2 + 150, 90), (w // 2 + 40, 60), 130, 6)

    # simulated opacity / nodule (small bright blob in right lung)
    cv2.circle(img, (w // 2 + 130, h // 2 - 40), 14, 170, -1)

    # sensor noise
    noise = rng.normal(0, 8, size).astype(np.float32)
    img = img + noise

    # uneven exposure vignette (common real-world artifact)
    yy, xx = np.mgrid[0:h, 0:w]
    cx, cy = w / 2, h / 2
    vignette = 1 - 0.25 * (((xx - cx) ** 2 + (yy - cy) ** 2) / (cx**2 + cy**2))
    img = img * vignette

    img = np.clip(img, 0, 255).astype(np.uint8)
    return img


if __name__ == "__main__":
    phantom = generate_phantom()
    cv2.imwrite("/home/claude/umipe_backend/demo/sample_chest_xray_phantom.png", phantom)
    print("Saved synthetic phantom.")
