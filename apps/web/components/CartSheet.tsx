"use client";
import * as React from "react";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, UtensilsCrossed } from "lucide-react";
import { useSimpleCart, linePrice, cartTotal, type SimpleCartLine } from "@/lib/simpleCart";

const fmt = (v: number) => `€${v.toFixed(2).replace(".", ",")}`;

export function CartSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lines, inc, dec, remove } = useSimpleCart();
  const total = cartTotal(lines);
  const count = lines.reduce((n, l) => n + l.qty, 0);

  // Lock body scroll when open
  React.useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end lg:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="relative w-full rounded-t-3xl bg-ink border-t border-line/[0.08] shadow-2xl flex flex-col"
        style={{ maxHeight: "calc(85svh - env(safe-area-inset-top))" }}
      >
        {/* Grab handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <span className="h-1 w-10 rounded-full bg-line/15" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-1 pb-4 border-b border-line/[0.06] shrink-0">
          <div>
            <h2 className="font-display text-2xl font-medium italic text-cream">Bestelling</h2>
            {count > 0 && (
              <p className="text-[12px] text-cream/50 mt-0.5">
                {count} {count === 1 ? "gerecht" : "gerechten"}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-line/[0.05] text-cream/60 hover:text-cream transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        {lines.length === 0 ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 gap-5">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-line/[0.04] border border-line/[0.07]">
              <ShoppingBag className="h-7 w-7 text-cream/30" />
            </div>
            <div>
              <p className="font-display text-xl italic text-cream/70">Nog niks besteld.</p>
              <p className="text-[13px] text-cream/45 mt-1">Voeg gerechten toe vanuit het menu.</p>
            </div>
            <Link
              href="/menukaart"
              onClick={onClose}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-gold text-ink text-[13px] font-semibold hover:bg-gold-soft active:scale-[0.98] transition-all"
            >
              <UtensilsCrossed className="h-4 w-4" />
              Ga naar menu
            </Link>
          </div>
        ) : (
          <>
            {/* Cart lines */}
            <ul className="flex-1 overflow-y-auto px-5 py-4 space-y-1 divide-y divide-line/[0.05]">
              {lines.map((l) => (
                <CartLine
                  key={l.uid}
                  line={l}
                  onInc={() => inc(l.uid)}
                  onDec={() => dec(l.uid)}
                  onRemove={() => remove(l.uid)}
                />
              ))}
            </ul>

            {/* Footer CTA */}
            <div className="shrink-0 border-t border-line/[0.06] px-5 py-4 pb-[max(env(safe-area-inset-bottom),16px)]">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-[13px] text-cream/55 uppercase tracking-wider font-medium">Totaal</span>
                <span className="font-display text-2xl text-gold font-semibold tabular-nums">{fmt(total)}</span>
              </div>
              <Link
                href="/bestellen"
                onClick={onClose}
                className="flex items-center justify-between w-full h-13 bg-gold text-ink rounded-full pl-6 pr-2 hover:bg-gold-soft active:scale-[0.98] transition-all"
              >
                <span className="text-[14px] font-semibold">Doorgaan naar bestellen</span>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink/15">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CartLine({ line, onInc, onDec, onRemove }: {
  line: SimpleCartLine;
  onInc: () => void;
  onDec: () => void;
  onRemove: () => void;
}) {
  const meta = [line.size, line.sauce, ...((line.extras ?? []).map((e) => e.name))].filter(Boolean);
  return (
    <li className="py-3 first:pt-1 last:pb-1">
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-[15px] font-medium text-cream leading-snug">{line.name}</p>
            <p className="font-semibold text-gold text-[15px] tabular-nums shrink-0">{fmt(linePrice(line))}</p>
          </div>
          {meta.length > 0 && (
            <p className="text-[11px] text-cream/45 mt-0.5">{meta.join(" · ")}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={onDec}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-line/[0.05] text-cream/60 hover:bg-line/[0.09] active:scale-95 transition-all"
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="text-[13px] font-semibold tabular-nums text-cream w-5 text-center">{line.qty}</span>
        <button
          onClick={onInc}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-line/[0.05] text-cream/60 hover:bg-line/[0.09] active:scale-95 transition-all"
        >
          <Plus className="h-3 w-3" />
        </button>
        <button
          onClick={onRemove}
          className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-full text-cream/25 hover:text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
}
