"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag, Star, ChevronRight, LogOut, User,
  Clock, CheckCircle2, Bike, ChefHat, XCircle,
} from "lucide-react";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { useCustomerAuth, logout } from "@/lib/useCustomerAuth";
import { db, RESTAURANT_ID } from "@/lib/firebase";

const fmt = (v: number) => `€${v.toFixed(2).replace(".", ",")}`;

const STATUS_LABEL: Record<string, string> = {
  new: "Ontvangen",
  accepted: "Geaccepteerd",
  preparing: "In bereiding",
  ready: "Klaar",
  out_for_delivery: "Onderweg",
  completed: "Bezorgd",
  cancelled: "Geannuleerd",
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  new: <Clock className="h-3.5 w-3.5" />,
  accepted: <Clock className="h-3.5 w-3.5" />,
  preparing: <ChefHat className="h-3.5 w-3.5" />,
  ready: <ShoppingBag className="h-3.5 w-3.5" />,
  out_for_delivery: <Bike className="h-3.5 w-3.5" />,
  completed: <CheckCircle2 className="h-3.5 w-3.5" />,
  cancelled: <XCircle className="h-3.5 w-3.5" />,
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

type Order = {
  id: string;
  status: string;
  mode: "pickup" | "delivery";
  total: number;
  createdAt: { seconds: number } | null;
  items: { name: string; qty: number }[];
  number?: number;
};

export default function AccountPage() {
  const router = useRouter();
  const { user, loading } = useCustomerAuth();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = React.useState(true);

  // Redirect if not logged in
  React.useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  // Fetch recent orders
  React.useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db(), "restaurants", RESTAURANT_ID, "orders"),
          where("customer.email", "==", user.email),
          orderBy("createdAt", "desc"),
          limit(10),
        );
        const snap = await getDocs(q);
        setOrders(snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as Order));
      } catch {
        // Firestore index not yet created — show empty gracefully
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  if (loading || !user) return null;

  const initials = (user.displayName ?? user.email ?? "?")
    .split(" ").map((s) => s[0]).join("").substring(0, 2).toUpperCase();

  const totalSpent = orders
    .filter((o) => o.status === "completed")
    .reduce((s, o) => s + (o.total ?? 0), 0);
  const loyaltyPoints = Math.floor(totalSpent);

  return (
    <div className="min-h-screen pt-20 lg:pt-8 pb-28 lg:pb-10 px-4 sm:px-8 lg:px-10">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Profile card */}
        <div className="bg-card border border-line/[0.07] rounded-3xl p-6">
          <div className="flex items-center gap-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 border border-gold/30 shrink-0">
              <span className="font-display text-2xl font-semibold text-gold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-semibold text-cream truncate">
                {user.displayName ?? "Klant"}
              </p>
              <p className="text-[13px] text-cream/55 truncate">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 h-9 rounded-xl text-[12px] text-cream/50 hover:text-red-400 hover:bg-red-400/[0.06] border border-line/[0.07] hover:border-red-400/20 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Uitloggen
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-line/[0.06]">
            <Stat value={orders.filter((o) => o.status === "completed").length} label="Bestellingen" />
            <Stat value={loyaltyPoints} label="Punten" />
            <Stat value={loyaltyPoints >= 1500 ? "Goud" : loyaltyPoints >= 500 ? "Zilver" : "Brons"} label="Niveau" gold />
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <ActionTile icon={<ShoppingBag className="h-5 w-5" />} label="Opnieuw bestellen" sub="Bestel snel hetzelfde" href="/menukaart" />
          <ActionTile icon={<Star className="h-5 w-5" />} label="Spaarpunten" sub={`${loyaltyPoints} punten gespaart`} />
        </div>

        {/* Orders */}
        <section>
          <h2 className="font-display text-2xl font-medium italic text-cream mb-4">Bestelgeschiedenis</h2>

          {ordersLoading ? (
            <p className="text-[13px] text-cream/40 animate-pulse">Laden…</p>
          ) : orders.length === 0 ? (
            <div className="bg-card border border-line/[0.07] rounded-3xl p-8 text-center">
              <ShoppingBag className="h-10 w-10 text-cream/20 mx-auto mb-3" />
              <p className="font-display text-lg italic text-cream/60">Nog geen bestellingen.</p>
              <p className="text-[12px] text-cream/40 mt-1">Je bestellingen verschijnen hier na je eerste order.</p>
              <Link href="/menukaart" className="mt-4 inline-flex items-center gap-2 h-10 px-5 rounded-full bg-gold text-ink text-[13px] font-semibold hover:bg-gold-soft transition-colors">
                Bekijk menu
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {orders.map((order) => {
                const date = order.createdAt
                  ? new Date(order.createdAt.seconds * 1000).toLocaleDateString("nl-NL", {
                      day: "numeric", month: "long",
                    })
                  : "";
                const status = order.status ?? "new";
                return (
                  <li key={order.id}>
                    <Link
                      href={`/order/${order.id}`}
                      className="flex items-center gap-4 bg-card hover:bg-surface-2 border border-line/[0.07] hover:border-gold/20 rounded-2xl p-4 transition-all group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-[14px] font-semibold text-cream">
                            {order.number ? `#${order.number}` : "Bestelling"}
                            {date && <span className="font-normal text-cream/45 ml-2 text-[12px]">{date}</span>}
                          </p>
                          <span className="text-gold font-semibold text-[14px] tabular-nums shrink-0">
                            {fmt(order.total ?? 0)}
                          </span>
                        </div>
                        <p className="text-[12px] text-cream/50 mt-0.5 truncate">
                          {(order.items ?? []).slice(0, 2).map((i) => `${i.qty ?? 1}× ${i.name ?? ""}`).join(", ")}
                          {(order.items ?? []).length > 2 && ` +${(order.items ?? []).length - 2}`}
                        </p>
                        <span className={`inline-flex items-center gap-1 mt-1.5 text-[11px] font-medium ${STATUS_COLOR[status] ?? "text-cream/40"}`}>
                          {STATUS_ICON[status]}
                          {STATUS_LABEL[status] ?? status}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-cream/25 group-hover:text-gold/60 transition-colors shrink-0" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Profile settings */}
        <section className="bg-card border border-line/[0.07] rounded-3xl divide-y divide-line/[0.05]">
          <h3 className="px-5 pt-5 pb-3 text-[11px] uppercase tracking-[0.2em] font-semibold text-cream/40">Account</h3>
          <SettingsRow icon={<User className="h-4 w-4" />} label="Naam" value={user.displayName ?? "—"} />
          <SettingsRow icon={<User className="h-4 w-4" />} label="E-mail" value={user.email ?? "—"} />
          <div className="px-5 py-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-[13px] text-red-400/80 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Uitloggen
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}

function Stat({ value, label, gold }: { value: string | number; label: string; gold?: boolean }) {
  return (
    <div className="text-center">
      <p className={`font-display text-2xl font-semibold tabular-nums ${gold ? "text-gold" : "text-cream"}`}>
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-[0.2em] text-cream/45 font-medium mt-0.5">{label}</p>
    </div>
  );
}

function ActionTile({ icon, label, sub, href }: {
  icon: React.ReactNode; label: string; sub: string; href?: string;
}) {
  const cls = "flex flex-col gap-3 bg-card border border-line/[0.07] hover:border-gold/20 rounded-2xl p-5 text-left transition-all group";
  const inner = (
    <>
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold group-hover:bg-gold/15 transition-colors">
        {icon}
      </span>
      <div>
        <p className="text-[14px] font-semibold text-cream">{label}</p>
        <p className="text-[11px] text-cream/50 mt-0.5">{sub}</p>
      </div>
    </>
  );
  return href
    ? <Link href={href} className={cls}>{inner}</Link>
    : <div className={cls}>{inner}</div>;
}

function SettingsRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <span className="text-cream/35 shrink-0">{icon}</span>
      <span className="text-[12px] text-cream/45 w-16 shrink-0 uppercase tracking-wider font-medium">{label}</span>
      <span className="text-[13px] text-cream/80 flex-1 truncate">{value}</span>
    </div>
  );
}
