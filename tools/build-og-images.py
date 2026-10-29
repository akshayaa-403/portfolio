"""Share-preview cards as JPEG: public/assets/og/<id>.jpg and hobby-<id>.jpg.

LinkedIn has been unreliable with WebP previews, so every card is a 1200x630
JPEG: title and tagline on the left, the project's own picture on the right
(its `screen`, else its thumbnail; a gallery's first photograph). A project
with neither gets no card, and tools/build-share-pages.js falls back to
og-card.png for it.

Run once after a project's title, tagline or picture changes, then
`node tools/build-share-pages.js`. Output is committed; the site stays
buildless.

    python tools/build-og-images.py
"""
import json, os, subprocess, textwrap
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'assets', 'og')
W, H = 1200, 630
PAPER, INK, SOFT, MUTED, ACCENT = '#f4f7fa', '#16283d', '#3c5a7a', '#4e6880', '#094e94'


def font(names, size):
    for n in names:
        try:
            return ImageFont.truetype(n, size)
        except OSError:
            pass
    return ImageFont.load_default(size)


SERIF = lambda s: font(['georgia.ttf', 'DejaVuSerif.ttf'], s)
MONO = lambda s: font(['consola.ttf', 'DejaVuSansMono.ttf'], s)


def data(fn):
    js = "process.stdout.write(JSON.stringify(require('./tools/data')." + fn + "()))"
    return json.loads(subprocess.check_output(['node', '-e', js], cwd=ROOT))


def card(path, kind, title, tagline, picture):
    im = Image.new('RGB', (W, H), PAPER)
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 10, H], fill=ACCENT)
    x, y = 72, 72
    d.text((x, y), kind.upper(), font=MONO(22), fill=MUTED)
    y += 54
    for line in textwrap.wrap(title, 18)[:3]:
        d.text((x, y), line, font=SERIF(58), fill=INK)
        y += 70
    y += 14
    for line in textwrap.wrap(tagline, 34)[:5]:
        d.text((x, y), line, font=SERIF(27), fill=SOFT)
        y += 38
    d.text((x, H - 72), 'Akshayaa Kashyap · AI Engineer', font=MONO(22), fill=MUTED)

    pic = Image.open(picture).convert('RGB')
    box_w, box_h = 520, 520
    k = min(box_w / pic.width, box_h / pic.height, 1.5)   # no more than 1.5x up
    pic = pic.resize((round(pic.width * k), round(pic.height * k)), Image.LANCZOS)
    px, py = 1200 - 56 - pic.width, (H - pic.height) // 2
    d.rectangle([px - 1, py - 1, px + pic.width, py + pic.height], outline='#c9d3de')
    im.paste(pic, (px, py))
    im.save(path, 'JPEG', quality=86, optimize=True, progressive=True)
    print(os.path.relpath(path, ROOT))


def biggest(paths):
    found = [p for p in paths if p and os.path.exists(os.path.join(ROOT, p))]
    return max(found, key=lambda p: Image.open(os.path.join(ROOT, p)).width, default=None)


def main():
    os.makedirs(OUT, exist_ok=True)
    for p in data('loadProjects'):
        screen = p.get('screen')
        screen = screen[0] if isinstance(screen, list) else screen
        pic = biggest([screen, 'public/assets/work/' + p['id'] + '-thumb.webp'])
        if not pic:
            continue
        card(os.path.join(OUT, p['id'] + '.jpg'), 'Case study', p['title'], p.get('tagline', ''),
             os.path.join(ROOT, pic))
    for gid, g in data('loadHobbies').items():
        pic = os.path.join(ROOT, 'public', 'assets', 'hobbies', gid + '-1.webp')
        if os.path.exists(pic):
            card(os.path.join(OUT, 'hobby-' + gid + '.jpg'), 'Gallery', g['label'], g.get('note', ''), pic)


if __name__ == '__main__':
    main()
