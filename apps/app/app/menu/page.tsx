"use client";
import * as React from "react";
import {
  collection, doc, onSnapshot, updateDoc, setDoc, deleteDoc, addDoc,
  writeBatch, serverTimestamp, getDocs,
} from "firebase/firestore";
import { db, RESTAURANT_ID } from "@/lib/firebase";
import { StaffShell } from "@/components/StaffShell";
import {
  Search, Eye, EyeOff, Plus, Edit3, Trash2, Download, Check, X,
  Tag as TagIcon, FolderPlus,
} from "lucide-react";
import { cn } from "@eufraat/ui";
import {
  categories as seedCategories,
  menuItems as seedItems,
  categoryExtras, categorySauces, categorySizes,
  type MenuTag,
} from "@/data/menu";

const fmt = (v: number) => `€${(v ?? 0).toFixed(2).replace(".", ",")}`;
const TAGS: MenuTag[] = ["populair", "nieuw", "vegan", "pittig"];

interface Category {
  id: string;
  name: string;
  description?: string;
  order?: number;
}

interface Item {
  id: string;
  name: string;
  description?: string;
  price?: number;
  visible?: boolean;
  soldOut?: boolean;
  tags?: MenuTag[];
  order?: number;
}

export default function MenuAdminPage() {
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [items, setItems] = React.useState<Record<string, Item[]>>({});
  const [active, setActive] = React.useState<string>("");
  const [search, setSearch] = React.useState("");
  const [editing, setEditing] = React.useState<{ category: string; item: Item | null } | null>(null);
  const [importing, setImporting] = React.useState(false);
  const [importDone, setImportDone] = React.useState(false);

  // Live categories
  React.useEffect(() => {
    const catRef = collection(db(), "restaurants", RESTAURANT_ID, "menu");
    const unsub = onSnapshot(catRef, (snap) => {
      const cats = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Category[];
      cats.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setCategories(cats);
      if (!active && cats[0]) setActive(cats[0].id);
    });
    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live items per active category
  React.useEffect(() => {
    if (!active) return;
    const itemsRef = collection(db(), "restaurants", RESTAURANT_ID, "menu", active, "items");
    const unsub = onSnapshot(itemsRef, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Item[];
      arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setItems((prev) => ({ ...prev, [active]: arr }));
    });
    return () => unsub();
  }, [active]);

  const toggleSoldOut = async (item: Item) => {
    await updateDoc(
      doc(db(), "restaurants", RESTAURANT_ID, "menu", active, "items", item.id),
      { soldOut: !item.soldOut },
    );
  };
  const toggleVisible = async (item: Item) => {
    await updateDoc(
      doc(db(), "restaurants", RESTAURANT_ID, "menu", active, "items", item.id),
      { visible: item.visible === false ? true : false },
    );
  };
  const removeItem = async (item: Item) => {
    if (!confirm(`Verwijder "${item.name}"?`)) return;
    await deleteDoc(doc(db(), "restaurants", RESTAURANT_ID, "menu", active, "items", item.id));
  };

  const importFromWeb = async () => {
    if (!confirm(`${seedItems.length} gerechten in ${seedCategories.length} categorieën importeren? Dit overschrijft bestaande items met dezelfde ID.`)) return;
    setImporting(true);
    try {
      // 1) Write categories
      for (let i = 0; i < seedCategories.length; i++) {
        const c = seedCategories[i];
        await setDoc(
          doc(db(), "restaurants", RESTAURANT_ID, "menu", c.id),
          {
            name: c.name,
            description: c.description,
            order: i,
            extras: categoryExtras[c.id] ?? [],
            sauces: categorySauces[c.id] ?? [],
            sizes: categorySizes[c.id] ?? [],
          },
          { merge: true },
        );
      }
      // 2) Write items per category (batched per category for efficiency)
      const byCategory: Record<string, typeof seedItems> = {};
      seedItems.forEach((it) => {
        if (!byCategory[it.categoryId]) byCategory[it.categoryId] = [];
        byCategory[it.categoryId].push(it);
      });
      for (const [catId, list] of Object.entries(byCategory)) {
        const batch = writeBatch(db());
        list.forEach((it, idx) => {
          const ref = doc(db(), "restaurants", RESTAURANT_ID, "menu", catId, "items", it.id);
          batch.set(ref, {
            name: it.name,
            description: it.description,
            price: it.price,
            tags: it.tags ?? [],
            visible: true,
            soldOut: false,
            order: idx,
            updatedAt: serverTimestamp(),
          }, { merge: true });
        });
        await batch.commit();
      }
      setImportDone(true);
      setTimeout(() => setImportDone(false), 3000);
    } finally {
      setImporting(false);
    }
  };

  const wipeFromFirestore = async () => {
    if (!confirm("Weet je zeker dat je ALLE menu items wilt verwijderen? Dit kan niet ongedaan worden.")) return;
    setImporting(true);
    try {
      for (const cat of categories) {
        const itemsSnap = await getDocs(collection(db(), "restaurants", RESTAURANT_ID, "menu", cat.id, "items"));
        const batch = writeBatch(db());
        itemsSnap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
        await deleteDoc(doc(db(), "restaurants", RESTAURANT_ID, "menu", cat.id));
      }
    } finally {
      setImporting(false);
    }
  };

  const list = (items[active] ?? []).filter((i) =>
    !search || i.name?.toLowerCase().includes(search.toLowerCase()),
  );
  const soldOutCount = (items[active] ?? []).filter((i) => i.soldOut).length;
  const isEmpty = categories.length === 0;

  return (
    <>
      <StaffShell
        title="Menu beheer"
        subtitle={isEmpty ? "Nog niet geïmporteerd" : `${categories.length} categorieën · ${soldOutCount} uitverkocht`}
        requireRole={["owner", "manager"]}
      >

        {/* EMPTY: import from web data */}
        {isEmpty ? (
          <section className="px-4 py-8">
            <div className="bg-card/60 border border-gold/30 rounded-3xl p-6 text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 mb-4">
                <Download className="h-6 w-6 text-gold" />
              </div>
              <h2 className="font-display text-2xl italic text-cream mb-2">Importeer het menu</h2>
              <p className="text-[13px] text-cream/55 leading-relaxed max-w-sm mx-auto mb-5">
                Nog geen menu in Firestore. Importeer in één keer het volledige menu zoals het op de website staat: <span className="text-cream font-semibold">{seedItems.length} gerechten</span> in <span className="text-cream font-semibold">{seedCategories.length} categorieën</span>.
              </p>
              <button
                onClick={importFromWeb}
                disabled={importing}
                className="inline-flex items-center gap-2 h-12 px-6 rounded-2xl bg-gold text-ink font-bold text-[14px] hover:bg-gold-soft active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {importing ? "Importeren…" : importDone ? <><Check className="h-4 w-4" /> Klaar!</> : <><Download className="h-4 w-4" /> Importeer nu</>}
              </button>
              <p className="text-[10px] text-cream/35 mt-3">
                Daarna kun je gerechten wijzigen, toevoegen of verwijderen.
              </p>
            </div>
          </section>
        ) : (
          <>
            {/* Sticky category tabs */}
            <div
              className="sticky z-30 bg-ink/95 backdrop-blur-xl border-b border-white/[0.06]"
              style={{ top: "calc(env(safe-area-inset-top) + 64px)" }}
            >
              <div className="scrollbar-hide overflow-x-auto px-4">
                <nav className="flex gap-1 py-2.5 w-max">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setActive(c.id)}
                      className={cn(
                        "shrink-0 px-4 h-9 rounded-full text-[13px] font-medium whitespace-nowrap transition-all",
                        active === c.id ? "bg-gold text-ink" : "text-cream/55 hover:text-cream hover:bg-white/[0.04]",
                      )}
                    >
                      {c.name}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Search + Add */}
            <div className="px-4 pt-4 space-y-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-cream/35" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Zoek gerecht…"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl pl-11 pr-4 py-3 text-[14px] text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/60"
                />
              </div>
              <button
                onClick={() => setEditing({ category: active, item: null })}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-gold/10 border border-gold/30 text-gold text-[13px] font-semibold hover:bg-gold/15 active:scale-[0.99] transition-all"
              >
                <Plus className="h-4 w-4" />
                Nieuw gerecht in {categories.find((c) => c.id === active)?.name}
              </button>
            </div>

            {/* Items */}
            <div className="px-4 py-4 space-y-2">
              {list.length === 0 ? (
                <p className="text-center text-cream/40 text-[13px] py-8">Geen gerechten gevonden.</p>
              ) : (
                list.map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "bg-card/60 border rounded-2xl p-4 transition-all",
                      item.visible !== false ? "border-white/[0.06]" : "border-white/[0.04] opacity-50",
                      item.soldOut && "ring-1 ring-red-400/30",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <p className="font-medium text-cream text-[14px] truncate">{item.name}</p>
                          {item.soldOut && <span className="text-[9px] uppercase tracking-wider font-bold text-red-300">Uitverkocht</span>}
                          {item.tags?.map((t) => (
                            <span key={t} className="text-[9px] uppercase tracking-wider font-bold text-gold/60">{t}</span>
                          ))}
                        </div>
                        {item.description && (
                          <p className="text-[12px] text-cream/45 mt-0.5 line-clamp-1">{item.description}</p>
                        )}
                      </div>
                      <span className="font-display font-semibold text-gold text-[14px] tabular-nums shrink-0">
                        {fmt(item.price ?? 0)}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-1.5">
                      <button
                        onClick={() => toggleSoldOut(item)}
                        className={cn(
                          "flex-1 h-9 rounded-xl text-[11px] font-medium transition-colors",
                          item.soldOut
                            ? "bg-red-500/15 text-red-300 border border-red-400/30"
                            : "bg-white/[0.04] text-cream/70 border border-white/[0.07] hover:bg-white/[0.07]",
                        )}
                      >
                        {item.soldOut ? "Weer beschikbaar" : "Uitverkocht"}
                      </button>
                      <button
                        onClick={() => toggleVisible(item)}
                        className={cn(
                          "h-9 px-3 rounded-xl text-[11px] font-medium transition-colors flex items-center justify-center",
                          item.visible !== false
                            ? "bg-white/[0.04] text-cream/70 border border-white/[0.07]"
                            : "bg-gold/15 text-gold border border-gold/30",
                        )}
                        title={item.visible !== false ? "Verbergen" : "Tonen"}
                      >
                        {item.visible !== false ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => setEditing({ category: active, item })}
                        className="h-9 px-3 rounded-xl text-[11px] font-medium bg-gold/10 text-gold border border-gold/25 hover:bg-gold/15"
                        title="Wijzigen"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => removeItem(item)}
                        className="h-9 px-3 rounded-xl text-[11px] font-medium bg-red-500/[0.07] text-red-300 border border-red-500/20 hover:bg-red-500/15"
                        title="Verwijderen"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Danger zone — only owner */}
            <section className="px-4 mt-6">
              <details className="bg-card/40 border border-white/[0.06] rounded-2xl">
                <summary className="px-4 py-3 cursor-pointer text-[12px] text-cream/40 uppercase tracking-wider font-semibold">
                  Geavanceerd
                </summary>
                <div className="px-4 pb-4 space-y-2">
                  <button
                    onClick={importFromWeb}
                    disabled={importing}
                    className="w-full h-10 rounded-xl bg-white/[0.04] border border-white/[0.07] text-cream/70 text-[12px] hover:bg-white/[0.08] inline-flex items-center justify-center gap-2"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Opnieuw importeren van web (merge)
                  </button>
                  <button
                    onClick={wipeFromFirestore}
                    disabled={importing}
                    className="w-full h-10 rounded-xl bg-red-500/[0.07] border border-red-500/20 text-red-300 text-[12px] hover:bg-red-500/15 inline-flex items-center justify-center gap-2"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Wis ALLE menu items
                  </button>
                </div>
              </details>
            </section>
          </>
        )}
      </StaffShell>

      {editing && (
        <ItemEditor
          categoryId={editing.category}
          item={editing.item}
          existingCount={(items[editing.category] ?? []).length}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

function ItemEditor({
  categoryId, item, existingCount, onClose,
}: {
  categoryId: string;
  item: Item | null;
  existingCount: number;
  onClose: () => void;
}) {
  const isNew = !item;
  const [name, setName] = React.useState(item?.name ?? "");
  const [description, setDescription] = React.useState(item?.description ?? "");
  const [price, setPrice] = React.useState(String(item?.price ?? ""));
  const [tags, setTags] = React.useState<MenuTag[]>(item?.tags ?? []);
  const [soldOut, setSoldOut] = React.useState(item?.soldOut ?? false);
  const [visible, setVisible] = React.useState(item?.visible !== false);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const toggleTag = (t: MenuTag) =>
    setTags((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  const save = async () => {
    setBusy(true);
    try {
      const data = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price) || 0,
        tags,
        soldOut,
        visible,
        updatedAt: serverTimestamp(),
      };
      if (isNew) {
        await addDoc(
          collection(db(), "restaurants", RESTAURANT_ID, "menu", categoryId, "items"),
          { ...data, order: existingCount, createdAt: serverTimestamp() },
        );
      } else {
        await updateDoc(
          doc(db(), "restaurants", RESTAURANT_ID, "menu", categoryId, "items", item!.id),
          data,
        );
      }
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex flex-col justify-end bg-ink/80 backdrop-blur-md" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full rounded-t-3xl bg-ink border-t border-white/[0.08] shadow-2xl flex flex-col"
        style={{ maxHeight: "calc(92svh - env(safe-area-inset-top))" }}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <span className="h-1 w-10 rounded-full bg-white/15" />
        </div>

        <div className="flex items-center justify-between px-5 pt-1 pb-4 border-b border-white/[0.06] shrink-0">
          <h2 className="font-display text-xl italic text-cream">
            {isNew ? "Nieuw gerecht" : "Gerecht wijzigen"}
          </h2>
          <button onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.05] text-cream/60">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          <Field label="Naam" required>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Pizza Margherita"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-[14px] text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/60"
            />
          </Field>

          <Field label="Beschrijving">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Tomatensaus, mozzarella, basilicum"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-[13px] text-cream placeholder:text-cream/35 focus:outline-none focus:border-gold/60 resize-none"
            />
          </Field>

          <Field label="Prijs (€)" required>
            <input
              type="number" step="0.50" min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="9.50"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-[14px] text-cream font-mono placeholder:text-cream/35 focus:outline-none focus:border-gold/60"
            />
          </Field>

          <Field label="Tags">
            <div className="flex flex-wrap gap-2">
              {TAGS.map((t) => {
                const on = tags.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-[12px] font-medium border transition-colors",
                      on ? "bg-gold/15 border-gold/40 text-gold" : "bg-white/[0.03] border-white/[0.07] text-cream/55",
                    )}
                  >
                    <TagIcon className="h-3 w-3" />
                    {t}
                    {on && <Check className="h-3 w-3" />}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => setSoldOut(!soldOut)}
              className={cn(
                "h-12 rounded-xl border text-[12px] font-medium transition-colors",
                soldOut ? "bg-red-500/15 border-red-400/30 text-red-300" : "bg-white/[0.03] border-white/[0.07] text-cream/65",
              )}
            >
              {soldOut ? "Uitverkocht ✓" : "Op voorraad"}
            </button>
            <button
              onClick={() => setVisible(!visible)}
              className={cn(
                "h-12 rounded-xl border text-[12px] font-medium transition-colors",
                visible ? "bg-emerald-500/15 border-emerald-400/30 text-emerald-300" : "bg-white/[0.03] border-white/[0.07] text-cream/65",
              )}
            >
              {visible ? "Zichtbaar ✓" : "Verborgen"}
            </button>
          </div>
        </div>

        <div className="shrink-0 border-t border-white/[0.06] bg-ink/95 px-4 py-3" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}>
          <button
            onClick={save}
            disabled={busy || !name.trim() || !price}
            className="w-full h-13 rounded-2xl bg-gold text-ink font-bold text-[14px] hover:bg-gold-soft active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {busy ? "Opslaan…" : isNew ? "Toevoegen" : "Wijzigingen opslaan"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-[0.18em] font-semibold text-cream/60 mb-2">
        {label}{required && <span className="text-gold ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
