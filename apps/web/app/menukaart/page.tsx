"use client";
import { useMemo, useState, useEffect } from "react";
import { Flame, Sparkles, Leaf, ArrowRight, Plus } from "lucide-react";
import { categories, menuItems, type MenuItem, type MenuTag } from "@/data/menu";
import { ItemModal } from "@/components/ItemModal";
import { CartBar } from "@/components/CartBar";
import { cn } from "@eufraat/ui";

const tagFilters: { value: MenuTag | "alles"; label: string; icon?: React.ReactNode }[] = [
  { value: "alles", label: "Alles" },
  { value: "populair", label: "Populair", icon: <Sparkles className="h-3 w-3" /> },
  { value: "nieuw", label: "Nieuw" },
  { value: "vegan", label: "Veggie", icon: <Leaf className="h-3 w-3" /> },
  { value: "pittig", label: "Pittig", icon: <Flame className="h-3 w-3" /> },
];

const tagColors: Record<MenuTag, string> = {
  populair: "text-gold",
  nieuw: "text-emerald-300",
  vegan: "text-lime-300",
  pittig: "text-orange-300",
};

const tagIcons: Partial<Record<MenuTag, React.ReactNode>> = {
  populair: <Sparkles className="h-2.5 w-2.5" />,
  vegan: <Leaf className="h-2.5 w-2.5" />,
  pittig: <Flame className="h-2.5 w-2.5" />,
};

export default function MenukaartPage() {
  const [activeTag, setActiveTag] = useState<MenuTag | "alles">("alles");
  const [activeCat, setActiveCat] = useState<string>(categories[0].id);
  const [openItem, setOpenItem] = useState<MenuItem | null>(null);

  const filtered = useMemo(() => {
    if (activeTag === "alles") return menuItems;
    return menuItems.filter((m) => m.tags.includes(activeTag));
  }, [activeTag]);

  // Scroll-spy: update activeCat as user scrolls
  useEffect(() => {
    const onScroll = () => {
      const offset = window.scrollY + 180;
      let current = categories[0].id;
      for (const c of categories) {
        const el = document.getElementById(`cat-${c.id}`);
        if (el && el.offsetTop <= offset) current = c.id;
      }
      setActiveCat(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToCat = (id: string) => {
    setActiveCat(id);
    const el = document.getElementById(`cat-${id}`);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 140;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <>
      {/* PAGE HERO */}
      <section className="pt-20 lg:pt-10 pb-6 px-4 sm:px-8 lg:px-10">
        <h1 className="font-display font-medium tracking-[-0.04em] text-cream leading-[0.88]">
          <span className="block text-[18vw] sm:text-[12vw] lg:text-8xl italic">Menu</span>
          <span className="block text-[18vw] sm:text-[12vw] lg:text-8xl text-gold/90 -mt-2">kaart<span className="text-cream">.</span></span>
        </h1>
        <p className="mt-3 text-sm text-cream/55 max-w-sm">
          {menuItems.length} gerechten in {categories.length} categorieën. Vers bereid.
        </p>
      </section>

      {/* STICKY CATEGORY + FILTER BAR */}
      <div className="sticky top-16 lg:top-0 z-30 bg-ink border-y border-line/[0.06]">
        {/* Category pills */}
        <div className="scrollbar-hide overflow-x-auto px-4 sm:px-8 lg:px-10">
          <nav className="flex items-center gap-1.5 py-3 w-max min-w-full">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => scrollToCat(c.id)}
                className={cn(
                  "shrink-0 px-3.5 h-8 rounded-full text-[12px] font-medium whitespace-nowrap transition-all",
                  activeCat === c.id
                    ? "bg-gold text-ink"
                    : "text-cream/55 hover:text-cream hover:bg-line/[0.05]"
                )}
              >
                {c.name}
              </button>
            ))}
          </nav>
        </div>
        {/* Tag filters */}
        <div className="scrollbar-hide overflow-x-auto px-4 sm:px-8 lg:px-10 border-t border-line/[0.04]">
          <div className="flex items-center gap-1.5 py-2.5 w-max">
            {tagFilters.map((t) => (
              <button
                key={t.value}
                onClick={() => setActiveTag(t.value)}
                className={cn(
                  "shrink-0 inline-flex items-center gap-1.5 px-3 h-7 rounded-full text-[11px] font-medium border transition-colors",
                  activeTag === t.value
                    ? "border-gold text-gold bg-gold/[0.07]"
                    : "border-line/[0.08] text-cream/50 hover:border-line/20 hover:text-cream/80"
                )}
              >
                {t.icon}{t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MENU CONTENT */}
      <div className="px-4 sm:px-8 lg:px-10 py-8 pb-8 space-y-12">
        {categories.map((c) => {
          const items = filtered.filter((m) => m.categoryId === c.id);
          if (items.length === 0) return null;
          return (
            <section key={c.id} id={`cat-${c.id}`} className="scroll-mt-44">
              {/* Category header */}
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="font-display text-3xl sm:text-4xl font-medium italic text-cream tracking-[-0.02em]">
                  {c.name}
                </h2>
                <span className="text-xs text-cream/35 tabular-nums">{items.length}</span>
              </div>

              {/* Items — card grid, 1 col on mobile / 2 col on sm+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {items.map((item) => (
                  <MenuItemCard key={item.id} item={item} onOpen={() => setOpenItem(item)} />
                ))}
              </div>
            </section>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="font-display italic text-3xl text-cream/50 mb-4">Geen resultaat.</p>
            <button
              onClick={() => setActiveTag("alles")}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-gold text-ink text-sm font-semibold hover:bg-gold-soft transition-colors"
            >
              Toon alles <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      <ItemModal item={openItem} onClose={() => setOpenItem(null)} />
      <CartBar />
    </>
  );
}

function MenuItemCard({ item, onOpen }: { item: MenuItem; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group w-full text-left bg-card hover:bg-surface-2 border border-line/[0.07] hover:border-gold/25 rounded-2xl p-4 transition-all active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
    >
      <div className="flex items-start gap-3">
        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="font-display text-[17px] sm:text-lg font-medium text-cream group-hover:text-gold transition-colors leading-snug">
            {item.name}
          </p>
          <p className="mt-1 text-[13px] text-cream/50 leading-relaxed line-clamp-2">
            {item.description}
          </p>
          {item.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className={cn("inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider", tagColors[tag])}
                >
                  {tagIcons[tag]}
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex flex-col items-end gap-2.5 shrink-0 ml-1">
          <span className="font-display text-[18px] font-semibold tabular-nums text-gold">
            €{item.price.toFixed(2).replace(".", ",")}
          </span>
          <span className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-full transition-all",
            "bg-gold text-ink group-hover:scale-110 group-hover:shadow-[0_0_16px_rgba(233,185,73,0.4)]"
          )}>
            <Plus className="h-4 w-4" strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </button>
  );
}
