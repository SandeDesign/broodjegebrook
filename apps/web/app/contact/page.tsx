"use client";
import { useState } from "react";
import { ArrowUpRight, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { restaurant, dayLabels, dayOrder, type DayKey } from "@/data/restaurant";
import { OpenStatus } from "@/components/OpenStatus";
import { getCurrentDayKey } from "@/lib/hours";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const today = getCurrentDayKey();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Bericht via website van ${form.name || "klant"}`);
    const body = encodeURIComponent(`Naam: ${form.name}\nTelefoon: ${form.phone}\n\n${form.message}`);
    window.location.href = `mailto:${restaurant.email}?subject=${subject}&body=${body}`;
  };

  return (
    <>
      {/* HERO */}
      <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 noise opacity-60" />
        <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-9">
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-gold mb-6 flex items-center gap-3">
                <span className="h-px w-10 bg-gold" />
                Contact
              </p>
              <h1 className="font-display font-medium leading-[0.85] tracking-[-0.04em] text-cream">
                <span className="block text-[14vw] sm:text-[10vw] lg:text-[8.5rem] italic">Schrijf</span>
                <span className="block text-[14vw] sm:text-[10vw] lg:text-[8.5rem] -mt-2 sm:-mt-4 text-gold/95">ons even.</span>
              </h1>
            </div>
            <div className="lg:col-span-3">
              <p className="text-base text-cream/65 leading-relaxed">
                Bel, mail of WhatsApp ons. We zijn doordeweeks en in het weekend bereikbaar. Behalve dinsdag.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DETAILS + FORM */}
      <section className="border-t border-line/[0.08] py-20 sm:py-24">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12 grid gap-16 lg:gap-24 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-12">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-gold mb-6">I · Coördinaten</p>
              <ul className="divide-y divide-line/[0.07]">
                <li className="flex items-start gap-5 py-5">
                  <MapPin className="h-4 w-4 text-gold/80 shrink-0 mt-1.5" />
                  <div className="flex-1">
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cream/45">Adres</p>
                    <p className="font-display text-2xl text-cream mt-1.5 tracking-[-0.01em]">{restaurant.address.street}</p>
                    <p className="text-sm text-cream/55 mt-0.5">{restaurant.address.postcode} {restaurant.address.city}</p>
                  </div>
                  <a href={restaurant.social.googleMaps} target="_blank" rel="noopener noreferrer" className="text-cream/35 hover:text-gold transition-colors mt-1.5">
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </li>
                <li>
                  <a href={`tel:${restaurant.phone}`} className="flex items-start gap-5 py-5 group">
                    <Phone className="h-4 w-4 text-gold/80 shrink-0 mt-1.5" />
                    <div className="flex-1">
                      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cream/45">Telefoon</p>
                      <p className="font-display text-2xl text-cream mt-1.5 tracking-[-0.01em] group-hover:text-gold transition-colors">{restaurant.phoneDisplay}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-cream/35 group-hover:text-gold transition-colors mt-1.5" />
                  </a>
                </li>
                <li>
                  <a href={`mailto:${restaurant.email}`} className="flex items-start gap-5 py-5 group">
                    <Mail className="h-4 w-4 text-gold/80 shrink-0 mt-1.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cream/45">E-mail</p>
                      <p className="font-display text-xl text-cream mt-1.5 tracking-[-0.01em] group-hover:text-gold transition-colors break-all">{restaurant.email}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-cream/35 group-hover:text-gold transition-colors mt-1.5 shrink-0" />
                  </a>
                </li>
                <li>
                  <a href={restaurant.social.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-start gap-5 py-5 group">
                    <MessageCircle className="h-4 w-4 text-gold/80 shrink-0 mt-1.5" />
                    <div className="flex-1">
                      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cream/45">WhatsApp</p>
                      <p className="font-display text-2xl text-cream mt-1.5 tracking-[-0.01em] group-hover:text-gold transition-colors">Stuur een bericht</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-cream/35 group-hover:text-gold transition-colors mt-1.5" />
                  </a>
                </li>
              </ul>
            </div>

            <div className="aspect-[4/3] overflow-hidden border border-line/[0.08]">
              <iframe
                title="Locatie Eufraat in Geleen"
                src="https://www.google.com/maps?q=Rijksweg+Centrum+38+6161+EG+Geleen&output=embed"
                className="w-full h-full grayscale contrast-[1.1] opacity-90"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="lg:col-span-7 lg:sticky lg:top-32 lg:self-start">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-gold mb-6">II · Bericht</p>
            <h2 className="font-display text-4xl sm:text-5xl italic text-cream tracking-[-0.02em] leading-[0.95]">
              Stuur ons een notitie.
            </h2>
            <p className="mt-4 text-sm text-cream/55 max-w-md leading-relaxed">
              We lezen alle berichten persoonlijk en reageren meestal binnen een dag.
            </p>

            <div className="mt-10 space-y-7">
              {([
                ["name", "Naam", "text", "Je naam"],
                ["phone", "Telefoon", "tel", "06-12345678"],
              ] as const).map(([id, label, type, ph]) => (
                <div key={id}>
                  <label htmlFor={id} className="block font-mono text-[10px] uppercase tracking-[0.3em] text-cream/45 mb-2">{label}</label>
                  <input
                    id={id}
                    type={type}
                    required={id === "name"}
                    value={form[id]}
                    onChange={(e) => setForm({ ...form, [id]: e.target.value })}
                    className="w-full bg-transparent border-b border-line/[0.15] py-3 text-lg text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold transition-colors"
                    placeholder={ph}
                  />
                </div>
              ))}
              <div>
                <label htmlFor="message" className="block font-mono text-[10px] uppercase tracking-[0.3em] text-cream/45 mb-2">Bericht</label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-transparent border-b border-line/[0.15] py-3 text-lg text-cream placeholder:text-cream/30 focus:outline-none focus:border-gold transition-colors resize-none"
                  placeholder="Waarmee kunnen we je helpen?"
                />
              </div>

              <div className="flex items-center justify-between flex-wrap gap-4 pt-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-cream/40">Opent in je e-mail-app</p>
                <button
                  type="submit"
                  className="group inline-flex items-center gap-3 bg-gold text-ink rounded-full px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em] font-semibold hover:bg-gold-soft transition-colors"
                >
                  Verstuur <Send className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* HOURS */}
      <section className="border-t border-line/[0.08] py-20 sm:py-28">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
            <div className="lg:col-span-8">
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-gold mb-5 flex items-center gap-3">
                <span className="h-px w-10 bg-gold" />
                Openingstijden
              </p>
              <h2 className="font-display font-medium leading-[0.92] tracking-[-0.03em] text-cream text-5xl sm:text-6xl lg:text-7xl">
                Wanneer staan<br />
                <span className="italic text-gold/95">we voor je klaar.</span>
              </h2>
            </div>
            <div className="lg:col-span-4 lg:pl-8 self-end">
              <p className="text-sm text-cream/55 leading-relaxed">
                Wij rusten alleen op dinsdag. Alle andere dagen stoken we de oven en zetten we de grill aan.
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-px bg-line/[0.06]">
            <HoursColumn label="Bezorging" service="delivery" today={today} />
            <HoursColumn label="Afhalen" service="pickup" today={today} />
          </div>
        </div>
      </section>
    </>
  );
}

function HoursColumn({ label, service, today }: { label: string; service: "delivery" | "pickup"; today: DayKey }) {
  return (
    <div className="bg-card p-7 sm:p-12">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-display text-3xl sm:text-4xl font-medium italic text-cream">{label}</h3>
        <OpenStatus service={service} variant="minimal" />
      </div>
      <ul className="space-y-1">
        {dayOrder.map((day) => {
          const w = restaurant.hours[service][day];
          const isToday = day === today;
          return (
            <li key={day} className={`flex items-baseline justify-between py-3 border-b border-line/[0.06] last:border-0 ${isToday ? "text-gold" : w ? "text-cream" : "text-cream/30"}`}>
              <span className="flex items-baseline gap-3">
                {isToday && <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-gold/80">→</span>}
                <span className="text-sm">{dayLabels[day]}</span>
              </span>
              <span className="font-mono text-[12px] tabular-nums tracking-wide">{w ? `${w.open} tot ${w.close}` : "Gesloten"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
