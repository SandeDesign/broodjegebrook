"use client";
import * as React from "react";
import {
  collection, query, orderBy, onSnapshot, where,
} from "firebase/firestore";
import { db, RESTAURANT_ID } from "@/lib/firebase";
import { StaffShell } from "@/components/StaffShell";
import {
  TrendingUp, ShoppingBag, Truck, Award, Calendar,
} from "lucide-react";
import { cn } from "@eufraat/ui";

const fmt = (v: number) => `€${(v ?? 0).toFixed(2).replace(".", ",")}`;
const fmtShort = (v: number) => v >= 1000 ? `€${(v / 1000).toFixed(1)}k` : fmt(v);

type Range = 7 | 14 | 30;

export default function RapportenPage() {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [range, setRange] = React.useState<Range>(7);

  React.useEffect(() => {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    since.setHours(0, 0, 0, 0);

    const unsub = onSnapshot(
      query(
        collection(db(), "restaurants", RESTAURANT_ID, "orders"),
        where("createdAt", ">=", since),
        orderBy("createdAt", "desc"),
      ),
      (snap) => {
        setOrders(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
        setLoading(false);
      },
      () => setLoading(false),
    );
    return () => unsub();
  }, []);

  // Filter to selected range
  const since = new Date();
  since.setDate(since.getDate() - range);
  since.setHours(0, 0, 0, 0);
  const inRange = orders.filter((o) => {
    const t = o.createdAt?.seconds ? o.createdAt.seconds * 1000 : 0;
    return t >= since.getTime();
  });
  const completed = inRange.filter((o) => o.status === "completed");

  const totalRevenue = completed.reduce((s, o) => s + (o.total ?? 0), 0);
  const totalOrders = completed.length;
  const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const pickupCount = completed.filter((o) => o.mode === "pickup").length;
  const deliveryCount = completed.filter((o) => o.mode === "delivery").length;

  // Daily revenue bars
  const dailyData = React.useMemo(() => {
    const map: Record<string, number> = {};
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      map[d.toISOString().slice(0, 10)] = 0;
    }
    completed.forEach((o) => {
      const t = o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000) : null;
      if (!t) return;
      t.setHours(0, 0, 0, 0);
      const key = t.toISOString().slice(0, 10);
      if (key in map) map[key] += o.total ?? 0;
    });
    return Object.entries(map).map(([date, value]) => ({ date, value }));
  }, [completed, range]);

  const maxDaily = Math.max(...dailyData.map((d) => d.value), 1);

  // Top items
  const itemCounts: Record<string, { qty: number; revenue: number; name: string }> = {};
  completed.forEach((o) => {
    const items = o.items ?? o.lines ?? [];
    items.forEach((it: any) => {
      const key = it.name ?? "";
      if (!key) return;
      if (!itemCounts[key]) itemCounts[key] = { qty: 0, revenue: 0, name: key };
      itemCounts[key].qty += it.qty ?? 1;
      itemCounts[key].revenue += it.lineTotal ?? 0;
    });
  });
  const topItems = Object.values(itemCounts).sort((a, b) => b.qty - a.qty).slice(0, 5);

  // Hourly heatmap
  const hourCounts: number[] = new Array(24).fill(0);
  completed.forEach((o) => {
    const t = o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000) : null;
    if (!t) return;
    hourCounts[t.getHours()]++;
  });
  const maxHour = Math.max(...hourCounts, 1);

  return (
    <StaffShell title="Rapporten" subtitle="Omzet & inzichten" requireRole={["owner", "manager"]}>

      {/* Range tabs */}
      <section className="px-4 mb-4">
        <div className="flex gap-1.5 bg-card/40 border border-white/[0.06] rounded-2xl p-1">
          {([7, 14, 30] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "flex-1 h-9 rounded-xl text-[12px] font-semibold transition-all",
                range === r ? "bg-gold text-ink" : "text-cream/55 hover:text-cream",
              )}
            >
              {r} dagen
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <p className="text-center text-cream/40 py-10 text-[13px]">Laden…</p>
      ) : (
        <>
          {/* Key stats */}
          <section className="px-4 mb-5">
            <div className="grid grid-cols-2 gap-2.5">
              <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Omzet" value={fmt(totalRevenue)} gold />
              <StatCard icon={<ShoppingBag className="h-4 w-4" />} label="Orders" value={String(totalOrders)} />
              <StatCard icon={<Award className="h-4 w-4" />} label="Gem. order" value={fmt(avgOrder)} />
              <StatCard icon={<Truck className="h-4 w-4" />} label="Bezorgd" value={`${deliveryCount} / ${pickupCount}`} sub="bezorg / afhaal" />
            </div>
          </section>

          {/* Daily revenue chart */}
          <section className="px-4 mb-5">
            <div className="bg-card/60 border border-white/[0.06] rounded-2xl p-5">
              <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-cream/60 mb-4 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                Omzet per dag
              </h2>
              {totalRevenue === 0 ? (
                <p className="text-cream/40 text-[12px] py-8 text-center">Nog geen omzet in deze periode.</p>
              ) : (
                <>
                  <div className="flex items-end gap-1 h-32">
                    {dailyData.map((d) => {
                      const h = (d.value / maxDaily) * 100;
                      return (
                        <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5">
                          <div className="w-full flex-1 flex items-end">
                            <div
                              className={cn(
                                "w-full rounded-t transition-all",
                                d.value > 0 ? "bg-gradient-to-t from-gold/40 to-gold" : "bg-white/[0.04]",
                              )}
                              style={{ height: `${Math.max(h, 2)}%` }}
                              title={fmt(d.value)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-2 text-[9px] text-cream/35 font-mono">
                    {dailyData.length > 14 ? (
                      <>
                        <span>{new Date(dailyData[0].date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</span>
                        <span>{new Date(dailyData[dailyData.length - 1].date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}</span>
                      </>
                    ) : (
                      dailyData.map((d, i) => i % 2 === 0 ? (
                        <span key={d.date}>{new Date(d.date).getDate()}</span>
                      ) : <span key={d.date} />)
                    )}
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Top items */}
          <section className="px-4 mb-5">
            <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-cream/45 mb-2 px-1">Top gerechten</h2>
            <div className="bg-card/60 border border-white/[0.06] rounded-2xl divide-y divide-white/[0.05]">
              {topItems.length === 0 ? (
                <p className="text-cream/40 text-[12px] py-8 text-center">Geen data.</p>
              ) : (
                topItems.map((item, i) => (
                  <div key={item.name} className="px-4 py-3 flex items-center gap-3">
                    <span className="font-display text-xl font-bold text-gold/70 tabular-nums w-6">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-cream truncate">{item.name}</p>
                      <p className="text-[11px] text-cream/45">{item.qty}× verkocht</p>
                    </div>
                    <span className="font-display font-semibold text-gold tabular-nums text-[13px]">
                      {fmtShort(item.revenue)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Hourly heatmap */}
          <section className="px-4 mb-5">
            <div className="bg-card/60 border border-white/[0.06] rounded-2xl p-5">
              <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-cream/60 mb-4">Piekuren</h2>
              <div className="grid grid-cols-12 gap-0.5">
                {hourCounts.slice(12).map((c, i) => {
                  const hour = i + 12;
                  const intensity = c / maxHour;
                  return (
                    <div key={hour} className="flex flex-col items-center gap-1">
                      <div
                        className="aspect-square w-full rounded-sm border border-white/[0.05]"
                        style={{
                          backgroundColor: intensity > 0
                            ? `rgba(233, 185, 73, ${0.15 + intensity * 0.7})`
                            : "rgba(255,255,255,0.02)",
                        }}
                        title={`${hour}:00 — ${c} orders`}
                      />
                      <span className="text-[8px] font-mono text-cream/35 tabular-nums">{hour}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-cream/40 mt-2">12u — 23u · per uur van de dag</p>
            </div>
          </section>
        </>
      )}
    </StaffShell>
  );
}

function StatCard({ icon, label, value, gold, sub }: {
  icon: React.ReactNode; label: string; value: string; gold?: boolean; sub?: string;
}) {
  return (
    <div className={cn(
      "rounded-2xl border p-4",
      gold ? "bg-gold/[0.08] border-gold/25" : "bg-card/60 border-white/[0.06]",
    )}>
      <div className={cn("inline-flex h-7 w-7 items-center justify-center rounded-lg mb-2",
        gold ? "bg-gold/15 text-gold" : "bg-white/[0.05] text-cream/55",
      )}>
        {icon}
      </div>
      <p className={cn("font-display text-xl font-bold tabular-nums", gold ? "text-gold" : "text-cream")}>{value}</p>
      <p className="text-[10px] text-cream/45 mt-0.5">{sub ?? label}</p>
    </div>
  );
}
