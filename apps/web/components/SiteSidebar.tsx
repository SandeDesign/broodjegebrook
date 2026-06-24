"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, UtensilsCrossed, ShoppingBag, Mail, ArrowRight, User, Info,
} from "lucide-react";
import { restaurant } from "@/data/restaurant";
import { OpenStatus } from "@/components/OpenStatus";
import { useCustomerAuth } from "@/lib/useCustomerAuth";
import { cn } from "@eufraat/ui";

const nav = [
  { href: "/",          label: "Home",           icon: Home },
  { href: "/menukaart", label: "Bestellen",       icon: UtensilsCrossed, primary: true },
  { href: "/bestellen", label: "Mijn bestelling", icon: ShoppingBag },
  { href: "/contact",   label: "Contact",         icon: Mail },
];

export function SiteSidebar() {
  const pathname = usePathname();
  const { user } = useCustomerAuth();

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 xl:w-72 flex-col bg-white border-r border-[rgb(var(--border))] z-50">
      {/* Logo / naam */}
      <div className="px-6 pt-8 pb-6 border-b border-[rgb(var(--border))]">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo_broodjes_gebrook.png"
            alt="Broodjes & Meer Broodje Gebrook"
            className="h-14 w-auto object-contain"
          />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
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
                    ? "bg-[rgb(var(--accent))] text-white"
                    : "bg-[rgb(var(--accent)/0.08)] text-[rgb(var(--accent))] hover:bg-[rgb(var(--accent))] hover:text-white"
                  : active
                    ? "bg-[rgb(var(--border))] text-[rgb(var(--text))]"
                    : "text-[rgb(var(--text-soft))] hover:bg-[rgb(var(--border)/0.5)] hover:text-[rgb(var(--text))]"
              )}
            >
              <Icon className={cn(
                "h-4 w-4 shrink-0 transition-colors",
                primary
                  ? active ? "text-white" : "text-[rgb(var(--accent))]"
                  : active ? "text-[rgb(var(--accent))]" : "text-[rgb(var(--text-soft))]"
              )} />
              {label}
              {primary && !active && (
                <ArrowRight className="h-3.5 w-3.5 ml-auto opacity-50 group-hover:opacity-100 transition-opacity" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Account */}
      <SidebarAccount user={user} />

      {/* Info onderaan */}
      <div className="px-5 py-5 border-t border-[rgb(var(--border))] space-y-3">
        <OpenStatus service="delivery" variant="minimal" />
        <a
          href={`mailto:${restaurant.email}`}
          className="flex items-center gap-2 text-[12px] text-[rgb(var(--text-soft))] hover:text-[rgb(var(--accent))] transition-colors"
        >
          <Mail className="h-3.5 w-3.5 text-[rgb(var(--accent))] shrink-0" />
          {restaurant.email}
        </a>
      </div>
    </aside>
  );
}

function SidebarAccount({ user }: { user: { displayName?: string | null; email?: string | null } | null }) {
  const initials = user
    ? (user.displayName ?? user.email ?? "?").split(" ").map((s) => s[0]).join("").substring(0, 2).toUpperCase()
    : null;

  if (user) {
    return (
      <div className="px-3 py-3 border-t border-[rgb(var(--border))]">
        <Link
          href="/account"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[rgb(var(--border)/0.5)] transition-colors group"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[rgb(var(--accent)/0.12)] border border-[rgb(var(--accent)/0.3)] shrink-0">
            <span className="font-display text-sm font-semibold text-[rgb(var(--accent))]">{initials}</span>
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-[rgb(var(--text))] truncate">{user.displayName ?? "Klant"}</p>
            <p className="text-[10px] text-[rgb(var(--text-soft))] truncate">{user.email}</p>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-[rgb(var(--text-soft))] group-hover:text-[rgb(var(--accent))] transition-colors shrink-0" />
        </Link>
      </div>
    );
  }

  return (
    <div className="px-3 py-3 border-t border-[rgb(var(--border))]">
      <Link
        href="/login"
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-[rgb(var(--text-soft))] hover:text-[rgb(var(--text))] hover:bg-[rgb(var(--border)/0.5)] transition-colors"
      >
        <User className="h-4 w-4 text-[rgb(var(--text-soft))] shrink-0" />
        Inloggen
      </Link>
    </div>
  );
}
