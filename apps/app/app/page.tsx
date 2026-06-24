"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  collection, query, orderBy, onSnapshot, doc, getDoc, updateDoc,
} from "firebase/firestore";
import {
  ListOrdered, Bike, ShoppingBag, TrendingUp, Pause, Clock, ChevronRight,
  Power, ChefHat, CheckCircle2,
} from "lucide-react";
import { db, RESTAURANT_ID } from "@/lib/firebase";
import { useStaffAuth } from "@/lib/useStaffAuth";
import { StaffShell } from "@/components/StaffShell";
import { cn } from "@eufraat/ui";

const fmt = (v: number) => `€${(v ?? 0).toFixed(2).replace(".", ",")}`;

export default function DashboardPage() {
  const router = useRouter();
  const { ready, isStaff, role, user } = useStaffAuth();
  const [orders, setOrders] = React.useState<any[]>([]);
  const [pauseUntil, setPauseUntil] = React.useState<Date | null>(null);

  React.useEffect(() => {
    if (ready && !isStaff) router.replace("/login");
    if (ready && role === "bezorger") router.replace("/bezorgen");
  }, [ready, isStaff, role, router]);

  React.useEffect(() => {
    const q = query(
      collection(db(), "restaurants", RESTAURANT_ID, "orders"),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });
    return () => unsub();
  }, []);

  // Today's stats
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter((o) => {
    const t = o.createdAt?.seconds ? o.createdAt.seconds * 1000 : 0;
    return t >= todayStart.getTime();
  });
  const todayRevenue = todayOrders
    .filter((o) => o.status === "completed")
    .reduce((s, o) => s + (o.total ?? 0), 0);
  const completedToday = todayOrders.filter((o) => o.status === "completed").length;

  const active = orders.filter((o) => ["new", "accepted"].includes(o.status));
  const preparing = orders.filter((o) => o.status === "preparing");
  const ready_ = orders.filter((o) => o.status === "ready" || o.status === "out_for_delivery");

  const handlePause = async (minutes: number | null) => {
    const until = minutes ? new Date(Date.now() + minutes * 60_000) : null;
    await updateDoc(doc(db(), "restaurants", RESTAURANT_ID), { pauseUntil: until });
    setPauseUntil(until);
  };

  React.useEffect(() => {
    getDoc(doc(db(), "restaurants", RESTAURANT_ID)).then((snap) => {
      const data = snap.data() as any;
      if (data?.pauseUntil) {
        const d = data.pauseUntil?.seconds ? new Date(data.pauseUntil.seconds * 1000) : new Date(data.pauseUntil);
        if (d > new Date()) setPauseUntil(d);
      }
    }).catch(() => {});
  }, []);

  if (!ready || !isStaff || role === "bezorger") {
    return <div className="min-h-screen flex items-center justify-center text-cream/40">Laden…</div>;
  }

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Goedemorgen";
    if (h < 18) return "Goedemiddag";
    return "Goedenavond";
  })();
  const name = (user?.displayName ?? user?.email?.split("@")[0] ?? "").split(" ")[0];

  return (
    <StaffShell title={`${greeting}${name ? `, ${name}` : ""}`} subtitle={role ? role : undefined}>

      {/* Pause status banner */}
      {pauseUntil && (
        <div className="mx-4 mb-3 bg-amber-500/10 border border-amber-400/30 rounded-2xl p-4 flex items-center gap-3">
          <Pause className="h-5 w-5 text-amber-300 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-amber-200">Bestellingen gepauzeerd</p>
            <p className="text-[11px] text-amber-200/70">
              Tot {pauseUntil.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <button
            onClick={() => handlePause(null)}
            className="text-[12px] font-medium text-amber-300 hover:text-amber-200 px-3 py-1.5 rounded-full bg-amber-400/15 hover:bg-amber-400/25"
          >
            Hervatten
          </button>
        </div>
      )}

      {/* Stats grid */}
      <section className="px-4 mb-5">
        <div className="grid grid-cols-2 gap-2.5">
          <StatTile icon={<TrendingUp className="h-4 w-4" />} label="Omzet vandaag" value={fmt(todayRevenue)} gold />
          <StatTile icon={<CheckCircle2 className="h-4 w-4" />} label="Voltooid" value={String(completedToday)} />
          <StatTile icon={<Clock className="h-4 w-4" />} label="Nieuw" value={String(active.length)} highlight={active.length > 0} />
          <StatTile icon={<ChefHat className="h-4 w-4" />} label="In bereiding" value={String(preparing.length)} />
        </div>
      </section>

      {/* Active orders preview */}
      <section className="px-4 mb-5">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-semibold text-[15px] text-cream">Actieve bestellingen</h2>
          <Link href="/orders" className="text-[12px] text-gold hover:text-gold-soft">
            Bekijk alles →
          </Link>
        </div>
        {[...active, ...preparing, ...ready_].slice(0, 3).map((o) => (
          <Link
            key={o.id}
            href="/orders"
            className="block bg-card/60 hover:bg-card border border-white/[0.06] hover:border-gold/30 rounded-xl p-3 mb-2 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="font-display font-semibold text-cream">#{o.number ?? o.id?.slice(-4)?.toUpperCase()}</span>
                <span className="text-[11px] text-cream/45">{o.customer?.name ?? "Klant"}</span>
              </div>
              <span className="font-display text-gold font-semibold tabular-nums">{fmt(o.total)}</span>
            </div>
          </Link>
        ))}
        {active.length + preparing.length + ready_.length === 0 && (
          <p className="text-center text-cream/40 text-[13px] py-4 bg-card/30 border border-white/[0.05] rounded-xl">
            Geen actieve bestellingen.
          </p>
        )}
      </section>

      {/* Pause controls */}
      {!pauseUntil && (
        <section className="px-4 mb-5">
          <h2 className="font-semibold text-[15px] text-cream mb-3">Snel pauzeren</h2>
          <div className="grid grid-cols-3 gap-2">
            {[15, 30, 60].map((m) => (
              <button
                key={m}
                onClick={() => handlePause(m)}
                className="bg-card/60 hover:bg-amber-500/15 hover:border-amber-400/40 border border-white/[0.06] text-cream rounded-xl h-12 text-[13px] font-medium transition-colors active:scale-[0.98]"
              >
                {m} min
              </button>
            ))}
          </div>
          <button
            onClick={() => handlePause(24 * 60)}
            className="mt-2 w-full bg-card/60 hover:bg-red-500/15 hover:border-red-400/40 border border-white/[0.06] text-cream rounded-xl h-12 text-[13px] font-medium transition-colors active:scale-[0.98] inline-flex items-center justify-center gap-2"
          >
            <Power className="h-4 w-4" />
            Sluit voor vandaag
          </button>
        </section>
      )}

      {/* Quick links */}
      <section className="px-4">
        <h2 className="font-semibold text-[15px] text-cream mb-3">Snel naar</h2>
        <div className="space-y-2">
          <QuickLink href="/orders" icon={<ListOrdered className="h-4 w-4" />} label="Live orders" badge={active.length + preparing.length} />
          <QuickLink href="/bezorgen" icon={<Bike className="h-4 w-4" />} label="Bezorgingen" badge={ready_.filter((o) => o.mode === "delivery").length} />
          <QuickLink href="/menu" icon={<ShoppingBag className="h-4 w-4" />} label="Menu beheer" />
        </div>
      </section>

    </StaffShell>
  );
}

function StatTile({ icon, label, value, gold, highlight }: {
  icon: React.ReactNode; label: string; value: string; gold?: boolean; highlight?: boolean;
}) {
  return (
    <div className={cn(
      "rounded-2xl border p-4 transition-colors",
      highlight ? "bg-blue-500/10 border-blue-400/30" :
      gold ? "bg-gold/[0.08] border-gold/25" :
      "bg-card/60 border-white/[0.06]",
    )}>
      <div className={cn("inline-flex h-7 w-7 items-center justify-center rounded-lg mb-2",
        gold ? "bg-gold/15 text-gold" :
        highlight ? "bg-blue-400/20 text-blue-300" :
        "bg-white/[0.05] text-cream/50",
      )}>
        {icon}
      </div>
      <p className={cn("font-display text-2xl font-bold tabular-nums", gold ? "text-gold" : "text-cream")}>
        {value}
      </p>
      <p className="text-[11px] text-cream/45 mt-0.5">{label}</p>
    </div>
  );
}

function QuickLink({ href, icon, label, badge }: { href: string; icon: React.ReactNode; label: string; badge?: number }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 bg-card/60 hover:bg-card border border-white/[0.06] hover:border-gold/30 rounded-2xl p-4 transition-all"
    >
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gold/10 text-gold">{icon}</span>
      <span className="flex-1 text-[14px] font-medium text-cream">{label}</span>
      {!!badge && badge > 0 && (
        <span className="inline-flex h-6 min-w-6 px-2 items-center justify-center rounded-full bg-gold text-ink text-[11px] font-bold tabular-nums">
          {badge}
        </span>
      )}
      <ChevronRight className="h-4 w-4 text-cream/30" />
    </Link>
  );
}
