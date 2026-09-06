# Cartiva

An e-commerce storefront built on Next.js 16 (App Router), running against the public [Route e-commerce demo API](https://ecommerce.routemisr.com). Portfolio project — no real orders are fulfilled.

## Features

- **Catalogue** — products, categories, brands, and client-side search (the demo API's `keyword` filter is unreliable, so search matches on title/brand/category locally)
- **Product detail** — image gallery, quantity stepper, real reviews (read + write), "you may also like" carousel
- **Cart & checkout** — quantity management, coupon codes, Stripe Checkout handoff
- **Account** — auth (sign up / sign in / forgot password), profile, saved addresses, order history, wishlist, product compare
- **Auth** — credentials-based sessions via NextAuth, backed by the demo API's JWT auth

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [NextAuth](https://next-auth.js.org) (credentials provider)
- react-hook-form + zod for form validation
- Sonner for toasts

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in NEXTAUTH_SECRET
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Description |
|---|---|
| `NEXTAUTH_SECRET` | Random secret NextAuth uses to sign session tokens. Generate one with `openssl rand -base64 32`. |
| `NEXTAUTH_URL` | The app's canonical URL (e.g. `http://localhost:3000` in dev, your production domain when deployed). |

No API keys are required for the product/catalogue/auth API itself — it's a public demo backend.

## Deployment

Deploys as a standard Next.js app. On [Vercel](https://vercel.com/new):

1. Import this repository.
2. Set `NEXTAUTH_SECRET` and `NEXTAUTH_URL` (your production URL) in the project's environment variables.
3. Deploy — no other configuration is required.

## Project structure

```
src/app/(auth)/        Login, register, forgot password
src/app/(shop)/         Products, categories, brand, search, cart, checkout, orders, wishlist, compare
src/app/profile/        Account settings, addresses
src/app/api/            NextAuth route, cart/profile proxy routes
src/component/          Shared UI, layout (Navbar/Footer), product & auth components
```
