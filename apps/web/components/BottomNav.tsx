"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, ShoppingBag, Mail } from "lucide-react";
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
        className="lg:hidden fixed inset-x-0 z-50 bg-white border-t border-[rgb(var(--border))] shadow-[0_-2px_12px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]"
        style={{ bottom: 0, transform: "translateZ(0)" }}
      >
        <div className="grid grid-cols-4 h-16">

          {/* Home */}
          <Link href="/" className="flex flex-col items-center justify-center gap-1">
            <Home className={cn("h-5 w-5 transition-colors", pathname === "/" ? "text-[rgb(var(--accent))]" : "text-[rgb(var(--text-soft))]")} />
            <span className={cn("text-[10px] font-medium", pathname === "/" ? "text-[rgb(var(--accent))]" : "text-[rgb(var(--text-soft))]")}>Home</span>
          </Link>

          {/* Bestellen */}
          <Link href="/menukaart" className="flex flex-col items-center justify-center gap-1 relative">
            <span className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full transition-all",
              onMenu
                ? "bg-[rgb(var(--accent))] text-white shadow-[0_2px_12px_rgba(45,106,79,0.4)]"
                : "bg-[rgb(var(--accent)/0.1)] text-[rgb(var(--accent))]",
            )}>
              <UtensilsCrossed className="h-5 w-5" />
            </span>
            <span className={cn("text-[10px] font-semibold transition-colors text-[rgb(var(--accent))]")}>
              Bestellen
            </span>
          </Link>

          {/* Cart */}
          <button
            onClick={() => setCartOpen(true)}
            className="flex flex-col items-center justify-center gap-1 relative"
          >
            <span className="relative inline-flex h-5 w-5 items-center justify-center">
              <ShoppingBag className={cn("h-5 w-5 transition-colors", count > 0 ? "text-[rgb(var(--text))]" : "text-[rgb(var(--text-soft))]")} />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-2 inline-flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[rgb(var(--accent))] text-white text-[10px] font-bold tabular-nums leading-none">
                  {count}
                </span>
              )}
            </span>
            <span className={cn("text-[10px] font-medium transition-colors", count > 0 ? "text-[rgb(var(--text))]" : "text-[rgb(var(--text-soft))]")}>
              Bestelling
            </span>
          </button>

          {/* Contact */}
          <Link href="/contact" className="flex flex-col items-center justify-center gap-1">
            <Mail className={cn("h-5 w-5 transition-colors", pathname.startsWith("/contact") ? "text-[rgb(var(--accent))]" : "text-[rgb(var(--text-soft))]")} />
            <span className={cn("text-[10px] font-medium", pathname.startsWith("/contact") ? "text-[rgb(var(--accent))]" : "text-[rgb(var(--text-soft))]")}>Contact</span>
          </Link>

        </div>
      </nav>
    </>
  );
}
