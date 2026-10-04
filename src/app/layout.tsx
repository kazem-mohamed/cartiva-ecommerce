import type { Metadata, Viewport } from "next";
import { Figtree, Fraunces } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "@/ds/ui/Toaster";
import { Providers } from "@/app/providers";
import { RouteProgress } from "@/ds/chrome/RouteProgress";
import { SiteShell } from "@/ds/chrome/SiteShell";
import { themeInitScript } from "@/ds/theme/theme";
import "./globals.css";

// Soft editorial: Fraunces (a soft, optical-size serif) for display and headings,
// Figtree for reading text, UI and prices. Chosen on /lab (option D).
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "opsz"],
  display: "swap",
});
const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Cartiva — Everything, well lit",
    template: "%s | Cartiva",
  },
  description: "Electronics and fashion, presented with care. Pay by card or cash on delivery.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#171721" },
    { media: "(prefers-color-scheme: light)", color: "#ededf3" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // data-theme is set by themeInitScript before paint, so the server markup
    // intentionally differs from the client here.
    <html lang="en" className={`${fraunces.variable} ${figtree.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <Suspense fallback={null}>
            <RouteProgress />
          </Suspense>
          <SiteShell>{children}</SiteShell>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
