"use client";
import * as React from "react";
import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useSimpleCart, cartTotal } from "@/lib/simpleCart";

const fmt = (v: number) => `€${v.toFixed(2).replace(".", ",")}`;

export function CartBar() {
  const lines = useSimpleCart((s) => s.lines);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const count = lines.reduce((n, l) => n + l.qty, 0);
  if (count === 0) return null;
  const total = cartTotal(lines);
  return (
    /* Desktop only: mobile uses the bottom-nav cart sheet instead */
    <div className="hidden lg:block fixed z-40 pointer-events-none inset-x-0 bottom-6 left-64 xl:left-72 px-4">
      <Link
        href="/bestellen"
        className="pointer-events-auto mx-auto max-w-md flex items-center justify-between gap-3 bg-gold text-ink rounded-full h-14 pl-5 pr-2 shadow-[0_20px_50px_-12px_rgba(233,185,73,0.5)] hover:bg-gold-soft active:scale-[0.98] transition-all"
      >
        <span className="flex items-center gap-2.5 font-semibold text-[14px]">
          <span className="relative inline-flex h-7 w-7 items-center justify-center">
            <ShoppingBag className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-ink text-gold text-[10px] font-bold tabular-nums">
              {count}
            </span>
          </span>
          Bekijk bestelling
        </span>
        <span className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-ink/90 text-gold text-[14px] font-semibold tabular-nums">
          {fmt(total)} <ArrowRight className="h-4 w-4" />
        </span>
      </Link>
    </div>
  );
}
