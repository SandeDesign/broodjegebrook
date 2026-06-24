"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { User } from "lucide-react";
import { cn } from "@eufraat/ui";
import { AccountModal } from "@/components/AccountModal";

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
          "fixed inset-x-0 z-50 transition-all duration-300 lg:hidden bg-white",
          "pt-[env(safe-area-inset-top)]",
          scrolled ? "border-b border-[rgb(var(--border))] shadow-sm" : "",
        )}
        style={{ top: 0, transform: "translateZ(0)" }}
      >
        <div className="h-16 px-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.webp"
              alt="Broodjes & Meer Broodje Gebrook"
              width={40}
              height={40}
              className="shrink-0 object-contain"
              priority
            />
            <span className="font-display text-xl font-bold text-[rgb(var(--text))]">Broodje Gebrook</span>
          </Link>

          {/* Account */}
          <button
            onClick={() => setAccountOpen(true)}
            aria-label="Mijn account"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgb(var(--border))] text-[rgb(var(--text-soft))] hover:text-[rgb(var(--accent))] active:scale-95 transition-all"
          >
            <User className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      <AccountModal open={accountOpen} onClose={() => setAccountOpen(false)} />
    </>
  );
}
