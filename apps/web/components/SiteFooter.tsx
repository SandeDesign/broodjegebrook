import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { restaurant, dayLabels, dayOrder } from "@/data/restaurant";

export function SiteFooter() {
  return (
    <footer className="relative bg-ink border-t border-line/[0.06] overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 -bottom-12 sm:-bottom-24 flex justify-center select-none">
        <span className="font-display italic font-semibold text-[22vw] sm:text-[18vw] leading-none text-white/[0.025] tracking-tighter">
          Eufraat
        </span>
      </div>

      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12 pt-20 sm:pt-28 pb-10">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-gold mb-5">Pizzeria · Shoarmazaak</p>
            <h2 className="font-display text-5xl sm:text-6xl font-medium italic leading-[0.95] text-balance text-cream">
              Tot ziens.<br /><span className="text-gold/90">Eet smakelijk.</span>
            </h2>
            <p className="mt-6 max-w-md text-sm text-cream/60 leading-relaxed">
              Vers gebakken in Geleen. Bezorgd in heel de regio. Bel, mail, of stap binnen.
            </p>
          </div>

          <div className="lg:col-span-3 lg:col-start-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-gold/70 mb-5">Openingstijden</p>
            <ul className="space-y-1 text-sm">
              {dayOrder.map((day) => {
                const w = restaurant.hours.pickup[day];
                return (
                  <li key={day} className={`flex justify-between py-1.5 border-b border-line/[0.06] last:border-0 ${w ? "text-cream/80" : "text-cream/30"}`}>
                    <span>{dayLabels[day]}</span>
                    <span className="font-mono text-[11px]">{w ? `${w.open} tot ${w.close}` : "Gesloten"}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="lg:col-span-2 lg:col-start-11">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-gold/70 mb-5">Contact</p>
            <ul className="space-y-3 text-sm mb-8">
              <li className="flex items-start gap-2.5 text-cream/70">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gold" />
                <span>{restaurant.address.street}<br />{restaurant.address.postcode} {restaurant.address.city}</span>
              </li>
              <li>
                <a href={`tel:${restaurant.phone}`} className="group flex items-start gap-2.5 text-cream/70 hover:text-cream transition-colors">
                  <Phone className="h-4 w-4 mt-0.5 shrink-0 text-gold" />
                  <span className="border-b border-transparent group-hover:border-gold/40">{restaurant.phoneDisplay}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${restaurant.email}`} className="group flex items-start gap-2.5 text-cream/70 hover:text-cream transition-colors">
                  <Mail className="h-4 w-4 mt-0.5 shrink-0 text-gold" />
                  <span className="break-all border-b border-transparent group-hover:border-gold/40 text-xs">{restaurant.email}</span>
                </a>
              </li>
            </ul>
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-gold/70 mb-3">Index</p>
            <ul className="space-y-2 text-sm">
              {[["Home","/"],["Menu","/menukaart"],["Contact","/contact"],["Bestellen","/bestellen"]].map(([label, href]) => (
                <li key={href}>
                  <Link href={href} className="group inline-flex items-center gap-1 text-cream/70 hover:text-gold transition-colors">
                    {label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-20 sm:mt-28 pt-6 border-t border-line/[0.07] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] font-mono uppercase tracking-[0.2em] text-cream/40">
          <span>© {new Date().getFullYear()} · {restaurant.name}</span>
          <span>Eigen platform. Geen commissie.</span>
          <span className="hidden sm:inline">Geleen, NL · 50.96°N, 5.83°E</span>
        </div>
      </div>
    </footer>
  );
}
