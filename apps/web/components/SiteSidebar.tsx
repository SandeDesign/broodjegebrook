"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, UtensilsCrossed, Phone, ShoppingBag, ArrowRight, User,
} from "lucide-react";
import { restaurant } from "@/data/restaurant";
import { OpenStatus } from "@/components/OpenStatus";
import { ThemeSwitch } from "@/components/ThemeSwitch";
import { useCustomerAuth } from "@/lib/useCustomerAuth";
import { cn } from "@eufraat/ui";

const nav = [
  { href: "/",          label: "Home",            icon: Home },
  { href: "/menukaart", label: "Bestellen",        icon: UtensilsCrossed, primary: true },
  { href: "/bestellen", label: "Mijn bestelling",  icon: ShoppingBag },
  { href: "/contact",   label: "Contact",          icon: Phone },
];

export function SiteSidebar() {
  const pathname = usePathname();

  const { user } = useCustomerAuth();
  const initials = user
    ? (user.displayName ?? user.email ?? "?").split(" ").map((s) => s[0]).join("").substring(0, 2).toUpperCase()
    : null;

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 xl:w-72 flex-col bg-ink border-r border-line/[0.06] z-50">
      {/* Logo */}
      <div className="px-6 pt-8 pb-7 border-b border-line/[0.06]">
        <Link href="/" className="flex items-center gap-3.5">
          <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-card ring-1 ring-gold/40 overflow-hidden shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={restaurant.logo} alt={restaurant.name} className="h-11 w-11 object-contain" />
          </span>
          <div>
            <div className="font-display text-3xl font-semibold italic text-cream leading-none">Eufraat</div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-gold/70 mt-1.5 font-medium">Geleen</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon, primary }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all group",
                primary
                  ? active
                    ? "bg-gold text-ink"
                    : "bg-gold/10 text-gold hover:bg-gold hover:text-ink"
                  : active
                    ? "bg-line/[0.07] text-cream"
                    : "text-cream/60 hover:bg-line/[0.04] hover:text-cream"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0 transition-colors", primary ? "" : active ? "text-gold" : "text-cream/40 group-hover:text-cream/70")} />
              {label}
              {primary && !active && (
                <ArrowRight className="h-3.5 w-3.5 ml-auto opacity-50 group-hover:opacity-100 transition-opacity" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Account section */}
      <SidebarAccount />

      {/* Theme + bottom info */}
      <div className="px-5 py-5 border-t border-line/[0.06] space-y-4">
        <ThemeSwitch variant="segment" className="w-full justify-stretch" />
        <div className="space-y-2">
          <OpenStatus service="delivery" variant="minimal" />
          <a href={`tel:${restaurant.phone}`} className="flex items-center gap-2 text-[12px] text-cream/60 hover:text-cream transition-colors">
            <Phone className="h-3.5 w-3.5 text-gold/70 shrink-0" />
            {restaurant.phoneDisplay}
          </a>
        </div>
      </div>
    </aside>
  );
}

function SidebarAccount() {
  const { user } = useCustomerAuth();
  const initials = user
    ? (user.displayName ?? user.email ?? "?").split(" ").map((s) => s[0]).join("").substring(0, 2).toUpperCase()
    : null;

  if (user) {
    return (
      <div className="px-3 py-3 border-t border-line/[0.06]">
        <Link
          href="/account"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-line/[0.04] transition-colors group"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gold/15 border border-gold/30 shrink-0">
            <span className="font-display text-sm font-semibold text-gold">{initials}</span>
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-cream truncate">{user.displayName ?? "Klant"}</p>
            <p className="text-[10px] text-cream/45 truncate">{user.email}</p>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-cream/25 group-hover:text-gold/60 transition-colors shrink-0" />
        </Link>
      </div>
    );
  }

  return (
    <div className="px-3 py-3 border-t border-line/[0.06]">
      <Link
        href="/login"
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-cream/55 hover:text-cream hover:bg-line/[0.04] transition-colors"
      >
        <User className="h-4 w-4 text-cream/35 shrink-0" />
        Inloggen
      </Link>
    </div>
  );
}
