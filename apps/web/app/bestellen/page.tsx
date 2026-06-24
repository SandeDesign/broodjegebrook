"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSimpleCart, linePrice, cartTotal, type SimpleCartLine } from "@/lib/simpleCart";
import { cn } from "@eufraat/ui";
import { SEED_RESTAURANT } from "@eufraat/schemas/seed-data";
import { generateSlots } from "@eufraat/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, RESTAURANT_ID } from "@/lib/firebase";
import { usePromoCode, calcDiscount, consumePromo, PROMO_MESSAGES } from "@/lib/usePromoCode";
import { Truck, ShoppingBag, Trash2, Plus, Minus, ArrowRight, ChevronLeft, Check, Tag, X as XIcon } from "lucide-react";

const fmt = (v: number) => `€${v.toFixed(2).replace(".", ",")}`;

type Step = "mode" | "details" | "review";

export default function BestellenPage() {
  const router = useRouter();
  const { lines, inc, dec, remove, clear } = useSimpleCart();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const [mode, setMode] = React.useState<"pickup" | "delivery">("pickup");
  const [postcode, setPostcode] = React.useState("");
  const [requestedTimeIso, setTime] = React.useState<string | null>(null);
  const [step, setStep] = React.useState<Step>("mode");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [contact, setContact] = React.useState({
    name: "", phone: "", email: "", address: "", city: "Geleen", note: "",
  });

  const total = cartTotal(lines);
  const pcPrefix = postcode.replace(/\s/g, "").substring(0, 4);
  const zone = SEED_RESTAURANT.deliveryZones.find((z) => z.postcodePrefix === pcPrefix);
  const deliveryFee = mode === "delivery" && zone ? zone.fee : 0;
  const minOrder = mode === "delivery" && zone ? zone.minOrder : 0;

  // Promo code
  const { promo, error: promoError, validating: promoValidating, validate: validatePromo, clear: clearPromo } = usePromoCode();
  const [promoInput, setPromoInput] = React.useState("");
  const discount = promo ? calcDiscount(promo, total) : 0;
  const grandTotal = Math.max(0, total - discount + deliveryFee);
  const meetsMin = total >= minOrder;

  const slots = React.useMemo(() => {
    if (!mode) return [];
    return generateSlots(SEED_RESTAURANT.openingHours, mode, new Date(), SEED_RESTAURANT.prepTimeMinutes);
  }, [mode]);

  React.useEffect(() => {
    if (!requestedTimeIso && slots[0]) setTime(slots[0].toISOString());
  }, [slots, requestedTimeIso]);

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const ordersRef = collection(db(), "restaurants", RESTAURANT_ID, "orders");
      const ref = await addDoc(ordersRef, {
        createdAt: serverTimestamp(),
        source: "web",
        mode,
        requestedTime: requestedTimeIso ? new Date(requestedTimeIso) : null,
        status: "new",
        items: lines.map((l) => ({
          itemId: l.itemId ?? "",
          name: l.name ?? "",
          qty: l.qty ?? 1,
          unitPrice: l.basePrice ?? 0,
          size: l.size ?? null,
          sauce: l.sauce ?? null,
          extras: l.extras ?? [],
          removed: l.removed ?? [],
          note: l.note ?? "",
          lineTotal: linePrice(l) ?? 0,
        })),
        subtotal: total,
        deliveryFee,
        discount,
        promoCode: promo?.code ?? "",
        promoId: promo?.id ?? "",
        total: grandTotal,
        customer: {
          name: contact.name ?? "",
          phone: contact.phone ?? "",
          email: contact.email ?? "",
          note: contact.note ?? "",
          address: mode === "delivery" ? (contact.address ?? "") : "",
          postcode: mode === "delivery" ? (postcode ?? "") : "",
          city: mode === "delivery" ? (contact.city ?? "") : "",
        },
        paymentMethod: "pin_on_pickup",
      });
      if (promo?.id) await consumePromo(promo.id);
      clear();
      router.push(`/order/${ref.id}`);
    } catch (err) {
      setError((err as Error).message ?? "Er ging iets mis. Probeer opnieuw.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  if (lines.length === 0) {
    return (
      <div className="min-h-[100svh] flex items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-card/60 border border-line/[0.06] mb-6">
            <ShoppingBag className="h-7 w-7 text-cream/40" />
          </div>
          <h1 className="font-display text-4xl font-medium italic text-cream mb-3 tracking-[-0.02em]">Je mand is leeg.</h1>
          <p className="text-cream/55 text-sm mb-8 leading-relaxed">Voeg eerst gerechten toe vanuit de menukaart om te bestellen.</p>
          <Link
            href="/menukaart"
            className="inline-flex items-center gap-2 rounded-full bg-gold text-ink h-12 px-7 text-[14px] font-semibold hover:bg-gold-soft active:scale-[0.98] transition-all"
          >
            Naar menukaart <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const stepIndex: Record<Step, number> = { mode: 0, details: 1, review: 2 };
  const currentIdx = stepIndex[step];
  const stepLabels = ["Bezorging", "Gegevens", "Overzicht"];

  return (
    <div className="min-h-screen pt-20 pb-40 sm:pb-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-8 lg:px-12">

        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <h1 className="font-display text-[14vw] sm:text-6xl lg:text-7xl font-medium italic leading-[0.9] tracking-[-0.04em] text-cream">
            Bestellen<span className="text-gold">.</span>
          </h1>
        </div>

        {/* Progress — minimal */}
        <div className="flex items-center gap-2 mb-8">
          {(["mode", "details", "review"] as Step[]).map((s, i) => (
            <React.Fragment key={s}>
              <button
                onClick={() => i < currentIdx && setStep(s)}
                disabled={i > currentIdx}
                className={cn(
                  "inline-flex items-center gap-2 text-[12px] font-medium transition-colors",
                  i === currentIdx ? "text-gold" : i < currentIdx ? "text-cream/60 hover:text-cream" : "text-cream/25 cursor-default"
                )}
              >
                <span className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold transition-colors",
                  i === currentIdx ? "bg-gold text-ink" :
                  i < currentIdx ? "bg-line/[0.06] text-cream/70" : "border border-line/15 text-cream/30"
                )}>
                  {i < currentIdx ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
                </span>
                <span className="hidden sm:inline">{stepLabels[i]}</span>
              </button>
              {i < 2 && <span className={cn("h-px flex-1 max-w-12 transition-colors", i < currentIdx ? "bg-gold/40" : "bg-line/[0.08]")} />}
            </React.Fragment>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

          {/* LEFT — steps */}
          <div>
            {step === "mode" && (
              <div className="space-y-8">
                <section>
                  <h2 className="text-[14px] font-semibold uppercase tracking-[0.12em] text-cream/90 mb-4">Hoe bestel je?</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <ModeCard
                      active={mode === "pickup"}
                      onClick={() => setMode("pickup")}
                      icon={<ShoppingBag className="h-5 w-5" />}
                      title="Afhalen"
                      desc="Gratis"
                    />
                    <ModeCard
                      active={mode === "delivery"}
                      onClick={() => setMode("delivery")}
                      icon={<Truck className="h-5 w-5" />}
                      title="Bezorgen"
                      desc="Vanaf €2"
                    />
                  </div>

                  {mode === "delivery" && (
                    <div className="mt-4">
                      <label className="block text-[12px] font-medium text-cream/70 mb-2">Postcode</label>
                      <input
                        value={postcode}
                        onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                        placeholder="6161 EG"
                        className="w-full bg-line/[0.03] border border-line/[0.08] rounded-xl px-4 py-3.5 text-base text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold/60 focus:bg-line/[0.05] transition-colors"
                      />
                      {zone ? (
                        <p className="mt-2 text-[12px] text-cream/60">
                          Bezorgkosten <span className="text-gold font-medium">{fmt(zone.fee)}</span> · Min. <span className="text-gold font-medium">{fmt(zone.minOrder)}</span>
                        </p>
                      ) : pcPrefix.length >= 4 ? (
                        <p className="mt-2 text-[12px] text-red-400">Buiten bezorggebied. Kies afhalen.</p>
                      ) : null}
                    </div>
                  )}
                </section>

                {slots.length > 0 && (
                  <section>
                    <h2 className="text-[14px] font-semibold uppercase tracking-[0.12em] text-cream/90 mb-4">Wanneer?</h2>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {slots.slice(0, 20).map((slot) => {
                        const iso = slot.toISOString();
                        return (
                          <button
                            key={iso}
                            type="button"
                            onClick={() => setTime(iso)}
                            className={cn(
                              "py-3 rounded-xl text-[13px] font-medium tabular-nums transition-colors",
                              requestedTimeIso === iso
                                ? "bg-gold text-ink"
                                : "bg-line/[0.03] text-cream/70 hover:bg-line/[0.06] hover:text-cream"
                            )}
                          >
                            {slot.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}

                {slots.length === 0 && (
                  <p className="rounded-xl bg-red-400/[0.08] border border-red-400/20 p-4 text-sm text-red-300">
                    We zijn momenteel gesloten. Bel ons op 046 410 67 45.
                  </p>
                )}

                <button
                  onClick={() => setStep("details")}
                  disabled={mode === "delivery" && !zone}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gold text-ink rounded-full h-12 px-7 text-[14px] font-semibold hover:bg-gold-soft active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Verder <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {step === "details" && (
              <div className="space-y-6">
                <h2 className="text-[14px] font-semibold uppercase tracking-[0.12em] text-cream/90">Jouw gegevens</h2>
                <div className="space-y-4">
                  <DarkField label="Naam" value={contact.name} onChange={(v) => setContact({ ...contact, name: v })} required />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <DarkField label="Telefoon" type="tel" value={contact.phone} onChange={(v) => setContact({ ...contact, phone: v })} required />
                    <DarkField label="E-mail" type="email" value={contact.email} onChange={(v) => setContact({ ...contact, email: v })} required />
                  </div>
                  {mode === "delivery" && (
                    <>
                      <DarkField label="Straat + huisnummer" value={contact.address} onChange={(v) => setContact({ ...contact, address: v })} required />
                      <DarkField label="Plaats" value={contact.city} onChange={(v) => setContact({ ...contact, city: v })} />
                    </>
                  )}
                  <div>
                    <label className="block text-[12px] font-medium text-cream/70 mb-2">Opmerking</label>
                    <textarea
                      value={contact.note}
                      onChange={(e) => setContact({ ...contact, note: e.target.value })}
                      rows={2}
                      placeholder="Bv. aanbellen 2×"
                      className="w-full bg-line/[0.03] border border-line/[0.08] rounded-xl px-4 py-3 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold/60 focus:bg-line/[0.05] transition-colors resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button onClick={() => setStep("mode")} className="inline-flex items-center gap-1 text-[13px] text-cream/55 hover:text-cream transition-colors">
                    <ChevronLeft className="h-4 w-4" /> Terug
                  </button>
                  <button
                    onClick={() => setStep("review")}
                    disabled={!contact.name || !contact.phone || !contact.email || (mode === "delivery" && !contact.address)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-gold text-ink rounded-full h-12 px-7 text-[14px] font-semibold hover:bg-gold-soft active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Overzicht <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {step === "review" && (
              <div className="space-y-6">
                <h2 className="text-[14px] font-semibold uppercase tracking-[0.12em] text-cream/90">Controleer</h2>

                <div className="rounded-2xl bg-card/40 border border-line/[0.06] p-5 space-y-3">
                  <ReviewRow label="Methode" value={mode === "pickup" ? "Afhalen" : "Bezorgen"} />
                  <ReviewRow label="Tijd" value={requestedTimeIso ? new Date(requestedTimeIso).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }) : "—"} />
                  <ReviewRow label="Naam" value={contact.name} />
                  <ReviewRow label="Telefoon" value={contact.phone} />
                  {mode === "delivery" && <ReviewRow label="Adres" value={`${contact.address}, ${contact.city}`} />}
                  <ReviewRow label="Betaling" value={`Cash of PIN bij ${mode === "pickup" ? "afhalen" : "bezorging"}`} />
                </div>

                {error && (
                  <p className="rounded-xl bg-red-400/[0.08] border border-red-400/20 p-4 text-sm text-red-300">{error}</p>
                )}

                <div className="flex items-center gap-3">
                  <button onClick={() => setStep("details")} className="inline-flex items-center gap-1 text-[13px] text-cream/55 hover:text-cream transition-colors">
                    <ChevronLeft className="h-4 w-4" /> Terug
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || (mode === "delivery" && !meetsMin)}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-gold text-ink rounded-full h-12 px-6 text-[14px] font-semibold hover:bg-gold-soft active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Versturen…" : `Plaatsen · ${fmt(grandTotal)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — order summary */}
          <aside className="lg:sticky lg:top-24 lg:self-start order-first lg:order-last">
            <div className="rounded-2xl bg-card/40 border border-line/[0.06] p-5">
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-[14px] font-semibold uppercase tracking-[0.12em] text-cream/90">Bestelling</h2>
                <span className="text-[12px] text-cream/45 tabular-nums">{lines.length} {lines.length === 1 ? "item" : "items"}</span>
              </div>
              <ul className="space-y-3 divide-y divide-line/[0.05]">
                {lines.map((l) => (
                  <OrderLine key={l.uid} line={l} onInc={() => inc(l.uid)} onDec={() => dec(l.uid)} onRemove={() => remove(l.uid)} />
                ))}
              </ul>
              {/* Promo code */}
              <div className="mt-5 pt-4 border-t border-line/[0.06]">
                {promo ? (
                  <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-emerald-500/[0.07] border border-emerald-400/25">
                    <div className="flex items-center gap-2 min-w-0">
                      <Tag className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
                      <p className="text-[12px] font-mono text-emerald-200 truncate">{promo.code}</p>
                    </div>
                    <button
                      onClick={() => { clearPromo(); setPromoInput(""); }}
                      aria-label="Verwijder code"
                      className="text-emerald-200/60 hover:text-emerald-200"
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                        placeholder="Kortingscode"
                        className="flex-1 bg-line/[0.03] border border-line/[0.08] rounded-xl px-3 py-2 text-[12px] font-mono tracking-wider text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold/60"
                      />
                      <button
                        onClick={() => validatePromo(promoInput, total)}
                        disabled={!promoInput || promoValidating}
                        className="px-4 py-2 rounded-xl bg-gold/15 border border-gold/30 text-gold text-[12px] font-semibold hover:bg-gold/25 disabled:opacity-40 transition-colors"
                      >
                        {promoValidating ? "…" : "Pas toe"}
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-[11px] text-red-400/90 mt-1.5">{PROMO_MESSAGES[promoError]}</p>
                    )}
                  </>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-line/[0.06] space-y-2">
                <div className="flex justify-between text-[13px] text-cream/65">
                  <span>Subtotaal</span>
                  <span className="tabular-nums">{fmt(total)}</span>
                </div>
                {mode === "delivery" && (
                  <div className="flex justify-between text-[13px] text-cream/65">
                    <span>Bezorgkosten</span>
                    <span className="tabular-nums">{deliveryFee > 0 ? fmt(deliveryFee) : "—"}</span>
                  </div>
                )}
                {promo && discount > 0 && (
                  <div className="flex justify-between text-[13px] text-emerald-300">
                    <span>Korting <span className="font-mono">({promo.code})</span></span>
                    <span className="tabular-nums">− {fmt(discount)}</span>
                  </div>
                )}
                <div className="flex items-baseline justify-between pt-2 border-t border-line/[0.06]">
                  <span className="text-[13px] font-semibold text-cream/90 uppercase tracking-wider">Totaal</span>
                  <span className="font-display text-2xl text-gold font-semibold tabular-nums">{fmt(grandTotal)}</span>
                </div>
              </div>
              {!meetsMin && mode === "delivery" && zone && (
                <p className="mt-3 text-[12px] text-amber-300/90">
                  Nog {fmt(zone.minOrder - total)} nodig voor bezorging
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function OrderLine({ line, onInc, onDec, onRemove }: {
  line: SimpleCartLine;
  onInc: () => void;
  onDec: () => void;
  onRemove: () => void;
}) {
  const meta = [line.size, line.sauce, ...((line.extras ?? []).map((e) => e.name))].filter(Boolean);
  const removed = (line.removed ?? []).filter(Boolean);
  return (
    <li className="pt-3 first:pt-0">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-medium text-cream text-[14px] leading-tight flex-1">{line.name}</span>
        <span className="font-semibold text-gold text-[14px] tabular-nums shrink-0">{fmt(linePrice(line))}</span>
      </div>
      {meta.length > 0 && (
        <p className="mt-1 text-[11px] text-cream/50">{meta.join(" · ")}</p>
      )}
      {removed.length > 0 && (
        <p className="mt-0.5 text-[11px] text-orange-300/70">Zonder: {removed.join(", ")}</p>
      )}
      {line.note && (
        <p className="mt-0.5 text-[11px] italic text-cream/40">"{line.note}"</p>
      )}
      <div className="mt-2 flex items-center gap-1.5">
        <button onClick={onDec} className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-line/[0.04] text-cream/65 hover:bg-line/[0.08] hover:text-cream active:scale-95 transition-all">
          <Minus className="h-3 w-3" />
        </button>
        <span className="text-[12px] font-semibold tabular-nums text-cream w-5 text-center">{line.qty}</span>
        <button onClick={onInc} className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-line/[0.04] text-cream/65 hover:bg-line/[0.08] hover:text-cream active:scale-95 transition-all">
          <Plus className="h-3 w-3" />
        </button>
        <button onClick={onRemove} className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-full text-cream/30 hover:text-red-400 hover:bg-red-400/10 transition-colors">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-[13px]">
      <span className="text-cream/45 uppercase tracking-wider text-[11px] font-medium shrink-0">{label}</span>
      <span className="text-cream text-right">{value}</span>
    </div>
  );
}

function ModeCard({ active, onClick, icon, title, desc }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-3 rounded-2xl border p-5 text-left transition-all active:scale-[0.98]",
        active
          ? "border-gold bg-gold/10 text-cream"
          : "border-line/[0.08] bg-line/[0.02] text-cream/70 hover:border-line/20 hover:text-cream"
      )}
    >
      <span className={cn("inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors", active ? "bg-gold text-ink" : "bg-line/[0.06] text-cream/65")}>{icon}</span>
      <div>
        <div className="font-display text-xl font-medium italic">{title}</div>
        <div className="text-[12px] text-cream/55 mt-0.5">{desc}</div>
      </div>
    </button>
  );
}

function DarkField({ label, value, onChange, type = "text", required }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-cream/70 mb-2">
        {label}{required && <span className="text-gold ml-0.5">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-line/[0.03] border border-line/[0.08] rounded-xl px-4 py-3.5 text-base text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold/60 focus:bg-line/[0.05] transition-colors"
      />
    </div>
  );
}
