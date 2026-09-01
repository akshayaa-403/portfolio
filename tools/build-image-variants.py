#!/usr/bin/env python3
"""Generate the 600px responsive variants the hobby galleries serve to phones.

Every gallery photo used to be served at its full desktop size — up to 198 KB
for a tile a few hundred CSS pixels wide, on 47 images. This writes a 600px
copy alongside each source (name-600.webp), which js/hobby-page.js offers via
srcset; the browser picks whichever is smaller for the viewport.

600px is chosen to cover a phone tile (~300 CSS px) at 2x device pixel ratio.

Requires Pillow (pip install Pillow). Re-run after adding gallery photos:

    python tools/build-image-variants.py

Then re-run `node tools/build-share-pages.js` so js/hobby-dims.js picks up any
new source images.
"""

import glob
import os
import sys

try:
    from PIL import Image
except ImportError:
    sys.exit("Pillow is required: pip install Pillow")

TARGET = 600
# Sources only a little wider than the target are not worth a second file.
MIN_SOURCE = TARGET + 60

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
GALLERY = os.path.join(ROOT, "public", "assets", "hobbies")


def main():
    if not os.path.isdir(GALLERY):
        sys.exit("no gallery directory at " + GALLERY)

    made = skipped = 0
    before = after = 0

    for path in sorted(glob.glob(os.path.join(GALLERY, "*.webp"))):
        name = os.path.basename(path)
        if name.endswith("-600.webp"):
            continue

        out = path[: -len(".webp")] + "-600.webp"

        with Image.open(path) as im:
            if im.width < MIN_SOURCE:
                skipped += 1
                continue
            # Skip work already done, unless the source is newer.
            if os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(path):
                skipped += 1
                continue
            height = round(im.height * TARGET / im.width)
            im.resize((TARGET, height), Image.LANCZOS).save(
                out, "WEBP", quality=82, method=6
            )

        made += 1
        before += os.path.getsize(path)
        after += os.path.getsize(out)

    print("wrote %d variants, skipped %d" % (made, skipped))
    if made:
        print(
            "  %.2f MB -> %.2f MB for those images on small screens"
            % (before / 1048576, after / 1048576)
        )


if __name__ == "__main__":
    main()
