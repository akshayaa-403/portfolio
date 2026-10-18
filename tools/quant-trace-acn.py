"""Run once: trace ACN's price line out of the old dashboard screenshot.

    python tools/quant-trace-acn.py

Reads public/assets/projects/quant-deepdive.webp (the pre-2026-10-12 code's
"Stock Deep Dive" tab) and prints one approximate close per calendar day as a
JS array, to paste into js/articles/quantamental-screener.js. The site stays
buildless; this only recovers numbers from a picture already on it.

Calibration is the chart's own: the y gridlines at $280 ... $120 and the
x tick labels at the first of Sep/Nov 2025 and Jan/Mar/May/Jul 2026. The line
is the only blue-violet ink in the plot area. A column's price is the mean
row of its line pixels, so steep moves inside one column are averaged:
approximate to about a dollar, and labelled so on the page.
"""
from datetime import date, timedelta
from pathlib import Path

import numpy as np
from PIL import Image

SRC = Path(__file__).resolve().parent.parent / "public/assets/projects/quant-deepdive.webp"

# y pixel of the $280 and $120 gridlines (measured: rows 292.8 and 496.8)
Y280, Y120 = 292.8, 496.8
# x pixel of the 2025-09-01 and 2026-07-01 tick-label centres
X0, D0 = 135.5, date(2025, 9, 1)
X1, D1 = 1079.5, date(2026, 7, 1)
PX_PER_DAY = (X1 - X0) / (D1 - D0).days


def trace():
    a = np.asarray(Image.open(SRC).convert("RGB")).astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    line = (b > 150) & (b - r > 50) & (b - g > 50)
    line[:260] = False
    line[520:] = False
    xs, ys = [], []
    for x in range(a.shape[1]):
        rows = np.nonzero(line[:, x])[0]
        if len(rows):
            xs.append(x)
            ys.append(rows.mean())
    xs, ys = np.array(xs, float), np.array(ys)
    price = 280 - (ys - Y280) * (280 - 120) / (Y120 - Y280)
    days = (xs - X0) / PX_PER_DAY
    first, last = int(np.ceil(days.min())), int(np.floor(days.max()))
    grid = np.arange(first, last + 1)
    vals = np.interp(grid, days, price)
    return D0 + timedelta(days=first), vals


if __name__ == "__main__":
    start, vals = trace()
    assert 100 < vals.min() < 135 and 270 < vals.max() < 295, (vals.min(), vals.max())
    print("start", start.isoformat(), "days", len(vals))
    print("[" + ",".join(f"{v:.1f}" for v in vals) + "]")
