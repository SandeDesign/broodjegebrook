"use client";
import { useEffect, useState } from "react";
import { categories } from "@/data/menu";
import { cn } from "@eufraat/ui";

export function CategoryNav() {
  const [active, setActive] = useState<string>(categories[0].id);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY + 240;
      let current = categories[0].id;
      for (const c of categories) {
        const el = document.getElementById(`cat-${c.id}`);
        if (el && el.offsetTop <= scrollY) current = c.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(`cat-${id}`);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 160;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div className="sticky top-16 sm:top-20 z-40 bg-ink/85 backdrop-blur-xl border-y border-line/[0.06]">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <nav className="scrollbar-hide flex items-center gap-1 overflow-x-auto py-3.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-cream/40 shrink-0 mr-3">
            Index
          </span>
          {categories.map((c, i) => (
            <a
              key={c.id}
              href={`#cat-${c.id}`}
              onClick={(e) => onClick(e, c.id)}
              className={cn(
                "shrink-0 px-3 py-1.5 text-[12px] font-medium transition-all whitespace-nowrap flex items-center gap-1.5 rounded-full border",
                active === c.id
                  ? "border-gold text-gold"
                  : "border-transparent text-cream/60 hover:text-cream"
              )}
            >
              <span className="font-mono text-[9px] tabular-nums opacity-60">
                {String(i + 1).padStart(2, "0")}
              </span>
              {c.name}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
