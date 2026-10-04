import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { CartivaLogo } from "../brand/Logo";
import { ThemeToggle } from "../theme/ThemeToggle";

/** Checkout drops the shop's navigation: the way out is back to the bag, nothing else competes. */
export function CheckoutHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex h-16 w-full max-w-(--page-max) items-center gap-4 px-(--gutter)">
        <Link href="/" aria-label="Cartiva, home" className="text-fg hover:opacity-75">
          <CartivaLogo variant="horizontal" height={22} title="" />
        </Link>
        <p className="hidden items-center gap-2 t-caption text-fg-3 sm:flex">
          <Lock aria-hidden size={14} strokeWidth={1.5} />
          Secure checkout
        </p>
        <div className="ml-auto flex items-center gap-2">
          <Link href="/cart" className="group inline-flex h-11 items-center gap-2 rounded-pill px-3 t-label text-fg-2 hover:bg-raised hover:text-fg active:scale-[.97]">
            <ArrowLeft aria-hidden size={16} strokeWidth={1.5} className="transition-[translate] duration-(--dur-state) ease-light group-hover:-translate-x-0.5" />
            Back to bag
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
