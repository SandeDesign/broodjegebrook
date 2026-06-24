"use client";
import * as React from "react";
import { use } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db, RESTAURANT_ID } from "@/lib/firebase";
import { cn } from "@eufraat/ui";
import { CheckCircle2, ChefHat, Bike, ShoppingBag, Clock } from "lucide-react";

type OrderStatus = "new" | "accepted" | "preparing" | "ready" | "out_for_delivery" | "completed" | "cancelled";

type OrderItem = {
  itemId: string;
  name: string;
  qty: number;
  unitPrice: number;
  size?: string | null;
  sauce?: string | null;
  extras?: { name: string; price: number }[];
  removed?: string[];
  note?: string;
  lineTotal: number;
};

type OrderData = {
  id: string;
  status: OrderStatus;
  mode: "pickup" | "delivery";
  requestedTime: { seconds: number } | string | null;
  number?: number;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  customer: {
    name: string;
    phone?: string;
    address?: string;
    postcode?: string;
    city?: string;
    note?: string;
  };
};

const fmt = (v: number) => `€${v.toFixed(2).replace(".", ",")}`;

const STEPS_PICKUP = [
  { key: "new" as OrderStatus, label: "Ontvangen", icon: <Clock className="h-5 w-5" /> },
  { key: "preparing" as OrderStatus, label: "In bereiding", icon: <ChefHat className="h-5 w-5" /> },
  { key: "ready" as OrderStatus, label: "Klaar voor afhalen", icon: <ShoppingBag className="h-5 w-5" /> },
  { key: "completed" as OrderStatus, label: "Voltooid", icon: <CheckCircle2 className="h-5 w-5" /> },
];

const STEPS_DELIVERY = [
  { key: "new" as OrderStatus, label: "Ontvangen", icon: <Clock className="h-5 w-5" /> },
  { key: "preparing" as OrderStatus, label: "In bereiding", icon: <ChefHat className="h-5 w-5" /> },
  { key: "out_for_delivery" as OrderStatus, label: "Onderweg", icon: <Bike className="h-5 w-5" /> },
  { key: "completed" as OrderStatus, label: "Bezorgd", icon: <CheckCircle2 className="h-5 w-5" /> },
];

function resolveTime(t: OrderData["requestedTime"]): Date | null {
  if (!t) return null;
  if (typeof t === "string") return new Date(t);
  if ("seconds" in t) return new Date(t.seconds * 1000);
  return null;
}

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = React.useState<OrderData | null>(null);
  const [notFound, setNotFound] = React.useState(false);

  React.useEffect(() => {
    const ref = doc(db(), "restaurants", RESTAURANT_ID, "orders", id);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setOrder({ id: snap.id, ...(snap.data() as object) } as OrderData);
      } else {
        setNotFound(true);
      }
    });
    return () => unsub();
  }, [id]);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-gold mb-4">Bestelling</p>
          <h1 className="font-display text-4xl italic text-cream mb-3">Niet gevonden.</h1>
          <p className="text-cream/50">Controleer of de link klopt.</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-cream/40 animate-pulse">Laden…</p>
      </div>
    );
  }

  const steps = order.mode === "delivery" ? STEPS_DELIVERY : STEPS_PICKUP;
  const currentIdx = Math.max(0, steps.findIndex((s) => s.key === order.status));
  const requestedDate = resolveTime(order.requestedTime);
  const when = requestedDate
    ? requestedDate.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <div className="min-h-screen pt-24 pb-24">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">

        {/* Header */}
        <div className="mb-12 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-gold mb-4">
            {order.number ? `Bestelling #${order.number}` : "Bestelling bevestigd"}
          </p>
          <h1 className="font-display font-medium italic text-cream text-5xl sm:text-6xl leading-[0.9] tracking-[-0.03em]">
            {order.status === "completed"
              ? "Geniet ervan!"
              : order.status === "cancelled"
              ? "Geannuleerd."
              : `${order.mode === "pickup" ? "Afhalen" : "Bezorgen"} rond ${when}.`}
          </h1>
          <p className="mt-4 text-cream/50 text-sm">
            {order.customer.name && `Hoi ${order.customer.name}. `}
            We houden je op de hoogte van de status.
          </p>
        </div>

        {/* Status steps */}
        <div className="grid grid-cols-4 gap-px bg-line/[0.06] mb-12">
          {steps.map((step, i) => {
            const done = i <= currentIdx;
            const active = i === currentIdx;
            return (
              <div
                key={step.key}
                className={cn(
                  "bg-card p-4 sm:p-6 text-center transition-colors",
                  active && "bg-gold/10",
                )}
              >
                <div className={cn(
                  "mx-auto inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors",
                  done ? "border-gold text-gold bg-gold/10" : "border-line/[0.15] text-cream/25"
                )}>
                  {step.icon}
                </div>
                <div className={cn(
                  "mt-3 font-mono text-[9px] uppercase tracking-[0.2em]",
                  active ? "text-gold" : done ? "text-cream/60" : "text-cream/25"
                )}>
                  {step.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Order items */}
        <div className="border border-line/[0.08] p-6 mb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-gold mb-6">Overzicht</p>
          <ul className="space-y-4 divide-y divide-line/[0.06]">
            {(order.items ?? []).map((item, i) => {
              const meta = [item.size, item.sauce, ...(item.extras ?? []).map((e) => e.name)].filter(Boolean);
              const removed = (item.removed ?? []).filter(Boolean);
              return (
                <li key={i} className="pt-4 first:pt-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-[11px] tabular-nums text-cream/40 shrink-0">{item.qty}×</span>
                        <span className="font-display text-lg text-cream">{item.name}</span>
                      </div>
                      {meta.length > 0 && (
                        <p className="ml-6 mt-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-cream/40">{meta.join(" · ")}</p>
                      )}
                      {removed.length > 0 && (
                        <p className="ml-6 mt-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-red-400/50">Zonder: {removed.join(", ")}</p>
                      )}
                      {item.note && (
                        <p className="ml-6 mt-0.5 text-[11px] italic text-cream/35">"{item.note}"</p>
                      )}
                    </div>
                    <span className="font-display text-base text-gold tabular-nums shrink-0">{fmt(item.lineTotal)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-6 pt-4 border-t border-line/[0.08] space-y-2">
            <div className="flex justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-cream/50">
              <span>Subtotaal</span>
              <span>{fmt(order.subtotal)}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-cream/50">
                <span>Bezorgkosten</span>
                <span>{fmt(order.deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between font-display text-2xl text-cream pt-2 border-t border-line/[0.08]">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] self-end pb-0.5">Totaal</span>
              <span>{fmt(order.total)}</span>
            </div>
          </div>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-cream/40">
            Betaling: contant of PIN bij {order.mode === "pickup" ? "afhalen" : "bezorgen"}
          </p>
        </div>

        {/* Delivery note */}
        {order.status === "out_for_delivery" && (
          <div className="border border-gold/20 bg-gold/5 p-4 flex items-center gap-3">
            <Bike className="h-5 w-5 text-gold shrink-0" />
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold/80">
              De bezorger is onderweg naar je toe!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
