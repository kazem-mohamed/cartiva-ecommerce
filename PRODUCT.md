# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two layers: (1) the real audience is whoever evaluates the developer's portfolio (recruiters, hiring managers, other developers) — they judge the project by how polished and considered it feels, not by transaction volume; (2) the simulated in-product user is a general online shopper browsing and buying everyday merchandise (electronics, fashion, beauty, home goods, books, music, mobiles, supermarket items) — someone who wants to find something quickly, trust the checkout, and not think about the interface.

## Product Purpose

A fully-functional e-commerce storefront built against the routemisr training API, existing to demonstrate high-level front-end engineering and design craft. It is a training/portfolio project, not a live business — there is no real revenue, no real customer base, and no real fulfillment behind it.

## Positioning

Many training projects are built on the same shared routemisr API and default to interchangeable, AI-template-flavored storefronts. This one is meant to stand out through genuine design specificity, accessibility done correctly (not as a polish afterthought), and a coherent identity — rather than the safe, generic patterns a design critique run on this project (2026-08-10) found throughout, most visibly on the auth pages.

## Operating Context

Built on the fixed routemisr demo REST API (products, categories, brands, cart, wishlist, auth, orders, reviews) — the data shape, available categories, and available product images are constraints outside the developer's control. Currency displayed is EGP. Authentication runs through next-auth backed by the same API. The app lives at `app/` inside the repo, Next.js 16 (App Router), Tailwind v4.

## Capabilities and Constraints

- Cart, wishlist, compare, checkout, profile/addresses, and order-history flows are real and functional (verified working during a prior cleanup pass, 2026-08-08/09).
- Actual catalog categories: Electronics, Men's Fashion, Women's Fashion, Beauty & Health, Home, Baby & Toys, Books, Music, Mobiles, SuperMarket — this is a **general marketplace**, not a dedicated grocery store.
- Google/Facebook "Continue with" buttons currently exist visually on the login page but have no working handler; the user has decided to remove them from the redesign rather than implement OAuth.

## Brand Commitments

- **Renaming from "FreshCart" to "Souqly"**, effective site-wide, because the old name and its produce/grocery-basket imagery falsely implied the site is a grocery store — it is a general marketplace, and the user was explicit that groceries have nothing to do with it.
- The new identity must not lean on grocery/produce visual language (no vegetable/fruit basket imagery, no "fresh picks" framing) anywhere the rename touches.

## Evidence on Hand

No real testimonials, customer photos, trust certifications, or usage statistics exist. The current login page shows a fabricated "50K+ Users / 4.9 Rating / SSL Secured" trust row and register shows a fabricated testimonial ("Sarah Johnson", `/review-author.jpg`) — both flagged by critique as unverifiable placeholder content. **Future work must not fabricate replacements**: either remove this content or replace it with something explicitly and honestly illustrative, never presented as a real claim.

## Product Principles

1. Every visible claim must be true or removed — no fabricated testimonials, ratings, or trust badges, ever.
2. Design must be specific to Souqly as a general marketplace — not grocery-coded, not generic-e-commerce-template-coded.
3. Accessibility is a baseline requirement, not a later polish pass — visible keyboard focus states and WCAG AA contrast are non-negotiable, especially on the auth flows being redesigned now.
4. This is a redesign, not a rebuild — all currently-working functionality (cart, wishlist, compare, checkout, auth) must keep working exactly as-is while the visuals change.
5. Favor genuine, considered design decisions over safe/generic defaults — the whole point of this pass is to stop looking like an AI-template.

## Accessibility & Inclusion

A design critique (2026-08-10, `.impeccable/critique/2026-08-10T07-24-48Z__src-app-page-tsx.md`) confirmed via computed style that none of the three auth pages (login, register, forget-password) show any visible `:focus-visible` state on their inputs, buttons, or links, and that the primary CTA button fails WCAG AA contrast (3.3:1 measured, 4.5:1 required) on all three. Both are required fixes in the upcoming auth redesign, not optional polish.
