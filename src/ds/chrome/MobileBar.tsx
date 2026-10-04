"use client";

import { ArrowRight, LogOut, Menu, Search, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { CartivaLogo } from "../brand/Logo";
import { useCommerce } from "../commerce/CommerceProvider";
import { ThemeToggle } from "../theme/ThemeToggle";
import { ButtonLink } from "../ui/Button";
import { IconButton } from "../ui/IconButton";
import { Sheet } from "../ui/Sheet";
import { Spinner } from "../ui/Spinner";
import { ACCOUNT_LINKS, useSignOut } from "./AccountMenu";
import { useChrome } from "./ChromeProvider";
import { NAV } from "./SiteHeader";

const MORPH = { duration: 0.52, ease: [0.16, 1, 0.3, 1] } as const;

/** Phones: a logo-only top bar. Everything you reach for lives in the pill, under your thumb. */
export function MobileTopBar() {
  return (
    <header className="sticky top-0 z-(--z-sticky) flex h-14 items-center justify-center border-b border-line bg-[color-mix(in_srgb,var(--canvas)_82%,transparent)] backdrop-blur-xl lg:hidden">
      <Link href="/" aria-label="Cartiva, home" className="text-fg hover:opacity-75 active:opacity-60">
        <CartivaLogo variant="compact" height={20} title="" />
      </Link>
    </header>
  );
}

export function MobilePill() {
  const { openSearch, pillAction } = useChrome();
  const { cart, openBag } = useCommerce();
  const [menu, setMenu] = useState(false);
  const reduce = useReducedMotion();
  // Touch first: the press is the feedback (a lit well under the thumb and a slight give).
  const item =
    "flex h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-pill text-[11px] font-[480] text-fg hover:bg-raised active:scale-[.95] active:bg-raised [&_svg]:size-5";

  return (
    <>
      <nav aria-label="Shortcuts" className="pointer-events-none fixed inset-x-0 bottom-0 z-(--z-sticky) flex justify-center px-4 pb-[max(12px,env(safe-area-inset-bottom))] lg:hidden">
        <motion.div
          layout={!reduce}
          transition={MORPH}
          className="pointer-events-auto flex w-full max-w-[420px] items-center gap-1 rounded-pill border border-line bg-[color-mix(in_srgb,var(--surface)_86%,transparent)] p-1.5 backdrop-blur-xl"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {pillAction ? (
              <motion.div
                key="action"
                className="flex w-full items-center gap-1.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: MORPH }}
                exit={{ opacity: 0, transition: { duration: 0.18 } }}
              >
                <button
                  type="button"
                  onClick={() => setMenu(true)}
                  aria-label="Menu"
                  className="grid size-12 shrink-0 place-items-center rounded-full text-fg hover:bg-raised active:scale-[.94] active:bg-raised [&_svg]:size-5"
                >
                  <Menu aria-hidden strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={pillAction.onClick}
                  disabled={pillAction.disabled || pillAction.busy}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-pill bg-action px-5 t-label text-on-action hover:bg-[color-mix(in_srgb,var(--action)_86%,white)] enabled:active:scale-[.97] disabled:opacity-50"
                >
                  {pillAction.busy ? <Spinner label="Adding" /> : <ShoppingBag aria-hidden size={18} strokeWidth={1.5} />}
                  {pillAction.label}
                  {pillAction.price && <span className="t-num font-normal">· {pillAction.price}</span>}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="nav"
                className="flex w-full items-center gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: MORPH }}
                exit={{ opacity: 0, transition: { duration: 0.18 } }}
              >
                <button type="button" className={item} onClick={() => setMenu(true)}>
                  <Menu aria-hidden strokeWidth={1.5} />
                  Menu
                </button>
                <button type="button" className={item} onClick={openSearch}>
                  <Search aria-hidden strokeWidth={1.5} />
                  Search
                </button>
                <button type="button" className={cn(item, "relative")} onClick={openBag} aria-label={`Bag${cart.units ? `, ${cart.units} items` : ""}`}>
                  <ShoppingBag aria-hidden strokeWidth={1.5} />
                  <span aria-hidden>Bag</span>
                  {cart.units > 0 && (
                    <span className="absolute right-[calc(50%-22px)] top-1 grid h-[18px] min-w-[18px] place-items-center rounded-pill bg-fg px-1 text-[10px] t-num text-canvas">
                      {cart.units > 9 ? "9+" : cart.units}
                    </span>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </nav>
      <MobileMenu open={menu} onClose={() => setMenu(false)} />
    </>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: session } = useSession();
  const signOutNow = useSignOut();
  const signedIn = Boolean(session?.accessToken);
  return (
    <Sheet open={open} onClose={onClose} labelledBy="menu-title" side="bottom">
      <div className="flex items-center px-6 pt-1 pb-2">
        <h2 id="menu-title" className="t-h3">
          Menu
        </h2>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <IconButton label="Close menu" icon={<X strokeWidth={1.5} aria-hidden />} onClick={onClose} className="-mr-2" />
        </div>
      </div>
      <nav aria-label="Main" className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-8">
        <ul className="grid">
          {NAV.map((l) => (
            <li key={l.href}>
              <Link href={l.href} onClick={onClose} className="group flex min-h-14 items-center justify-between border-b border-line t-h3 hover:text-fg-2 active:text-fg-2">
                {l.label}
                <ArrowRight
                  aria-hidden
                  size={20}
                  strokeWidth={1.5}
                  className="text-fg-3 transition-[translate,color] duration-(--dur-state) group-hover:translate-x-1 group-active:translate-x-1 group-hover:text-fg"
                />
              </Link>
            </li>
          ))}
        </ul>
        {signedIn ? (
          <>
            <p className="mt-8 mb-2 t-caption text-fg-3">{session?.user?.name ?? session?.user?.email}</p>
            <ul className="grid grid-cols-2 gap-x-4">
              {ACCOUNT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} onClick={onClose} className="flex min-h-12 items-center t-body text-fg-2 hover:text-fg active:text-fg">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => {
                onClose();
                void signOutNow();
              }}
              className="mt-4 flex min-h-12 items-center gap-2 t-label text-fg-2 hover:text-fg active:text-fg"
            >
              <LogOut aria-hidden size={16} strokeWidth={1.5} />
              Sign out
            </button>
          </>
        ) : (
          <div className="mt-8 grid gap-3">
            <ButtonLink href="/login" variant="secondary" fullWidth onClick={onClose}>
              Sign in
            </ButtonLink>
            <ButtonLink href="/register" variant="text" onClick={onClose} className="justify-self-center">
              Create an account
            </ButtonLink>
          </div>
        )}
      </nav>
    </Sheet>
  );
}
