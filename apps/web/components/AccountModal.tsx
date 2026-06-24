"use client";
import * as React from "react";
import Link from "next/link";
import { X, User, ShoppingBag, Star, ChevronRight, LogIn, LogOut, Settings } from "lucide-react";
import { useCustomerAuth, logout } from "@/lib/useCustomerAuth";
import { ThemeSwitch } from "@/components/ThemeSwitch";

export function AccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, loading } = useCustomerAuth();

  React.useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const initials = user
    ? (user.displayName ?? user.email ?? "?")
        .split(" ").map((s) => s[0]).join("").substring(0, 2).toUpperCase()
    : null;

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end lg:hidden">
      <div className="absolute inset-0 bg-ink/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full rounded-t-3xl bg-ink border-t border-line/[0.08] shadow-2xl">
        {/* Grab handle */}
        <div className="flex justify-center pt-3 pb-1">
          <span className="h-1 w-10 rounded-full bg-line/15" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-1 pb-4 border-b border-line/[0.06]">
          <h2 className="font-display text-2xl font-medium italic text-cream">Mijn account</h2>
          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-line/[0.05] text-cream/60 hover:text-cream transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          {loading ? (
            <p className="text-[13px] text-cream/40 animate-pulse py-4 text-center">Laden…</p>
          ) : user ? (
            /* ── LOGGED IN ── */
            <>
              {/* Profile row */}
              <div className="flex items-center gap-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 border border-gold/30 shrink-0">
                  <span className="font-display text-xl font-semibold text-gold">{initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-cream truncate">{user.displayName ?? "Klant"}</p>
                  <p className="text-[12px] text-cream/50 truncate">{user.email}</p>
                </div>
              </div>

              {/* Quick links */}
              <div className="space-y-1">
                <NavLink href="/account" icon={<User className="h-4 w-4" />} label="Mijn dashboard" onClick={onClose} />
                <NavLink href="/account" icon={<ShoppingBag className="h-4 w-4" />} label="Bestelgeschiedenis" onClick={onClose} />
                <NavLink href="/account" icon={<Star className="h-4 w-4" />} label="Spaarpunten" onClick={onClose} />
                <NavLink href="/account" icon={<Settings className="h-4 w-4" />} label="Instellingen" onClick={onClose} />
              </div>

              {/* Theme picker */}
              <div className="flex items-center justify-between gap-3 px-1 py-2">
                <span className="text-[12px] uppercase tracking-wider font-semibold text-cream/55">Weergave</span>
                <ThemeSwitch variant="segment" />
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-3 rounded-2xl text-[13px] text-red-400/80 hover:text-red-400 hover:bg-red-400/[0.06] transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Uitloggen
              </button>
            </>
          ) : (
            /* ── GUEST ── */
            <>
              <div className="flex items-center gap-4">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-line/[0.05] border border-line/[0.08]">
                  <User className="h-6 w-6 text-cream/35" />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-cream">Nog niet ingelogd</p>
                  <p className="text-[12px] text-cream/50 mt-0.5">Log in om punten te sparen</p>
                </div>
              </div>

              <Link
                href="/login"
                onClick={onClose}
                className="flex items-center justify-between w-full h-12 bg-gold text-ink rounded-2xl px-5 hover:bg-gold-soft active:scale-[0.98] transition-all"
              >
                <span className="flex items-center gap-2 text-[14px] font-semibold">
                  <LogIn className="h-4 w-4" />
                  Inloggen of registreren
                </span>
                <ChevronRight className="h-4 w-4 opacity-60" />
              </Link>

              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { icon: ShoppingBag, label: "Bestellingen" },
                  { icon: Star, label: "Spaarpunten" },
                  { icon: Settings, label: "Instellingen" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-2 py-4 rounded-2xl bg-line/[0.03] border border-line/[0.06] text-center">
                    <Icon className="h-5 w-5 text-gold/50" />
                    <span className="text-[10px] text-cream/45 font-medium leading-tight">{label}</span>
                  </div>
                ))}
              </div>

              {/* Theme picker — also available to guests */}
              <div className="flex items-center justify-between gap-3 pt-3 px-1">
                <span className="text-[12px] uppercase tracking-wider font-semibold text-cream/55">Weergave</span>
                <ThemeSwitch variant="segment" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function NavLink({ href, icon, label, onClick }: {
  href: string; icon: React.ReactNode; label: string; onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] text-cream/80 hover:text-cream hover:bg-line/[0.04] transition-colors group"
    >
      <span className="text-cream/40 group-hover:text-gold/70 transition-colors">{icon}</span>
      {label}
      <ChevronRight className="h-3.5 w-3.5 ml-auto text-cream/20 group-hover:text-cream/40 transition-colors" />
    </Link>
  );
}
