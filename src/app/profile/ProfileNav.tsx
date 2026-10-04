"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSignOut } from "@/ds/chrome/AccountMenu";

const SECTIONS = [
  { href: "/profile", label: "Overview" },
  { href: "/profile/settings", label: "Profile & password" },
  { href: "/profile/addresses", label: "Addresses" },
];
const ELSEWHERE = [
  { href: "/orders", label: "Orders" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/compare", label: "Compare" },
];

/** Phones: a row of tabs that scrolls. Desktop: a quiet column that stays in view. */
export function ProfileNav() {
  const pathname = usePathname();
  const signOutNow = useSignOut();
  const link = (active: boolean) =>
    cn(
      "flex h-11 shrink-0 items-center rounded-pill px-4 t-label transition-colors duration-(--dur-hover)",
      active ? "bg-raised text-fg" : "text-fg-2 hover:bg-raised hover:text-fg",
    );

  return (
    <nav aria-label="Account" className="lg:sticky lg:top-24 lg:self-start">
      <ul className="-mx-(--gutter) flex gap-1 overflow-x-auto px-(--gutter) [scrollbar-width:none] lg:mx-0 lg:grid lg:px-0">
        {SECTIONS.map((s) => {
          const active = pathname === s.href;
          return (
            <li key={s.href}>
              <Link href={s.href} aria-current={active ? "page" : undefined} className={link(active)}>
                {s.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-6 hidden border-t border-line pt-6 lg:block">
        <p className="mb-2 px-4 t-caption text-fg-3">Also yours</p>
        <ul className="grid">
          {ELSEWHERE.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={link(false)}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => void signOutNow()} className={cn(link(false), "mt-4 w-full gap-2")}>
          <LogOut aria-hidden size={16} strokeWidth={1.5} />
          Sign out
        </button>
      </div>
    </nav>
  );
}
