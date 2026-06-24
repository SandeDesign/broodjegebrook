"use client";
import * as React from "react";
import { X, Minus, Plus, Check } from "lucide-react";
import { type MenuItem, categoryExtras, categorySauces, categorySizes } from "@/data/menu";
import { useSimpleCart } from "@/lib/simpleCart";
import { cn } from "@eufraat/ui";

function parseIngredients(description: string): string[] {
  return description
    .split(/[,·]|\s+en\s+/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length < 30)
    .slice(0, 8);
}

const fmt = (cents: number) => `€${cents.toFixed(2).replace(".", ",")}`;

export function ItemModal({ item, onClose }: { item: MenuItem | null; onClose: () => void }) {
  const add = useSimpleCart((s) => s.add);
  const [qty, setQty] = React.useState(1);
  const [size, setSize] = React.useState<string | undefined>();
  const [sauces, setSauces] = React.useState<string[]>([]);
  const [extras, setExtras] = React.useState<{ name: string; price: number }[]>([]);
  const [removed, setRemoved] = React.useState<string[]>([]);
  const [note, setNote] = React.useState("");

  const extrasList = item ? categoryExtras[item.categoryId] ?? [] : [];
  const sauceList = item ? categorySauces[item.categoryId] ?? [] : [];
  const sizeList = item ? categorySizes[item.categoryId] ?? [] : [];
  const ingredients = item ? parseIngredients(item.description) : [];

  React.useEffect(() => {
    if (!item) return;
    setQty(1);
    setSize(categorySizes[item.categoryId]?.[0]);
    setSauces([]);
    setExtras([]);
    setRemoved([]);
    setNote("");
  }, [item]);

  React.useEffect(() => {
    if (!item) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [item]);

  if (!item) return null;

  const extraTotal = extras.reduce((s, e) => s + e.price, 0);
  const sauceTotal = sauces.length * 0.50;
  const unit = item.price + extraTotal + sauceTotal;
  const total = unit * qty;

  const toggleExtra = (e: { name: string; price: number }) => {
    setExtras((cur) => (cur.some((x) => x.name === e.name) ? cur.filter((x) => x.name !== e.name) : [...cur, e]));
  };

  const toggleSauce = (name: string) => {
    setSauces((cur) => cur.includes(name) ? cur.filter((s) => s !== name) : [...cur, name]);
  };

  const toggleRemoved = (i: string) => {
    setRemoved((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]));
  };

  const handleAdd = () => {
    const sauceExtras = sauces.map((s) => ({ name: s, price: 0.50 }));
    add({
      itemId: item.id, name: item.name, basePrice: item.price, qty,
      size, sauce: undefined, extras: [...extras, ...sauceExtras], removed, note,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-ink/80 backdrop-blur-md animate-in fade-in duration-200" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-2xl sm:h-auto sm:max-h-[88vh] overflow-hidden rounded-t-3xl sm:rounded-3xl bg-ink border-t sm:border border-line/10 shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300"
        style={{ maxHeight: "calc(92svh - env(safe-area-inset-top))" }}
      >
        {/* Mobile grab handle */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <span className="h-1 w-10 rounded-full bg-line/15" />
        </div>

        {/* Header */}
        <div className="relative px-5 sm:px-8 pt-3 sm:pt-7 pb-5 sm:pb-6 border-b border-line/[0.06]">
          <button onClick={onClose} aria-label="Sluiten" className="absolute top-3 sm:top-5 right-4 sm:right-5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-line/[0.06] text-cream/70 hover:text-cream hover:bg-line/10 transition-colors">
            <X className="h-4 w-4" />
          </button>
          <h2 className="font-display text-2xl sm:text-3xl font-medium italic text-cream tracking-[-0.02em] leading-[1.05] pr-12">
            {item.name}
          </h2>
          <p className="mt-2 text-[13px] sm:text-sm text-cream/55 leading-relaxed pr-12">{item.description}</p>
          <p className="mt-3 font-display text-2xl tabular-nums text-gold font-semibold">{fmt(item.price)}</p>
        </div>

        {/* Scrollable */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-5 sm:py-6 space-y-6">
          {/* Maat */}
          {sizeList.length > 0 && (
            <Section label="Pasta" required>
              <div className="grid grid-cols-2 gap-2">
                {sizeList.map((s) => (
                  <Choice key={s} label={s} selected={size === s} onClick={() => setSize(s)} />
                ))}
              </div>
            </Section>
          )}

          {/* Sauzen — optioneel, meerdere mogelijk */}
          {sauceList.length > 0 && (
            <Section label="Sauzen">
              <p className="text-[11px] text-cream/40 mb-3 -mt-1">+€0,50 per saus. Meerdere mogelijk</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {sauceList.map((s) => {
                  const checked = sauces.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSauce(s)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left text-sm transition-colors active:scale-[0.98]",
                        checked
                          ? "border-gold bg-gold/10 text-cream"
                          : "border-line/[0.08] bg-line/[0.02] text-cream/75 hover:border-line/25 hover:text-cream"
                      )}
                    >
                      <span className={cn("inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-md border", checked ? "border-gold bg-gold" : "border-line/30")}>
                        {checked && <Check className="h-3 w-3 text-ink" strokeWidth={3} />}
                      </span>
                      {s}
                    </button>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Extras */}
          {extrasList.length > 0 && (
            <Section label="Extra's">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {extrasList.map((e) => {
                  const checked = extras.some((x) => x.name === e.name);
                  return (
                    <button
                      key={e.name}
                      type="button"
                      onClick={() => toggleExtra(e)}
                      className={cn(
                        "flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-left transition-colors active:scale-[0.98]",
                        checked ? "border-gold bg-gold/10 text-cream" : "border-line/[0.08] bg-line/[0.02] text-cream/80 hover:border-line/20"
                      )}
                    >
                      <span className="flex items-center gap-2.5 text-sm">
                        <span className={cn("inline-flex h-4 w-4 items-center justify-center rounded-md border", checked ? "border-gold bg-gold" : "border-line/30")}>
                          {checked && <Check className="h-3 w-3 text-ink" strokeWidth={3} />}
                        </span>
                        {e.name}
                      </span>
                      <span className={cn("text-[12px] font-medium tabular-nums", checked ? "text-gold" : "text-cream/45")}>+{fmt(e.price)}</span>
                    </button>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Weghalen */}
          {ingredients.length > 0 && (
            <Section label="Weghalen">
              <div className="flex flex-wrap gap-2">
                {ingredients.map((i) => {
                  const checked = removed.includes(i);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleRemoved(i)}
                      className={cn(
                        "px-3 py-2 rounded-full text-xs font-medium border transition-colors active:scale-[0.96]",
                        checked
                          ? "border-orange-300/50 bg-orange-400/10 text-orange-200 line-through"
                          : "border-line/[0.1] bg-line/[0.02] text-cream/70 hover:border-line/25"
                      )}
                    >
                      {i}
                    </button>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Opmerking */}
          <Section label="Opmerking">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={200}
              placeholder="Bijv. extra knapperig"
              className="w-full bg-line/[0.03] border border-line/[0.08] rounded-xl px-4 py-3 text-sm text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold/60 focus:bg-line/[0.05] transition-colors resize-none"
            />
          </Section>
        </div>

        {/* Footer — sticky CTA */}
        <div className="border-t border-line/[0.06] bg-ink/95 backdrop-blur-xl px-4 sm:px-5 py-3 sm:py-4 pb-[max(env(safe-area-inset-bottom),12px)] flex items-center gap-3">
          <div className="flex items-center bg-line/[0.04] border border-line/[0.08] rounded-full p-1 shrink-0">
            <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Minder" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-cream/80 hover:text-cream active:bg-line/10">
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-7 text-center text-base font-semibold tabular-nums text-cream">{qty}</span>
            <button type="button" onClick={() => setQty(qty + 1)} aria-label="Meer" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-cream/80 hover:text-cream active:bg-line/10">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 inline-flex items-center justify-center h-12 rounded-full bg-gold text-ink text-[14px] font-semibold hover:bg-gold-soft active:scale-[0.98] transition-all"
          >
            Toevoegen · {fmt(total)}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cream/90">{label}</p>
        {required && <span className="text-[10px] uppercase tracking-wider text-gold">verplicht</span>}
      </div>
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
        "px-4 py-3 rounded-xl border text-sm font-medium text-left transition-colors active:scale-[0.98]",
        selected
          ? "border-gold bg-gold/10 text-cream"
          : "border-line/[0.08] bg-line/[0.02] text-cream/75 hover:border-line/25 hover:text-cream"
      )}
    >
      {label}
    </button>
  );
}
