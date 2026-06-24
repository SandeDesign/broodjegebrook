"use client";
import * as React from "react";
import { use } from "react";
import {
  doc, getDoc, collection, query, where, orderBy, onSnapshot,
} from "firebase/firestore";
import { db, RESTAURANT_ID } from "@/lib/firebase";
import { StaffShell } from "@/components/StaffShell";
import {
  Mail, Phone, MapPin, Award, ChefHat, Clock, Bike, CheckCircle2,
  ShoppingBag, TrendingUp,
} from "lucide-react";
import { cn } from "@eufraat/ui";

const fmt = (v: number) => `€${(v ?? 0).toFixed(2).replace(".", ",")}`;

const STATUS_ICON: Record<string, React.ReactNode> = {
  new: <Clock className="h-3 w-3" />,
  accepted: <Clock className="h-3 w-3" />,
  preparing: <ChefHat className="h-3 w-3" />,
  ready: <CheckCircle2 className="h-3 w-3" />,
  out_for_delivery: <Bike className="h-3 w-3" />,
  completed: <CheckCircle2 className="h-3 w-3" />,
};
const STATUS_LABEL: Record<string, string> = {
  new: "Nieuw", accepted: "Geaccepteerd", preparing: "In bereiding",
  ready: "Klaar", out_for_delivery: "Onderweg", completed: "Voltooid", cancelled: "Geannuleerd",
};
const STATUS_COLOR: Record<string, string> = {
  new: "text-blue-300",
  accepted: "text-blue-300",
  preparing: "text-amber-300",
  ready: "text-emerald-300",
  out_for_delivery: "text-purple-300",
  completed: "text-emerald-400",
  cancelled: "text-red-400",
};

export default function KlantDetailPage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = use(params);
  const [customer, setCustomer] = React.useState<any | null>(null);
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let unsubOrders: (() => void) | undefined;
    (async () => {
      const snap = await getDoc(doc(db(), "customers", uid));
      if (snap.exists()) {
        const c = { uid: snap.id, ...(snap.data() as any) };
        setCustomer(c);
        if (c.email) {
          unsubOrders = onSnapshot(
            query(
              collection(db(), "restaurants", RESTAURANT_ID, "orders"),
              where("customer.email", "==", c.email),
              orderBy("createdAt", "desc"),
            ),
            (snap) => {
              setOrders(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
              setLoading(false);
            },
            () => setLoading(false),
          );
        } else {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    })();
    return () => unsubOrders?.();
  }, [uid]);

  if (loading) {
    return (
      <StaffShell title="Klant" backHref="/klanten">
        <p className="text-center text-cream/40 py-10 text-[13px]">Laden…</p>
      </StaffShell>
    );
  }

  if (!customer) {
    return (
      <StaffShell title="Klant niet gevonden" backHref="/klanten">
        <div className="px-4 py-10 text-center">
          <p className="text-cream/55">Deze klant bestaat niet.</p>
        </div>
      </StaffShell>
    );
  }

  const completed = orders.filter((o) => o.status === "completed");
  const totalSpent = completed.reduce((s, o) => s + (o.total ?? 0), 0);
  const lastOrderAt = orders[0]?.createdAt?.seconds
    ? new Date(orders[0].createdAt.seconds * 1000)
    : null;

  return (
    <StaffShell title={customer.name ?? "Klant"} subtitle={customer.email} backHref="/klanten">
      {/* Profile card */}
      <section className="px-4 mb-4">
        <div className="bg-card/60 border border-white/[0.07] rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 border border-gold/30">
              <span className="font-display text-xl font-semibold text-gold">
                {(customer.name ?? customer.email ?? "?").substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[16px] font-semibold text-cream truncate">{customer.name ?? "Onbekend"}</p>
              {customer.loyalty?.tier && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-gold/15 text-gold text-[10px] font-bold uppercase tracking-wider">
                  {customer.loyalty.tier}
                </span>
              )}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-white/[0.06] grid grid-cols-3 gap-2">
            <Stat value={String(completed.length)} label="Orders" />
            <Stat value={fmt(totalSpent)} label="Omzet" gold />
            <Stat value={String(customer.loyalty?.points ?? 0)} label="Punten" />
          </div>
        </div>
      </section>

      {/* Contact actions */}
      <section className="px-4 mb-5">
        <div className="grid grid-cols-2 gap-2">
          {customer.email && (
            <a
              href={`mailto:${customer.email}`}
              className="flex items-center gap-2 bg-card/60 hover:bg-card border border-white/[0.06] rounded-xl px-4 h-12 text-[13px] text-cream/85 hover:text-cream transition-all"
            >
              <Mail className="h-4 w-4 text-gold/70" />
              <span className="truncate">E-mail</span>
            </a>
          )}
          {customer.phone && (
            <a
              href={`tel:${customer.phone}`}
              className="flex items-center gap-2 bg-card/60 hover:bg-card border border-white/[0.06] rounded-xl px-4 h-12 text-[13px] text-cream/85 hover:text-cream transition-all"
            >
              <Phone className="h-4 w-4 text-gold/70" />
              <span className="truncate">Bel</span>
            </a>
          )}
        </div>
      </section>

      {/* Order history */}
      <section className="px-4">
        <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-cream/45 mb-3 px-1">
          Bestelgeschiedenis ({orders.length})
        </h2>
        {orders.length === 0 ? (
          <p className="bg-card/40 border border-dashed border-white/[0.08] rounded-2xl p-6 text-center text-[13px] text-cream/40">
            Nog geen bestellingen
          </p>
        ) : (
          <div className="space-y-2">
            {orders.map((o) => {
              const date = o.createdAt?.seconds
                ? new Date(o.createdAt.seconds * 1000)
                : null;
              const items = o.items ?? o.lines ?? [];
              return (
                <div key={o.id} className="bg-card/60 border border-white/[0.06] rounded-2xl p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="flex items-baseline gap-2">
                      <p className="font-display font-semibold text-cream">
                        #{o.number ?? o.id?.slice(-4)?.toUpperCase()}
                      </p>
                      {date && (
                        <p className="text-[11px] text-cream/45">
                          {date.toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                        </p>
                      )}
                    </div>
                    <span className="font-display font-semibold text-gold tabular-nums">{fmt(o.total)}</span>
                  </div>
                  <p className="text-[12px] text-cream/55 mt-1 line-clamp-1">
                    {items.slice(0, 3).map((i: any) => `${i.qty ?? 1}× ${i.name ?? ""}`).join(", ")}
                  </p>
                  <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium mt-2", STATUS_COLOR[o.status] ?? "text-cream/45")}>
                    {STATUS_ICON[o.status]}
                    {STATUS_LABEL[o.status] ?? o.status}
                    <span className="text-cream/40 ml-1">· {o.mode === "pickup" ? "Afhalen" : "Bezorgen"}</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </StaffShell>
  );
}

function Stat({ value, label, gold }: { value: string; label: string; gold?: boolean }) {
  return (
    <div className="text-center">
      <p className={cn("font-display text-lg font-bold tabular-nums", gold ? "text-gold" : "text-cream")}>
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-wider font-medium text-cream/45 mt-0.5">{label}</p>
    </div>
  );
}
