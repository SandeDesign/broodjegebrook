"use client";
import * as React from "react";
import {
  X, Phone, Truck, ShoppingBag, Check, Clock, ChefHat,
  MapPin, MessageSquare, History, Bike, XCircle, User,
} from "lucide-react";
import { doc, updateDoc, serverTimestamp, arrayUnion } from "firebase/firestore";
import { db, RESTAURANT_ID } from "@/lib/firebase";
import { useStaffDirectory, useCurrentStaffName } from "@/lib/staffResolver";
import { cn } from "@eufraat/ui";

const fmt = (v: number) => `€${(v ?? 0).toFixed(2).replace(".", ",")}`;

const TIME_OPTIONS = [30, 45, 60] as const;

const STATUS_LABEL: Record<string, string> = {
  new: "Ontvangen",
  accepted: "Geaccepteerd",
  preparing: "In bereiding",
  ready: "Klaar voor afhalen",
  out_for_delivery: "Onderweg",
  completed: "Voltooid",
  cancelled: "Geannuleerd",
};

interface OrderDetailModalProps {
  order: any | null;
  onClose: () => void;
}

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  const [busy, setBusy] = React.useState(false);
  const [selectedTime, setSelectedTime] = React.useState<number>(45);
  const { resolve: resolveStaff } = useStaffDirectory();
  const current = useCurrentStaffName();

  React.useEffect(() => {
    if (order) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [order]);

  if (!order) return null;

  const items = order.items ?? order.lines ?? [];
  const customer = order.customer ?? {};
  const status: string = order.status ?? "new";

  const rawTime = order.requestedTime;
  const requestedDate = rawTime?.seconds
    ? new Date(rawTime.seconds * 1000)
    : rawTime
      ? new Date(rawTime)
      : null;

  const update = async (changes: Record<string, any>) => {
    setBusy(true);
    try {
      const ref = doc(db(), "restaurants", RESTAURANT_ID, "orders", order.id);
      const newStatus = changes.status ?? status;
      await updateDoc(ref, {
        ...changes,
        // Mark the staff member responsible for THIS specific transition
        [`status_${newStatus}_by`]: { uid: current.uid, name: current.name, at: new Date().toISOString() },
        lastActionBy: { uid: current.uid, name: current.name, at: new Date().toISOString() },
        statusHistory: arrayUnion({
          status: newStatus,
          at: new Date().toISOString(),
          by: current.uid,
          byName: current.name, // ⬅ name embedded for permanent audit
        }),
        _updatedAt: serverTimestamp(),
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  const cancelOrder = async () => {
    if (!confirm("Weet je zeker dat je deze bestelling wilt annuleren?")) return;
    await update({ status: "cancelled", cancelledAt: serverTimestamp() });
  };

  // Build complete timeline
  const timeline: { status: string; at: Date; byName: string }[] = [];
  // Order creation
  if (order.createdAt) {
    const at = order.createdAt.seconds ? new Date(order.createdAt.seconds * 1000) : new Date(order.createdAt);
    const taker = order.takenBy?.name ?? (order.source === "web" ? "Klant (online)" : "—");
    timeline.push({ status: "new", at, byName: taker });
  }
  // From statusHistory
  if (Array.isArray(order.statusHistory)) {
    order.statusHistory.forEach((h: any) => {
      const at = typeof h.at === "string" ? new Date(h.at) : h.at?.seconds ? new Date(h.at.seconds * 1000) : null;
      if (!at) return;
      const byName = h.byName ?? (h.by ? resolveStaff(h.by) : "—");
      timeline.push({ status: h.status, at, byName });
    });
  }
  // Dedupe consecutive same-status entries (we add "new" + may have "new" in history)
  const cleanTimeline = timeline.filter((entry, i) => i === 0 || entry.status !== timeline[i - 1].status);

  const acceptWithTime = () => {
    const ready = new Date(Date.now() + selectedTime * 60_000);
    update({
      status: "preparing",
      acceptedAt: serverTimestamp(),
      estimatedReadyAt: ready,
      estimatedMinutes: selectedTime,
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col justify-end bg-ink/80 backdrop-blur-md" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full rounded-t-3xl bg-ink border-t border-white/[0.08] shadow-2xl flex flex-col"
        style={{ maxHeight: "calc(95svh - env(safe-area-inset-top))" }}
      >
        {/* Grab handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <span className="h-1 w-10 rounded-full bg-white/15" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-1 pb-4 border-b border-white/[0.06] shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-2xl font-semibold text-cream truncate">
                {customer.name?.trim() || "Walk-in klant"}
              </h2>
              <StatusBadge status={status} />
            </div>
            <p className="text-[11px] text-cream/50 mt-0.5 truncate">
              <span className="font-mono text-cream/40">#{order.number ?? order.id?.slice(-4)?.toUpperCase()}</span>
              {requestedDate && <> · {requestedDate.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}</>}
            </p>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] text-cream/60 hover:text-cream"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Mode + delivery */}
          <div className="flex items-center gap-2">
            <span className={cn(
              "inline-flex items-center gap-1.5 px-3 h-7 rounded-full text-[12px] font-medium",
              order.mode === "pickup"
                ? "bg-blue-500/15 text-blue-300 border border-blue-400/20"
                : "bg-purple-500/15 text-purple-300 border border-purple-400/20",
            )}>
              {order.mode === "pickup"
                ? <><ShoppingBag className="h-3.5 w-3.5" /> Afhalen</>
                : <><Truck className="h-3.5 w-3.5" /> Bezorgen</>}
            </span>
            <span className="text-gold font-display font-semibold text-lg tabular-nums ml-auto">
              {fmt(order.total)}
            </span>
          </div>

          {/* Items */}
          <section>
            <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-cream/45 mb-3">Bestelling</p>
            <ul className="space-y-3 divide-y divide-white/[0.05]">
              {items.map((l: any, i: number) => {
                const extras = Array.isArray(l.extras) ? l.extras : [];
                const removed = Array.isArray(l.removed) ? l.removed : [];
                const meta = [l.size, l.sauce, ...extras.map((e: { name: string }) => e?.name)].filter(Boolean);
                return (
                  <li key={i} className="pt-3 first:pt-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-medium text-cream text-[14px]">
                        <span className="text-gold font-semibold mr-1.5">{l.qty ?? 1}×</span>
                        {l.name ?? ""}
                      </p>
                      <span className="text-cream/70 text-[13px] tabular-nums shrink-0">{fmt(l.lineTotal ?? 0)}</span>
                    </div>
                    {meta.length > 0 && (
                      <p className="text-[11px] text-cream/55 mt-0.5 ml-1">+ {meta.join(" · ")}</p>
                    )}
                    {removed.length > 0 && (
                      <p className="text-[11px] text-orange-300/80 mt-0.5 ml-1">
                        − Zonder: {removed.join(", ")}
                      </p>
                    )}
                    {l.note && (
                      <p className="text-[11px] italic text-amber-300/80 mt-0.5 ml-1">"{l.note}"</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Source / channel */}
          <section className="bg-card/40 border border-white/[0.06] rounded-2xl p-4 space-y-2">
            <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-cream/45 mb-1">Bron</p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[14px] font-medium text-cream">
                {order.channel === "phone" || order.source === "kassa_phone"
                  ? "📞 Telefonisch"
                  : order.channel === "walkin" || order.source === "kassa_walkin"
                    ? "🏪 Walk-in"
                    : "🌐 Online via website"}
              </span>
            </div>
            {order.takenBy?.name && (
              <p className="text-[12px] text-cream/55">
                Aangenomen door <span className="text-gold font-semibold">{order.takenBy.name}</span>
              </p>
            )}
          </section>

          {/* Customer */}
          <section className="bg-card/40 border border-white/[0.06] rounded-2xl p-4 space-y-2">
            <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-cream/45 mb-1">Klant</p>
            <div className="flex items-center gap-2 text-[14px]">
              <span className="font-medium text-cream">{customer.name?.trim() || "Walk-in klant"}</span>
            </div>
            {customer.phone && (
              <a href={`tel:${customer.phone}`} className="flex items-center gap-2 text-[14px] text-cream/80 hover:text-gold">
                <Phone className="h-3.5 w-3.5 text-cream/40" />
                {customer.phone}
              </a>
            )}
            {order.mode === "delivery" && customer.address && (
              <p className="flex items-start gap-2 text-[13px] text-cream/70">
                <MapPin className="h-3.5 w-3.5 text-cream/40 mt-0.5 shrink-0" />
                <span>{customer.address}, {customer.postcode ?? ""} {customer.city ?? ""}</span>
              </p>
            )}
            {customer.note && (
              <p className="flex items-start gap-2 text-[12px] text-amber-300/80 italic bg-amber-400/[0.05] border border-amber-400/15 rounded-lg p-2 mt-2">
                <MessageSquare className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                {customer.note}
              </p>
            )}
          </section>

          {/* Totals */}
          <section className="bg-card/40 border border-white/[0.06] rounded-2xl p-4 space-y-1.5 text-[13px]">
            <Row label="Subtotaal" value={fmt(order.subtotal)} />
            {order.deliveryFee > 0 && <Row label="Bezorgkosten" value={fmt(order.deliveryFee)} />}
            <div className="flex items-baseline justify-between pt-2 mt-2 border-t border-white/[0.06]">
              <span className="text-[12px] uppercase tracking-wider font-semibold text-cream/70">Totaal</span>
              <span className="font-display text-xl text-gold font-semibold tabular-nums">{fmt(order.total)}</span>
            </div>
            <p className="text-[11px] text-cream/40 pt-1">
              {order.paymentMethod === "cash" ? "Contant" : "PIN"} bij {order.mode === "pickup" ? "afhalen" : "bezorgen"}
            </p>
          </section>

          {/* Timeline — audit trail */}
          <section className="bg-card/40 border border-white/[0.06] rounded-2xl p-4">
            <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-cream/45 mb-3 flex items-center gap-2">
              <History className="h-3.5 w-3.5" />
              Historie
            </p>
            <ol className="relative space-y-3 pl-5">
              {/* Vertical line */}
              <span className="absolute left-1 top-1.5 bottom-1.5 w-px bg-white/[0.08]" />
              {cleanTimeline.map((entry, i) => {
                const isLast = i === cleanTimeline.length - 1;
                return (
                  <li key={i} className="relative">
                    <span className={cn(
                      "absolute -left-[14px] top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-ink",
                      isLast ? "bg-gold" : "bg-cream/40",
                    )} />
                    <div className="flex items-baseline justify-between gap-3">
                      <p className={cn("text-[13px] font-semibold", isLast ? "text-cream" : "text-cream/75")}>
                        {STATUS_LABEL[entry.status] ?? entry.status}
                      </p>
                      <span className="text-[10px] font-mono tabular-nums text-cream/40 shrink-0">
                        {entry.at.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-[11px] text-cream/55 flex items-center gap-1.5 mt-0.5">
                      <User className="h-3 w-3 text-cream/35" />
                      {entry.byName}
                    </p>
                  </li>
                );
              })}
            </ol>
            {order.takenBy?.name && order.source !== "web" && (
              <p className="mt-3 pt-3 border-t border-white/[0.06] text-[11px] text-cream/45">
                Bestelling aangenomen door <span className="text-gold font-semibold">{order.takenBy.name}</span>
              </p>
            )}
          </section>
        </div>

        {/* Footer: action buttons */}
        <div
          className="shrink-0 border-t border-white/[0.06] bg-ink/95 backdrop-blur-xl px-4 py-4"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 16px)" }}
        >
          {status === "new" || status === "accepted" ? (
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-cream/60 text-center">
                Hoelang gaat het duren?
              </p>
              <div className="grid grid-cols-3 gap-2">
                {TIME_OPTIONS.map((min) => (
                  <button
                    key={min}
                    onClick={() => setSelectedTime(min)}
                    className={cn(
                      "h-12 rounded-xl font-semibold text-[14px] transition-all active:scale-[0.97]",
                      selectedTime === min
                        ? "bg-gold text-ink"
                        : "bg-white/[0.05] text-cream/70 hover:bg-white/[0.08]",
                    )}
                  >
                    {min} min
                  </button>
                ))}
              </div>
              <button
                onClick={acceptWithTime}
                disabled={busy}
                className="w-full h-13 rounded-2xl bg-gold text-ink font-semibold text-[15px] hover:bg-gold-soft active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Check className="h-5 w-5" />
                Bevestig & start ({selectedTime}min)
              </button>
            </div>
          ) : status === "preparing" ? (
            <button
              onClick={() => update({ status: order.mode === "delivery" ? "out_for_delivery" : "ready" })}
              disabled={busy}
              className="w-full h-13 rounded-2xl bg-gold text-ink font-semibold text-[15px] hover:bg-gold-soft active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {order.mode === "delivery" ? <Truck className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
              {order.mode === "delivery" ? "Onderweg!" : "Klaar voor afhalen"}
            </button>
          ) : status === "ready" || status === "out_for_delivery" ? (
            <button
              onClick={() => update({ status: "completed", completedAt: serverTimestamp() })}
              disabled={busy}
              className="w-full h-13 rounded-2xl bg-emerald-500 text-white font-semibold text-[15px] hover:bg-emerald-400 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Check className="h-5 w-5" />
              Voltooien
            </button>
          ) : (
            <p className="text-center text-[12px] text-cream/40 py-2">
              Deze bestelling is {status === "completed" ? "voltooid" : "geannuleerd"}.
            </p>
          )}

          {/* Annuleer link (alleen als nog niet voltooid/geannuleerd) */}
          {status !== "completed" && status !== "cancelled" && (
            <button
              onClick={cancelOrder}
              disabled={busy}
              className="mt-3 w-full inline-flex items-center justify-center gap-1.5 text-[11px] text-red-300/70 hover:text-red-300 transition-colors py-2"
            >
              <XCircle className="h-3.5 w-3.5" />
              Annuleer bestelling
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-cream/55">{label}</span>
      <span className="text-cream tabular-nums">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
    new: { label: "Nieuw", bg: "bg-blue-500/20 border-blue-400/30", text: "text-blue-300", icon: <Clock className="h-3 w-3" /> },
    accepted: { label: "Geaccepteerd", bg: "bg-blue-500/20 border-blue-400/30", text: "text-blue-300", icon: <Clock className="h-3 w-3" /> },
    preparing: { label: "In bereiding", bg: "bg-amber-500/20 border-amber-400/30", text: "text-amber-300", icon: <ChefHat className="h-3 w-3" /> },
    ready: { label: "Klaar", bg: "bg-emerald-500/20 border-emerald-400/30", text: "text-emerald-300", icon: <Check className="h-3 w-3" /> },
    out_for_delivery: { label: "Onderweg", bg: "bg-purple-500/20 border-purple-400/30", text: "text-purple-300", icon: <Truck className="h-3 w-3" /> },
    completed: { label: "Voltooid", bg: "bg-emerald-500/20 border-emerald-400/30", text: "text-emerald-400", icon: <Check className="h-3 w-3" /> },
    cancelled: { label: "Geannuleerd", bg: "bg-red-500/20 border-red-400/30", text: "text-red-300", icon: <X className="h-3 w-3" /> },
  };
  const c = config[status] ?? config.new;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold", c.bg, c.text)}>
      {c.icon}
      {c.label}
    </span>
  );
}
