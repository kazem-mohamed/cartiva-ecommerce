import Link from "next/link";
import { CartivaLogo } from "../brand/Logo";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/products", label: "All products" },
      { href: "/categories", label: "Departments" },
      { href: "/brand", label: "Brands" },
      { href: "/products?sale=1", label: "Marked down" },
    ],
  },
  {
    title: "Your account",
    links: [
      { href: "/profile", label: "Account" },
      { href: "/orders", label: "Orders" },
      { href: "/wishlist", label: "Wishlist" },
      { href: "/compare", label: "Compare" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/brand.html", label: "Brand guidelines" },
      { href: "/system", label: "Design system" },
    ],
  },
] as const;

/**
 * Only true service facts — how you can pay and where it ships. No invented
 * badges, counts or guarantees (brand guidelines §9).
 */
export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line pb-28 lg:pb-0">
      <div className="mx-auto grid max-w-(--page-max) gap-12 px-(--gutter) py-16 lg:grid-cols-[1.2fr_2fr]">
        <div className="grid content-start gap-5">
          <CartivaLogo height={28} />
          <p className="t-h3 max-w-[18ch] text-fg-2">Everything, well lit.</p>
          <ul className="grid gap-1.5 t-caption text-fg-3">
            <li>Pay by card (Stripe) or cash on delivery.</li>
            <li>Prices in Egyptian pounds (EGP).</li>
          </ul>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {COLUMNS.map((c) => (
            <div key={c.title}>
              <h2 className="mb-4 t-caption text-fg-3">{c.title}</h2>
              <ul className="grid gap-3">
                {c.links.map((l) => (
                  <li key={l.href}>
                    {/* Static files (the brand board) are not routes, so they get a plain link. */}
                    {l.href.endsWith(".html") ? (
                      <a href={l.href} className="t-body text-fg-2 transition-colors hover:text-fg">
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className="t-body text-fg-2 transition-colors hover:text-fg">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-(--page-max) px-(--gutter) py-6 t-caption text-fg-3">
          © 2026 Cartiva · A portfolio store built on a public demo catalogue — no real orders are fulfilled.
        </p>
      </div>
    </footer>
  );
}
