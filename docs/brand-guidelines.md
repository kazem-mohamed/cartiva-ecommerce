# Cartiva — Brand Guidelines v2.1

> Last updated: 2026-10-03
> Status: **For review**
> Supersedes: v1.0 (Vault / gold / Archivo / C + disc / Arrow Travel). Only the name survives.
> Visual board: `public/brand.html` (open `/brand.html` in the running app; `?theme=dark|light` forces a mode).
> Editorial image prompts: `docs/editorial-image-prompts.md`.

## 0. Idea

**Everything, well lit.** Cartiva presents everyday things the way a gallery presents objects after hours: a dark room, one light, nothing competing. The product is always the brightest thing on the screen.

| | |
|---|---|
| Positioning | A general marketplace (electronics and fashion today) whose premium is the presentation, not the price tag |
| Premium, honestly | No luxury claims. Every product gets the same light, space and accurate price — EGP 149 to EGP 42,960 |
| Personality | Calm · Precise · Confident · Honest |
| Tone | Measured and direct. Short sentences, real numbers, no exclamation marks |
| Visual philosophy | Darkness is the canvas; light is the content. One light source (cobalt) marks the one thing to do. Elevation by value, never shadow. Pills for what you touch, 12px for what you look at |

## 1. Logo — Lit Edge

A heavy ring C plus the rim of light a product picks up when lit from behind; the rim is thickest toward the upper-left source and tapers to zero.

| Asset | Use | Minimum |
|---|---|---|
| Primary (horizontal) | Header, footer, default | 96px wide |
| Alternative (stacked) | Auth, splash, packaging | — |
| Symbol (with rim) | Icon use ≥ 40px | 40px |
| Minimal mark (no rim) | Everything < 40px, favicon 32/16 | 16px |
| Compact lockup (no rim) | Small headers, tight spaces | 96px wide |
| App icon | Onyx or ivory tile, 22% corner radius | — |

Geometry: ring R 500 / inner 262 / mouth ±42°. Rim = the part of an offset disc lying outside a clearance circle at R+30, 60 units at its thickest, tapering to zero at ±80° from the upper-left axis. Wordmark: Fraunces, weight 520, optical size 48, SOFT 100, font kerning — outlined, never retyped (cap height = 729 lockup units, so the lockup proportions are unchanged).

Colour: ivory `#ededf3` on dark, onyx `#171721` on light. Nothing else. Clear space = the stroke of the C on all sides.

Don't: recolour in cobalt · stretch, squash or rotate · add glow, shadow or gradient · use the rim below 40px.

## 2. Colour

Nine brand colours (from the reference DESIGN.md). Light-mode values are **derived** from them, never invented.

| Brand | Hex | Job |
|---|---|---|
| Onyx | `#171721` | Canvas (dark) · text (light) |
| Graphite | `#1e1e2a` | Surface (dark) |
| Obsidian | `#272735` | Raised (dark) · chips |
| Slate | `#70707d` | Strong lines · field edge (light) |
| Mist | `#e2e3ed` | Field edge (dark) · raised (light) |
| Ash | `#c3c3cc` | Secondary text (dark) |
| Ivory | `#ededf3` | Text (dark) · canvas (light) · product plates |
| Cobalt | `#5266eb` | The one action |
| White | `#ffffff` | On cobalt · surface (light) |

### Semantic tokens

| Token | Dark | Light | Use |
|---|---|---|---|
| `--canvas` | `#171721` | `#ededf3` | Page |
| `--surface` | `#1e1e2a` | `#ffffff` | Cards, sheets |
| `--raised` | `#272735` | `#e2e3ed` | Chips, hovers |
| `--plate` | `#ededf3` | `#ffffff` | Product plate (image multiplied onto it) |
| `--text` | `#ededf3` | `#171721` | Primary text |
| `--text-2` | `#c3c3cc` | `#575763` | Secondary text |
| `--text-3` | `#8e8e99` | `#646471` | Meta, placeholders |
| `--line` | `#272735` | `#e2e3ed` | Hairlines |
| `--line-strong` | `#70707d` | `#70707d` | Strong dividers |
| `--field-edge` | `#e2e3ed` | `#70707d` | Input and ghost-button edge |
| `--action` / `--on-action` | `#5266eb` / `#ffffff` | same | Primary action |
| `--focus` | `#ededf3` | `#171721` | Focus ring |
| `--error` | `#e96368` | `#bd2a2b` | Errors and destructive only |
| `--chip` / `--on-chip` | `#272735` / `#ededf3` | `#e2e3ed` / `#171721` | Discount chip, tags |

Derived: dark `--text-3` = slate + 36% ash · light `--text-2` = slate + 28% onyx · light `--text-3` = slate + 13% onyx · error = the one approved hue exception, solved for contrast.

**Contrast:** all 46 text, action, field-edge and focus pairs measured — every one passes WCAG AA in both modes (text ≥ 4.5:1, UI ≥ 3:1).

### Rules
1. **One cobalt per view.** Only the single next step: add to bag, checkout, place order. Never decoration, never text, never the logo.
2. **Sale is monochrome.** Struck original in `--text-3`, current in `--text` at 480, discount as a `--chip`. Never red — 27 of 56 products are discounted.
3. **One red, errors only.** Validation and destructive actions, always with icon + sentence.
4. **No shadows on dark.** Separation is a value step: canvas → surface → raised.
5. **Theme:** user-switchable Dark/Light, equal priority; default follows `prefers-color-scheme`.

## 3. Typography

**Soft editorial** (chosen 2026-10-03 from six candidates): **Fraunces** for display and headings — a variable serif set soft (`SOFT 100`), slightly light and tightly tracked, with the high-contrast optical cut (`opsz 144`) at display size — and **Figtree** for reading text, UI, labels and prices. Both OFL, Google Fonts, loaded with `next/font`.

| Role | Face | Size | Weight | Settings | Line height | Tracking |
|---|---|---|---|---|---|---|
| Display | Fraunces | 42–70 | 380 | SOFT 100, opsz 144 | 1.02 | −.02em |
| Heading L | Fraunces | 34–46 | 400 | SOFT 100 | 1.08 | −.015em |
| Heading | Fraunces | 28–36 | 420 | SOFT 100 | 1.12 | −.01em |
| Heading S | Fraunces | 22–26 | 440 | SOFT 100 | 1.18 | −.005em |
| Subheading | Figtree | 19–21 | 420 | — | 1.35 | 0 |
| Body L | Figtree | 18 | 400 | — | 1.5 | 0 |
| Body | Figtree | 16 | 400 | — | 1.5 | 0 |
| Label / button | Figtree | 14–15 | 480 | — | 1.2 | .005em |
| Caption | Figtree | 12 | 480 | — | 1.3 | .01em |

The wordmark is Fraunces too, outlined into the Lit Edge lockup (§1) — never typed live.

Prices, totals, quantities and order numbers use `font-variant-numeric: tabular-nums`. Sentence case everywhere. Body 16px minimum, 65–75 characters a line.

## 4. Shape, space, layers

| | |
|---|---|
| Spacing (4px base) | 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 56 · 72 · 112 · 128 |
| Radius | controls/pills `999px` · fields `32px` · cards/plates `12px` · structural `4px` |
| Page | max 1200px content; section rhythm 72px (112px between major bands) |
| Breakpoints | 375 · 768 · 1024 · 1440 |
| z-index | base 0 · raised 10 · sticky 100 · drawer 400 · modal 500 · toast 600 |
| Touch | targets ≥ 44px, ≥ 8px apart |

## 5. Imagery

- **Product photos** come from the API untouched, on a `--plate` with `mix-blend-mode: multiply`. 47 of 56 are shot on white and merge into the plate; the nine with grey studio backdrops keep them — the plate never paints over a photograph. All are 660×900 (≈ 3:4). The one adjustment: 31 of the 351 photos arrive with a ~30px white mat baked in around a grey backdrop, which would show as pale strips down the plate's edges — those are drawn 10% closer so the mat falls just outside the frame (`src/ds/ui/matted.ts`).
- **Editorial images** (8, see prompts doc, v2): one bright, airy studio on pale cool-grey paper, one large soft daylight source from the upper left. Egyptian and Mediterranean models in neutral wardrobes, devices placed the way they're used, at most one muted accent colour per image. Everything unbranded; no text or logos. (v1, a dark empty studio with no people, was rejected as too dark and abstract.)

## 6. Icons

Lucide (`lucide-react`), one library. 24px grid, 1.5px stroke, round caps and joins. Outline everywhere; filled heart only for a saved item. Icon-only buttons carry an `aria-label`.

## 7. Motion

Motion is light arriving, not objects bouncing. Nothing overshoots. Transforms and opacity only.

| Token | Value | Use |
|---|---|---|
| `--dur-press` | 120ms | Press feedback (scale .97), toggles |
| `--dur-hover` | 200ms | Hover, focus |
| `--dur-state` | 320ms | State changes, image swap, chips |
| `--dur-sheet` | 520ms | Drawers, sheets, pill morph |
| `--dur-light` | 900ms | Lights on, theme switch |
| `--ease-out` | `cubic-bezier(.16,1,.3,1)` | Entering |
| `--ease-exit` | `cubic-bezier(.4,0,1,1)` | Leaving (~65% of enter time) |
| `--ease-move` | `cubic-bezier(.65,0,.35,1)` | Travelling / shared elements |

Signature moments: **Lights on** (surfaces rise out of black, then a rim sweeps from the upper left — once per surface) · **Add to bag** (image travels to the bag, count ticks, drawer opens) · **Theme switch** (a circle of light spreads from the toggle — View Transitions) · **Pill morph** (mobile nav pill becomes the add-to-bag bar on product pages).

Stack: Motion (`motion/react`) + CSS + View Transitions. No GSAP, no smooth-scroll library. `prefers-reduced-motion` replaces all movement with a ≤120ms fade.

## 8. Voice

| Moment | We say | We don't |
|---|---|---|
| Stock | In stock. | Hurry — only a few left! |
| Error | That code didn't work. Check it and try again. | Error: invalid coupon!! |
| Empty bag | Your bag is empty. Most wanted is a good place to start → | Oops! Nothing here |
| Empty category | Nothing on display in Books yet. See what's in Fashion → | Coming soon! |
| Success | Order placed. | Woohoo! Your order was successfully submitted! |

Never: invented statistics, fake urgency, "luxury", "curated", "seamless", "elevate", "unlock", exclamation marks, emoji. UI language: English; currency EGP.

## 9. Honesty (non-negotiable)

This is a portfolio store on a public demo API. It claims only what is true.

- **No fabricated proof** — no invented ratings, counts, testimonials or press logos.
- **No false newness** — all 56 products were added over three days in March 2023; nothing is labelled "new". Rankings use real fields (`sold`, discount, rating).
- **No dead controls** — no size/colour selector without real variants, no free-shipping bar without a shipping rule, no filter option that returns nothing.
- **No stand-in products** — editorial images never depict a fake version of a catalogue item.

## Changelog

| Version | Date | Changes |
|---|---|---|
| 2.1 | 2026-10-03 | Editorial imagery v2: bright studio with models (v1 dark studio rejected), all eight live. Type: Mona Sans replaced by Fraunces (display) + Figtree (text). Product card: "Curtain" (direction-aware photo wipe, "+" opening into "Add to bag"). Wordmark redrawn in Fraunces. Matted catalogue photos cropped. |
| 2.0 | 2026-09-24 | Complete rebrand: vitrine/light concept, Lit Edge logo, DESIGN.md palette with derived light mode, Mona Sans, dark/light toggle, new motion and voice. |
| 1.0 | 2026-08-10 | Vault identity (superseded). |
