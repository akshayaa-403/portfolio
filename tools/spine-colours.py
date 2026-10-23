#!/usr/bin/env python3
"""Write each book's spine colour into js/readings-data.js, sampled from its cover.

The spine is the cover's most prominent real colour (see dominant()), made vivid;
the back of the book uses it too. Written as `spine: '#rrggbb'` on
the line after `cover:`, replacing any value already there, so the site stays
buildless and the colour costs no image fetch. A book with no cover gets no
field and draws black (js/script.js).

Requires Pillow. Re-run after adding or replacing a cover:

    python tools/spine-colours.py
"""

import colorsys
import math
import os
import re
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required: pip install Pillow")

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
DATA = os.path.join(ROOT, "js", "readings-data.js")


def dominant(path):
    """The cover's most prominent real colour, never black, white or grey.

    Every pixel with real colour in it (chroma, max-min, of at least 22%:
    so not black, white, grey or cream paper -- HLS saturation would call
    cream saturated) votes for one of 24 hue bins, weighted by its chroma,
    so a red title on a white cover beats the white. The winning bin's
    average colour keeps its hue and is pushed vivid -- saturation at least
    60%, lightness 38-58% -- so the spine stands out on the shelf rather
    than fading into the page. Per pixel rather than a reduced palette: a
    palette averages a small green title into the paper around it."""
    with Image.open(path) as im:
        im = im.convert("RGB")
        im.thumbnail((160, 160))
        raw = im.tobytes()
    px = zip(raw[0::3], raw[1::3], raw[2::3])
    # Per bin: total weight, weighted lightness, weighted saturation, and the
    # hue as a weighted vector (hue is circular, so it is averaged as one).
    bins = [[0.0, 0.0, 0.0] for _ in range(24)]
    vec = [[0.0, 0.0] for _ in range(24)]
    for r, g, b in px:
        r, g, b = r / 255, g / 255, b / 255
        chroma = max(r, g, b) - min(r, g, b)
        if chroma < 0.22:
            continue
        h, l, s = colorsys.rgb_to_hls(r, g, b)
        k = int(h * 24) % 24
        bins[k][0] += chroma
        bins[k][1] += l * chroma
        bins[k][2] += s * chroma
        vec[k][0] += math.cos(h * 2 * math.pi) * chroma
        vec[k][1] += math.sin(h * 2 * math.pi) * chroma
    k = max(range(24), key=lambda i: bins[i][0])
    hls = None
    if bins[k][0] > 0:
        w = bins[k][0]
        h = (math.atan2(vec[k][1], vec[k][0]) / (2 * math.pi)) % 1
        hls = (h, bins[k][1] / w, bins[k][2] / w)
    if hls is None:
        # A wholly monochrome cover: a deep ink blue rather than a grey.
        hls = (0.6, 0.45, 0.6)
    h, l, s = hls
    r, g, b = colorsys.hls_to_rgb(h, min(0.58, max(0.38, l)), max(0.6, s))
    return "#%02x%02x%02x" % (round(r * 255), round(g * 255), round(b * 255))


def main():
    raw = open(DATA, encoding="utf-8", newline="").read()
    nl = "\r\n" if "\r\n" in raw else "\n"
    s = raw.replace("\r\n", "\n")

    def put(m):
        indent, path = m.group(1), m.group(2)
        hexv = dominant(os.path.join(ROOT, path))
        print(hexv, path)
        return "%scover: '%s',\n%sspine: '%s',\n" % (indent, path, indent, hexv)

    s = re.sub(r"( +)cover: '([^']+)',\n(?: +spine: '[^']*',\n)?", put, s)
    open(DATA, "w", encoding="utf-8", newline="").write(s.replace("\n", nl))


if __name__ == "__main__":
    main()
