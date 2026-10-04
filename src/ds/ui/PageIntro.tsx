import Link from "next/link";
import { cn } from "@/lib/utils";

/** The top of every inner page: where you are, what this is, one line of context. */
export function PageIntro({
  crumbs = [],
  title,
  children,
  className,
}: {
  crumbs?: { href: string; label: string }[];
  title: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("grid gap-4 pt-10 pb-10 lg:pt-14", className)}>
      {crumbs.length > 0 && (
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 t-caption text-fg-3">
            {crumbs.map((c) => (
              <li key={c.href} className="flex items-center gap-2">
                <Link href={c.href} className="hover:text-fg">
                  {c.label}
                </Link>
                <span aria-hidden>/</span>
              </li>
            ))}
          </ol>
        </nav>
      )}
      <h1 className="t-h1 max-w-[20ch]">{title}</h1>
      {children && <div className="t-body-lg max-w-[60ch] text-fg-2">{children}</div>}
    </header>
  );
}

/** Page frame for inner pages: the site's content width and gutters. */
export function PageFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-(--page-max) px-(--gutter) pb-24", className)}>{children}</div>;
}
