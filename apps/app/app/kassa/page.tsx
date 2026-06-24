"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import {
  collection, query, where, getDocs, addDoc, serverTimestamp,
} from "firebase/firestore";
import { db, RESTAURANT_ID, auth } from "@/lib/firebase";
import { useStaffAuth } from "@/lib/useStaffAuth";
import { StaffShell } from "@/components/StaffShell";
import {
  categories, menuItems, categoryExtras, categorySauces, categorySizes,
  type MenuItem,
} from "@/data/menu";
import {
  Plus, Minus, Trash2, Search, ShoppingBag, Truck, Phone, ArrowRight,
  X, Check, ChevronLeft,
} from "lucide-react";
import { cn } from "@eufraat/ui";

const fmt = (v: number) => `€${(v ?? 0).toFixed(2).replace(".", ",")}`;

interface KassaLine {
  uid: string;
  itemId: string;
  name: string;
  basePrice: number;
  qty: number;
  size?: string;
  sauce?: string;
  extras: { name: string; price: number }[];
  note: string;
}

const linePrice = (l: KassaLine) =>
  (l.basePrice + l.extras.reduce((s, e) => s + e.price, 0)) * l.qty;

type Step = "items" | "customer" | "review";
type Channel = "phone" | "walkin";

export default function KassaPage() {
  const router = useRouter();
  const { user } = useStaffAuth();
  const [step, setStep] = React.useState<Step>("items");

  // Channel — phone vs walk-in
  const [channel, setChannel] = React.useState<Channel>("phone");

  // Cart
  const [lines, setLines] = React.useState<KassaLine[]>([]);
  const [openItem, setOpenItem] = React.useState<MenuItem | null>(null);
  const [activeCat, setActiveCat] = React.useState<string>(categories[0].id);
  const [search, setSearch] = React.useState("");

  // Customer
  const [mode, setMode] = React.useState<"pickup" | "delivery">("pickup");
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [postcode, setPostcode] = React.useState("");
  const [city, setCity] = React.useState("Geleen");
  const [note, setNote] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState<"cash" | "pin_on_pickup">("cash");
  const [pickupMinutes, setPickupMinutes] = React.useState(30);

  // Existing customer search
  const [customerResults, setCustomerResults] = React.useState<any[]>([]);

  // Submission
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const total = lines.reduce((s, l) => s + linePrice(l), 0);
  const deliveryFee = mode === "delivery" ? 2 : 0;
  const grandTotal = total + deliveryFee;

  const addLine = (line: Omit<KassaLine, "uid">) => {
    const uid = `${line.itemId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setLines((cur) => [...cur, { ...line, uid }]);
  };
  const incLine = (uid: string) =>
    setLines((cur) => cur.map((l) => (l.uid === uid ? { ...l, qty: l.qty + 1 } : l)));
  const decLine = (uid: string) =>
    setLines((cur) =>
      cur.map((l) => (l.uid === uid ? { ...l, qty: l.qty - 1 } : l)).filter((l) => l.qty > 0),
    );
  const removeLine = (uid: string) =>
    setLines((cur) => cur.filter((l) => l.uid !== uid));

  // Search existing customers by phone or name
  React.useEffect(() => {
    if (step !== "customer") return;
    const term = phone.replace(/\s/g, "");
    if (term.length < 4) {
      setCustomerResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const snap = await getDocs(
          query(collection(db(), "customers"), where("phone", "==", term)),
        );
        setCustomerResults(snap.docs.map((d) => ({ uid: d.id, ...(d.data() as any) })));
      } catch {
        setCustomerResults([]);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [phone, step]);

  const useCustomer = (c: any) => {
    setName(c.name ?? "");
    setPhone(c.phone ?? "");
    if (c.address) setAddress(c.address);
    if (c.postcode) setPostcode(c.postcode);
    if (c.city) setCity(c.city);
    setCustomerResults([]);
  };

  const submitOrder = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const requestedTime = new Date(Date.now() + pickupMinutes * 60_000);
      const staffUid = auth().currentUser?.uid ?? "staff";
      const staffName = user?.displayName ?? user?.email?.split("@")[0] ?? "Medewerker";

      const ref = await addDoc(
        collection(db(), "restaurants", RESTAURANT_ID, "orders"),
        {
          createdAt: serverTimestamp(),
          source: channel === "phone" ? "kassa_phone" : "kassa_walkin",
          channel,
          mode,
          requestedTime,
          status: "preparing", // already being prepared
          acceptedAt: serverTimestamp(),
          estimatedReadyAt: requestedTime,
          estimatedMinutes: pickupMinutes,
          items: lines.map((l) => ({
            itemId: l.itemId,
            name: l.name,
            qty: l.qty,
            unitPrice: l.basePrice,
            size: l.size ?? null,
            sauce: l.sauce ?? null,
            extras: l.extras,
            removed: [],
            note: l.note,
            lineTotal: linePrice(l),
          })),
          subtotal: total,
          deliveryFee,
          total: grandTotal,
          customer: {
            name: name.trim(),
            phone: phone.trim(),
            email: "",
            note: note.trim(),
            address: mode === "delivery" ? address.trim() : "",
            postcode: mode === "delivery" ? postcode.trim() : "",
            city: mode === "delivery" ? city.trim() : "",
          },
          paymentMethod,
          // Medewerker die de bestelling heeft aangenomen
          takenBy: {
            uid: staffUid,
            name: staffName,
            at: new Date().toISOString(),
          },
          enteredBy: staffUid,
          statusHistory: [
            { status: "new", at: new Date().toISOString(), by: staffUid },
            { status: "preparing", at: new Date().toISOString(), by: staffUid },
          ],
        },
      );
      router.replace(`/orders?focus=${ref.id}`);
    } catch (e) {
      setError((e as Error).message ?? "Er ging iets mis.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredItems = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    if (q) return menuItems.filter((i) => i.name.toLowerCase().includes(q));
    return menuItems.filter((i) => i.categoryId === activeCat);
  }, [search, activeCat]);

  const itemCount = lines.reduce((n, l) => n + l.qty, 0);

  return (
    <>
      <StaffShell
        title="Kassa"
        subtitle={step === "items" ? `${itemCount} ${itemCount === 1 ? "gerecht" : "gerechten"} · ${fmt(total)}` : step === "customer" ? "Klantgegevens" : "Bevestigen"}
        backHref={step === "items" ? "/" : undefined}
        rightAction={
          step !== "items" ? (
            <button
              onClick={() => setStep(step === "review" ? "customer" : "items")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-cream/80 hover:bg-white/[0.05]"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : undefined
        }
      >

        {step === "items" && (
          <>
            {/* Sticky category + search */}
            <div
              className="sticky z-20 bg-ink/95 backdrop-blur-xl border-b border-white/[0.06]"
              style={{ top: "calc(env(safe-area-inset-top) + 64px)" }}
            >
              <div className="px-4 pt-3">
                <div className="relative mb-3">
                  <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-cream/35" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Zoek gerecht…"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-11 pr-4 py-2.5 text-[14px] text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/60"
                  />
                </div>
              </div>
              {!search && (
                <div className="scrollbar-hide overflow-x-auto px-4 pb-3">
                  <nav className="flex gap-1.5 w-max">
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setActiveCat(c.id)}
                        className={cn(
                          "shrink-0 px-3.5 h-8 rounded-full text-[12px] font-medium whitespace-nowrap transition-all",
                          activeCat === c.id ? "bg-gold text-ink" : "text-cream/55 hover:text-cream hover:bg-white/[0.04]",
                        )}
                      >
                        {c.name}
                      </button>
                    ))}
                  </nav>
                </div>
              )}
            </div>

            {/* Item list */}
            <div className="px-4 py-4 pb-32 space-y-2">
              {filteredItems.length === 0 ? (
                <p className="text-center text-cream/40 py-12 text-[13px]">Geen gerechten gevonden.</p>
              ) : (
                filteredItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setOpenItem(item)}
                    className="w-full text-left bg-card/60 hover:bg-card border border-white/[0.06] hover:border-gold/30 rounded-2xl p-3 transition-all active:scale-[0.99] flex items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-cream text-[14px] truncate">{item.name}</p>
                      <p className="text-[11px] text-cream/45 line-clamp-1">{item.description}</p>
                    </div>
                    <span className="font-display font-semibold text-gold tabular-nums text-[14px] shrink-0">
                      {fmt(item.price)}
                    </span>
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gold text-ink shrink-0">
                      <Plus className="h-4 w-4" strokeWidth={2.5} />
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Sticky cart preview */}
            {lines.length > 0 && (
              <div
                className="fixed inset-x-0 z-30 bg-ink/95 backdrop-blur-2xl border-t border-white/[0.06]"
                style={{ bottom: "calc(env(safe-area-inset-bottom) + 64px)" }}
              >
                <div className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-cream/55">
                        {itemCount} {itemCount === 1 ? "gerecht" : "gerechten"}
                      </p>
                      <p className="font-display font-bold text-gold text-xl tabular-nums">{fmt(total)}</p>
                    </div>
                    <button
                      onClick={() => setStep("customer")}
                      className="inline-flex items-center gap-2 h-12 px-5 rounded-full bg-gold text-ink text-[13px] font-bold hover:bg-gold-soft active:scale-[0.97] transition-all"
                    >
                      Verder
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Quick item list */}
                  <div className="mt-3 max-h-32 overflow-y-auto space-y-1 -mx-1 px-1">
                    {lines.map((l) => (
                      <div key={l.uid} className="flex items-center gap-2 text-[12px]">
                        <div className="flex items-center gap-1 bg-white/[0.04] rounded-full">
                          <button
                            onClick={() => decLine(l.uid)}
                            className="inline-flex h-6 w-6 items-center justify-center text-cream/60 hover:text-cream"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-4 text-center font-semibold text-cream tabular-nums">{l.qty}</span>
                          <button
                            onClick={() => incLine(l.uid)}
                            className="inline-flex h-6 w-6 items-center justify-center text-cream/60 hover:text-cream"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="flex-1 text-cream/75 truncate">{l.name}</span>
                        <span className="text-gold tabular-nums font-semibold">{fmt(linePrice(l))}</span>
                        <button
                          onClick={() => removeLine(l.uid)}
                          className="text-cream/30 hover:text-red-400"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {step === "customer" && (
          <div className="px-4 space-y-5">

            {/* Channel: phone / walkin */}
            <section>
              <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-cream/60 mb-2">Hoe is de bestelling binnengekomen?</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setChannel("phone")}
                  className={cn(
                    "h-14 rounded-2xl border text-[14px] font-semibold transition-all flex items-center justify-center gap-2",
                    channel === "phone" ? "bg-gold/10 border-gold/40 text-gold" : "bg-white/[0.03] border-white/[0.07] text-cream/65",
                  )}
                >
                  <Phone className="h-4 w-4" /> Telefoon
                </button>
                <button
                  onClick={() => setChannel("walkin")}
                  className={cn(
                    "h-14 rounded-2xl border text-[14px] font-semibold transition-all flex items-center justify-center gap-2",
                    channel === "walkin" ? "bg-gold/10 border-gold/40 text-gold" : "bg-white/[0.03] border-white/[0.07] text-cream/65",
                  )}
                >
                  <ShoppingBag className="h-4 w-4" /> Walk-in
                </button>
              </div>
              {/* Show which staff is taking it */}
              <p className="mt-2 text-[11px] text-cream/45 px-1">
                Wordt aangenomen door <span className="text-gold font-semibold">{user?.displayName ?? user?.email ?? "—"}</span>
              </p>
            </section>

            {/* Mode picker */}
            <section>
              <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-cream/60 mb-2">Afhalen of bezorgen?</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMode("pickup")}
                  className={cn(
                    "h-14 rounded-2xl border text-[14px] font-semibold transition-all flex items-center justify-center gap-2",
                    mode === "pickup" ? "bg-gold/10 border-gold/40 text-gold" : "bg-white/[0.03] border-white/[0.07] text-cream/65",
                  )}
                >
                  <ShoppingBag className="h-4 w-4" /> Afhalen
                </button>
                <button
                  onClick={() => setMode("delivery")}
                  className={cn(
                    "h-14 rounded-2xl border text-[14px] font-semibold transition-all flex items-center justify-center gap-2",
                    mode === "delivery" ? "bg-gold/10 border-gold/40 text-gold" : "bg-white/[0.03] border-white/[0.07] text-cream/65",
                  )}
                >
                  <Truck className="h-4 w-4" /> Bezorgen
                </button>
              </div>
            </section>

            {/* Time */}
            <section>
              <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-cream/60 mb-2">
                Klaar in
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[15, 30, 45, 60].map((m) => (
                  <button
                    key={m}
                    onClick={() => setPickupMinutes(m)}
                    className={cn(
                      "h-12 rounded-xl border text-[13px] font-semibold transition-all",
                      pickupMinutes === m ? "bg-gold/10 border-gold/40 text-gold" : "bg-white/[0.03] border-white/[0.07] text-cream/65",
                    )}
                  >
                    {m} min
                  </button>
                ))}
              </div>
            </section>

            {/* Name — for phone orders this is leidend in the order overview */}
            <section>
              <label className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-cream/60 mb-2">
                Naam {channel === "phone" && <span className="text-gold ml-1">verplicht</span>}
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={channel === "phone" ? "Naam van de beller" : "Naam (optioneel)"}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-[14px] text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/60"
              />
            </section>

            {/* Phone */}
            <section>
              <label className="text-[11px] uppercase tracking-[0.18em] font-semibold text-cream/60 mb-2 flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" /> Telefoon
                {channel === "phone" && <span className="text-gold ml-1">verplicht</span>}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={channel === "walkin" ? "06-12345678 (optioneel)" : "06-12345678"}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-[14px] text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/60"
              />
              {customerResults.length > 0 && (
                <div className="mt-2 bg-card/60 border border-gold/30 rounded-xl divide-y divide-white/[0.06]">
                  {customerResults.map((c) => (
                    <button
                      key={c.uid}
                      onClick={() => useCustomer(c)}
                      className="w-full text-left px-4 py-3 hover:bg-gold/[0.05] transition-colors first:rounded-t-xl last:rounded-b-xl"
                    >
                      <div className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-gold" />
                        <p className="text-[13px] font-medium text-cream">{c.name}</p>
                      </div>
                      <p className="text-[11px] text-cream/50">{c.email}</p>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {mode === "delivery" && (
              <>
                <section>
                  <label className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-cream/60 mb-2">Adres</label>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Straat + huisnummer"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-[14px] text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/60"
                  />
                </section>
                <section className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-cream/60 mb-2">Postcode</label>
                    <input
                      value={postcode}
                      onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                      placeholder="6161 EG"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-[14px] text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/60"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-cream/60 mb-2">Plaats</label>
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-[14px] text-cream focus:outline-none focus:border-gold/60"
                    />
                  </div>
                </section>
              </>
            )}

            <section>
              <label className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-cream/60 mb-2">Notitie</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Bv. zonder ui / extra knapperig"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-[13px] text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/60 resize-none"
              />
            </section>

            <section>
              <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-cream/60 mb-2">Betaling</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMethod("cash")}
                  className={cn(
                    "h-12 rounded-xl border text-[13px] font-semibold transition-all",
                    paymentMethod === "cash" ? "bg-gold/10 border-gold/40 text-gold" : "bg-white/[0.03] border-white/[0.07] text-cream/65",
                  )}
                >
                  Contant
                </button>
                <button
                  onClick={() => setPaymentMethod("pin_on_pickup")}
                  className={cn(
                    "h-12 rounded-xl border text-[13px] font-semibold transition-all",
                    paymentMethod === "pin_on_pickup" ? "bg-gold/10 border-gold/40 text-gold" : "bg-white/[0.03] border-white/[0.07] text-cream/65",
                  )}
                >
                  PIN
                </button>
              </div>
            </section>

            <button
              onClick={() => setStep("review")}
              disabled={
                (channel === "phone" && (!name.trim() || !phone.trim())) ||
                (mode === "delivery" && (!address || !postcode))
              }
              className="w-full h-13 rounded-2xl bg-gold text-ink font-bold text-[14px] hover:bg-gold-soft active:scale-[0.99] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              Naar overzicht
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {step === "review" && (
          <div className="px-4 space-y-4">

            <section className="bg-card/60 border border-white/[0.07] rounded-2xl p-5">
              <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-cream/45 mb-3">Bestelling</p>
              <ul className="space-y-2 divide-y divide-white/[0.05]">
                {lines.map((l) => {
                  const meta = [l.size, l.sauce, ...l.extras.map((e) => e.name)].filter(Boolean);
                  return (
                    <li key={l.uid} className="pt-2 first:pt-0">
                      <div className="flex items-baseline justify-between">
                        <p className="text-[14px] text-cream"><span className="text-gold font-semibold mr-1.5">{l.qty}×</span>{l.name}</p>
                        <p className="text-gold font-semibold tabular-nums text-[13px]">{fmt(linePrice(l))}</p>
                      </div>
                      {meta.length > 0 && <p className="text-[11px] text-cream/50 ml-7">{meta.join(" · ")}</p>}
                      {l.note && <p className="text-[11px] text-amber-300/80 italic ml-7">"{l.note}"</p>}
                    </li>
                  );
                })}
              </ul>
              <div className="mt-4 pt-3 border-t border-white/[0.06] space-y-1 text-[13px]">
                <div className="flex justify-between text-cream/65">
                  <span>Subtotaal</span><span className="tabular-nums">{fmt(total)}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-cream/65">
                    <span>Bezorgkosten</span><span className="tabular-nums">{fmt(deliveryFee)}</span>
                  </div>
                )}
                <div className="flex items-baseline justify-between pt-2 border-t border-white/[0.06]">
                  <span className="text-[12px] uppercase tracking-wider font-semibold text-cream/70">Totaal</span>
                  <span className="font-display text-2xl text-gold font-bold tabular-nums">{fmt(grandTotal)}</span>
                </div>
              </div>
            </section>

            <section className="bg-card/60 border border-white/[0.07] rounded-2xl p-5 space-y-1.5 text-[13px]">
              <Row label="Kanaal" value={channel === "phone" ? "Telefonisch" : "Walk-in"} />
              <Row label="Klant" value={name.trim() || (channel === "walkin" ? "Walk-in klant" : "—")} />
              {phone && <Row label="Telefoon" value={phone} />}
              {mode === "delivery" && <Row label="Adres" value={`${address}, ${postcode} ${city}`} />}
              <Row label="Type" value={mode === "pickup" ? `Afhalen ~ ${pickupMinutes}min` : `Bezorgen ~ ${pickupMinutes}min`} />
              <Row label="Betaling" value={paymentMethod === "cash" ? "Contant" : "PIN"} />
              <Row label="Aangenomen door" value={user?.displayName ?? user?.email ?? "—"} gold />
            </section>

            {error && (
              <p className="text-[12px] text-red-400 bg-red-400/[0.07] border border-red-400/20 rounded-xl px-4 py-3">{error}</p>
            )}

            <button
              onClick={submitOrder}
              disabled={
                submitting ||
                lines.length === 0 ||
                (channel === "phone" && (!name.trim() || !phone.trim()))
              }
              className="w-full h-14 rounded-2xl bg-gold text-ink font-bold text-[15px] hover:bg-gold-soft active:scale-[0.99] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              {submitting ? "Plaatsen…" : `Bestelling plaatsen · ${fmt(grandTotal)}`}
            </button>
          </div>
        )}
      </StaffShell>

      {/* Item picker modal */}
      {openItem && (
        <ItemPickerModal
          item={openItem}
          onClose={() => setOpenItem(null)}
          onAdd={(line) => {
            addLine(line);
            setOpenItem(null);
          }}
        />
      )}
    </>
  );
}

function Row({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="text-[11px] uppercase tracking-wider font-semibold text-cream/45 shrink-0">{label}</span>
      <span className={cn("text-right truncate", gold ? "text-gold font-semibold" : "text-cream")}>{value}</span>
    </div>
  );
}

function ItemPickerModal({
  item, onClose, onAdd,
}: {
  item: MenuItem;
  onClose: () => void;
  onAdd: (line: Omit<KassaLine, "uid">) => void;
}) {
  const [qty, setQty] = React.useState(1);
  const [size, setSize] = React.useState<string | undefined>(categorySizes[item.categoryId]?.[0]);
  const [sauce, setSauce] = React.useState<string | undefined>();
  const [extras, setExtras] = React.useState<{ name: string; price: number }[]>([]);
  const [note, setNote] = React.useState("");

  const extrasList = categoryExtras[item.categoryId] ?? [];
  const sauceList = categorySauces[item.categoryId] ?? [];
  const sizeList = categorySizes[item.categoryId] ?? [];
  const sauceRequired = sauceList.length > 0;

  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const extraTotal = extras.reduce((s, e) => s + e.price, 0);
  const total = (item.price + extraTotal) * qty;
  const isValid = !sauceRequired || sauce !== undefined;

  const toggleExtra = (e: { name: string; price: number }) =>
    setExtras((c) => (c.some((x) => x.name === e.name) ? c.filter((x) => x.name !== e.name) : [...c, e]));

  return (
    <div className="fixed inset-0 z-[70] flex flex-col justify-end bg-ink/80 backdrop-blur-md" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full rounded-t-3xl bg-ink border-t border-white/[0.08] shadow-2xl flex flex-col"
        style={{ maxHeight: "calc(92svh - env(safe-area-inset-top))" }}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0"><span className="h-1 w-10 rounded-full bg-white/15" /></div>

        <div className="px-5 pt-1 pb-4 border-b border-white/[0.06] shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-xl italic text-cream">{item.name}</h3>
              <p className="text-[12px] text-cream/55 mt-0.5 line-clamp-2">{item.description}</p>
            </div>
            <button onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] text-cream/60 shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="font-display text-xl tabular-nums text-gold font-bold mt-2">{fmt(item.price)}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {sizeList.length > 0 && (
            <Section label="Pasta" required>
              <div className="grid grid-cols-2 gap-2">
                {sizeList.map((s) => (
                  <Choice key={s} label={s} selected={size === s} onClick={() => setSize(s)} />
                ))}
              </div>
            </Section>
          )}
          {sauceList.length > 0 && (
            <Section label="Saus" required>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {sauceList.map((s) => (
                  <Choice key={s} label={s} selected={sauce === s} onClick={() => setSauce(s)} />
                ))}
              </div>
            </Section>
          )}
          {extrasList.length > 0 && (
            <Section label="Extra's">
              <div className="grid grid-cols-1 gap-2">
                {extrasList.map((e) => {
                  const checked = extras.some((x) => x.name === e.name);
                  return (
                    <button
                      key={e.name}
                      type="button"
                      onClick={() => toggleExtra(e)}
                      className={cn(
                        "flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border text-left transition-colors",
                        checked ? "border-gold bg-gold/10 text-cream" : "border-white/[0.08] bg-white/[0.02] text-cream/80",
                      )}
                    >
                      <span className="flex items-center gap-2 text-[13px]">
                        <span className={cn("inline-flex h-4 w-4 items-center justify-center rounded-md border", checked ? "border-gold bg-gold" : "border-white/30")}>
                          {checked && <Check className="h-3 w-3 text-ink" strokeWidth={3} />}
                        </span>
                        {e.name}
                      </span>
                      <span className={cn("text-[12px] tabular-nums font-medium", checked ? "text-gold" : "text-cream/45")}>+{fmt(e.price)}</span>
                    </button>
                  );
                })}
              </div>
            </Section>
          )}
          <Section label="Notitie">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Bv. extra knapperig"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-[13px] text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/60 resize-none"
            />
          </Section>
        </div>

        <div className="shrink-0 border-t border-white/[0.06] bg-ink/95 backdrop-blur-xl px-4 py-3 flex items-center gap-3" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}>
          <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-full p-1">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-cream/80">
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-7 text-center font-bold tabular-nums text-cream">{qty}</span>
            <button onClick={() => setQty(qty + 1)} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-cream/80">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            disabled={!isValid}
            onClick={() => onAdd({
              itemId: item.id,
              name: item.name,
              basePrice: item.price,
              qty,
              size,
              sauce,
              extras,
              note,
            })}
            className="flex-1 h-12 rounded-full bg-gold text-ink font-bold text-[14px] hover:bg-gold-soft active:scale-[0.98] transition-all disabled:opacity-40"
          >
            {isValid ? `Toevoegen · ${fmt(total)}` : "Kies eerst saus"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.18em] font-semibold text-cream/60 mb-2">
        {label}{required && <span className="text-gold ml-1.5">verplicht</span>}
      </p>
      {children}
    </div>
  );
}

function Choice({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-2.5 rounded-xl border text-[13px] font-medium text-left transition-colors",
        selected ? "border-gold bg-gold/10 text-cream" : "border-white/[0.08] bg-white/[0.02] text-cream/75",
      )}
    >
      {label}
    </button>
  );
}
