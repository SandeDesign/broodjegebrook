"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, ShoppingBag, Phone } from "lucide-react";
import { cn } from "@eufraat/ui";
import { useSimpleCart } from "@/lib/simpleCart";
import { CartSheet } from "@/components/CartSheet";

export function BottomNav() {
  const pathname = usePathname();
  const [cartOpen, setCartOpen] = useState(false);
  const lines = useSimpleCart((s) => s.lines);
  const count = lines.reduce((n, l) => n + l.qty, 0);

  const onMenu = pathname.startsWith("/menukaart");

  return (
    <>
      <CartSheet open={cartOpen} onClose={() => setCartOpen(false)} />

      <nav
        className="lg:hidden fixed inset-x-0 z-50 bg-ink border-t border-line/[0.06] pb-[env(safe-area-inset-bottom)]"
        style={{ bottom: 0, transform: "translateZ(0)" }}
      >
        <div className="grid grid-cols-4 h-16">

          {/* Home */}
          <Link href="/" className="flex flex-col items-center justify-center gap-1">
            <Home className={cn("h-5 w-5 transition-colors", pathname === "/" ? "text-gold" : "text-cream/40")} />
            <span className={cn("text-[10px] font-medium", pathname === "/" ? "text-gold" : "text-cream/45")}>Home</span>
          </Link>

          {/* Bestellen — gaat naar de menukaart en is de primaire actie */}
          <Link href="/menukaart" className="flex flex-col items-center justify-center gap-1 relative">
            <span className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full transition-all",
              onMenu
                ? "bg-gold text-ink shadow-[0_0_18px_rgba(233,185,73,0.45)]"
                : "bg-gold/15 text-gold ring-1 ring-gold/40",
            )}>
              <UtensilsCrossed className="h-5 w-5" />
            </span>
            <span className={cn("text-[10px] font-semibold transition-colors", onMenu ? "text-gold" : "text-gold/85")}>
              Bestellen
            </span>
          </Link>

          {/* Mijn bestelling — opent cart sheet */}
          <button
            onClick={() => setCartOpen(true)}
            className="flex flex-col items-center justify-center gap-1 relative"
          >
            <span className="relative inline-flex h-5 w-5 items-center justify-center">
              <ShoppingBag className={cn("h-5 w-5 transition-colors", count > 0 ? "text-cream" : "text-cream/40")} />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-2 inline-flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-gold text-ink text-[10px] font-bold tabular-nums leading-none">
                  {count}
                </span>
              )}
            </span>
            <span className={cn("text-[10px] font-medium transition-colors", count > 0 ? "text-cream" : "text-cream/45")}>
              Mijn bestelling
            </span>
          </button>

          {/* Contact */}
          <Link href="/contact" className="flex flex-col items-center justify-center gap-1">
            <Phone className={cn("h-5 w-5 transition-colors", pathname.startsWith("/contact") ? "text-gold" : "text-cream/40")} />
            <span className={cn("text-[10px] font-medium", pathname.startsWith("/contact") ? "text-gold" : "text-cream/45")}>Contact</span>
          </Link>

        </div>
      </nav>
    </>
  );
}
