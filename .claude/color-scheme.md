# Portfolio Color Scheme

Source: [css/style.css](../css/style.css) (`:root`).

**Light-only, blue-on-cool-paper palette sampled from the site's own favicon**
([public/assets/favicon.png](../public/assets/favicon.png) — a blue lotus/palm
rosette). Deep navy, mid blue and pale blue over a cool paper ground. There is no
dark theme and no theme toggle, but every colour is a CSS custom property so a
dark variant can be added in one block.

Note: this replaced an earlier warm-cream + orange scheme. No orange remains.

## Ground

| Token | Value | Role |
|---|---|---|
| `--bg` | `#f4f7fa` | Page background (cool paper, never pure white) |
| `--bg-raised` | `#fbfcfe` | Raised panels, skill groups, aside boxes |
| `--bg-sunken` | `#e9eff6` | Marquee strip, tech chips |
| `--surface` | `#ffffff` | Collage/project card surface |
| `--surface-muted` | `#dbe4ee` | Inert UI bits (window dots, progress track) |

## Ink (all navy-derived)

| Token | Value | Contrast on paper | Role |
|---|---|---|---|
| `--ink` | `#16283d` | 13.90:1 | Headings, brand, card titles |
| `--ink-body` | `#1e3a5f` | 10.70:1 | Body text |
| `--ink-soft` | `#3c5a7a` | 6.65:1 | Secondary prose, nav, lede |
| `--ink-muted` | `#4e6880` | 5.40:1 | Meta, labels, chips |
| `--ink-faint` | `#647c96` | 4.01:1 | Decorative meta only — never body copy |

## Accent (sampled from the favicon)

| Token | Value | Where it came from / use |
|---|---|---|
| `--accent` | `#094e94` | The mark's mid-blue petals. **7.72:1 on paper**, so unlike the old orange it is safe for text — links, `.job__org`, section glyphs, brand dot. |
| `--accent-ink` | `#094e94` | Alias kept so existing text rules stay valid; identical to `--accent`. |
| `--accent-deep` | `#00317a` | Near-black navy at the mark's centre. Primary-button and active mode-button fill (white on it = 12.21:1). |
| `--accent-hover` | `#002d6b` | Button hover |
| `--accent-pale` | `#b2d5e7` | Pale highlight from the mark — decorative only (lily petals, tape strips) |
| `--accent-mid` | `#80b1d7` | Mid highlight — decorative (hero glow, gradients) |
| `--accent-tint` | `rgba(9,78,148,0.09)` | Active/hover nav pill background |
| `--accent-tint-strong` | `rgba(9,78,148,0.18)` | `::selection` |
| `--link` | `#094e94` | Same blue |
| `--highlight` | `#fff9c4` | Sticky-note card background (ink on it: `#4a4416`, 9.2:1) |

## Lines & shadows

| Token | Value |
|---|---|
| `--line` | `rgba(22,40,61,0.14)` |
| `--line-strong` | `rgba(22,40,61,0.28)` |
| `--shadow-card` | `0 2px 10px 1px rgba(28,55,90,0.14)` |
| `--shadow-card-hover` | `0 10px 28px 2px rgba(28,55,90,0.22)` |
| `--shadow-sticker` | `5.32px 5.32px 10px rgba(28,55,90,0.16)` |
| `--shadow-lamp` | `0 1px 30px 15px rgba(128,177,215,0.42)` |

Shadows are **cool navy-tinted, never black** — the reference used warm grey;
this palette shifts them blue to match the favicon.

## Per-mode overrides

`notebook` mode overrides the ground to a warmer paper (`--bg: #fdfcf7`) and
paints ruled lines plus a red margin rule on a **fixed `body::before`**. Do not
move that to `background-attachment: fixed` on the body itself — it renders
unreliably alongside `overflow-x: hidden`. Body text on notebook paper is
11.20:1 and the accent 8.08:1, so both still clear AA.

## Accessibility

All text combinations meet WCAG AA (4.5:1) — verified at 14 combinations across
all three modes, 0 failures. Decorative-only values are marked above. When adding
a colour:

1. Put it in `:root` as a token.
2. Check its ratio against `--bg`, `--bg-sunken`, `--bg-raised` **and** the
   notebook ground `#fdfcf7`.
3. Anything below 4.5:1 is decoration only and must not carry words.
