# Portfolio — Akshayaa Kashyap

Personal portfolio site. Software engineer with AI specialist experience —
data pipelines, LLM workflows and dashboards.

**Live:** https://akshayaa-403.github.io/portfolio/

## Stack

Deliberately none. Plain HTML, CSS and vanilla JavaScript — no framework, no
bundler, no `package.json`, no build step. Clone it and open `index.html`, or
serve the folder statically.

```bash
python -m http.server 8000
# → http://localhost:8000
```

## Layout

```
index.html            single-page site
project.html          case-study page, driven by ?id=
hobby.html            gallery page, driven by ?id=
404.html
work/, hobbies/       generated share pages (see Tooling)
css/style.css         design tokens + global styles
css/project.css       detail + hobby pages
js/util.js            shared helpers (esc, safeUrl, rotationOf) — loads first
js/project-data.js    all project copy (single source of truth)
js/script.js          cards, scroll reveals, draggable hero collage
js/nav.js             mobile menu, shared by every page
js/project-detail.js  renders a case study + per-project meta tags
js/theme.js           theme, header height, footer year
js/hobby-dims.js      generated image dimensions (prevents gallery CLS)
public/assets/        favicons, og-card.png, resume.pdf
tools/                build + check scripts (never run at serve time)
```

## Tooling

The site itself is still buildless — nothing below runs when it is served.
These are maintenance scripts, run by hand when the content changes.

```bash
node tools/check.js                # link/anchor/a11y/consistency checks
node tools/build-share-pages.js    # per-project share pages + sitemap + image dims
python tools/build-image-variants.py   # 600px gallery variants (needs Pillow)
```

`check.js` exits non-zero on failure, so it works as a pre-push hook or CI
step. Run `build-share-pages.js` after editing `js/project-data.js` — social
previews and the sitemap are generated from it, and `check.js` fails if they
have gone stale.

Social crawlers do not run JavaScript, so `project.html?id=x` cannot carry a
per-project preview on its own. `tools/build-share-pages.js` writes one real
page per project under `work/` (and per gallery under `hobbies/`) carrying
proper `og:` tags, each redirecting a real visitor to the renderer. Share those
URLs rather than the query-string ones.

## Design

Blue-on-paper: the palette is sampled from the site's own lotus favicon — deep
navy, mid blue and pale blue over cool paper — with IBM Plex Mono throughout and
a script face for the name. A faded lily blooms open behind the hero on load.

**Three view modes**, switchable from the header and remembered between visits:

| Mode | What it is |
|---|---|
| `chaos` | Default. Draggable cards scattered across a canvas with desk props. |
| `notebook` | Ruled paper, one column, cards taped in like clippings. |
| `clean` | No props or motion. Just type and a plain grid. |

Design tokens are documented in `.claude/color-scheme.md`; broader context in
`.claude/redesign-metadata.md`.

> **Note:** the decorative props in `public/assets/props/` are third-party images
> used as placeholders. Replace them with owned or licensed assets before
> publishing — see `.claude/redesign-metadata.md`.

## Live demo embeds

Every project with a `demo` URL gets a click-to-activate embed on its case
study, framed like a browser window. Nothing loads until the visitor asks —
six third-party apps auto-loading would cost more than the case studies
themselves, and idle Streamlit apps wake slowly.

Adding a demo on a new host means adding that origin to `project.html`'s
`frame-src`; `tools/check.js` fails if you forget. Whether a cross-origin
frame actually painted is not detectable from the page, so the caption under
every embed keeps a direct link — a blank frame is never a dead end.

## Accessibility

- All text meets WCAG AA contrast.
- Motion is gated behind `prefers-reduced-motion` and a `js` class, with a
  failsafe so content is never left hidden.
- The draggable collage is enhancement-only: keyboard-operable with arrow keys,
  disabled under reduced motion and on small screens, and degrades to static
  cards without JavaScript.
- Skip link (first focusable element on every page, targeting a focusable
  `<main>`), visible focus rings, semantic landmarks.
- Smooth scrolling is gated on `prefers-reduced-motion`, so the skip link
  jumps instantly for motion-sensitive users.
- Verified with axe-core: zero WCAG 2.1 AA violations across all four pages,
  in both themes and all three view modes.

## License

[MIT](LICENSE)
