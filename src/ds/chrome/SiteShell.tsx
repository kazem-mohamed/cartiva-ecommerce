"use client";

import { usePathname } from "next/navigation";
import { CheckoutHeader } from "./CheckoutHeader";
import { ChromeProvider } from "./ChromeProvider";
import { CompareTray } from "./CompareTray";
import { MobilePill, MobileTopBar } from "./MobileBar";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/** Routes that bring their own frame. */
const BARE_ROUTES = ["/system"];
/** Routes without the shop's navigation: a slim header, no footer, no pill. */
const FOCUS_ROUTES = ["/checkout"];

const matches = (list: string[], path: string) => list.some((r) => path === r || path.startsWith(`${r}/`));

/** The site frame: header, mobile bar and pill, footer, compare tray — or the slim checkout frame. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  if (matches(BARE_ROUTES, pathname)) return <ChromeProvider>{children}</ChromeProvider>;

  if (matches(FOCUS_ROUTES, pathname)) {
    return (
      <ChromeProvider>
        <CheckoutHeader />
        <main id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">
          {children}
        </main>
      </ChromeProvider>
    );
  }

  return (
    <ChromeProvider>
      <div className="hidden lg:contents">
        <SiteHeader />
      </div>
      <MobileTopBar />
      <main id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        {children}
      </main>
      <SiteFooter />
      <CompareTray />
      <MobilePill />
    </ChromeProvider>
  );
}
