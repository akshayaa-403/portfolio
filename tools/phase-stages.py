"""Run once, output committed: the stage images of img_0002 for the
phase-contrast case study (js/articles/phase-contrast-denoising.js).

Calls the project's own code (src/pipeline.py, src/preprocessor.py) on
img_0002, one of the 20 frames the network never trained on, and writes six
256x256 lossless greyscale webps to public/assets/projects/phase-0002-<stage>.webp:

  raw       as captured (data/noisy_input/img_0002.png)
  dog       after Difference-of-Gaussians, normalised to 0..1
  clahe     after DoG + CLAHE (the cv_only output)
  residual  what the U-Net predicts and subtracts, mapped -1..1 -> 0..255
            (mid grey = nothing subtracted)
  hybrid    clamp(cv_only - residual, 0, 1)
  truth     data/ground_truth/img_0002.png

Lossless, so the article can read the pixel values back for its scan-line
traces. It also prints, as JSON, two 32x32 CLAHE tiles of the DoG output in
both quantisations (the article's "slider that did nothing" figure) and the
residual statistics, to check against the numbers quoted.

    <repo>/.venv/Scripts/python.exe tools/phase-stages.py <path to phase-contrast-denoising>
"""
import json
import os
import sys

PORTFOLIO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = os.path.abspath(sys.argv[1])
sys.path.insert(0, REPO)
os.chdir(REPO)

import cv2  # noqa: E402
import numpy as np  # noqa: E402
import torch  # noqa: E402
from src.pipeline import CleanupPipeline  # noqa: E402
from src.report import _load_gray01  # noqa: E402

OUT = os.path.join(PORTFOLIO, 'public', 'assets', 'projects')
pipe = CleanupPipeline('configs/default_config.yaml',
                       model_weights='models/pretrained_fp16.pth', device='cpu')
pre = pipe.cv_ops

noisy = _load_gray01('data/noisy_input/img_0002.png')
truth = _load_gray01('data/ground_truth/img_0002.png')
st = pipe.run_staged(noisy)
cv = st['cv_only']
with torch.no_grad():
    res = pipe.model.predict_residual(torch.from_numpy(cv).float()[None, None]).squeeze().numpy()
hybrid = np.clip(cv - res, 0, 1)
assert np.abs(hybrid - st['hybrid']).max() < 1e-5, 'hybrid differs from pipeline.run'

stages = {
    'raw': noisy, 'dog': st['dog'], 'clahe': cv,
    'residual': np.clip(res * 0.5 + 0.5, 0, 1), 'hybrid': hybrid, 'truth': truth,
}
for name, img in stages.items():
    path = os.path.join(OUT, 'phase-0002-%s.webp' % name)
    u8 = np.round(np.clip(img, 0, 1) * 255).astype(np.uint8)
    cv2.imwrite(path, u8, [cv2.IMWRITE_WEBP_QUALITY, 101])  # 101 = lossless
    back = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
    assert back is not None and np.array_equal(back, u8), path
    print('wrote %s (%d bytes)' % (os.path.relpath(path, PORTFOLIO), os.path.getsize(path)), file=sys.stderr)

# Two CLAHE tiles of the DoG output, quantised the shipped way (uint16) and
# the usual way (uint8). 8x8 grid on 256 px = 32x32 tiles of 1,024 px.
dog = pre.halo_suppression_dog(noisy)
lo, hi = float(dog.min()), float(dog.max())
u16 = ((dog - lo) / (hi - lo) * 65535.0).astype(np.uint16)
u8 = (pre.normalize_01(dog) * 255).astype(np.uint8)
stds = [(float(u16[ty*32:ty*32+32, tx*32:tx*32+32].std()), ty, tx) for ty in range(8) for tx in range(8)]
flat = min(stds)
tiles = {'cell': (5, 1), 'background': (flat[1], flat[2])}  # (5,1) holds row 168's big cell
out = {'tiles': {}}
for k, (ty, tx) in tiles.items():
    sl = (slice(ty*32, ty*32+32), slice(tx*32, tx*32+32))
    out['tiles'][k] = {'ty': ty, 'tx': tx, 'u16': u16[sl].ravel().tolist(), 'u8': u8[sl].ravel().tolist()}

mask = truth > 0.25
out['residual'] = {
    'pred_rms': round(float(np.sqrt((res ** 2).mean())), 3),
    'target_rms': round(float(np.sqrt(((cv - truth) ** 2).mean())), 3),
    'image_rms': round(float(np.sqrt((cv ** 2).mean())), 3),
    'corr_with_cells': round(float(np.corrcoef(res.ravel(), truth.ravel())[0, 1]), 3),
    'mean_background': round(float(res[~mask].mean()), 3),
    'mean_cells': round(float(res[mask].mean()), 3),
    'min': round(float(res.min()), 3), 'max': round(float(res.max()), 3),
}
print(json.dumps(out, separators=(',', ':')))
