"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useId, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const ACCOUNT_LINKS = [
  { href: "/profile", label: "Your account" },
  { href: "/orders", label: "Orders" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/profile/addresses", label: "Addresses" },
  { href: "/profile/settings", label: "Settings" },
  { href: "/compare", label: "Compare" },
] as const;

export function useSignOut() {
  const router = useRouter();
  return async () => {
    try {
      await signOut({ redirect: false });
      toast("Signed out.");
      router.push("/login");
    } catch {
      toast.error("Couldn't sign you out. Try again.");
    }
  };
}

function initials(name?: string | null) {
  return (name ?? "?")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

/** Signed-in account menu: a button with your initials, a short list, and sign out set apart. */
export function AccountMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const signOutNow = useSignOut();
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const name = session?.user?.name ?? session?.user?.email ?? "Account";

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    root.current?.querySelector<HTMLElement>("a")?.focus();
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        ref={button}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`Account: ${name}`}
        onClick={() => setOpen((o) => !o)}
        className="group grid size-11 place-items-center rounded-full active:scale-[.94]"
      >
        {/* Hover rings the initials; open, they turn solid — the menu belongs to them. */}
        <span
          className={cn(
            "grid size-8 place-items-center rounded-full bg-raised t-caption text-fg",
            "transition-[background-color,color,box-shadow] duration-(--dur-hover) ease-light",
            "group-hover:shadow-[0_0_0_1.5px_var(--line-strong)] group-aria-expanded:bg-fg group-aria-expanded:text-canvas",
          )}
        >
          {initials(name)}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={id}
            role="menu"
            aria-label="Account"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } }}
            exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.14, ease: [0.4, 0, 1, 1] } }}
            className="absolute right-0 z-(--z-raised) mt-2 w-64 origin-top-right rounded-card border border-line bg-surface p-2 shadow-[0_16px_40px_-16px_rgb(0_0_0/0.45)]"
          >
            <div className="border-b border-line px-3 pt-2 pb-3">
              <p className="truncate t-label">{session?.user?.name ?? "Your account"}</p>
              {session?.user?.email && <p className="truncate t-caption text-fg-3">{session.user.email}</p>}
            </div>
            <ul className="py-1">
              {ACCOUNT_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    role="menuitem"
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-[8px] px-3 py-2.5 t-label text-fg-2 hover:bg-raised hover:text-fg focus-visible:bg-raised focus-visible:text-fg focus-visible:outline-none"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                setOpen(false);
                void signOutNow();
              }}
              className="mt-1 flex w-full items-center gap-2 rounded-[8px] border-t border-line px-3 pt-3 pb-2.5 t-label text-fg-2 hover:text-fg"
            >
              <LogOut aria-hidden size={16} strokeWidth={1.5} />
              Sign out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
