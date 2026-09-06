import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "@/component/ui/sonner";
import { Providers } from "@/app/providers";
import Navbar from "@/component/layout/Navbar/Navbar";
import Footer from "@/component/layout/Footer/Footer";
import RouteLoader from "@/component/layout/RouteLoader";
import CompareBar from "@/component/compare/CompareBar";
import "./globals.css";

// One family, two widths. Display runs expanded (wdth 110-116), body runs
// normal — the contrast comes from width rather than a second typeface.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Cartiva",
    template: "%s | Cartiva",
  },
  description:
    "Cartiva — electronics, fashion, beauty, home, books and mobiles. Everything has a price tag.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${archivo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>
          <Suspense fallback={null}>
            <RouteLoader />
          </Suspense>
          <Navbar />
          {/* Target for the skip link. tabIndex -1 lets it receive focus
             programmatically without entering the tab order itself. */}
          <div id="main" tabIndex={-1} className="flex flex-1 flex-col outline-none">
            {children}
          </div>
          <Footer />
          <CompareBar />
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
