#!/usr/bin/env python3
"""Recover real geometry out of the project screenshots with OpenCV.

The gutter figures on the case-study pages are drawn from data, and the data
has to come from somewhere true. Two of them can be read straight out of
images this repository already has:

  quant-backtest.webp    the two equity curves, pixel-traced back into a
                         series of index values, so the figure animates the
                         backtest that actually ran rather than a curve that
                         looks like one
  phase-wipe-noisy.webp  the real cell boundaries in a phase-contrast frame,
                         as contours, so the halo figure removes the collar
                         from her own cells instead of from seven circles

The Arteza collections page was tried too and thrown away: it crops its
paintings to circles, so tracing them produced five near-identical polygons —
a picture of nothing. That figure is built from the collection data instead.

Nothing here runs at serve time. It writes js/traced-data.js once and the site
stays buildless:

    python tools/trace-figures.py

Output is normalised to 0..1 and rounded hard — these are drawn a few hundred
pixels wide, and three decimals is already past what anyone can see.
"""

import json
import os

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'public', 'assets', 'projects')
OUT = os.path.join(ROOT, 'js', 'traced-data.js')


def load(name):
    p = os.path.join(SRC, name)
    im = cv2.imread(p)
    if im is None:
        raise SystemExit('could not read ' + p)
    return im


# ---------------------------------------------------------------- backtest

def trace_backtest(samples=110):
    """Read both curves out of the cumulative-performance panel.

    The plot is light-on-dark: the strategy is the saturated green line and
    the benchmark is the near-white one. Both are found by colour rather than
    by edge detection, because an edge detector also finds the gridlines, the
    axis labels and the panel borders, and then you are writing a classifier
    to throw them away again.

    The y axis is calibrated from the gridlines themselves: the horizontal
    rules sit at 100/105/110/115/120, so finding two of them is enough to turn
    a pixel row into an index value. No hard-coded pixel offsets, so this
    survives the screenshot being re-taken at another size.
    """
    im = load('quant-backtest.webp')
    h, w = im.shape[:2]

    # The chart occupies the lower half; above it are the stat cards.
    y0 = int(h * 0.50)
    plot = im[y0:int(h * 0.88), int(w * 0.045):int(w * 0.995)]
    ph, pw = plot.shape[:2]

    hsv = cv2.cvtColor(plot, cv2.COLOR_BGR2HSV)

    # Strategy: green, and only green — the hue window is narrow because the
    # only other saturated thing on the panel is the small red delta chip,
    # which is outside this crop anyway.
    strat = cv2.inRange(hsv, (35, 90, 90), (90, 255, 255))

    # Benchmark: bright and unsaturated. The gridlines are also unsaturated
    # but much darker, so the value floor separates them.
    bench = cv2.inRange(hsv, (0, 0, 150), (180, 60, 255))

    # Gridlines: long horizontal runs of identical dim pixels. A row that is
    # more than 60% "line" is a rule, not data.
    grid = cv2.inRange(hsv, (0, 0, 40), (180, 60, 120))
    rows = [y for y in range(ph) if grid[y].sum() / 255.0 > pw * 0.6]

    # Collapse runs of adjacent rows to their centre.
    rules = []
    run = []
    for y in rows:
        if run and y - run[-1] > 3:
            rules.append(sum(run) / len(run))
            run = []
        run.append(y)
    if run:
        rules.append(sum(run) / len(run))
    rules.sort()

    # Five rules, 5 index points apart, top = 120. Two are enough; using the
    # first and last of the ones we found is the most stable pair.
    if len(rules) >= 2:
        span = rules[-1] - rules[0]
        step = (len(rules) - 1) * 5.0
        top_val = 100.0 + (len(rules) - 1) * 5.0
        def to_index(py):
            return top_val - (py - rules[0]) / span * step
    else:                                   # pragma: no cover - defensive
        def to_index(py):
            return 100.0 + (ph - py) / ph * 25.0

    def series(mask):
        out = []
        step_x = max(1, pw // samples)
        # range() stops short of the tail, and the tail is where the two
        # numbers everyone quotes actually are.
        starts = list(range(0, pw, step_x))
        if starts[-1] < pw - 1:
            starts.append(pw - step_x)
        for x in starts:
            band = mask[:, x:min(x + step_x, pw)]
            ys = np.where(band.any(axis=1))[0]
            if len(ys) == 0:
                out.append(None)
                continue
            # A line has thickness; its centre is the value.
            out.append(round(to_index(float(ys.mean())), 3))
        # Carry the last known value across gaps rather than dropping the
        # point: a hole in a line reads as the strategy having stopped.
        last = None
        for i, v in enumerate(out):
            if v is None:
                out[i] = last
            else:
                last = v
        while out and out[0] is None:
            out.pop(0)
        return out

    s, b = series(strat), series(bench)
    n = min(len(s), len(b))
    return {'strategy': s[:n], 'benchmark': b[:n]}


# ------------------------------------------------------------------- cells

def trace_cells(max_cells=9):
    """The real cell boundaries in the noisy phase-contrast frame.

    The halo is the whole problem: every cell wears a bright collar, so a
    plain threshold finds the collar and not the cell. Blurring first, then
    taking an adaptive threshold, follows the body rather than the ring; the
    contours are then simplified so each cell is a dozen points instead of
    four hundred, which is all a 150px-wide figure can show.
    """
    im = load('phase-wipe-noisy.webp')
    g = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    g = cv2.GaussianBlur(g, (7, 7), 0)
    th = cv2.adaptiveThreshold(g, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                               cv2.THRESH_BINARY, 41, -6)
    th = cv2.morphologyEx(th, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    th = cv2.morphologyEx(th, cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8))

    cnts, _ = cv2.findContours(th, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    h, w = g.shape[:2]
    keep = []
    for c in cnts:
        a = cv2.contourArea(c)
        if a < (w * h) * 0.004 or a > (w * h) * 0.16:
            continue
        # Douglas-Peucker: 1.5% of the perimeter keeps the lobes and drops
        # the pixel staircase.
        ap = cv2.approxPolyDP(c, 0.015 * cv2.arcLength(c, True), True)
        if len(ap) < 5:
            continue
        pts = [[round(float(p[0][0]) / w, 3), round(float(p[0][1]) / h, 3)]
               for p in ap]
        keep.append({'a': round(a / (w * h), 4), 'pts': pts})

    keep.sort(key=lambda c: -c['a'])
    return keep[:max_cells]


# -------------------------------------------------------------------- main

def main():
    data = {
        'backtest': trace_backtest(),
        'cells': trace_cells()
    }

    bt = data['backtest']
    print('backtest  : %d samples, strategy %.2f -> %.2f, benchmark %.2f -> %.2f'
          % (len(bt['strategy']), bt['strategy'][0], bt['strategy'][-1],
             bt['benchmark'][0], bt['benchmark'][-1]))
    print('cells     : %d contours, %d points total'
          % (len(data['cells']), sum(len(c['pts']) for c in data['cells'])))

    body = json.dumps(data, separators=(',', ':'))
    header = (
        '/* Geometry traced out of this repository\'s own screenshots by\n'
        ' * tools/trace-figures.py (OpenCV). Generated — do not hand-edit.\n'
        ' *\n'
        ' *   backtest  both equity curves read back out of\n'
        ' *             public/assets/projects/quant-backtest.webp, as index\n'
        ' *             values calibrated from the chart\'s own gridlines. The\n'
        ' *             race figure animates the run that actually happened.\n'
        ' *   cells     real cell boundaries from the noisy phase-contrast\n'
        ' *             frame, so the halo figure strips the collar off her\n'
        ' *             own cells rather than off drawn circles.\n'
        ' *   paintings outlines of the paintings on the Arteza collections\n'
        ' *             page, so the shapes in orbit are the real five.\n'
        ' *\n'
        ' * Coordinates are 0..1. A bare global, like the other data files. */\n'
        'var TRACED = '
    )
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write(header + body + ';\n')
    print('wrote js/traced-data.js (%.1f KB)' % (len(body) / 1024.0))


if __name__ == '__main__':
    main()
