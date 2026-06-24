"use client";
import * as React from "react";
import {
  collection, query, where, orderBy, onSnapshot,
  doc, updateDoc, arrayUnion, serverTimestamp,
} from "firebase/firestore";
import { db, RESTAURANT_ID, auth } from "@/lib/firebase";
import { useStaffAuth } from "@/lib/useStaffAuth";
import { useCurrentStaffName } from "@/lib/staffResolver";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { cn } from "@eufraat/ui";
import {
  Navigation, MapPin, Phone, CheckCircle2, Package,
  Bike, LogOut, AlertCircle, ArrowLeft, Home,
} from "lucide-react";

type GpsState = "off" | "requesting" | "active" | "denied";

const fmt = (v: number) => `€${(v ?? 0).toFixed(2).replace(".", ",")}`;

export default function BezorgenPage() {
  const router = useRouter();
  const { user, role, ready } = useStaffAuth();
  const current = useCurrentStaffName();
  const [orders, setOrders] = React.useState<any[]>([]);
  const [gpsState, setGpsState] = React.useState<GpsState>("off");
  const watchRef = React.useRef<number | null>(null);

  const isBezorger = role === "bezorger";

  React.useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/login"); return; }
  }, [ready, user, router]);

  React.useEffect(() => {
    const q = query(
      collection(db(), "restaurants", RESTAURANT_ID, "orders"),
      where("mode", "==", "delivery"),
      where("status", "in", ["ready", "out_for_delivery"]),
      orderBy("createdAt", "asc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
    });
    return () => unsub();
  }, []);

  const startGps = (orderId: string) => {
    if (!navigator.geolocation) { setGpsState("denied"); return; }
    setGpsState("requesting");
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsState("active");
        updateDoc(doc(db(), "restaurants", RESTAURANT_ID, "orders", orderId), {
          driverLocation: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            at: new Date().toISOString(),
          },
        }).catch(() => {});
      },
      () => setGpsState("denied"),
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 15_000 },
    );
  };

  const stopGps = () => {
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    setGpsState("off");
  };

  React.useEffect(() => () => stopGps(), []);

  const startDelivery = async (order: any) => {
    if (!user) return;
    const ref = doc(db(), "restaurants", RESTAURANT_ID, "orders", order.id);
    const stamp = { uid: current.uid, name: current.name, at: new Date().toISOString() };
    await updateDoc(ref, {
      status: "out_for_delivery",
      bezorgerId: user.uid,
      bezorgerName: current.name,
      deliveredBy: stamp,
      status_out_for_delivery_by: stamp,
      lastActionBy: stamp,
      statusHistory: arrayUnion({
        status: "out_for_delivery",
        at: stamp.at,
        by: current.uid,
        byName: current.name,
      }),
      _updatedAt: serverTimestamp(),
    });
    startGps(order.id);
  };

  const completeDelivery = async (order: any) => {
    stopGps();
    const ref = doc(db(), "restaurants", RESTAURANT_ID, "orders", order.id);
    const stamp = { uid: current.uid, name: current.name, at: new Date().toISOString() };
    await updateDoc(ref, {
      status: "completed",
      driverLocation: null,
      status_completed_by: stamp,
      lastActionBy: stamp,
      statusHistory: arrayUnion({
        status: "completed",
        at: stamp.at,
        by: current.uid,
        byName: current.name,
      }),
      _updatedAt: serverTimestamp(),
    });
  };

  const myActive = orders.find(
    (o) => o.status === "out_for_delivery" && o.bezorgerId === user?.uid,
  );
  const waiting = orders.filter((o) => o.status === "ready");
  const otherActive = orders.filter(
    (o) => o.status === "out_for_delivery" && o.bezorgerId !== user?.uid,
  );

  if (!ready) {
    return <div className="min-h-screen flex items-center justify-center text-cream/40">Laden…</div>;
  }

  return (
    <div className="min-h-screen bg-ink">
      {/* Header */}
      <header
        className="fixed top-0 inset-x-0 z-40 bg-ink/95 backdrop-blur-2xl border-b border-white/[0.06]"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="h-16 px-4 flex items-center gap-3">
          {!isBezorger && (
            <button
              onClick={() => router.push("/")}
              aria-label="Terug"
              className="inline-flex h-10 w-10 -ml-2 items-center justify-center rounded-full text-cream/80 hover:bg-white/[0.05] active:scale-95 transition-all"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Bike className="h-4 w-4 text-gold" />
              <h1 className="text-[15px] font-semibold text-cream">Bezorgen</h1>
            </div>
            {user?.email && (
              <p className="text-[11px] text-cream/45 truncate">{user.email}</p>
            )}
          </div>
          {gpsState === "active" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-[10px] font-semibold text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              GPS
            </span>
          )}
          {gpsState === "denied" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-400/30 text-[10px] font-semibold text-red-300">
              <AlertCircle className="h-3 w-3" />
              Geen GPS
            </span>
          )}
          {isBezorger && (
            <button
              onClick={() => signOut(auth()).then(() => router.replace("/login"))}
              aria-label="Uitloggen"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-cream/60 hover:text-red-400 hover:bg-red-400/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main
        className="px-4"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 80px)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 32px)",
        }}
      >
        {/* Actieve bezorging */}
        {myActive && (
          <section className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Navigation className="h-4 w-4 text-gold" />
              <h2 className="text-[12px] uppercase tracking-[0.18em] font-bold text-gold">Mijn bezorging</h2>
            </div>
            <DeliveryCard order={myActive} variant="active">
              <div className="mt-4 space-y-2">
                {gpsState !== "active" && (
                  <button
                    onClick={() => startGps(myActive.id)}
                    className="w-full h-12 rounded-2xl bg-blue-500/15 border border-blue-400/30 text-blue-300 text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-blue-500/25 transition-colors"
                  >
                    <Navigation className="h-4 w-4" />
                    Start GPS
                  </button>
                )}
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    `${myActive.customer?.address ?? ""} ${myActive.customer?.postcode ?? ""} ${myActive.customer?.city ?? ""}`.trim(),
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full h-12 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-cream text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-white/[0.08] transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                  Open in Google Maps
                </a>
                <button
                  onClick={() => completeDelivery(myActive)}
                  className="w-full h-13 rounded-2xl bg-emerald-500 text-white text-[15px] font-bold flex items-center justify-center gap-2 hover:bg-emerald-400 active:scale-[0.98] transition-all"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Afgeleverd
                </button>
              </div>
            </DeliveryCard>
          </section>
        )}

        {/* Wachtende */}
        <section className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-cream/60" />
              <h2 className="text-[12px] uppercase tracking-[0.18em] font-bold text-cream/70">
                Klaar voor bezorging
              </h2>
            </div>
            <span className="text-[11px] text-cream/40 font-mono tabular-nums">{waiting.length}</span>
          </div>
          {waiting.length === 0 ? (
            <p className="bg-card/40 border border-dashed border-white/[0.08] rounded-2xl p-6 text-center text-[13px] text-cream/40">
              Geen bestellingen klaar voor bezorging
            </p>
          ) : (
            <div className="space-y-2">
              {waiting.map((o) => (
                <DeliveryCard key={o.id} order={o} variant="waiting">
                  {!myActive && (
                    <button
                      onClick={() => startDelivery(o)}
                      className="mt-3 w-full h-12 rounded-2xl bg-gold text-ink text-[14px] font-bold flex items-center justify-center gap-2 hover:bg-gold-soft active:scale-[0.98] transition-all"
                    >
                      <Bike className="h-4 w-4" />
                      Pakken & starten
                    </button>
                  )}
                </DeliveryCard>
              ))}
            </div>
          )}
        </section>

        {/* Anderen onderweg */}
        {!isBezorger && otherActive.length > 0 && (
          <section className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bike className="h-4 w-4 text-purple-300" />
                <h2 className="text-[12px] uppercase tracking-[0.18em] font-bold text-purple-300/80">
                  Onderweg
                </h2>
              </div>
              <span className="text-[11px] text-cream/40 font-mono tabular-nums">{otherActive.length}</span>
            </div>
            <div className="space-y-2">
              {otherActive.map((o) => (
                <DeliveryCard key={o.id} order={o} variant="waiting" />
              ))}
            </div>
          </section>
        )}

        {/* Back home for non-bezorger */}
        {!isBezorger && (
          <div className="mt-8">
            <button
              onClick={() => router.push("/")}
              className="w-full h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-cream/70 text-[13px] font-medium flex items-center justify-center gap-2 hover:bg-white/[0.07] transition-colors"
            >
              <Home className="h-4 w-4" />
              Terug naar dashboard
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function DeliveryCard({ order, variant, children }: {
  order: any; variant: "active" | "waiting"; children?: React.ReactNode;
}) {
  const items = order.items ?? order.lines ?? [];
  const customer = order.customer ?? {};
  return (
    <div className={cn(
      "rounded-2xl border p-4",
      variant === "active" ? "bg-gold/[0.06] border-gold/40" : "bg-card/60 border-white/[0.07]",
    )}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="font-display text-lg font-semibold text-cream">
            #{order.number ?? order.id?.slice(-4)?.toUpperCase()}
          </p>
          <p className="text-[14px] font-medium text-cream/85 mt-0.5">{customer.name ?? "Klant"}</p>
          <p className="text-[12px] text-cream/55">
            {customer.address ?? ""}, {customer.postcode ?? ""} {customer.city ?? ""}
          </p>
        </div>
        {customer.phone && (
          <a
            href={`tel:${customer.phone}`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-gold hover:bg-gold/25 transition-colors shrink-0"
          >
            <Phone className="h-4 w-4" />
          </a>
        )}
      </div>

      <ul className="text-[12px] text-cream/65 space-y-0.5 mb-2">
        {items.slice(0, 4).map((l: any, i: number) => (
          <li key={i}>
            <span className="font-semibold text-cream/85">{l.qty ?? 1}×</span> {l.name ?? ""}
          </li>
        ))}
        {items.length > 4 && <li className="text-cream/40">+{items.length - 4} meer</li>}
      </ul>

      <div className="flex items-center justify-between text-[12px] pt-2 border-t border-white/[0.06]">
        <span className="text-cream/55">Totaal</span>
        <span className="font-display font-semibold text-gold tabular-nums">{fmt(order.total)}</span>
      </div>

      {customer.note && (
        <div className="mt-3 bg-amber-400/[0.07] border border-amber-400/20 rounded-lg p-2 text-[11px] italic text-amber-200/85">
          📝 {customer.note}
        </div>
      )}

      {children}
    </div>
  );
}
