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
404.html
css/style.css         design tokens + global styles
css/project.css       detail page + 404
js/project-data.js    all project copy (single source of truth)
js/script.js          cards, scroll reveals, nav, draggable hero collage
js/project-detail.js  renders a case study + per-project meta tags
js/theme.js           shared per-page chores
public/assets/        favicons, resume.pdf
```

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

## Accessibility

- All text meets WCAG AA contrast.
- Motion is gated behind `prefers-reduced-motion` and a `js` class, with a
  failsafe so content is never left hidden.
- The draggable collage is enhancement-only: keyboard-operable with arrow keys,
  disabled under reduced motion and on small screens, and degrades to static
  cards without JavaScript.
- Skip link, visible focus rings, semantic landmarks.

## License

[MIT](LICENSE)
