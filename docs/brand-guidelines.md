# Cartiva — Brand Guidelines v1.0 (final)

> Last updated: 2026-08-10
> Status: **Approved**
> Supersedes: FreshCart (grocery identity), Souqly (interim naming), and the rejected indigo/magenta pass.

## Quick Reference

| Element | Value |
|---------|-------|
| Primary Color | #1C1917 |
| Secondary Color | #0C0A09 |
| Accent Color | #9A6B12 |
| Primary Font | Archivo |
| Direction | Vault — near-black + struck metal |
| Voice | Direct, confident, unfussy, warm only where it counts |

---

## 0. Positioning

Cartiva is a **general marketplace** — electronics, fashion, beauty, home, books, mobiles, everyday essentials. It is explicitly **not** a grocery store; no visual, verbal, or photographic cue may imply one.

**The idea the brand owns:** *the tag*. Every object sold anywhere carries one — a price, a size, a spec. It is the single artefact common to every category Cartiva sells. Grocery brands own the crate and the stall; Cartiva owns the tag, the ticket, the struck plate.

**Why Vault, and not the category default.** Marketplace incumbents converge hard on orange (Amazon, Jumia, Etsy, AliExpress, Temu) or green (Shopify and grocery-coded storefronts). Green was ruled out by the client; orange would have landed on the rut. Vault takes the opposite route — the register of a watch case or a jewellery vitrine, where value is signalled by *material and restraint* rather than by shouting.

---

## 1. Colour

### Primary Colors

| Name | Hex | Usage |
|------|-----|-------|
| Vault | #1C1917 | Brand anchor, primary surfaces on dark, wordmark on light |
| Vault Dark | #0C0A09 | Deepest ground, hero and footer fields |
| Vault Light | #161318 | Raised panels on dark |

### Secondary Colors

| Name | Hex | Usage |
|------|-----|-------|
| Void | #08070A | Page ground for dark surfaces |
| Panel | #161318 | Cards and raised panels on dark |
| Hairline | #2A252C | Dividers and edges on dark |

### Accent Colors

| Name | Hex | Usage |
|------|-----|-------|
| Gold Base | #9A6B12 | Accent anchor; the only gold safe as solid text on paper |
| Gold Dark | #5C3D06 | Ramp shadow end, borders on light |
| Gold Light | #E8C878 | Ramp highlight, text on dark |

### The Gold Ramp — **gold is never one flat hex**

This is the single most important rule in the system. A metal edge needs a shadow end, a body, and a highlight, or it reads as a coloured line instead of metal.

| Stop | Hex | Role |
|------|-----|------|
| 1 | #5C3D06 | Shadow — ramp ends, borders on paper |
| 2 | #9A6B12 | Body — solid gold text on light (4.68:1) |
| 3 | #C79A3C | Mid — dividers, sub-labels |
| 4 | #E8C878 | Highlight — gold text on dark (9.38:1) |
| 5 | #F6E7BE | Specular — the catch-light band only |

Canonical metal edge:

```css
linear-gradient(115deg,
  #5C3D06 0%, #9A6B12 22%, #E8C878 42%,
  #F6E7BE 50%, #E8C878 58%, #9A6B12 78%, #5C3D06 100%)
```

### Neutrals

| Name | Hex | Usage |
|------|-----|-------|
| Paper | #FAFAF9 | Light page ground |
| Paper Line | #DED9D2 | Dividers on light |
| Paper Ink | #0C0A09 | Body text on light |
| Paper Muted | #6B6560 | Captions on light |
| Text | #F2ECE1 | Body text on dark |
| Text Dim | #9A9088 | Captions on dark |

### Semantic

| State | Hex |
|-------|-----|
| Success | #1F5F3F |
| Warning | #B45309 |
| Error | #8A2B18 |

**Note on green:** the no-green rule governs brand identity — mark, CTAs, chrome, fields. Success confirmation stays a deep green because that mapping is a real-world convention and a redundancy for colour-blind users alongside icon and label. It never appears in the logo, nav, footer, or any CTA.

### Contrast — measured, not assumed

| Pair | Ratio | Verdict |
|------|-------|---------|
| Gold Light #E8C878 on Void #08070A | 9.38:1 | AAA |
| Gold Base #9A6B12 on Paper #FAFAF9 | 4.68:1 | AA |
| Text #F2ECE1 on Void | 16.1:1 | AAA |
| Paper Ink on Paper | 18.2:1 | AAA |

Every interactive element carries a visible `:focus-visible` ring — 1px Gold Light at 4px offset on dark, 2px Gold Base on light. Non-negotiable; the pre-Cartiva build shipped with focus suppressed globally.

---

## 2. Typography

### Font

```css
--font-brand: 'Archivo', system-ui, sans-serif;   /* variable: wdth 62–125, wght 100–900 */
```

**One family, two widths.** Display runs expanded (`wdth` 110–118); body runs normal (100). The contrast comes from width, not from a second face — which keeps the system cohesive and gives it the signage character the tag idea wants. Archivo descends from grotesques built for signage and newspaper display: price boards, shelf tickets, wayfinding.

### Scale

| Role | Size | Weight | wdth | Tracking | Line height |
|------|------|--------|------|----------|-------------|
| Display | 62px / 36 mob | 600 | 116 | -.02em | 1.05 |
| H1 | 40 / 30 | 600 | 112 | -.02em | 1.15 |
| H2 | 30 / 24 | 600 | 110 | -.015em | 1.2 |
| H3 | 22 / 20 | 600 | 106 | -.01em | 1.3 |
| Body | 16 | 400 | 100 | 0 | 1.6 |
| Body light | 16 | 300 | 100 | 0 | 1.66 |
| Small | 13 | 400 | 100 | 0 | 1.5 |
| Label | 10 | 500 | 100 | **.28em** | 1.4 · uppercase |
| Button | 11 | 400 | 100 | **.24em** | 1 · uppercase |
| Price | — | 600 | 110 | .01em | 1 · **tabular** |

Body measure 65–75ch. Nothing below 10px, and 10px only for tracked uppercase labels.

### Numerals

Prices, order numbers, quantities and reference codes use `font-variant-numeric: tabular-nums`, so columns align and totals do not jitter as they update.

---

## 3. Logo

### The Mark

Constructed, not drawn: a ring with a rectangular bite taken from its right side — producing a **C** — with a disc seated in the mouth. It is a letter and a container at once. No shopping-cart glyph; every marketplace already owns one.

```
ring     circle r44, inner r23, centred 50,50
bite     rect x50 y35 w50 h30
disc     circle cx68 cy50 r9   (in the mouth, clear of the ring)
```

| Variant | Use |
|---------|-----|
| Mark, Vault on paper | Default on light |
| Mark, white + gold disc | Reversed, on dark |
| Lockup mark + wordmark | Header, footer, auth |

**Clear space** = the diameter of the disc, on all sides.
**Minimum size** = 16px for the mark, 96px wide for the lockup.

### Don'ts

- Don't rotate, skew, or stretch
- Don't recolour outside Vault / white / the gold ramp
- Don't add shadow, glow, or bevel to the mark itself
- Don't set the wordmark in anything but Archivo expanded
- Don't reintroduce a cart glyph

---

## 4. Buttons — **Arrow Travel**

The approved primary. At rest it is a centred label and nothing else; on hover the label steps left and a mark arrives in the space it vacated. **The composition changes on interaction, not the colour.**

```css
/* the metal skin — the gradient SWEEPS, it never snaps */
background-image:
  linear-gradient(var(--ground),var(--ground)),
  linear-gradient(115deg, /* the 5-stop gold ramp */);
background-origin: border-box;
background-clip: padding-box, border-box;
background-size: 100% 100%, 220% 100%;
background-position: 0 0, 0% 0;
transition: background-position .75s cubic-bezier(.22,1,.36,1), color .5s;
/* hover */ background-position: 0 0, 100% 0;
```

**Why 220% and a moving position:** CSS cannot transition `background-image`. Animating the *position* of an oversized gradient is what produces a smooth sweep instead of a snap. This is a system rule, not a one-off.

| Tier | Treatment | Use |
|------|-----------|-----|
| Primary | Arrow travel, gold metal edge | Add to cart, buy, submit |
| Secondary | Arrow travel, hairline edge, no gold | Save, compare |
| Tertiary | Label over a gold rule | Size guide, shipping, care |
| Quiet | Pill, no metal | Filters and category chips only |

Height 60px (76px for the wide variant). Label 11px / .24em / uppercase. Motion 550–750ms — luxury motion is slow, and nothing in this system bounces.

---

## 5. Components

| Element | Radius |
|---------|--------|
| Buttons, inputs | 1px |
| Cards, panels | 2px |
| Sheets, modals | 3px |
| Filter pills | full |
| The mark | fixed geometry — never re-rounded |

### Spacing

4 · 8 · 16 · 24 · 32 · 48 · 72 · 112. More space above a heading than below it, always.

### Elevation

On dark, elevation is a **hairline and a tone step**, not a shadow — shadows do not read on near-black. On light, real offset plus soft blur, never a zero-offset coloured halo.

| Level | Dark | Light |
|-------|------|-------|
| Raised | `#161318` + 1px `#2A252C` | `0 1px 2px rgba(12,10,9,.05)` |
| Card | `#161318` + 1px `#2A252C` | `0 2px 4px rgba(12,10,9,.04), 0 12px 24px -12px rgba(12,10,9,.10)` |
| Overlay | `#1C1917` + gold hairline | `0 8px 16px rgba(12,10,9,.08), 0 32px 56px -24px rgba(12,10,9,.20)` |

### Motion

One authored moment per surface. Easing `cubic-bezier(.22,1,.36,1)`. Micro-interactions 250–500ms; the gold sweep 750ms; page-level shared-element transitions 700ms. No spring, no bounce, no scattered hover effects.

### Icons

Outlined, 24px grid, **1.4px stroke**, 2px corner radius. One library throughout. Filled variants reserved for active/selected state only. Never an emoji or Unicode glyph in place of an icon.

---

## 6. Imagery

- **Subjects:** the product, on a plain or softly defocused ground. Objects over lifestyle.
- **Lighting:** even and neutral, or a single directional light that suits the vitrine register. No warm golden-hour cast — it re-codes the brand as food.
- **Colour:** product colour leads; brand colour lives in the UI around the image, not on it.
- **Never:** produce, groceries, market stalls, baskets, farms, wooden crates.

---

## 7. Voice

| Trait | We are | We are not |
|-------|--------|------------|
| Direct | Plain, specific | Blunt, cold |
| Confident | Assured | Boastful, hypey |
| Unfussy | Efficient | Curt, robotic |
| Warm | Human where it counts | Chatty, cutesy, emoji-laden |

| Context | Example |
|---------|---------|
| Product | "In stock. Arrives Tue 12 Aug." |
| Error | "That code has expired. Try another." |
| Empty | "Nothing saved yet. Browse electronics →" |
| Success | "Order placed." |

**Prohibited:** fresh / farm / organic (grocery-coded); seamless, revolutionary, best-in-class, curated; unlock, supercharge, elevate; and any invented statistic.

---

## 8. Honesty Rules (non-negotiable)

This is a portfolio build on a public demo API. It has no real customers, revenue, ratings, or testimonials — so it claims none.

- **No fabricated social proof.** No invented user counts, star ratings, testimonials, or press logos. The pre-Cartiva build shipped "50K+ Users", "4.9 Rating", and a testimonial from a person who does not exist.
- **No dead controls.** If a control renders, it does something. The Google and Facebook buttons were removed rather than faked.
- **No unowned assets.** The old login hero was hot-linked from a design tool's temp bucket with the generator prompt still in its alt text.

Violations here are brand violations, not content bugs.

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-08-10 | Cartiva identity approved: Vault direction, Archivo, C-mark, Arrow Travel buttons. |
