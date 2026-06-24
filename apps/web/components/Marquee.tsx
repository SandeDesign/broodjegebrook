import { Asterisk } from "lucide-react";

const words = [
  "Steenoven Pizza", "Dagverse Shoarma", "Vers Gebakken", "Geleen, NL",
  "Bezorgd & Afgehaald", "Mediterraans", "Knapperig", "Open tot 00:50",
  "Ambachtelijk", "Pittig op Verzoek",
];

export function Marquee() {
  const all = [...words, ...words];
  return (
    <div className="relative overflow-hidden border-y border-line/[0.07] bg-ink/60 py-5">
      <div className="marquee-track items-center gap-12 whitespace-nowrap">
        {all.map((w, i) => (
          <span key={i} className="flex items-center gap-12 shrink-0">
            <span className="font-display italic text-2xl sm:text-3xl font-medium text-cream/85">{w}</span>
            <Asterisk className="h-4 w-4 text-gold/70 shrink-0" />
          </span>
        ))}
      </div>
    </div>
  );
}
