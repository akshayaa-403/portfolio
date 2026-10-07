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


def vision_board():
    """A sheet of cut-outs on a flat grey: each connected object kept is its
    own file. Objects are named by a point on them (x, y in the sheet), not
    by label number, which shifts with the threshold; one that falls apart
    into pieces can be given a point on each."""
    img = ref('Vision Board Cutouts')
    bg = ground(img, (229,), 13, sat_max=14)
    fg = cv2.morphologyEx((~bg).astype(np.uint8), cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    n, lab = cv2.connectedComponents(fg, connectivity=8)
    groups = {
        'star-charm': [(640, 150)], 'eight-ball': [(647, 700)],
        'heart-key': [(300, 740)], 'leica': [(310, 900)],
        'books-glasses': [(330, 1130)], 'keys': [(140, 1150)], 'cassette': [(600, 1210)],
    }

    def label_near(x, y, r=14):
        win = lab[y - r:y + r, x - r:x + r]
        ids, counts = np.unique(win[win > 0], return_counts=True)
        assert len(ids), ('no object near', x, y)
        return ids[counts.argmax()]

    for name, pts in groups.items():
        m = np.isin(lab, [label_near(x, y) for x, y in pts])
        m = cv2.morphologyEx(m.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8)).astype(bool)
        # Fill holes, so nothing inside an object is see-through.
        cnts, _ = cv2.findContours(m.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
        solid = np.zeros(m.shape, np.uint8)
        cv2.drawContours(solid, cnts, -1, 1, -1)
        save(name, img, solid.astype(bool))


def flat(name, prefix, box):
    """A rectangle of a reference kept as it is (a print, a painting)."""
    img = ref(prefix)
    x0, y0, x1, y1 = box
    crop = img[y0:y1, x0:x1]
    save(name, crop, np.ones(crop.shape[:2], bool), crop=False)


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    laptop()
    vision_board()
    cutout('swirl', 'Download free image of Van Gogh', CHECKER, 9)
    cutout('starry-night', 'Download premium png of The Starry Night', CHECKER, 9)
    cutout('goddess', 'Download premium png of Greek goddess', CHECKER, 7, sat_max=10)
    cutout('grad-cap', 'Vintage Black and White Graduation Cap', (30, 58), 14)
    cutout('moon', 'download (4)', (255,), 10)
    cutout('paper-star', 'download (6)', (255,), 10)
    cutout('enter-key', 'download (7)', (255,), 4, sat_max=6)
    flat('flora-print', 'Download premium psd _ image of Flora', (40, 40, 696, 696))
    flat('water-lilies', 'download (5)', (110, 110, 626, 626))
