"use client";
import { Clock } from "lucide-react";

export function ComingSoon({ description }: { description?: string }) {
  return (
    <div className="px-4 py-12">
      <div className="bg-card/40 border border-white/[0.06] rounded-3xl p-8 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 mb-4">
          <Clock className="h-6 w-6 text-gold/70" />
        </div>
        <h2 className="font-display text-2xl italic text-cream mb-2">Binnenkort beschikbaar</h2>
        {description && <p className="text-[13px] text-cream/55 leading-relaxed max-w-sm mx-auto">{description}</p>}
      </div>
    </div>
  );
}
