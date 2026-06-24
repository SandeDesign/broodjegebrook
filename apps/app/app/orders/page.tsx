"use client";
import * as React from "react";
import {
  collection, query, where, orderBy, onSnapshot,
} from "firebase/firestore";
import { db, RESTAURANT_ID } from "@/lib/firebase";
import { StaffShell } from "@/components/StaffShell";
import { OrderDetailModal } from "@/components/OrderDetailModal";
import { cn } from "@eufraat/ui";
import {
  Clock, ChefHat, CheckCircle2, Truck, ShoppingBag,
  Bell, BellOff, Phone, Globe, Store,
} from "lucide-react";

const fmt = (v: number) => `€${(v ?? 0).toFixed(2).replace(".", ",")}`;

type TabKey = "active" | "preparing" | "ready" | "history";

const TABS: { key: TabKey; label: string; filter: (s: string) => boolean }[] = [
  { key: "active",    label: "Nieuw",       filter: (s) => s === "new" || s === "accepted" },
  { key: "preparing", label: "In bereiding", filter: (s) => s === "preparing" },
  { key: "ready",     label: "Klaar",        filter: (s) => s === "ready" || s === "out_for_delivery" },
  { key: "history",   label: "Voltooid",     filter: (s) => s === "completed" || s === "cancelled" },
];

export default function OrdersPage() {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [tab, setTab] = React.useState<TabKey>("active");
  const [selected, setSelected] = React.useState<any | null>(null);
  const [muted, setMuted] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const lastNotifiedRef = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    const q = query(
      collection(db(), "restaurants", RESTAURANT_ID, "orders"),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      const next = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      for (const o of next) {
        if (o.status === "new" && !lastNotifiedRef.current.has(o.id)) {
          lastNotifiedRef.current.add(o.id);
          if (!muted) audioRef.current?.play().catch(() => {});
        }
      }
      setOrders(next);
    });
    return () => unsub();
  }, [muted]);

  const counts = React.useMemo(() => ({
    active: orders.filter((o) => o.status === "new" || o.status === "accepted").length,
    preparing: orders.filter((o) => o.status === "preparing").length,
    ready: orders.filter((o) => o.status === "ready" || o.status === "out_for_delivery").length,
    history: orders.filter((o) => o.status === "completed" || o.status === "cancelled").length,
  }), [orders]);

  const filtered = orders.filter((o) => TABS.find((t) => t.key === tab)?.filter(o.status ?? "new"));

  return (
    <>
      <StaffShell
        title="Live orders"
        subtitle={`${counts.active + counts.preparing + counts.ready} actief`}
        rightAction={
          <button
            onClick={() => setMuted((v) => !v)}
            aria-label={muted ? "Geluid aan" : "Geluid uit"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-cream/70 hover:bg-white/[0.05] active:scale-95 transition-all"
          >
            {muted ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
          </button>
        }
      >
        {/* Tabs */}
        <div
          className="sticky z-30 bg-ink/95 backdrop-blur-xl border-b border-white/[0.06]"
          style={{ top: "calc(env(safe-area-inset-top) + 64px)" }}
        >
          <div className="scrollbar-hide overflow-x-auto px-4">
            <nav className="flex gap-1 py-2.5 w-max">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "shrink-0 inline-flex items-center gap-1.5 px-4 h-9 rounded-full text-[13px] font-medium whitespace-nowrap transition-all",
                    tab === t.key
                      ? "bg-gold text-ink"
                      : "text-cream/55 hover:text-cream hover:bg-white/[0.04]",
                  )}
                >
                  {t.label}
                  <span className={cn(
                    "inline-flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full text-[10px] font-bold tabular-nums",
                    tab === t.key ? "bg-ink/15 text-ink" : "bg-white/[0.08] text-cream/60",
                  )}>
                    {counts[t.key]}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Orders list */}
        <div className="px-4 py-4 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.04] border border-white/[0.07] mb-4">
                <Clock className="h-6 w-6 text-cream/30" />
              </div>
              <p className="text-cream/55 text-[14px]">Geen bestellingen hier.</p>
            </div>
          ) : (
            filtered.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                isNew={order.status === "new"}
                onClick={() => setSelected(order)}
              />
            ))
          )}
        </div>
      </StaffShell>

      <OrderDetailModal order={selected} onClose={() => setSelected(null)} />

      <audio ref={audioRef} src="/notify.mp3" preload="auto" />
    </>
  );
}

function OrderCard({ order, isNew, onClick }: { order: any; isNew: boolean; onClick: () => void }) {
  const items = order.items ?? order.lines ?? [];
  const itemCount = items.reduce((n: number, l: any) => n + (l.qty ?? 1), 0);
  const customer = order.customer ?? {};
  const rawTime = order.requestedTime;
  const requestedDate = rawTime?.seconds
    ? new Date(rawTime.seconds * 1000)
    : rawTime ? new Date(rawTime) : null;
  const when = requestedDate
    ? requestedDate.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })
    : "—";

  const status = order.status ?? "new";

  // Time remaining for "preparing"
  let timeBadge: { label: string; color: string } | null = null;
  if (status === "preparing" && order.estimatedReadyAt) {
    const readyAt = order.estimatedReadyAt.seconds
      ? new Date(order.estimatedReadyAt.seconds * 1000)
      : new Date(order.estimatedReadyAt);
    const remaining = Math.round((readyAt.getTime() - Date.now()) / 60_000);
    if (remaining > 0) {
      timeBadge = { label: `${remaining}min`, color: "text-amber-300 bg-amber-400/15 border-amber-400/25" };
    } else {
      timeBadge = { label: `klaar!`, color: "text-emerald-300 bg-emerald-400/15 border-emerald-400/25" };
    }
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "block w-full text-left bg-card/60 hover:bg-card border border-white/[0.06] hover:border-gold/30 rounded-2xl p-4 transition-all active:scale-[0.99]",
        isNew && "border-gold/40 order-card-new",
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          {/* Customer name is leidend now */}
          <div className="flex items-center gap-2 mb-0.5">
            <SourceIcon source={order.source} channel={order.channel} />
            <p className="font-display text-lg font-semibold text-cream truncate">
              {customer.name?.trim() || "Walk-in klant"}
            </p>
            {timeBadge && (
              <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold tabular-nums shrink-0", timeBadge.color)}>
                <Clock className="h-2.5 w-2.5" />
                {timeBadge.label}
              </span>
            )}
          </div>
          <p className="text-[11px] text-cream/55 truncate">
            <span className="font-mono text-cream/40">#{order.number ?? order.id?.slice(-4)?.toUpperCase()}</span>
            <span className="mx-1.5 text-cream/25">·</span>
            {when}
            {order.takenBy?.name && (
              <>
                <span className="mx-1.5 text-cream/25">·</span>
                <span className="text-gold/80">door {order.takenBy.name.split(" ")[0]}</span>
              </>
            )}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-display font-semibold text-gold text-[16px] tabular-nums">
            {fmt(order.total)}
          </p>
          <p className="text-[10px] text-cream/40 mt-0.5">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-[12px]">
        <span className={cn(
          "inline-flex items-center gap-1 text-cream/65",
          order.mode === "pickup" ? "" : "",
        )}>
          {order.mode === "pickup"
            ? <><ShoppingBag className="h-3 w-3 text-blue-300" /> Afhalen</>
            : <><Truck className="h-3 w-3 text-purple-300" /> Bezorgen</>}
        </span>
        <StatusDot status={status} />
      </div>

      {/* First items preview */}
      <p className="text-[12px] text-cream/55 mt-2 truncate">
        {items.slice(0, 3).map((l: any) => `${l.qty ?? 1}× ${l.name ?? ""}`).join(", ")}
        {items.length > 3 && ` +${items.length - 3} meer`}
      </p>
    </button>
  );
}

function SourceIcon({ source, channel }: { source?: string; channel?: string }) {
  let icon: React.ReactNode;
  let color = "text-cream/40";
  let title = "Web";

  if (channel === "phone" || source === "kassa_phone") {
    icon = <Phone className="h-3.5 w-3.5" />;
    color = "text-emerald-300";
    title = "Telefoon";
  } else if (channel === "walkin" || source === "kassa_walkin") {
    icon = <Store className="h-3.5 w-3.5" />;
    color = "text-blue-300";
    title = "Walk-in";
  } else {
    icon = <Globe className="h-3.5 w-3.5" />;
    color = "text-gold/70";
    title = "Online";
  }

  return (
    <span title={title} className={cn("inline-flex shrink-0", color)} aria-label={title}>
      {icon}
    </span>
  );
}

function StatusDot({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    new: { label: "Nieuw", color: "text-blue-300", icon: <Clock className="h-3 w-3" /> },
    accepted: { label: "Geaccepteerd", color: "text-blue-300", icon: <Clock className="h-3 w-3" /> },
    preparing: { label: "In bereiding", color: "text-amber-300", icon: <ChefHat className="h-3 w-3" /> },
    ready: { label: "Klaar", color: "text-emerald-300", icon: <CheckCircle2 className="h-3 w-3" /> },
    out_for_delivery: { label: "Onderweg", color: "text-purple-300", icon: <Truck className="h-3 w-3" /> },
    completed: { label: "Voltooid", color: "text-emerald-400", icon: <CheckCircle2 className="h-3 w-3" /> },
    cancelled: { label: "Geannuleerd", color: "text-red-300", icon: <Clock className="h-3 w-3" /> },
  };
  const c = config[status] ?? config.new;
  return (
    <span className={cn("inline-flex items-center gap-1", c.color)}>
      {c.icon}
      {c.label}
    </span>
  );
}
