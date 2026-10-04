"use client";

import { Heart, Search, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CartivaLogo } from "../brand/Logo";
import { useCommerce } from "../commerce/CommerceProvider";
import { hasEditorial } from "../commerce/EditorialImage";
import { ThemeToggle } from "../theme/ThemeToggle";
import { AccountMenu } from "./AccountMenu";
import { useChrome } from "./ChromeProvider";

export const NAV = [
  { href: "/products", label: "Shop" },
  { href: "/categories", label: "Departments" },
  { href: "/brand", label: "Brands" },
  { href: "/products?sale=1", label: "Marked down" },
] as const;

function Count({ n }: { n: number }) {
  if (!n) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-pill bg-fg px-1 text-[10px] font-[480] t-num text-canvas">
      {n > 9 ? "9+" : n}
    </span>
  );
}

/**
 * Transparent over the homepage hero, frosted glass once the page moves — the
 * room's frame, never competing with what is on display.
 */
export function SiteHeader() {
  const pathname = usePathname() ?? "/";
  const { openSearch } = useChrome();
  const { cart, wishlist, openBag, signedIn } = useCommerce();
  const [scrolled, setScrolled] = useState(false);
  const overHero = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const clear = overHero && !scrolled;
  const isActive = (href: string) => {
    const path = href.split("?")[0];
    return href.includes("?") ? false : pathname === path || pathname.startsWith(`${path}/`);
  };

  const iconLink = "relative inline-grid size-11 place-items-center rounded-full text-fg hover:bg-raised active:scale-[.94] [&_svg]:size-5";

  return (
    <header
      // Over the homepage hero the clear header takes the hero's theme: light over the campaign
      // photo, dark over the stand-in vitrine.
      data-theme={clear ? (hasEditorial("hero-desktop") ? "light" : "dark") : undefined}
      className={cn(
        "sticky top-0 z-(--z-sticky) transition-[background-color,border-color,backdrop-filter] duration-(--dur-state) ease-light",
        clear
          ? "border-b border-transparent bg-transparent"
          : "border-b border-line bg-[color-mix(in_srgb,var(--canvas)_78%,transparent)] backdrop-blur-xl",
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-10 focus:rounded-pill focus:bg-surface focus:px-5 focus:py-3 focus:t-label"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-(--page-max) items-center gap-8 px-(--gutter)">
        <Link href="/" aria-label="Cartiva, home" className="shrink-0 rounded-[6px] text-fg hover:opacity-75">
          <CartivaLogo variant="compact" height={22} title="" />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  // One hairline under the label: drawn in from the left on hover, held for the current page.
                  className={cn(
                    "relative t-label",
                    "after:absolute after:inset-x-0 after:-bottom-1.5 after:h-px after:origin-left after:bg-current",
                    "after:transition-[scale,background-color] after:duration-(--dur-state) after:ease-light",
                    isActive(item.href) ? "text-fg after:scale-x-100" : "text-fg-2 after:scale-x-0 hover:text-fg hover:after:scale-x-100",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={openSearch}
            className="group hidden h-11 items-center gap-2.5 rounded-pill border border-line-strong pl-4 pr-2 t-label text-fg-2 hover:border-fg hover:text-fg active:scale-[.98] lg:inline-flex"
          >
            <Search aria-hidden size={18} strokeWidth={1.5} />
            <span className="w-28 text-left">Search</span>
            <kbd className="rounded-[6px] border border-line-strong px-1.5 py-0.5 t-caption text-fg-3 transition-colors group-hover:border-fg-3 group-hover:text-fg-2">/</kbd>
          </button>
          <div className="hidden lg:block">
            <ThemeToggle showLabel={false} className="ml-1 border-transparent" />
          </div>
          <div className="hidden lg:block">
            {signedIn ? (
              <AccountMenu />
            ) : (
              <Link href="/login" className={iconLink} aria-label="Sign in">
                <User aria-hidden strokeWidth={1.5} />
              </Link>
            )}
          </div>
          <Link href="/wishlist" className={cn(iconLink, "hidden lg:inline-grid")} aria-label={`Wishlist${wishlist.size ? `, ${wishlist.size} saved` : ""}`}>
            <Heart aria-hidden strokeWidth={1.5} />
            <Count n={wishlist.size} />
          </Link>
          <button
            type="button"
            onClick={openBag}
            className={cn(iconLink, "hidden lg:inline-grid")}
            aria-label={`Bag${cart.units ? `, ${cart.units} ${cart.units === 1 ? "item" : "items"}` : ""}`}
          >
            <ShoppingBag aria-hidden strokeWidth={1.5} />
            <Count n={cart.units} />
          </button>
        </div>
      </div>
    </header>
  );
}
