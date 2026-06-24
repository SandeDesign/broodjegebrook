import { Leaf } from "lucide-react";

const words = [
  "Verse Broodjes", "Hoensbroek", "Ambachtelijk Belegd", "Elke Dag Vers",
  "Bezorgd & Afgehaald", "Stokbroodjes", "Lunchroom", "Ma–Za Open",
  "Burgers", "Tosti's", "Salades", "Bagels",
];

export function Marquee() {
  const all = [...words, ...words];
  return (
    <div className="relative overflow-hidden border-y border-[rgb(var(--border))] bg-[rgb(var(--accent)/0.05)] py-4">
      <div className="marquee-track items-center gap-10 whitespace-nowrap">
        {all.map((w, i) => (
          <span key={i} className="flex items-center gap-10 shrink-0">
            <span className="font-display italic text-xl sm:text-2xl font-semibold text-[rgb(var(--accent)/0.75)]">{w}</span>
            <Leaf className="h-3.5 w-3.5 text-[rgb(var(--accent)/0.4)] shrink-0" />
          </span>
        ))}
      </div>
    </div>
  );
}
