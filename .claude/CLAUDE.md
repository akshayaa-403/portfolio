# Portfolio — Project Guide

Personal portfolio for **Akshayaa Kashyap** (Software Engineer, AI & data). Static, buildless site: plain HTML/CSS/vanilla JS, no framework, no package.json, deployable as static files.

## Reference docs (read these before design/style work)
- **[color-scheme.md](color-scheme.md)** — full color palette with hex codes for both dark (default) and light themes, all CSS custom properties, and the olive `#768c45` brand accent.
- **[redesign-metadata.md](redesign-metadata.md)** — stack, layout/sections, typography, design tokens, accessibility, assets, content locations, and known gaps/opportunities.

## Structure at a glance
- [index.html](../index.html) — single-page site (hero collage, work, experience, skills, about, contact).
- [project.html](../project.html) — dynamic project detail page (reads `?id=` query param).
- [404.html](../404.html) — custom not-found page.
- [css/style.css](../css/style.css) — global styles + all design tokens (`:root`).
- [css/project.css](../css/project.css) — detail-page + 404 styles.
- [js/theme.js](../js/theme.js) — light/dark theme (`data-theme="dark"` on `<html>`), persisted to localStorage, OS preference honoured on first visit; plus the footer year. Exposes `window.portfolioTheme`.
- [js/hero-hover.js](../js/hero-hover.js) — prop hover-scale, player hover-to-play, and the **hero lamp as the theme switch** (lit lamp = dark theme).
- [js/marquee.js](../js/marquee.js) — draggable skills marquee; also keeps the "Skills" heading aligned to the mode toggle.
- [js/layout-editor.js](../js/layout-editor.js) — dev-only prop positioning, enabled with `?edit=1`. Press **A** to select behind an overlapping prop, **D** to dump coordinates.
- [js/modes.js](../js/modes.js) — chaos/notebook/clean view-mode switcher (`data-mode` on `<html>`).
- [js/script.js](../js/script.js) — card rendering, scroll reveals, active-nav/header observers, mobile menu, draggable collage.
- [js/project-data.js](../js/project-data.js) — full copy for all 6 projects.
- [js/project-detail.js](../js/project-detail.js) — injects detail content + per-project meta.
- [robots.txt](../robots.txt), [sitemap.xml](../sitemap.xml) — SEO.

## Conventions to respect
- Keep it **static & buildless** unless explicitly asked to add tooling.
- The palette is **blue-on-paper**, sampled from `public/assets/favicon.png` (paper `#f4f7fa`, accent `#094e94`, deep `#00317a`), with a **dark theme** inverting the same navy family (`:root[data-theme='dark']`, ground `#0c1620`). Every new color must be a token in `:root` **and** get a dark counterpart. All text must meet WCAG AA in *both* themes — check against the notebook ground too, and remember notebook mode's hero text sits on a light photographic prop whatever the theme.
- Never hardcode a color that sits on `--accent-deep`: use `var(--on-accent-deep, #fff)`, which flips to dark navy when the accent goes pale in dark mode.
- Project case studies carry a `deepDive` array in [js/project-data.js](../js/project-data.js), rendered by [js/project-detail.js](../js/project-detail.js). Section kinds: `prose`, `figure`, `formula`, `code`, `table`, `steps`. Formulas are styled TeX source, **not** typeset — no MathJax/KaTeX, to keep the site buildless and offline-safe.
- Three **view modes** (chaos / notebook / clean) live on `data-mode`. They share **identical hero geometry** and differ only in surface treatment — never reintroduce per-mode repositioning. New decorative elements should be hidden in clean.
- The hero is a **0px-exact copy of jackiehu.design's** above-the-fold layout (props carry `--x/--y/--w/--h` as % of a 1440x900 stage, with `object-fit: contain`). Verify with a live render before changing any coordinate — see redesign-metadata.md.
- The props in `public/assets/props/` are **borrowed third-party images** and must be replaced before publishing — see redesign-metadata.md.
- Preserve accessibility (skip-link, `:focus-visible`, `prefers-reduced-motion` gating, semantic landmarks).
- Keep the `js`-class + reduced-motion gating on any new animation, **and the 4s reveal failsafe** in script.js — without it, deep-anchor loads leave sections invisible.
- Project copy must match what the repos actually contain; several upstream READMEs overstate their stack (see redesign-metadata.md).
- Escape dynamic strings rendered via `innerHTML` (use the existing `esc()` helpers).
