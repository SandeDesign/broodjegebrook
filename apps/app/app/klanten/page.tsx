"use client";
import * as React from "react";
import Link from "next/link";
import {
  collection, query, orderBy, onSnapshot, limit, collectionGroup, where, getDocs,
} from "firebase/firestore";
import { db, RESTAURANT_ID } from "@/lib/firebase";
import { StaffShell } from "@/components/StaffShell";
import {
  Search, ChevronRight, Mail, Phone, Award, ShoppingBag, TrendingUp,
} from "lucide-react";
import { cn } from "@eufraat/ui";

const fmt = (v: number) => `€${(v ?? 0).toFixed(2).replace(".", ",")}`;

interface Customer {
  uid: string;
  name?: string;
  email?: string;
  phone?: string;
  createdAt?: { seconds: number };
  loyalty?: { points?: number; tier?: string };
}

interface CustomerWithStats extends Customer {
  orderCount: number;
  totalSpent: number;
  lastOrderAt: number | null;
}

const tierConfig: Record<string, { color: string; label: string }> = {
  goud:   { color: "text-amber-300 bg-amber-400/15 border-amber-400/30", label: "Goud" },
  zilver: { color: "text-slate-300 bg-slate-400/15 border-slate-400/30", label: "Zilver" },
  brons:  { color: "text-orange-400 bg-orange-500/10 border-orange-500/25", label: "Brons" },
};

export default function KlantenPage() {
  const [customers, setCustomers] = React.useState<CustomerWithStats[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [sortBy, setSortBy] = React.useState<"recent" | "spent" | "orders">("recent");

  React.useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      unsub = onSnapshot(
        query(collection(db(), "customers"), orderBy("createdAt", "desc")),
        async (snap) => {
          const baseList = snap.docs.map((d) => ({ uid: d.id, ...(d.data() as any) })) as Customer[];

          // Aggregate ALL orders by customer key (email OR phone fallback)
          const ordersSnap = await getDocs(
            collection(db(), "restaurants", RESTAURANT_ID, "orders"),
          );

          type Stats = {
            count: number;
            total: number;
            lastAt: number;
            // For guests: capture name/phone too
            name?: string;
            phone?: string;
            email?: string;
          };
          const statsByKey: Record<string, Stats> = {};

          ordersSnap.docs.forEach((d) => {
            const data = d.data() as any;
            if (data.status === "cancelled") return;
            const customer = data.customer ?? {};
            const key = (customer.email || customer.phone || "").trim().toLowerCase();
            if (!key) return;
            const at = data.createdAt?.seconds ? data.createdAt.seconds * 1000 : 0;
            if (!statsByKey[key]) {
              statsByKey[key] = {
                count: 0, total: 0, lastAt: 0,
                name: customer.name,
                phone: customer.phone,
                email: customer.email,
              };
            }
            if (data.status === "completed") {
              statsByKey[key].count++;
              statsByKey[key].total += data.total ?? 0;
            }
            if (at > statsByKey[key].lastAt) statsByKey[key].lastAt = at;
            // Improve known fields
            if (customer.name && !statsByKey[key].name) statsByKey[key].name = customer.name;
            if (customer.phone && !statsByKey[key].phone) statsByKey[key].phone = customer.phone;
          });

          // Enrich registered customers
          const registeredKeys = new Set<string>();
          const enriched: CustomerWithStats[] = baseList.map((c) => {
            const key = (c.email || c.phone || "").trim().toLowerCase();
            registeredKeys.add(key);
            const stats = key ? statsByKey[key] : undefined;
            return {
              ...c,
              orderCount: stats?.count ?? 0,
              totalSpent: stats?.total ?? 0,
              lastOrderAt: stats?.lastAt ?? null,
            };
          });

          // Add guest "customers" derived purely from orders
          Object.entries(statsByKey).forEach(([key, stats]) => {
            if (registeredKeys.has(key)) return;
            enriched.push({
              uid: `guest:${key}`,
              name: stats.name,
              email: stats.email,
              phone: stats.phone,
              orderCount: stats.count,
              totalSpent: stats.total,
              lastOrderAt: stats.lastAt,
            });
          });

          setCustomers(enriched);
          setLoading(false);
        },
        () => setLoading(false),
      );
    })().catch(() => setLoading(false));

    return () => unsub?.();
  }, []);

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = customers.filter((c) => {
      if (!q) return true;
      return (
        c.name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q)
      );
    });
    if (sortBy === "spent") list.sort((a, b) => b.totalSpent - a.totalSpent);
    else if (sortBy === "orders") list.sort((a, b) => b.orderCount - a.orderCount);
    else list.sort((a, b) => (b.lastOrderAt ?? 0) - (a.lastOrderAt ?? 0));
    return list;
  }, [customers, search, sortBy]);

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpent, 0);
  const activeCount = customers.filter((c) => (c.lastOrderAt ?? 0) > Date.now() - 30 * 24 * 60 * 60 * 1000).length;

  return (
    <StaffShell title="Klanten" subtitle={`${customers.length} totaal`} requireRole={["owner", "manager"]}>

      {/* Stats */}
      <section className="px-4 mb-4">
        <div className="grid grid-cols-3 gap-2.5">
          <Stat icon={<ShoppingBag className="h-3.5 w-3.5" />} label="Klanten" value={String(customers.length)} />
          <Stat icon={<TrendingUp className="h-3.5 w-3.5" />} label="Omzet" value={fmt(totalRevenue)} gold />
          <Stat icon={<Award className="h-3.5 w-3.5" />} label="Actief 30d" value={String(activeCount)} />
        </div>
      </section>

      {/* Search */}
      <section className="px-4 mb-3">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-cream/35" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Zoek op naam, email of telefoon"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl pl-11 pr-4 py-3 text-[14px] text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/60"
          />
        </div>
      </section>

      {/* Sort */}
      <section className="px-4 mb-4">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {([
            { key: "recent" as const, label: "Recent actief" },
            { key: "spent" as const, label: "Hoogste omzet" },
            { key: "orders" as const, label: "Meeste orders" },
          ]).map((s) => (
            <button
              key={s.key}
              onClick={() => setSortBy(s.key)}
              className={cn(
                "shrink-0 px-3 h-8 rounded-full text-[11px] font-medium border transition-colors",
                sortBy === s.key ? "bg-gold/15 border-gold/40 text-gold" : "bg-white/[0.03] border-white/[0.08] text-cream/55 hover:text-cream",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </section>

      {/* List */}
      <section className="px-4 space-y-2">
        {loading ? (
          <p className="text-center text-cream/40 text-[13px] py-8">Laden…</p>
        ) : filtered.length === 0 ? (
          <div className="bg-card/40 border border-white/[0.06] rounded-2xl p-8 text-center">
            <p className="font-display italic text-xl text-cream/60">Geen klanten gevonden.</p>
            <p className="text-[12px] text-cream/40 mt-1">
              {search ? "Probeer een andere zoekterm." : "Klanten verschijnen hier zodra ze zich registreren."}
            </p>
          </div>
        ) : (
          filtered.map((c) => {
            const isGuest = c.uid.startsWith("guest:");
            const inner = (
              <>
                <div className={cn(
                  "inline-flex h-11 w-11 items-center justify-center rounded-full border shrink-0",
                  isGuest ? "bg-white/[0.05] border-white/[0.1]" : "bg-gold/15 border-gold/25",
                )}>
                  <span className={cn(
                    "font-display text-base font-semibold",
                    isGuest ? "text-cream/50" : "text-gold",
                  )}>
                    {(c.name ?? c.email ?? c.phone ?? "?").substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-semibold text-cream text-[14px] truncate">
                      {c.name ?? "Onbekend"}
                    </p>
                    {isGuest ? (
                      <span className="text-[9px] uppercase tracking-wider text-cream/40 font-bold">GAST</span>
                    ) : c.loyalty?.tier && tierConfig[c.loyalty.tier] && (
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider shrink-0",
                        tierConfig[c.loyalty.tier].color,
                      )}>
                        {tierConfig[c.loyalty.tier].label}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-cream/45 truncate">
                    {c.email || c.phone || "—"}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-cream/55 mt-1">
                    <span>{c.orderCount} {c.orderCount === 1 ? "order" : "orders"}</span>
                    <span className="text-gold/80 tabular-nums">{fmt(c.totalSpent)}</span>
                    {!!c.loyalty?.points && (
                      <span className="text-cream/40 tabular-nums">{c.loyalty.points}p</span>
                    )}
                  </div>
                </div>
                {!isGuest && <ChevronRight className="h-4 w-4 text-cream/25 group-hover:text-gold/60 shrink-0 transition-colors" />}
              </>
            );
            const cls = "flex items-center gap-3 bg-card/60 border border-white/[0.06] rounded-2xl p-4 transition-all group";
            if (isGuest) {
              return (
                <div key={c.uid} className={cn(cls, "opacity-90")}>
                  {inner}
                </div>
              );
            }
            return (
              <Link
                key={c.uid}
                href={`/klanten/${c.uid}`}
                className={cn(cls, "hover:bg-card hover:border-gold/30")}
              >
                {inner}
              </Link>
            );
          })
        )}
      </section>

    </StaffShell>
  );
}

function Stat({ icon, label, value, gold }: { icon: React.ReactNode; label: string; value: string; gold?: boolean }) {
  return (
    <div className="bg-card/60 border border-white/[0.06] rounded-xl p-3">
      <div className={cn("flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-medium mb-1", gold ? "text-gold/70" : "text-cream/45")}>
        {icon}
        {label}
      </div>
      <p className={cn("font-display font-bold tabular-nums text-lg", gold ? "text-gold" : "text-cream")}>
        {value}
      </p>
    </div>
  );
}
