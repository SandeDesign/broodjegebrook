"use client";
import * as React from "react";
import {
  collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc, deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, RESTAURANT_ID } from "@/lib/firebase";
import { StaffShell } from "@/components/StaffShell";
import {
  Plus, X, Tag, Trash2, Percent, BadgeEuro, Power, Copy, Check,
} from "lucide-react";
import { cn } from "@eufraat/ui";

interface Promotion {
  id: string;
  code: string;
  type: "percent" | "amount";
  value: number;
  minOrder?: number;
  validFrom?: { seconds: number } | null;
  validTo?: { seconds: number } | null;
  maxUses?: number;
  usedCount?: number;
  active: boolean;
  createdAt?: { seconds: number };
}

const fmt = (v: number) => `€${(v ?? 0).toFixed(2).replace(".", ",")}`;

export default function PromotiesPage() {
  const [promos, setPromos] = React.useState<Promotion[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [creatorOpen, setCreatorOpen] = React.useState(false);
  const [copied, setCopied] = React.useState<string | null>(null);

  React.useEffect(() => {
    const unsub = onSnapshot(
      query(
        collection(db(), "restaurants", RESTAURANT_ID, "promotions"),
        orderBy("createdAt", "desc"),
      ),
      (snap) => {
        setPromos(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
        setLoading(false);
      },
      () => setLoading(false),
    );
    return () => unsub();
  }, []);

  const toggleActive = async (p: Promotion) => {
    await updateDoc(
      doc(db(), "restaurants", RESTAURANT_ID, "promotions", p.id),
      { active: !p.active },
    );
  };

  const removePromo = async (p: Promotion) => {
    if (!confirm(`Verwijder code "${p.code}"?`)) return;
    await deleteDoc(doc(db(), "restaurants", RESTAURANT_ID, "promotions", p.id));
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  const active = promos.filter((p) => p.active);
  const inactive = promos.filter((p) => !p.active);

  return (
    <>
      <StaffShell title="Promoties" subtitle={`${active.length} actief · ${promos.length} totaal`} requireRole={["owner", "manager"]}>

        <section className="px-4 mb-5">
          <button
            onClick={() => setCreatorOpen(true)}
            className="w-full flex items-center gap-3 bg-gold text-ink rounded-2xl p-4 hover:bg-gold-soft active:scale-[0.99] transition-all"
          >
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-ink/15">
              <Plus className="h-5 w-5" />
            </span>
            <div className="flex-1 text-left">
              <p className="text-[15px] font-semibold">Nieuwe kortingscode</p>
              <p className="text-[12px] opacity-75">Percentage of vast bedrag</p>
            </div>
          </button>
        </section>

        {loading ? (
          <p className="text-center text-cream/40 py-10 text-[13px]">Laden…</p>
        ) : promos.length === 0 ? (
          <div className="px-4">
            <div className="bg-card/40 border border-dashed border-white/[0.08] rounded-2xl p-8 text-center">
              <Tag className="h-8 w-8 text-cream/25 mx-auto mb-3" />
              <p className="text-cream/55 text-[13px]">Nog geen kortingscodes.</p>
              <p className="text-cream/35 text-[11px] mt-1">Klik hierboven om er een aan te maken.</p>
            </div>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <section className="px-4 mb-5">
                <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-cream/45 mb-2">Actief</h2>
                <div className="space-y-2">
                  {active.map((p) => (
                    <PromoCard
                      key={p.id} promo={p}
                      onCopy={() => copyCode(p.code)}
                      onToggle={() => toggleActive(p)}
                      onRemove={() => removePromo(p)}
                      copied={copied === p.code}
                    />
                  ))}
                </div>
              </section>
            )}
            {inactive.length > 0 && (
              <section className="px-4">
                <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-cream/45 mb-2">Inactief</h2>
                <div className="space-y-2 opacity-60">
                  {inactive.map((p) => (
                    <PromoCard
                      key={p.id} promo={p}
                      onCopy={() => copyCode(p.code)}
                      onToggle={() => toggleActive(p)}
                      onRemove={() => removePromo(p)}
                      copied={copied === p.code}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </StaffShell>

      {creatorOpen && <PromoCreator onClose={() => setCreatorOpen(false)} />}
    </>
  );
}

function PromoCard({ promo, onCopy, onToggle, onRemove, copied }: {
  promo: Promotion;
  onCopy: () => void;
  onToggle: () => void;
  onRemove: () => void;
  copied: boolean;
}) {
  const used = promo.usedCount ?? 0;
  const max = promo.maxUses ?? 0;
  return (
    <div className={cn(
      "bg-card/60 border rounded-2xl p-4",
      promo.active ? "border-white/[0.06]" : "border-white/[0.04]",
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-xl shrink-0",
          promo.type === "percent" ? "bg-amber-500/15 text-amber-300" : "bg-emerald-500/15 text-emerald-300",
        )}>
          {promo.type === "percent" ? <Percent className="h-4 w-4" /> : <BadgeEuro className="h-4 w-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <button
            onClick={onCopy}
            className="flex items-center gap-1.5 group"
          >
            <span className="font-mono text-[15px] font-bold text-cream tracking-wider">{promo.code}</span>
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-cream/30 group-hover:text-cream/60" />
            )}
          </button>
          <p className="text-[12px] text-cream/65 mt-0.5">
            {promo.type === "percent" ? `${promo.value}% korting` : `${fmt(promo.value)} korting`}
            {promo.minOrder && promo.minOrder > 0 && ` · min. ${fmt(promo.minOrder)}`}
          </p>
          {max > 0 && (
            <p className="text-[10px] text-cream/40 mt-0.5">
              {used} / {max} gebruikt
            </p>
          )}
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={onToggle}
          className={cn(
            "flex-1 h-8 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors",
            promo.active
              ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
              : "bg-white/[0.05] text-cream/55 hover:bg-white/[0.08]",
          )}
        >
          <Power className="h-3 w-3" />
          {promo.active ? "Actief" : "Activeer"}
        </button>
        <button
          onClick={onRemove}
          className="h-8 px-3 rounded-lg text-[11px] font-medium bg-red-500/[0.07] text-red-300 hover:bg-red-500/15 transition-colors"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function PromoCreator({ onClose }: { onClose: () => void }) {
  const [code, setCode] = React.useState("");
  const [type, setType] = React.useState<"percent" | "amount">("percent");
  const [value, setValue] = React.useState("10");
  const [minOrder, setMinOrder] = React.useState("");
  const [maxUses, setMaxUses] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await addDoc(collection(db(), "restaurants", RESTAURANT_ID, "promotions"), {
        code: code.trim().toUpperCase(),
        type,
        value: parseFloat(value) || 0,
        minOrder: parseFloat(minOrder) || 0,
        maxUses: parseInt(maxUses) || 0,
        usedCount: 0,
        active: true,
        createdAt: serverTimestamp(),
      });
      onClose();
    } finally {
      setBusy(false);
    }
  };

  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-[70] flex flex-col justify-end bg-ink/80 backdrop-blur-md" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full rounded-t-3xl bg-ink border-t border-white/[0.08] shadow-2xl"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 16px)" }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <span className="h-1 w-10 rounded-full bg-white/15" />
        </div>

        <div className="flex items-center justify-between px-5 pt-1 pb-4 border-b border-white/[0.06]">
          <h2 className="font-display text-xl italic text-cream">Nieuwe code</h2>
          <button onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] text-cream/60">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={submit} className="px-5 py-4 space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-cream/60 mb-2">Code</label>
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="BV. LENTE20"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-[14px] font-mono tracking-wider text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/60"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-cream/60 mb-2">Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("percent")}
                className={cn(
                  "h-12 rounded-xl border text-[13px] font-medium transition-colors flex items-center justify-center gap-2",
                  type === "percent" ? "bg-gold/10 border-gold/40 text-gold" : "bg-white/[0.03] border-white/[0.07] text-cream/65",
                )}
              >
                <Percent className="h-4 w-4" /> Percentage
              </button>
              <button
                type="button"
                onClick={() => setType("amount")}
                className={cn(
                  "h-12 rounded-xl border text-[13px] font-medium transition-colors flex items-center justify-center gap-2",
                  type === "amount" ? "bg-gold/10 border-gold/40 text-gold" : "bg-white/[0.03] border-white/[0.07] text-cream/65",
                )}
              >
                <BadgeEuro className="h-4 w-4" /> Vast bedrag
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-cream/60 mb-2">
                Waarde {type === "percent" ? "(%)" : "(€)"}
              </label>
              <input
                required type="number" step="0.01" min="0"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-[14px] text-cream focus:outline-none focus:border-gold/60"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-cream/60 mb-2">Min. order (€)</label>
              <input
                type="number" step="0.01" min="0"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                placeholder="0"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-[14px] text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-cream/60 mb-2">Max. gebruik (0 = onbeperkt)</label>
            <input
              type="number" min="0"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              placeholder="0"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-[14px] text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/60"
            />
          </div>

          <button
            type="submit"
            disabled={busy || !code}
            className="w-full h-12 rounded-2xl bg-gold text-ink font-semibold text-[14px] hover:bg-gold-soft active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {busy ? "Opslaan…" : "Code aanmaken"}
          </button>
        </form>
      </div>
    </div>
  );
}
