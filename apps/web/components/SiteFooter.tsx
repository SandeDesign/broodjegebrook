import Link from "next/link";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import { restaurant, dayLabels, dayOrder } from "@/data/restaurant";

export function SiteFooter() {
  return (
    <footer className="relative bg-[rgb(var(--accent))] overflow-hidden">
      {/* Decoratief grote naam op de achtergrond */}
      <div className="pointer-events-none absolute inset-x-0 -bottom-8 flex justify-center select-none overflow-hidden">
        <span className="font-display italic font-bold text-[20vw] leading-none text-white/[0.06] tracking-tighter whitespace-nowrap">
          Gebrook
        </span>
      </div>

      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12 pt-16 sm:pt-24 pb-10">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/60 mb-4 font-medium">Broodjeszaak · Lunchroom</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold italic leading-[0.95] text-balance text-white">
              Tot ziens.<br /><span className="text-white/70">Eet smakelijk.</span>
            </h2>
            <p className="mt-5 max-w-md text-sm text-white/70 leading-relaxed">
              Elke dag vers bereid in Hoensbroek. Bestel online of kom gewoon langs.
            </p>
          </div>

          <div className="lg:col-span-3 lg:col-start-7">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/60 mb-4 font-medium">Openingstijden (afhaal)</p>
            <ul className="space-y-0.5 text-sm">
              {dayOrder.map((day) => {
                const w = restaurant.hours.pickup[day];
                return (
                  <li key={day} className={`flex justify-between py-1.5 border-b border-white/10 last:border-0 ${w ? "text-white/85" : "text-white/30"}`}>
                    <span>{dayLabels[day]}</span>
                    <span className="font-mono text-[11px]">{w ? `${w.open}–${w.close}` : "Gesloten"}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="lg:col-span-2 lg:col-start-11">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/60 mb-4 font-medium">Contact</p>
            <ul className="space-y-3 text-sm mb-8">
              <li className="flex items-start gap-2.5 text-white/75">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-white/50" />
                <a
                  href={restaurant.social.googleMaps ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {restaurant.address.street}<br />{restaurant.address.postcode} {restaurant.address.city}
                </a>
              </li>
              <li>
                <a href={`mailto:${restaurant.email}`} className="group flex items-start gap-2.5 text-white/75 hover:text-white transition-colors">
                  <Mail className="h-4 w-4 mt-0.5 shrink-0 text-white/50" />
                  <span className="break-all text-xs border-b border-transparent group-hover:border-white/40">{restaurant.email}</span>
                </a>
              </li>
            </ul>
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/60 mb-3 font-medium">Navigatie</p>
            <ul className="space-y-2 text-sm">
              {[["Home","/"],["Menukaart","/menukaart"],["Beoordelingen","/#reviews"],["Contact","/contact"]].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="group inline-flex items-center gap-1 text-white/75 hover:text-white transition-colors">
                    {label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 sm:mt-24 pt-6 border-t border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] font-mono uppercase tracking-[0.2em] text-white/40">
          <span>© {new Date().getFullYear()} · {restaurant.name}</span>
          <span>Eigen platform. Geen commissie.</span>
          <span className="hidden sm:inline">Hoensbroek, NL</span>
        </div>
      </div>
    </footer>
  );
}
