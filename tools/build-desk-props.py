"""Cut desk mode's objects out of the owner's reference images.

OpenCV, run once, output committed -- like tools/trace-figures.py, so the
site stays buildless. Reads .claude/references/ (the owner's mood folder,
which is only opened when the owner asks), writes public/assets/desk/*.webp
with real transparency.

Most of the references are "transparent PNG" previews with the grey
checkerboard baked into the pixels, or objects on a flat white or grey
ground. Every cut is the same idea: the background is the set of pixels
close to the ground's colours that is CONNECTED TO THE IMAGE BORDER (plus,
for a frame, its open middle). Anything enclosed by the object is kept,
so a white highlight inside a statue does not become a hole.

    python tools/build-desk-props.py
"""
import os
import glob
import cv2
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REF = os.path.join(ROOT, '.claude', 'references')
OUT = os.path.join(ROOT, 'public', 'assets', 'desk')
MAX_SIDE = 520          # about twice the largest size anything is shown at


def ref(prefix):
    """Open a reference by the start of its (sometimes very long) name."""
    hits = [f for f in os.listdir(REF) if f.startswith(prefix)]
    assert len(hits) == 1, (prefix, hits)
    path = os.path.join(REF, hits[0])
    if os.name == 'nt':
        path = '\\\\?\\' + path            # names past MAX_PATH
    return cv2.cvtColor(np.asarray(Image.open(path).convert('RGB')), cv2.COLOR_RGB2BGR)


def ground(img, greys, tol, sat_max=16, seeds=()):
    """Mask of background pixels: near one of `greys`, unsaturated, and
    connected to the border or to one of `seeds` (x, y)."""
    g = img.astype(int)
    v = g.mean(2)
    sat = g.max(2) - g.min(2)
    near = np.zeros(v.shape, bool)
    for c in greys:
        near |= np.abs(v - c) <= tol
    near &= sat <= sat_max
    n, lab = cv2.connectedComponents(near.astype(np.uint8), connectivity=4)
    keep = set(np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    for x, y in seeds:
        keep.add(lab[y, x])
    keep.discard(0)
    return np.isin(lab, list(keep))


def save(name, img, alpha, crop=True, max_side=MAX_SIDE):
    """Feather the edge a pixel, trim to the object, cap the size, write."""
    a = alpha.astype(np.uint8) * 255
    a = cv2.erode(a, np.ones((2, 2), np.uint8))
    a = cv2.GaussianBlur(a, (3, 3), 0)
    if crop:
        ys, xs = np.nonzero(a > 8)
        y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
        img, a = img[y0:y1, x0:x1], a[y0:y1, x0:x1]
    rgba = np.dstack([cv2.cvtColor(img, cv2.COLOR_BGR2RGB), a])
    im = Image.fromarray(rgba)
    s = max_side / max(im.size)
    if s < 1:
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    path = os.path.join(OUT, name + '.webp')
    im.save(path, 'WEBP', quality=86, method=6)
    print('%-16s %4dx%-4d %6d B' % (name, im.width, im.height, os.path.getsize(path)))


CHECKER = (236, 252)


def cutout(name, prefix, greys, tol, **kw):
    img = ref(prefix)
    save(name, img, ~ground(img, greys, tol, **kw))


def laptop():
    """The MacBook: white ground off, and the wallpaper inside the bezel off
    too, so the page can paint its own screen behind the photograph."""
    img = ref('Untitled design (6)')
    alpha = ~ground(img, (255,), 6, sat_max=8)
    g = img.astype(int)
    dark = g.max(2) < 70
    # The glass: the largest region inside the bezel that is not bezel-dark.
    h, w = dark.shape
    inner = (~dark).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(inner, connectivity=4)
    cx, cy = w // 2, h // 3
    glass = lab == lab[cy, cx]
    alpha &= ~glass
    ys, xs = np.nonzero(glass)
    print('laptop glass box (px of %dx%d): x %d-%d, y %d-%d' % (w, h, xs.min(), xs.max(), ys.min(), ys.max()))
    save('laptop', img, alpha, crop=False, max_side=10 ** 4)   # shown larger than its 710px


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    laptop()
