"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import {
  Bike, Clock, Tag, Users, BarChart3, UserCog, LogOut, UserPlus,
  ChevronRight, Settings, UtensilsCrossed,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { useStaffAuth, can } from "@/lib/useStaffAuth";
import { StaffShell } from "@/components/StaffShell";

export default function MeerPage() {
  const router = useRouter();
  const { role, user } = useStaffAuth();

  const handleLogout = async () => {
    await signOut(auth());
    router.replace("/login");
  };

  const groups: { title: string; items: { href: string; icon: React.ReactNode; label: string; show: boolean }[] }[] = [
    {
      title: "Operatie",
      items: [
        { href: "/menu",      icon: <UtensilsCrossed className="h-4 w-4" />, label: "Menu beheer",      show: can(role, "edit_menu") },
        { href: "/bezorgen",  icon: <Bike className="h-4 w-4" />,    label: "Bezorgingen",     show: can(role, "view_deliveries") },
        { href: "/opening",   icon: <Clock className="h-4 w-4" />,   label: "Openingstijden",   show: can(role, "edit_hours") },
        { href: "/promoties", icon: <Tag className="h-4 w-4" />,     label: "Promoties & codes", show: can(role, "edit_promotions") },
      ],
    },
    {
      title: "Beheer",
      items: [
        { href: "/klanten",   icon: <Users className="h-4 w-4" />,     label: "Klanten",  show: can(role, "view_customers") },
        { href: "/rapporten", icon: <BarChart3 className="h-4 w-4" />, label: "Rapporten", show: can(role, "view_reports") },
        { href: "/personeel", icon: <UserCog className="h-4 w-4" />,   label: "Personeel", show: can(role, "manage_staff") },
        { href: "/register",  icon: <UserPlus className="h-4 w-4" />,  label: "Nieuwe medewerker", show: can(role, "manage_staff") },
      ],
    },
  ];

  return (
    <StaffShell title="Meer">
      {/* Profile card */}
      <section className="px-4 mb-5">
        <div className="bg-card/60 border border-white/[0.07] rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 border border-gold/30">
              <span className="font-display text-lg font-semibold text-gold">
                {(user?.displayName ?? user?.email ?? "?").substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold text-cream truncate">{user?.displayName ?? "Medewerker"}</p>
              <p className="text-[12px] text-cream/50 truncate">{user?.email}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-gold/15 text-gold text-[11px] font-medium uppercase tracking-wider">
              {role ?? "—"}
            </span>
          </div>
        </div>
      </section>

      {/* Groups */}
      {groups.map((group) => {
        const visible = group.items.filter((i) => i.show);
        if (visible.length === 0) return null;
        return (
          <section key={group.title} className="px-4 mb-5">
            <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-cream/45 mb-2 px-1">
              {group.title}
            </h2>
            <div className="bg-card/40 border border-white/[0.06] rounded-2xl divide-y divide-white/[0.05]">
              {visible.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.03] first:rounded-t-2xl last:rounded-b-2xl transition-colors group"
                >
                  <span className="text-gold/70 group-hover:text-gold transition-colors">{item.icon}</span>
                  <span className="flex-1 text-[14px] font-medium text-cream">{item.label}</span>
                  <ChevronRight className="h-4 w-4 text-cream/25" />
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      {/* Logout */}
      <section className="px-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-red-500/[0.07] border border-red-500/20 text-red-300 hover:bg-red-500/15 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="flex-1 text-left text-[14px] font-medium">Uitloggen</span>
        </button>
      </section>
    </StaffShell>
  );
}
