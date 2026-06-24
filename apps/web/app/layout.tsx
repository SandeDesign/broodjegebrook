import type { Metadata, Viewport } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteSidebar } from "@/components/SiteSidebar";
import { BottomNav } from "@/components/BottomNav";
import { SiteFooter } from "@/components/SiteFooter";
import { ThemeProvider, themeInitScript } from "@/lib/theme";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  axes: ["opsz"],
});
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Pizzeria Shoarma Eufraat Geleen | Verse pizza & shoarma bestellen",
    template: "%s · Eufraat Geleen",
  },
  description:
    "Pizzeria Shoarma Eufraat in Geleen. Verse pizza, shoarma en wraps voor bezorging of afhaal. Open vanaf 15:30. Bel 046 410 6745.",
  metadataBase: new URL("https://eufraat.nl"),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Eufraat",
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: "Eufraat Geleen",
    title: "Eufraat. Pizzeria & Shoarmazaak Geleen",
    description: "Verse pizza, shoarma en kapsalon. Bestel online. Afhalen of bezorgen.",
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
    <html lang="nl" className={`${inter.variable} ${fraunces.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* Inline script: applies theme class before first paint to avoid FOUC */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-[100dvh] bg-ink text-cream">
        <ThemeProvider>
          {/* Mobile-only top header */}
          <SiteHeader />

          {/* Desktop sidebar */}
          <SiteSidebar />

          {/* Content column — shifts right on desktop to clear sidebar */}
          <div className="lg:ml-64 xl:ml-72 flex flex-col min-h-screen">
            <main className="flex-1 pb-20 lg:pb-0">
              {children}
            </main>
            {/* Footer: hidden on mobile (bottom nav takes over) */}
            <div className="hidden lg:block">
              <SiteFooter />
            </div>
          </div>

          {/* Mobile bottom nav */}
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
