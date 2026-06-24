"use client";
import { useState } from "react";
import { ArrowUpRight, Mail, MapPin, Send } from "lucide-react";
import { restaurant, dayLabels, dayOrder, type DayKey } from "@/data/restaurant";
import { OpenStatus } from "@/components/OpenStatus";
import { getCurrentDayKey } from "@/lib/hours";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", message: "" });
  const today = getCurrentDayKey();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Bericht via website van ${form.name || "klant"}`);
    const body = encodeURIComponent(`Naam: ${form.name}\n\n${form.message}`);
    window.location.href = `mailto:${restaurant.email}?subject=${subject}&body=${body}`;
  };

  return (
    <>
      {/* HERO */}
      <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-20 bg-[rgb(var(--bg))]">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-9">
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[rgb(var(--accent))] mb-6 flex items-center gap-3">
                <span className="h-px w-10 bg-[rgb(var(--accent))]" />
                Contact
              </p>
              <h1 className="font-display font-bold leading-[0.9] tracking-[-0.02em] text-[rgb(var(--text))]">
                <span className="block text-[13vw] sm:text-[9vw] lg:text-[7.5rem] italic text-[rgb(var(--accent))]">Schrijf</span>
                <span className="block text-[13vw] sm:text-[9vw] lg:text-[7.5rem] -mt-2 sm:-mt-4">ons even.</span>
              </h1>
            </div>
            <div className="lg:col-span-3">
              <p className="text-base text-[rgb(var(--text-soft))] leading-relaxed">
                Stuur een mail of kom langs. We zijn maandag tot en met vrijdag bereikbaar. Zaterdag afhaal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DETAILS + FORM */}
      <section className="border-t border-[rgb(var(--border))] py-20 sm:py-24 bg-white">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12 grid gap-16 lg:gap-24 lg:grid-cols-12">
          <div className="lg:col-span-5 space-y-12">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[rgb(var(--accent))] mb-6">Gegevens</p>
              <ul className="divide-y divide-[rgb(var(--border))]">
                <li className="flex items-start gap-5 py-5">
                  <MapPin className="h-4 w-4 text-[rgb(var(--accent))] shrink-0 mt-1.5" />
                  <div className="flex-1">
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[rgb(var(--text-soft))]">Adres</p>
                    <p className="font-display text-2xl text-[rgb(var(--text))] mt-1.5 tracking-[-0.01em] font-bold">{restaurant.address.street}</p>
                    <p className="text-sm text-[rgb(var(--text-soft))] mt-0.5">{restaurant.address.postcode} {restaurant.address.city}</p>
                  </div>
                  <a
                    href={restaurant.social.googleMaps ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[rgb(var(--text-soft))] hover:text-[rgb(var(--accent))] transition-colors mt-1.5"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </li>
                <li>
                  <a href={`mailto:${restaurant.email}`} className="flex items-start gap-5 py-5 group">
                    <Mail className="h-4 w-4 text-[rgb(var(--accent))] shrink-0 mt-1.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[rgb(var(--text-soft))]">E-mail</p>
                      <p className="font-display text-xl text-[rgb(var(--text))] mt-1.5 tracking-[-0.01em] font-bold group-hover:text-[rgb(var(--accent))] transition-colors break-all">{restaurant.email}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-[rgb(var(--text-soft))] group-hover:text-[rgb(var(--accent))] transition-colors mt-1.5 shrink-0" />
                  </a>
                </li>
              </ul>
            </div>

            <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-[rgb(var(--border))]">
              <iframe
                title="Locatie Broodje Gebrook in Hoensbroek"
                src="https://www.google.com/maps?q=Nieuwstraat+23+6431+KP+Hoensbroek&output=embed"
                className="w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="lg:col-span-7 lg:sticky lg:top-32 lg:self-start">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[rgb(var(--accent))] mb-6">Stuur een bericht</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold italic text-[rgb(var(--text))] tracking-[-0.02em] leading-[0.95]">
              Stuur ons een notitie.
            </h2>
            <p className="mt-4 text-sm text-[rgb(var(--text-soft))] max-w-md leading-relaxed">
              We lezen alle berichten persoonlijk en reageren zo snel mogelijk.
            </p>

            <div className="mt-10 space-y-7">
              <div>
                <label htmlFor="name" className="block font-mono text-[10px] uppercase tracking-[0.3em] text-[rgb(var(--text-soft))] mb-2">Naam</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-transparent border-b border-[rgb(var(--border))] py-3 text-lg text-[rgb(var(--text))] placeholder:text-[rgb(var(--text-soft)/0.5)] focus:outline-none focus:border-[rgb(var(--accent))] transition-colors"
                  placeholder="Je naam"
                />
              </div>
              <div>
                <label htmlFor="message" className="block font-mono text-[10px] uppercase tracking-[0.3em] text-[rgb(var(--text-soft))] mb-2">Bericht</label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-transparent border-b border-[rgb(var(--border))] py-3 text-lg text-[rgb(var(--text))] placeholder:text-[rgb(var(--text-soft)/0.5)] focus:outline-none focus:border-[rgb(var(--accent))] transition-colors resize-none"
                  placeholder="Waarmee kunnen we je helpen?"
                />
              </div>

              <div className="flex items-center justify-between flex-wrap gap-4 pt-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[rgb(var(--text-soft))]">Opent in je e-mail-app</p>
                <button
                  type="submit"
                  className="group inline-flex items-center gap-3 bg-[rgb(var(--accent))] text-white rounded-full px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em] font-semibold hover:bg-[rgb(var(--accent-soft))] transition-colors"
                >
                  Verstuur <Send className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* HOURS */}
      <section className="border-t border-[rgb(var(--border))] py-20 sm:py-28 bg-[rgb(var(--bg))]">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-14">
            <div className="lg:col-span-8">
              <div className="h-1 w-10 bg-[rgb(var(--accent))] mb-4 rounded-full" />
              <h2 className="font-display font-bold leading-[0.92] tracking-[-0.02em] text-[rgb(var(--text))] text-4xl sm:text-5xl lg:text-6xl">
                Wanneer staan<br />
                <span className="italic text-[rgb(var(--accent))]">we voor je klaar.</span>
              </h2>
            </div>
            <div className="lg:col-span-4 lg:pl-8 self-end">
              <p className="text-sm text-[rgb(var(--text-soft))] leading-relaxed">
                Maandag tot vrijdag voor bezorging en afhaal. Zaterdag alleen afhaal. Zondag gesloten.
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
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
    <div className="bg-white rounded-2xl border border-[rgb(var(--border))] p-6 sm:p-10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-2xl sm:text-3xl font-bold text-[rgb(var(--text))]">{label}</h3>
        <OpenStatus service={service} variant="minimal" />
      </div>
      <ul className="space-y-0.5">
        {dayOrder.map((day) => {
          const w = restaurant.hours[service][day];
          const isToday = day === today;
          return (
            <li
              key={day}
              className={`flex items-baseline justify-between py-2.5 border-b border-[rgb(var(--border))] last:border-0 ${
                isToday ? "text-[rgb(var(--accent))]" : w ? "text-[rgb(var(--text))]" : "text-[rgb(var(--text-soft)/0.4)]"
              }`}
            >
              <span className="flex items-baseline gap-2">
                {isToday && <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[rgb(var(--accent))]">→</span>}
                <span className="text-sm">{dayLabels[day]}</span>
              </span>
              <span className="font-mono text-[12px] tabular-nums tracking-wide">{w ? `${w.open}–${w.close}` : "Gesloten"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
