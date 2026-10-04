import type { Metadata } from "next";
import Link from "next/link";
import { EditorialImage, hasEditorial } from "@/ds/commerce/EditorialImage";
import { ButtonLink } from "@/ds/ui/Button";
import { PageFrame } from "@/ds/ui/PageIntro";

export const metadata: Metadata = { title: "Page not found" };

const LINKS = [
  { label: "Shop everything", href: "/products" },
  { label: "Departments", href: "/categories" },
  { label: "Brands", href: "/brand" },
  { label: "Marked down", href: "/products?sale=1" },
];

/** An empty bag in the studio: nothing is on display at this address. */
export default function NotFound() {
  return (
    <PageFrame className="grid flex-1 content-center items-center gap-12 py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-16 lg:py-32">
      <div className="grid justify-items-start gap-8">
        <p className="t-caption t-num text-fg-3">404</p>
        <h1 className="t-display max-w-[14ch]">Nothing on display here.</h1>
        <p className="t-body-lg max-w-[46ch] text-fg-2">The link may be old, or the product has left the catalogue. Everything else is where you left it.</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <ButtonLink href="/" size="lg">
            Back to the store
          </ButtonLink>
        </div>
        <nav aria-label="Or go to" className="mt-6 w-full border-t border-line pt-8">
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="t-label underline decoration-line-strong underline-offset-[6px] hover:decoration-current">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {hasEditorial("empty-plinth") && <EditorialImage name="empty-plinth" sizes="(min-width: 1024px) 40vw, 1px" className="hidden lg:block" />}
    </PageFrame>
  );
}
