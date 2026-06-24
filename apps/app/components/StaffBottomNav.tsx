"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListOrdered, ShoppingCart, MoreHorizontal } from "lucide-react";
import { cn } from "@eufraat/ui";

const items = [
  { href: "/",       label: "Home",   icon: LayoutDashboard },
  { href: "/orders", label: "Orders", icon: ListOrdered },
  { href: "/kassa",  label: "Kassa",  icon: ShoppingCart, primary: true },
  { href: "/meer",   label: "Meer",   icon: MoreHorizontal },
];

export function StaffBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-ink/95 backdrop-blur-2xl border-t border-white/[0.06]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-4 h-16">
        {items.map(({ href, label, icon: Icon, primary }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          if (primary) {
            return (
              <Link key={href} href={href} className="flex flex-col items-center justify-center gap-1">
                <span className={cn(
                  "inline-flex h-10 w-10 items-center justify-center rounded-full transition-all",
                  active ? "bg-gold text-ink shadow-[0_0_18px_rgba(233,185,73,0.4)]" : "bg-gold/15 text-gold",
                )}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className={cn("text-[10px] font-semibold transition-colors", active ? "text-gold" : "text-gold/80")}>
                  {label}
                </span>
              </Link>
            );
          }
          return (
            <Link key={href} href={href} className="flex flex-col items-center justify-center gap-1">
              <Icon className={cn("h-5 w-5 transition-colors", active ? "text-gold" : "text-cream/40")} />
              <span className={cn("text-[10px] font-medium transition-colors", active ? "text-gold" : "text-cream/45")}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
