#!/usr/bin/env python3
"""Find the ruling on each note in public/assets/notes/, once, offline.

    python tools/trace-notes.py

The reading overlay writes a book's summary onto a torn scrap of ruled paper,
and it has to write ON the rules rather than over them. Finding them in the
browser would mean a canvas read, a skew search and a profile scan on every
open, of an image that never changes — so it is done here instead and the
answer is committed to js/note-data.js. The site stays buildless.

Two things happen per note:

  1. DESKEW. Two of the three scraps are photographed at an angle, so their
     rules are not image rows and no row scan can see them. The sheet's angle
     is recovered by rotating it through a range and keeping whichever angle
     makes the row-luminance profile sharpest — ruled paper has the sharpest
     profile exactly when its rules are horizontal. The deskewed image is
     written back in place, so the runtime gets a flat sheet and sets text
     straight across it. Re-running is a no-op: a straight sheet measures 0.

  2. THE RULES. On the deskewed sheet, a rule is a row that is darker than the
     paper around it across most of the sheet's width. Rows are clustered so a
     two-pixel-thick rule counts once, and each rule carries the left and
     right edge of the paper AT THAT ROW — these are torn scraps, so the
     writing area narrows where the tear is, and the walk outward from the
     middle of the sheet stops at anything that is not paper, so a doodled
     star or a strip of tape lying over the scrap is not written on.

To add a note: drop a background-free PNG or WebP in public/assets/notes/ and
run this again. Nothing else needs editing; js/script.js reads whatever is in
js/note-data.js and picks among the notes big enough to hold the text.
"""
import json
import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit('Pillow is required: python -m pip install Pillow')

SRC = os.path.join('public', 'assets', 'notes')
OUT = os.path.join('js', 'note-data.js')

OPAQUE = 200          # alpha at or above this is paper, below it is cut-away
COVERAGE = 0.55       # a row is "across the sheet" at this fraction of its width
DARKER = 2.0          # luminance below paper level that counts as a rule
GAP = 3               # rows this close together are one rule


def grey(im):
    """Luminance and alpha planes, as flat lists."""
    w, h = im.size
    px = im.load()
    lum = [0.0] * (w * h)
    alp = [0] * (w * h)
    for y in range(h):
        r = y * w
        for x in range(w):
            p = px[x, y]
            lum[r + x] = 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2]
            alp[r + x] = p[3]
    return lum, alp, w, h


def profile(lum, alp, w, h):
    """Mean paper luminance per row, over the rows that cross the sheet."""
    out = []
    for y in range(h):
        r = y * w
        n = 0
        tot = 0.0
        for x in range(w):
            if alp[r + x] >= OPAQUE:
                n += 1
                tot += lum[r + x]
        out.append((n, tot / n if n else None))
    return out


def sharpness(prof, w):
    """How much a profile looks like ruled paper.

    The second difference of the row profile spikes at a rule and is flat on
    blank paper, so its total magnitude peaks when the rules line up with the
    rows — which is the definition of deskewed. Rows that do not cross the
    sheet are skipped so the torn edges do not vote.
    """
    vals = [m for n, m in prof if n > w * COVERAGE and m is not None]
    if len(vals) < 5:
        return 0.0
    return sum(abs(vals[i - 1] - 2 * vals[i] + vals[i + 1])
               for i in range(1, len(vals) - 1))


def deskew(im):
    """The angle that makes this sheet's rules horizontal."""
    best, best_score = 0.0, -1.0
    # Coarse then fine: 51 rotations of a 500px image, not 201.
    for step, span, centre in ((1.0, 25.0, 0.0), (0.1, 1.0, None)):
        c = best if centre is None else centre
        a = c - span
        while a <= c + span + 1e-9:
            r = im.rotate(a, resample=Image.BICUBIC, expand=True,
                          fillcolor=(0, 0, 0, 0))
            lum, alp, w, h = grey(r)
            s = sharpness(profile(lum, alp, w, h), w)
            if s > best_score:
                best_score, best = s, a
            a += step
    return best


def rules(im):
    """Every rule on a deskewed sheet, with the paper's edges at that row."""
    lum, alp, w, h = grey(im)
    prof = profile(lum, alp, w, h)

    across = [m for n, m in prof if n > w * COVERAGE and m is not None]
    if not across:
        return []
    across.sort()
    paper = across[len(across) // 2]        # the median row IS blank paper

    hits = [y for y, (n, m) in enumerate(prof)
            if n > w * COVERAGE and m is not None and m < paper - DARKER]

    clusters, cur = [], []
    for y in hits:
        if cur and y - cur[-1] > GAP:
            clusters.append(cur)
            cur = []
        cur.append(y)
    if cur:
        clusters.append(cur)

    px = im.load()

    def fill_gaps(ys):
        """Put back the rules the scan was too faint to see.

        Ruled paper is evenly ruled, so a gap that measures close to a whole
        number of the usual spacing is not a wide margin, it is one or two
        rules that were printed lighter or are lying under a strip of tape.
        Leaving them out makes the writing skip lines.
        """
        if len(ys) < 3:
            return ys
        gaps = sorted(ys[i + 1] - ys[i] for i in range(len(ys) - 1))
        unit = gaps[len(gaps) // 2]
        if unit < 4:
            return ys
        out = [ys[0]]
        for a, b in zip(ys, ys[1:]):
            n = int(round((b - a) / float(unit)))
            # Only whole multiples, and only small ones: a real margin at the
            # top of a page is not a run of missing rules.
            if 2 <= n <= 4 and abs((b - a) / float(n) - unit) < unit * 0.25:
                for k in range(1, n):
                    out.append(a + int(round((b - a) * k / float(n))))
            out.append(b)
        return out

    def drop_strays(ys):
        """Throw out the lines that are not part of the ruling.

        A sheet's own top edge, the shadow under a bulldog clip and the seam
        of a strip of tape all read as one dark row across the paper, and they
        land wherever they land — which shows up as one gap far shorter than
        the rest. Whichever of the two rows around that gap leaves the ruling
        more even is the real rule; the other is thrown away.
        """
        while len(ys) > 3:
            gaps = [ys[i + 1] - ys[i] for i in range(len(ys) - 1)]
            unit = sorted(gaps)[len(gaps) // 2]
            worst = min(range(len(gaps)), key=lambda i: gaps[i])
            if gaps[worst] >= unit * 0.6:
                return ys
            a = ys[:worst] + ys[worst + 1:]
            b = ys[:worst + 1] + ys[worst + 2:]
            ys = min(a, b, key=evenness)
        return ys

    def evenness(ys):
        gaps = [ys[i + 1] - ys[i] for i in range(len(ys) - 1)]
        if not gaps:
            return 0.0
        mean = sum(gaps) / float(len(gaps))
        return sum((g - mean) ** 2 for g in gaps)

    def paper_at(x, y):
        """Opaque, bright and near-neutral: paper, not a doodle or the tape."""
        r, g, b, a = px[x, y]
        return a >= OPAQUE and max(r, g, b) > 120 and max(r, g, b) - min(r, g, b) < 70

    out = []
    for y in fill_gaps(drop_strays([sum(c) // len(c) for c in clusters])):
        # Probe the blank paper just above the rule, not the rule itself — on
        # the rule every pixel is the rule, and the test would reject it.
        yp = max(0, y - 4)
        mid = w // 2
        if not paper_at(mid, yp):
            continue
        x0 = mid
        while x0 > 0 and paper_at(x0 - 1, yp):
            x0 -= 1
        x1 = mid
        while x1 < w - 1 and paper_at(x1 + 1, yp):
            x1 += 1
        out.append({'y': y, 'x0': x0, 'x1': x1})
    return out


def main():
    if not os.path.isdir(SRC):
        sys.exit('No ' + SRC)

    notes = []
    for name in sorted(os.listdir(SRC)):
        if not name.lower().endswith(('.png', '.webp')):
            continue
        path = os.path.join(SRC, name)
        im = Image.open(path).convert('RGBA')

        angle = deskew(im)
        if abs(angle) > 0.15:
            im = im.rotate(angle, resample=Image.BICUBIC, expand=True,
                           fillcolor=(0, 0, 0, 0))
            # Trim back to the paper, so the sheet is the image.
            box = im.getchannel('A').point(lambda v: 255 if v >= OPAQUE else 0).getbbox()
            if box:
                im = im.crop(box)

        stem = os.path.splitext(name)[0]
        dst = os.path.join(SRC, stem + '.webp')
        im.save(dst, 'WEBP', lossless=True)
        if dst != path:
            os.remove(path)

        found = rules(im)
        notes.append({
            'src': (SRC + '/' + stem + '.webp').replace('\\', '/'),
            'w': im.size[0],
            'h': im.size[1],
            'deskewed': round(angle, 2),
            'rules': found
        })
        print('%-26s %4dx%-4d  deskew %6.2f deg  %2d rules'
              % (stem, im.size[0], im.size[1], angle, len(found)))

    body = ',\n  '.join(json.dumps(n) for n in notes)
    with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
        f.write(
            '/* GENERATED by tools/trace-notes.py — do not hand-edit.\n'
            '\n'
            '   One entry per scrap of paper in public/assets/notes/. `rules` is\n'
            '   every ruled line on the deskewed sheet, in the image\'s own pixels:\n'
            '   `y` is the line, `x0`/`x1` are the paper\'s edges at that line, which\n'
            '   narrow where the scrap is torn. `deskewed` is the angle that was\n'
            '   taken out of the photograph and is kept only as a record.\n'
            '\n'
            '   Read by renderReadings() in js/script.js, which writes a book\'s\n'
            '   summary along these lines. A bare global, like the other data\n'
            '   files. Add a note by dropping a background-free image in that\n'
            '   folder and running the tool again. */\n'
            'var notePapers = [\n  ' + body + '\n];\n')
    print('\nWrote ' + OUT + ' (' + str(len(notes)) + ' notes)')


if __name__ == '__main__':
    main()
