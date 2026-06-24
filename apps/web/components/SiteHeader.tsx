"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { restaurant } from "@/data/restaurant";
import { cn } from "@eufraat/ui";
import { AccountModal } from "@/components/AccountModal";
import { ThemeSwitch } from "@/components/ThemeSwitch";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 z-50 transition-colors duration-300 lg:hidden bg-ink",
          "pt-[env(safe-area-inset-top)]",
          scrolled ? "border-b border-line/[0.06]" : "",
        )}
        style={{ top: 0, transform: "translateZ(0)" }}
      >
        <div className="h-16 px-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-ink ring-1 ring-gold/40 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={restaurant.logo} alt={restaurant.name} className="h-9 w-9 object-contain" />
            </span>
            <span className="font-display text-2xl font-semibold italic text-cream">Eufraat</span>
          </Link>

          {/* Right cluster: theme switch + account */}
          <div className="flex items-center gap-2">
            <ThemeSwitch />
            <button
              onClick={() => setAccountOpen(true)}
              aria-label="Mijn account"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-line/[0.07] border border-line/[0.1] text-cream/80 hover:text-cream hover:border-gold/40 active:scale-95 transition-all"
            >
              <User className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </header>

      <AccountModal open={accountOpen} onClose={() => setAccountOpen(false)} />
    </>
  );
}
