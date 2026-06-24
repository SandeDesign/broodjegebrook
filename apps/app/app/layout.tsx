import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: "Broodje Gebrook — Staff",
  description: "Live orders, menu en CRM voor Broodje Gebrook",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Gebrook Staff",
  },
};

export const viewport: Viewport = {
  themeColor: "#07091c",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={inter.variable}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
