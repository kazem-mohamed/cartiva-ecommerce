# Cartiva — Editorial Image Prompts

> Status: v2 · 2026-10-01 · all eight delivered 2026-10-03 and live (`app/public/images/editorial/`)
> v1 (dark empty studio, plinths, no people) was rejected: too dark, too abstract, nothing to want. v2 is bright and human.
> Product photography always comes from the API. These eight images are the only non-product imagery on the site.

## The shared look ("well lit", literally)

One bright, airy studio, shot on one day. Real people wearing the kind of clothes the store sells, and electronics placed the way they are used. Calm, aspirational and real: a minimalist fashion campaign, not a catalogue cut-out.

| Property | Rule |
|---|---|
| Studio | Pale cool-grey seamless paper (close to `#EDEDF3`), curving from floor to wall; props limited to pale travertine blocks and light oak |
| Light | One large soft daylight source from the **upper left** (like a big north window); soft natural shadows falling to the lower right; bright, never blown out |
| Colour | Wardrobe in cream, ecru, stone, charcoal, black, white and denim. At most **one** muted accent per image, from the clothing itself |
| People | Egyptian and Mediterranean models, mid-20s to 30s, natural make-up and real skin texture, relaxed confident expressions, candid in-between moments rather than stiff poses |
| Camera | Full-frame or medium-format look, 35–85mm, f/4–f/8, crisp focus, gentle film grain, true-to-life colour |
| Never | Text, logos, brand marks (check shoe sides, laptop lids, hoodies), harsh shadows, dark moody lighting, clutter, plastic or airbrushed skin, distorted hands |

**Honesty rule.** Clothes and devices are generic and unbranded. The images set the mood for a department; they never stand in for a specific catalogue product, and the models are never presented as customers.

**Negative prompt** (Stable Diffusion / Flux / any tool that takes one):

```
text, typography, logo, watermark, brand name, label, distorted hands, extra fingers, deformed face, plastic skin, airbrushed skin, oversaturated, harsh shadows, dark moody lighting, night, neon, low key, cluttered background, busy pattern background, cartoon, illustration, 3D render, CGI, frame, border
```

**Keeping the eight consistent.** Generate the hero first. When it's right, use it as the style reference for the other seven (Midjourney: add `--sref <hero image URL>`; other tools: use it as the image or style reference). Midjourney users append the suffix under each prompt; other tools: use the prompt as-is and set the aspect ratio in the tool.

**Delivery.** Generate at the largest size the tool allows, export PNG or maximum-quality JPG, and name files exactly as below. They go in `app/public/images/editorial/`; Next.js serves them as AVIF/WebP at responsive sizes.

---

## 01 · `hero-desktop` — Homepage hero, desktop

- **Purpose:** the first frame of the store: fashion and electronics, people and light.
- **Used:** full-bleed behind the headline on screens ≥ 1024px; the headline sits on the left.
- **Aspect ratio:** 16:9 (target 3840 × 2160).
- **Composition:** the **left 40% is calm, clean backdrop** for the headline. Two models in the right 60%: a woman seated on a low pale travertine block with an open laptop, a man standing beside her holding over-ear headphones.

```
Bright editorial fashion campaign photograph in a pale cool-grey seamless studio. On the right side of the frame, a young Egyptian woman in an oversized cream knit sweater and wide black trousers sits on a low pale travertine block with a slim silver laptop open on her lap, glancing up with a relaxed half-smile; beside her a young man in a charcoal hoodie, light stone chinos and clean white sneakers stands holding matte black over-ear headphones. The left 40% of the frame is calm, empty pale backdrop. One large soft daylight source from the upper left, gentle natural shadows falling to the lower right, airy and bright. Neutral palette of cream, charcoal, stone and white. Full-frame camera, 50mm lens, f/5.6, crisp focus on the faces, true-to-life colour, real skin texture, subtle film grain, minimalist fashion campaign aesthetic. Unbranded clothing and devices, no text, no logos.
```

Midjourney suffix: `--ar 16:9 --style raw`

---

## 02 · `hero-mobile` — Homepage hero, mobile

- **Purpose:** the same scene recomposed for a phone, not a crop of the desktop image.
- **Used:** below the headline on screens < 1024px (no text on top of it).
- **Aspect ratio:** 4:5 (target 1600 × 2000).
- **Composition:** the same two models, closer together, filling the frame from the knees up.

```
Vertical bright editorial fashion campaign photograph in a pale cool-grey seamless studio. A young Egyptian woman in an oversized cream knit sweater and wide black trousers sits on a low pale travertine block with a slim silver laptop open on her lap; a young man in a charcoal hoodie and light stone chinos stands close behind her shoulder holding matte black over-ear headphones, both relaxed and natural, framed from the knees up. One large soft daylight source from the upper left, gentle natural shadows, airy and bright. Neutral palette of cream, charcoal, stone and white. Full-frame camera, 50mm lens, f/5.6, crisp focus on the faces, true-to-life colour, real skin texture, subtle film grain, minimalist fashion campaign aesthetic. Unbranded clothing and devices, no text, no logos.
```

Midjourney suffix: `--ar 4:5 --style raw`

---

## 03 · `category-electronics` — Electronics cover

- **Purpose:** entry to Electronics (mostly laptops and TVs in the catalogue).
- **Used:** department card on the homepage and the Departments page; the label sits below the image.
- **Aspect ratio:** 3:4 (target 1800 × 2400).
- **Composition:** a styled still life in the same studio, devices arranged the way they're used.

```
Bright editorial still life photograph in a pale cool-grey seamless studio. A slim silver laptop stands open on a light oak side table, its screen showing a soft pale gradient; matte black over-ear headphones rest beside it, a smartphone lies face up next to a small ceramic cup on a pale travertine block below. A large soft daylight source from the upper left casts gentle diagonal shadows and a faint window-frame shadow across the backdrop. Calm, airy, premium, neutral palette of silver, black, oak and pale stone. Full-frame camera, 50mm lens, f/8, everything crisp, true-to-life colour, subtle film grain, minimalist product campaign aesthetic. Unbranded devices, no logos, no text, no people.
```

Midjourney suffix: `--ar 3:4 --style raw`

---

## 04 · `category-men` — Men's Fashion cover

- **Purpose:** entry to Men's Fashion (sportswear: hoodies, track pants, sneakers).
- **Used:** department card on the homepage and the Departments page; the label sits below the image.
- **Aspect ratio:** 3:4 (target 1800 × 2400).

```
Bright editorial fashion photograph in a pale cool-grey seamless studio. A young Egyptian man in a heather-grey hoodie, black tapered track pants and clean white sneakers sits casually on a low pale travertine block, forearms on his knees, looking just past the camera with an easy, confident expression. One large soft daylight source from the upper left, gentle natural shadow falling to the lower right, airy and bright. Neutral palette of grey, black and white. Full-frame camera, 85mm lens, f/4, crisp focus on the face and the fabric texture, true-to-life colour, real skin texture, subtle film grain, minimalist sportswear campaign aesthetic. Unbranded clothing, no logos on the shoes or hoodie, no text.
```

Midjourney suffix: `--ar 3:4 --style raw`

---

## 05 · `category-women` — Women's Fashion cover

- **Purpose:** entry to Women's Fashion (knitwear, blouses, shawls).
- **Used:** department card on the homepage and the Departments page; the label sits below the image.
- **Aspect ratio:** 3:4 (target 1800 × 2400).
- **Composition:** one model, three-quarter length; the patterned silk scarf is the image's single accent of colour.

```
Bright editorial fashion photograph in a pale cool-grey seamless studio. A young Egyptian woman in a soft ecru knit cardigan over a white blouse and wide stone-coloured trousers stands in a relaxed three-quarter pose, a colourful patterned silk square scarf tied loosely at her neck as the only accent of colour, one hand lightly in her pocket, a calm natural smile. One large soft daylight source from the upper left, gentle natural shadows, airy and bright. Neutral palette of ecru, white and stone with the scarf's colours. Full-frame camera, 85mm lens, f/4, crisp focus on the face and the knit texture, true-to-life colour, real skin texture, subtle film grain, minimalist womenswear campaign aesthetic. Unbranded clothing, no text, no logos.
```

Midjourney suffix: `--ar 3:4 --style raw`

---

## 06 · `brand-story` — Brand story band

- **Purpose:** the one wide moment on the homepage, where "well lit" becomes a place.
- **Used:** full-width band behind the brand-story text; the text sits on the left.
- **Aspect ratio:** 21:9 (target 3360 × 1440).
- **Composition:** the studio itself; the **left half stays calm** for text, the styled set on the right.

```
Wide bright editorial photograph of a minimalist pale cool-grey studio set. On the right half, a slim black clothing rail holds a few neutral garments (a cream knit, a charcoal overshirt, an ecru blouse); next to it a pale travertine block carries a folded knit, an open slim laptop and a pair of clean white sneakers. A tall soft daylight source from the far upper left streams across the space, laying long soft diagonal shadows on the floor. The left half of the frame is calm, empty pale backdrop and floor. Airy, quiet, premium, neutral palette. Full-frame camera, 35mm lens, straight-on, verticals corrected, f/8, crisp, true-to-life colour, subtle film grain. Unbranded items, no text, no logos, no people.
```

Midjourney suffix: `--ar 21:9 --style raw`

---

## 07 · `empty-plinth` — Empty states and 404

(The file keeps its old name so nothing in the code changes; the subject is new.)

- **Purpose:** one image for every "nothing here" moment: empty bag, empty wishlist, no results, 404. Each has its own copy.
- **Used:** centred image above the empty-state text.
- **Aspect ratio:** 4:3 (target 2400 × 1800).
- **Composition:** an empty, open paper shopping bag, centred, with room around it.

```
Bright minimal still life photograph of a single empty, open, unbranded matte paper shopping bag in pale stone colour standing on a pale cool-grey seamless studio floor, centred with generous space around it. One large soft daylight source from the upper left casts a long soft shadow to the lower right. Calm, quiet, airy, slightly hopeful mood, neutral palette. Full-frame camera, 50mm lens, eye level slightly above the bag, f/8, crisp, true-to-life colour, subtle film grain. No text, no logos, no people, nothing inside the bag.
```

Midjourney suffix: `--ar 4:3 --style raw`

---

## 08 · `auth-vitrine` — Sign-in / register panel

- **Purpose:** the image half of the sign-in, register and reset screens (desktop only).
- **Used:** a tall side panel; a short caption sits over its **bottom 25%**, so keep that area calm.
- **Aspect ratio:** 3:4 (target 1800 × 2400).

```
Vertical bright editorial portrait in a pale cool-grey seamless studio. A young Egyptian woman in a soft cream knit sweater sits on a pale travertine block in the upper two thirds of the frame, looking down at her phone with a small, warm smile, a folded charcoal coat beside her. One large soft daylight source from the upper left, gentle natural shadows, airy and bright. The bottom quarter of the frame is calm, empty pale floor. Neutral palette of cream, charcoal and stone. Full-frame camera, 85mm lens, f/4, crisp focus on the face, true-to-life colour, real skin texture, subtle film grain, minimalist fashion campaign aesthetic. Unbranded clothing and phone, no text, no logos.
```

Midjourney suffix: `--ar 3:4 --style raw`

---

## Checklist before sending images back

- [ ] Bright and airy in every image; the light comes from the upper left.
- [ ] Text zones are calm: hero left 40%, brand band left half, sign-in panel bottom quarter.
- [ ] No logos, text or brand marks anywhere: check shoe sides, laptop lids, hoodies, the bag.
- [ ] Faces and hands look natural (no extra fingers, no plastic skin).
- [ ] The eight images look like the same studio, shot the same day.
