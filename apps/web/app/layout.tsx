import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteSidebar } from "@/components/SiteSidebar";
import { BottomNav } from "@/components/BottomNav";
import { SiteFooter } from "@/components/SiteFooter";
import { ThemeProvider, themeInitScript } from "@/lib/theme";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Broodjes & Meer Broodje Gebrook | Verse broodjes in Hoensbroek",
    template: "%s · Broodje Gebrook",
  },
  description:
    "Vers belegde broodjes, burgers, tosti's en meer in Hoensbroek. Elke dag vers bereid. Afhalen of laten bezorgen. Mail info@broodjesgebrook.nl.",
  metadataBase: new URL("https://broodjesgebrook.nl"),
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon_16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon_32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon_32x32.png",
    apple: [{ url: "/icon_192x192.png", sizes: "192x192", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Broodje Gebrook",
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: "Broodje Gebrook",
    title: "Broodje Gebrook. Verse broodjes & meer in Hoensbroek.",
    description: "Vers belegde broodjes, burgers, salades en meer. Bestel online. Afhalen of bezorgen.",
    images: [
      {
        url: "/logo_broodjes_gebrook.png",
        width: 894,
        height: 636,
        alt: "Broodjes & Meer Broodje Gebrook",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Broodje Gebrook. Verse broodjes & meer in Hoensbroek.",
    description: "Vers belegde broodjes, burgers, salades en meer. Bestel online. Afhalen of bezorgen.",
    images: ["/logo_broodjes_gebrook.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#fafaf7",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-[100dvh] bg-[rgb(var(--bg))] text-[rgb(var(--text))]">
        <ThemeProvider>
          <SiteHeader />
          <SiteSidebar />
          <div className="lg:ml-64 xl:ml-72 flex flex-col min-h-screen">
            <main className="flex-1 pb-20 lg:pb-0">
              {children}
            </main>
            <div className="hidden lg:block">
              <SiteFooter />
            </div>
          </div>
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
