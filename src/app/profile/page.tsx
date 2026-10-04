"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useCommerce } from "@/ds/commerce/CommerceProvider";
import { listOrders } from "@/ds/data/account";

/** Every number here comes from the API — orders, wishlist and bag, nothing estimated. */
export default function ProfileOverview() {
  const { data: session } = useSession();
  const { cart, cartStatus, wishlist } = useCommerce();
  const token = session?.accessToken ?? null;
  const userId = session?.user?.id ?? null;
  const [orders, setOrders] = useState<number | null>(null);

  useEffect(() => {
    if (!token || !userId) return;
    let live = true;
    listOrders(token, userId)
      .then((list) => live && setOrders(list.length))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [token, userId]);

  const first = session?.user?.name?.split(" ")[0];
  const tiles = [
    { label: "Orders", value: orders, href: "/orders" },
    { label: "Wishlist", value: wishlist.size, href: "/wishlist" },
    { label: "In your bag", value: cartStatus === "ready" ? cart.units : null, href: "/cart" },
  ];

  return (
    <div className="grid gap-12">
      <header className="grid gap-3">
        <h1 className="t-h1">{first ? `Hello, ${first}.` : "Your account"}</h1>
        {session?.user?.email && <p className="t-body-lg text-fg-2">{session.user.email}</p>}
      </header>

      <ul aria-label="Account summary" className="grid gap-3 sm:grid-cols-3">
        {tiles.map((t) => (
          <li key={t.href}>
            <Link href={t.href} className="group grid h-full gap-6 rounded-card border border-line p-6 transition-colors duration-(--dur-hover) hover:border-line-strong">
              <span className="t-label text-fg-2">{t.label}</span>
              {t.value === null ? (
                <span className="skeleton h-10 w-14 rounded-pill" aria-label="Loading" />
              ) : (
                <span className="t-display t-num leading-none">{t.value}</span>
              )}
              <ArrowRight aria-hidden size={18} strokeWidth={1.5} className="text-fg-3 transition-transform duration-(--dur-state) ease-light group-hover:translate-x-1 group-hover:text-fg" />
            </Link>
          </li>
        ))}
      </ul>

      <section aria-labelledby="manage" className="grid gap-4 border-t border-line pt-10">
        <h2 id="manage" className="t-h3">
          Manage
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {[
            { href: "/profile/settings", label: "Profile & password", note: "Name, email, mobile, password" },
            { href: "/profile/addresses", label: "Addresses", note: "Where your orders go" },
          ].map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="group flex items-center justify-between gap-4 rounded-card bg-surface p-5 transition-colors duration-(--dur-hover) hover:bg-raised">
                <span className="grid gap-1">
                  <span className="t-label">{l.label}</span>
                  <span className="t-caption text-fg-3">{l.note}</span>
                </span>
                <ArrowRight aria-hidden size={18} strokeWidth={1.5} className="text-fg-3 transition-[translate,color] duration-(--dur-state) ease-light group-hover:translate-x-1 group-hover:text-fg" />
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
