import type { Metadata } from "next";
import { ArrowRight, Eye, Heart, Plus, Search, ShoppingBag, Trash2 } from "lucide-react";
import { CartivaLogo, LitEdgeMark } from "@/ds/brand/Logo";
import { ThemeToggle } from "@/ds/theme/ThemeToggle";
import { Button, ButtonLink } from "@/ds/ui/Button";
import { Chip, ToggleChip } from "@/ds/ui/Chip";
import { Field } from "@/ds/ui/Field";
import { IconButton } from "@/ds/ui/IconButton";
import { Price } from "@/ds/ui/Price";
import { ProductShot } from "@/ds/ui/ProductShot";
import { Spinner } from "@/ds/ui/Spinner";
import type { Review } from "@/ds/commerce/Reviews";
import type { Product } from "@/ds/commerce/types";
import { CommerceDemos } from "./CommerceDemos";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

const API = "https://ecommerce.routemisr.com/api/v1";

async function getAllProducts(): Promise<Product[]> {
  try {
    const pages = await Promise.all(
      [1, 2].map((n) => fetch(`${API}/products?limit=50&page=${n}`, { next: { revalidate: 3600 } }).then((r) => (r.ok ? r.json() : null))),
    );
    return pages.flatMap((p) => (p?.data ?? []) as Product[]);
  } catch {
    return [];
  }
}

async function getReviews(productId: string): Promise<Review[]> {
  try {
    const res = await fetch(`${API}/products/${productId}/reviews`, { next: { revalidate: 300 } });
    return res.ok ? ((await res.json()).data ?? []) : [];
  } catch {
    return [];
  }
}

function pickDemo(all: Product[]): Product[] {
  const pick = (fn: (p: Product) => boolean) => all.find(fn);
  return [
    pick((p) => p.title.startsWith("EOS M50")),
    pick((p) => p.category?.name === "Electronics" && !!p.priceAfterDiscount && !p.title.startsWith("EOS")),
    pick((p) => p.title.trim() === "Woman Shawl"),
    pick((p) => p.title.startsWith("Orca Leather Boots")),
  ].filter((p): p is Product => Boolean(p));
}

const COLOR_TOKENS = [
  ["canvas", "Page"],
  ["surface", "Cards, sheets"],
  ["raised", "Chips, hovers"],
  ["plate", "Product plate"],
  ["text", "Primary text"],
  ["text-2", "Secondary text"],
  ["text-3", "Meta, placeholders"],
  ["line", "Hairlines"],
  ["line-strong", "Strong lines"],
  ["field-edge", "Input edge"],
  ["action", "The one action"],
  ["error", "Errors only"],
] as const;

const TYPE_SCALE = [
  ["t-display", "Display", "Everything, well lit."],
  ["t-h1", "Heading L", "Most wanted"],
  ["t-h2", "Heading", "Marked down"],
  ["t-h3", "Heading S", "Order summary"],
  ["t-sub", "Subheading", "Free of noise, full of detail"],
  ["t-body-lg", "Body L", "Cool light, one source, nothing competing."],
  ["t-body", "Body", "Delivered to your door. Pay by card or cash on delivery."],
  ["t-label", "Label", "Add to bag"],
  ["t-caption", "Caption", "Adidas · Men's Fashion"],
] as const;

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`s-${n}`} className="border-t border-line pt-10">
      <header className="mb-8 flex items-baseline gap-4">
        <span className="t-caption t-num text-fg-3">{n}</span>
        <h2 id={`s-${n}`} className="t-h2">
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-card bg-surface p-6 sm:p-8 ${className}`}>{children}</div>;
}

export default async function SystemPage() {
  const all = await getAllProducts();
  const products = pickDemo(all);
  // A product with real written reviews. ratingsQuantity counts star ratings, which often have
  // no written review behind them, so check the most-rated few for actual reviews.
  const candidates = [...all].sort((a, b) => (b.ratingsQuantity ?? 0) - (a.ratingsQuantity ?? 0)).slice(0, 8);
  const withReviews = await Promise.all(candidates.map(async (p) => ({ p, r: await getReviews(p._id) })));
  const best = withReviews.sort((a, b) => b.r.length - a.r.length)[0];
  const reviewed = best?.p ?? null;
  const reviews = best?.r ?? [];

  return (
    <div className="min-h-dvh bg-canvas text-fg">
      <header className="sticky top-0 z-(--z-sticky) border-b border-line bg-[color-mix(in_srgb,var(--canvas)_82%,transparent)] backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-(--page-max) items-center gap-4 px-(--gutter)">
          <CartivaLogo variant="compact" height={22} />
          <span className="t-label text-fg-3">Design system</span>
          <ThemeToggle className="ml-auto" />
        </div>
      </header>

      <main id="main" className="mx-auto grid max-w-(--page-max) gap-20 px-(--gutter) py-16">
        <div className="grid gap-4">
          <p className="t-caption text-fg-3">v2.0 · living reference</p>
          <h1 className="t-display max-w-[14ch]">The system, in the product.</h1>
          <p className="t-body-lg max-w-[60ch] text-fg-2">
            Every piece below is the real component from <code className="t-label">src/ds</code>, rendered with real
            catalogue data. Switch the lights with the toggle above — both themes are first-class.
          </p>
        </div>

        <Section n="01" title="Logo">
          <div className="grid gap-4 md:grid-cols-3">
            <Panel className="grid min-h-48 place-items-center md:col-span-2">
              <CartivaLogo height={56} />
            </Panel>
            <Panel className="grid min-h-48 place-items-center">
              <CartivaLogo variant="stacked" height={120} />
            </Panel>
            <Panel className="flex min-h-40 items-end justify-center gap-8">
              {[64, 40, 32, 16].map((s) => (
                <figure key={s} className="grid justify-items-center gap-2">
                  <LitEdgeMark size={s} />
                  <figcaption className="t-caption t-num text-fg-3">{s}</figcaption>
                </figure>
              ))}
            </Panel>
            <Panel className="grid min-h-40 place-items-center">
              <CartivaLogo variant="compact" height={28} />
            </Panel>
            <Panel className="flex min-h-40 items-center justify-center gap-4">
              <span className="grid size-24 place-items-center rounded-[22px] bg-[#171721] text-[#ededf3]">
                <LitEdgeMark size={56} />
              </span>
              <span className="grid size-24 place-items-center rounded-[22px] bg-[#ededf3] text-[#171721]">
                <LitEdgeMark size={56} />
              </span>
            </Panel>
          </div>
        </Section>

        <Section n="02" title="Colour">
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {COLOR_TOKENS.map(([token, role]) => (
              <li key={token} className="grid gap-2">
                <span
                  className="h-24 rounded-card shadow-[inset_0_0_0_1px_var(--line)]"
                  style={{ background: `var(--${token})` }}
                />
                <span className="t-label">--{token}</span>
                <span className="t-caption text-fg-3">{role}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section n="03" title="Type">
          <div className="divide-y divide-line">
            {TYPE_SCALE.map(([cls, name, sample]) => (
              <div key={cls} className="grid gap-2 py-5 md:grid-cols-[200px_1fr] md:items-baseline">
                <span className="t-caption text-fg-3">
                  {name} · <code>{cls}</code>
                </span>
                <span className={cls}>{sample}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section n="04" title="Buttons">
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel className="flex flex-wrap items-center gap-3">
              <Button leadingIcon={<ShoppingBag strokeWidth={1.5} />}>Add to bag</Button>
              <Button variant="secondary" leadingIcon={<Heart strokeWidth={1.5} />}>
                Save
              </Button>
              <Button variant="text" trailingIcon={<ArrowRight strokeWidth={1.5} />}>
                View details
              </Button>
              <Button variant="danger" leadingIcon={<Trash2 strokeWidth={1.5} />}>
                Remove
              </Button>
            </Panel>
            <Panel className="flex flex-wrap items-center gap-3">
              <Button size="lg">Place order</Button>
              <Button loading loadingLabel="Placing order">
                Place order
              </Button>
              <Button disabled>Unavailable</Button>
              <ButtonLink href="/products" variant="secondary">
                Browse all
              </ButtonLink>
            </Panel>
            <Panel className="flex flex-wrap items-center gap-3">
              <IconButton label="Search" icon={<Search strokeWidth={1.5} />} />
              <IconButton label="Quick view" tone="solid" icon={<Eye strokeWidth={1.5} />} />
              <span className="inline-flex gap-3 rounded-card bg-plate p-3">
                <IconButton label="Save to wishlist" tone="plate" pressed={false} icon={<Heart strokeWidth={1.5} />} />
                <IconButton label="Add to bag" tone="plate" icon={<Plus strokeWidth={1.5} />} />
              </span>
              <Spinner label="Loading" className="text-fg-2" />
            </Panel>
            <Panel className="flex flex-wrap items-center gap-3">
              <ToggleChip selected>Electronics</ToggleChip>
              <ToggleChip selected={false}>Men&apos;s Fashion</ToggleChip>
              <ToggleChip selected={false}>Women&apos;s Fashion</ToggleChip>
              <Chip>In stock</Chip>
            </Panel>
          </div>
        </Section>

        <Section n="05" title="Fields">
          <Panel className="grid gap-6 md:grid-cols-2">
            <Field label="Phone" type="tel" placeholder="01012345678" autoComplete="tel" hint="Egyptian mobile, 11 digits." />
            <Field label="City" defaultValue="Cairo" required />
            <Field label="Coupon" defaultValue="SUMMER10" error="That code didn't work. Check it and try again." />
            <Field label="Coupon" defaultValue="WELCOME" valid hint="Applied — 10% off." />
            <Field label="Coupon" defaultValue="CHECKING" loading />
            <Field label="Email" defaultValue="you@example.com" disabled />
          </Panel>
        </Section>

        <Section n="06" title="Price">
          <Panel className="grid gap-5">
            <Price price={2449} priceAfterDiscount={1474} size="lg" />
            <Price price={19699} priceAfterDiscount={19199} />
            <Price price={149} size="sm" />
          </Panel>
        </Section>

        <Section n="07" title="Product shot — hover for the second photo">
          {products.length === 0 ? (
            <p className="t-body text-fg-2">Couldn&apos;t reach the catalogue. Reload to try again.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
              {products.map((p, i) => (
                <li key={p._id} className="group">
                  <ProductShot src={p.imageCover} hoverSrc={p.images?.[1]} alt={p.title} priority={i < 2}>
                    <IconButton
                      label={`Save ${p.title} to wishlist`}
                      tone="plate"
                      pressed={false}
                      icon={<Heart strokeWidth={1.5} />}
                      className="absolute right-3 top-3"
                    />
                  </ProductShot>
                  <p className="mt-4 t-caption text-fg-3">{p.brand?.name}</p>
                  <h3 className="mt-1 line-clamp-2 text-[0.9375rem] leading-snug font-[420]">{p.title}</h3>
                  <Price className="mt-2" size="sm" price={p.price} priceAfterDiscount={p.priceAfterDiscount} />
                </li>
              ))}
            </ul>
          )}
        </Section>

        {all.length > 0 && <CommerceDemos products={all} reviews={reviews} reviewed={reviewed} />}
      </main>
    </div>
  );
}
