import type { Metadata } from "next";
import { Exo } from "next/font/google";
import { Toaster } from "@/component/ui/sonner";
import { Providers } from "@/app/providers";
import Navbar from "@/component/layout/Navbar/Navbar";
import Footer from "@/component/layout/Footer/Footer";
import RouteLoader from "@/component/layout/RouteLoader";
import "./globals.css";

const exo = Exo({
  variable: "--font-exo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "FreshCart",
    template: "%s | FreshCart",
  },
  description: "FreshCart online store",
  icons: {
    icon: "/favicon.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${exo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>
          <RouteLoader />
          <Navbar />
          {children}
          <Footer />
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
