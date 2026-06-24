"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import {
  ListOrdered,
  Menu as MenuIcon,
  Clock,
  Tag,
  Users,
  BarChart3,
  UserCog,
  LogOut,
  Bike,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { useStaffAuth, can, type StaffRole } from "@/lib/useStaffAuth";
import { cn } from "@eufraat/ui";

type NavItem = { href: string; label: string; icon: React.ReactNode; action: Parameters<typeof can>[1] };

const NAV: NavItem[] = [
  { href: "/orders", label: "Orders", icon: <ListOrdered className="h-5 w-5" />, action: "view_orders" },
  { href: "/bezorgen", label: "Bezorgen", icon: <Bike className="h-5 w-5" />, action: "view_deliveries" },
  { href: "/menu", label: "Menu", icon: <MenuIcon className="h-5 w-5" />, action: "edit_menu" },
  { href: "/opening", label: "Openingstijden", icon: <Clock className="h-5 w-5" />, action: "edit_hours" },
  { href: "/promoties", label: "Promoties", icon: <Tag className="h-5 w-5" />, action: "edit_promotions" },
  { href: "/klanten", label: "Klanten", icon: <Users className="h-5 w-5" />, action: "view_customers" },
  { href: "/rapporten", label: "Rapporten", icon: <BarChart3 className="h-5 w-5" />, action: "view_reports" },
  { href: "/personeel", label: "Personeel", icon: <UserCog className="h-5 w-5" />, action: "manage_staff" },
];

export function AppShell({ children, requireRole }: { children: React.ReactNode; requireRole?: StaffRole[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const { ready, isStaff, role, user } = useStaffAuth();

  React.useEffect(() => {
    if (!ready) return;
    if (!isStaff) { router.replace("/login"); return; }
    // Bezorger heeft maar één scherm — stuur ze er direct naartoe
    if (role === "bezorger" && !pathname.startsWith("/bezorgen")) {
      router.replace("/bezorgen");
      return;
    }
    if (requireRole && role && !requireRole.includes(role)) {
      router.replace(role === "bezorger" ? "/bezorgen" : "/orders");
    }
  }, [ready, isStaff, role, requireRole, pathname, router]);

  if (!ready || !isStaff) {
    return <div className="flex min-h-screen items-center justify-center text-stone-500">Laden…</div>;
  }

  const allowed = NAV.filter((n) => can(role, n.action));
  const isBezorger = role === "bezorger";

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — verborgen voor bezorger (die heeft een fullscreen mobiele view) */}
      {!isBezorger && (
        <aside className="hidden w-64 flex-col border-r border-stone-200 bg-white p-4 md:flex">
          <div className="flex items-center gap-2 px-2 pb-6">
            <div className="font-display text-xl font-bold text-eufraat-700">Eufraat</div>
            <span className="rounded-md bg-eufraat-100 px-2 py-0.5 text-xs font-medium text-eufraat-700">
              {role}
            </span>
          </div>
          <nav className="flex flex-1 flex-col gap-1">
            {allowed.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  pathname.startsWith(n.href)
                    ? "bg-eufraat-50 text-eufraat-700"
                    : "text-stone-700 hover:bg-stone-50",
                )}
              >
                {n.icon}
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-stone-200 pt-3">
            <div className="px-3 text-xs text-stone-500">{user?.email}</div>
            <button
              type="button"
              onClick={() => signOut(auth()).then(() => router.replace("/login"))}
              className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-stone-600 hover:bg-stone-50"
            >
              <LogOut className="h-4 w-4" />
              Uitloggen
            </button>
          </div>
        </aside>
      )}

      <main
        className={cn("flex-1 bg-stone-50", isBezorger && "bg-white")}
        style={{
          paddingTop: !isBezorger ? "env(safe-area-inset-top)" : undefined,
          paddingBottom: !isBezorger ? "calc(env(safe-area-inset-bottom) + 64px)" : undefined,
        }}
      >
        {children}
      </main>

      {/* Mobiele bottom nav (niet voor bezorger — die heeft eigen UI) */}
      {!isBezorger && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-stone-200 bg-white md:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {allowed.slice(0, 4).map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-xs",
                pathname.startsWith(n.href)
                  ? "text-eufraat-700"
                  : "text-stone-500",
              )}
            >
              {n.icon}
              <span>{n.label}</span>
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
