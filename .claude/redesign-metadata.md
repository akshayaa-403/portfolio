# Site Metadata & Context

Reference notes for anyone (human or agent) working on this portfolio. Pairs with
[color-scheme.md](color-scheme.md).

## What this site is
A **static, dependency-free personal portfolio** for **Akshayaa Kashyap** —
*Software Engineer with AI specialist experience* (this is the framing from her
résumé and GitHub profile; earlier drafts of these notes said "Designer &
Developer", which was wrong).

Positioning line: _"I build data pipelines, LLM workflows and dashboards that turn
messy data into decisions people actually act on."_

No build step, no framework, no package.json — plain HTML/CSS/vanilla JS.

## Aesthetic (2026-08)
**Blue-on-paper collage.** The *layout and interaction language* is copied from
[jackiehu.design](https://jackiehu.design); the *palette* comes from this site's
own lotus favicon (deep navy / mid blue / pale blue on cool paper — see
[color-scheme.md](color-scheme.md)). **IBM Plex Mono is the workhorse face** with
a script display font for the name only, mirroring the reference's 24px→85px size
jump. Light-only.

Two superseded schemes, for anyone reading old commits: the original dark-teal +
olive `#768c45`, then a warm-cream + orange `#f76240` pass. Neither survives.

### What was taken from each reference
Later instruction narrowed this to jackiehu.design alone; the other four
references' contributions were already in place and were kept where they didn't
conflict.
- **jackiehu.design** (the model) — mono-first type with one script accent,
  draggable desktop-collage hero, scattered rotated props, decorative trailing
  glyphs on section headings (`▶ ⁕ ⌘ ☺︎`), soft shadows, absolute-positioned
  canvas layout, lowercase conversational voice.
- **jackiehu.dev** — motion tokens (`--ease`, `--dur`).
- **victoreke.com** — single-accent restraint, dated experience timeline.
- **v4.brittanychiang.com** — `▹` bullet markers, sticky-nav shadow-on-scroll,
  hover lift on cards.
- **deidredriscoll.com** — 40/60 two-column split on the project detail page.

## View modes (chaos / notebook / clean)
Set as `data-mode` on `<html>`, persisted in `localStorage.viewMode`, and applied
by the **inline `<head>` script on every page** before first paint so the mode
carries across navigation with no flash. Wired up by [js/modes.js](../js/modes.js);
styles live in section 14 of style.css. The switcher lives in the hero lockup
(where the reference puts its icon row), not in the header nav.

All three modes keep the **same hero geometry** (see below) and differ only in
surface treatment:
- **chaos** (default) — the reference experience: full prop stage, draggable
  cards, spinning vinyl, marquee, lilies.
- **notebook** — same layout, on warm ruled paper with a red margin rule; cards
  further down the page become dashed taped-in clippings.
- **clean** — same layout with the ornament stripped: no props, lilies, palette
  or marquee. Just the lockup, the two cards and the scroll cue.

The mode switcher is `display: none` without JS (the buttons would do nothing);
CSS falls back to chaos. `js/modes.js` fires a `modechange` event so the drag
layer and word-reveal can re-measure.

## Hero geometry is a 1:1 copy of the reference
The hero is a deliberate pixel-for-pixel reproduction of jackiehu.design's
above-the-fold composition. Coordinates came from a **live Playwright render of
the reference at 1440x900**, reading each element's real bounding box, not from
guesswork.

Every prop carries `--x/--y/--w/--h` as percentages of a 1440x900 stage:
`--x` and `--w` are % of width, `--y` and `--h` are % of height. **Both width and
height are set, with `object-fit: contain`** — sizing on width alone made the tall
objects (pen, lighter) up to 3.4x too long, because the re-cropped art has
different aspect ratios than the originals. Verified: all 12 props and the lockup
land within **0px** of the reference in all three view modes.

Two structural consequences worth knowing:
- `.hero` has a negative `margin-top` equal to the header height, so the stage
  starts at y=0 like the reference (which has no header). Without it every prop
  sits 58px low.
- Because cards then sit *under* the sticky header, `.site-header` is
  `pointer-events: none` with its links/buttons opting back in. Otherwise the
  header's empty middle swallows drags aimed at the player card. Put the rule on
  the `<header>` itself — putting it on `.site-header__inner` does not work,
  since the header element is what gets hit-tested.

All three view modes now share this **identical geometry**; they differ only in
surface treatment (notebook adds ruled paper, clean hides the props). Do not
reintroduce per-mode repositioning.

## The hero lilies
Two supplied blue-lily cut-outs (`lily-pair.webp` bottom-left,
`lily-single.webp` top-right) sit at `z-index: 0` behind everything, faded to
~0.4-0.45 opacity, fading in and scaling up on load. They replaced an earlier
hand-built SVG lily.

## Tech stack & architecture
- **Pages:** [index.html](../index.html) (single-page scroll),
  [project.html](../project.html) (dynamic detail via `?id=`),
  [404.html](../404.html).
- **CSS:** [css/style.css](../css/style.css) (tokens + global),
  [css/project.css](../css/project.css) (detail page + 404).
- **JS (vanilla, no libs):**
  - [js/theme.js](../js/theme.js) — shared per-page chores. Currently only the
    footer year; the site is light-only so there is **no theme toggle**.
  - [js/script.js](../js/script.js) — card rendering, scroll reveals, active-nav
    and header observers, mobile menu, draggable collage.
  - [js/project-data.js](../js/project-data.js) — the 6 projects, single source of
    truth for both cards and detail pages.
  - [js/project-detail.js](../js/project-detail.js) — renders a case study from
    `?id=` and sets per-project title/description/OG meta.
- **No backend.**

## Content accuracy (important)
Project copy is written from **what each repo actually contains**, because several
upstream READMEs overstate their stack. Do not "restore" these from the READMEs:

- **anttodo** — profile README claims vanilla JS + HTML5 Canvas; the repo is
  mostly Python + TypeScript. Copy is deliberately concept-focused and
  stack-neutral.
- **Wikipedia-Summarizer** — profile README credits ROUGE evaluation; the repo
  implements none. Described as a LexRank/LSA/BART comparison instead.
- **quantamental-screener** — FinBERT is **opt-in**, not the default (VADER +
  TextBlob ship by default to stay under Streamlit Cloud's ~1 GB cap). Copy says
  "ensemble sentiment".
- **Habita** — tagged `ios`/`swiftui` on GitHub but contains no Swift; it's a web
  app wrapped for **Android** via Capacitor.

Live demos: Habita and anttodo return 200. The Streamlit screener returned a 303
(sleeping free-tier app) — linked, but verify before featuring it prominently.

## Motion & accessibility (preserve)
- `.reveal` elements fade + rise 20px via `IntersectionObserver`, gated behind
  **both** `.js` and `@media (prefers-reduced-motion: no-preference)`.
- **Reveals have a 4s failsafe** that shows everything the observer hasn't
  reached. Without it, deep-anchor loads and full-page screenshot tools leave
  whole sections at `opacity: 0.001`. Don't remove it.
- The draggable collage is **enhancement-only**: disabled under reduced motion and
  below 900px, keyboard-operable via arrow keys + Home, with an
  `aria-describedby` hint. Cards remain plain static cards without JS.
- `.hero__lockup` is `pointer-events: none` above 900px (with interactive
  descendants opting back in) so it can't swallow drags aimed at cards.
- Skip link, `:focus-visible`, semantic landmarks, `rel="noopener"`, `lang="en"`.
- All text meets WCAG AA — see the two-tier accent note in color-scheme.md.

## SEO / sharing
- Full meta description, author, keywords, canonical, OG, Twitter Card,
  `theme-color`, and JSON-LD `Person` on index.
- project.html sets title/description/OG **dynamically** per project.
- [robots.txt](../robots.txt) + [sitemap.xml](../sitemap.xml) list all 6 projects.
- **URLs assume `https://akshayaa-403.github.io/portfolio/`** — update canonical,
  OG, robots and sitemap if the domain changes.

## ⚠ Third-party images in public/assets/props (must be replaced)
`pen`, `dreams`, `folder`, and `paint-toolbar` have been removed from the hero
(along with their markup, CSS, and layout-editor references) and are no longer
in the repo. The remaining decorative props in
[public/assets/props/](../public/assets/props/) — `vinyl`, `lamp`,
`notebook-page` — were **downloaded from jackiehu.design's CDN**
(framerusercontent.com) at the user's repeated explicit request, to reproduce
the reference layout exactly. They are someone else's copyrighted assets. The
user has stated they will replace everything before publishing. `camera` and
`lamp-light` still need their provenance confirmed.

`notebook-page` is structural, not purely decorative: notebook mode's hero
text contrast (light text + shadow) assumes it renders on top of that prop as
a light background — see [style.css](../css/style.css) around
`[data-mode='notebook'] .hero__name`. Don't remove it without also revisiting
that contrast treatment.

The two blue lilies (`lily-pair`, `lily-single`) were supplied by the user and
are not from the reference, and don't need replacing.

They are fine as local placeholders while iterating, but **must be swapped for
owned or properly-licensed images before this site is published**. Replacements
need transparent PNG/WebP cut-outs; drop them in with the same filenames and no
CSS changes are needed. Anything with a permissive licence works — or photograph
real objects. Only project screenshots and photos were deliberately *not* kept;
these six are generic desk objects, which is why they were the ones retained.

Deleting the folder degrades gracefully: the props simply don't render.

## Assets & links
- Favicons `public/assets/favicon.webp` + `.png`; résumé
  `public/assets/resume.pdf` (kept in sync with the repo-root `resume.pdf`).
- Fonts: IBM Plex Mono + Caveat from Google Fonts (the only external dependency).
- Real links: `akshayaakashyap5@gmail.com`, `github.com/akshayaa-403`,
  `linkedin.com/in/akshayaa-kashyap`, `akshayaakashyap.substack.com`.

## Constraints to respect
- Keep it **static & buildless** unless explicitly asked to add tooling.
- Every new colour is a token in `:root`; check contrast before shipping it.
- Preserve the reveal failsafe and reduced-motion gating on any new animation.
- Escape dynamic strings rendered via `innerHTML` (`esc()` helpers exist in both
  script.js and project-detail.js).
