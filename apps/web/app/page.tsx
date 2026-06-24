import Link from "next/link";
import Image from "next/image";
import { ArrowDown, ArrowRight, ArrowUpRight, Mail, Quote, MapPin } from "lucide-react";
import { Marquee } from "@/components/Marquee";
import { OpenStatus } from "@/components/OpenStatus";
import { restaurant, dayLabels, dayOrder, type DayKey } from "@/data/restaurant";
import { getCurrentDayKey } from "@/lib/hours";

const CATEGORY_CARDS = [
  { id: "broodjes",     name: "Broodjes",       desc: "Vers belegd met de lekkerste ingrediënten",  emoji: "🥖", bg: "bg-amber-50",   border: "border-amber-200" },
  { id: "burgers",      name: "Burgers",         desc: "Vers rundvlees, kaas en knapperig brood",    emoji: "🍔", bg: "bg-red-50",     border: "border-red-200" },
  { id: "uitsmijters",  name: "Uitsmijters",     desc: "3 eieren, ham en kaas op stevig brood",      emoji: "🍳", bg: "bg-yellow-50",  border: "border-yellow-200" },
  { id: "stokbroodjes", name: "Stokbroodjes",    desc: "Krokant stokbrood met jouw favoriete vulling",emoji: "🥖", bg: "bg-orange-50",  border: "border-orange-200" },
  { id: "salades",      name: "Salades",         desc: "Fris, knapperig en voedzaam",                emoji: "🥗", bg: "bg-green-50",   border: "border-green-200" },
  { id: "bagels",       name: "Bagels",          desc: "Zacht en vers belegd",                       emoji: "🫓", bg: "bg-stone-50",   border: "border-stone-200" },
  { id: "tostis",       name: "Tosti's",         desc: "Goudbruin geroosterd met kaas en beleg",     emoji: "🥪", bg: "bg-yellow-50",  border: "border-yellow-200" },
  { id: "wraps",        name: "Wraps",           desc: "Gevuld en strak gerold",                     emoji: "🌯", bg: "bg-lime-50",    border: "border-lime-200" },
  { id: "frisdranken",  name: "Frisdranken",     desc: "Fris en koel",                               emoji: "🥤", bg: "bg-blue-50",    border: "border-blue-200" },
  { id: "snoep",        name: "Snoepzakjes",     desc: "Een leuk zakje als afsluiter",               emoji: "🍬", bg: "bg-pink-50",    border: "border-pink-200" },
] as const;

const popular = [
  { id: "1", name: "Stokbroodje carpaccio",  description: "Carpaccio, rucola, pijnboompitten, truffelmayonaise en zongedroogde tomaat", price: 8.95 },
  { id: "2", name: "Bacon burger",           description: "Vers rundvlees, sla, tomaat, komkommer, augurk, saus, kaas en bacon",         price: 11.25 },
  { id: "3", name: "Broodje teriyaki kip",   description: "Lente ui, atjar tjampoer, knoflook, kipfilet en teriyaki saus",               price: 8.95 },
  { id: "4", name: "Bagel gerookte zalm",    description: "Zalm, roomkaas, kappertjes, rucola en pijnboompitten",                        price: 8.95 },
  { id: "5", name: "Caesarsalade",           description: "Pijnboompitten, rucola, croutons, cherrytomaat, honing-mosterd en gegrilde kip", price: 8.95 },
  { id: "6", name: "Tosti teriyaki",         description: "Kip teriyaki, atjar tampur, lente-ui en knoflook",                            price: 6.95 },
];

const reviews = [
  { name: "Marieke V.",  location: "Hoensbroek", rating: 5, body: "Het beste stokbroodje carpaccio van de regio! Vers, knapperig en royaal belegd. Ik kom hier elke dag voor de lunch." },
  { name: "Thomas B.",   location: "Brunssum",   rating: 5, body: "Fantastische bacon burger — het vlees was zo mals en alles was super vers. Snel klaar en vriendelijke bediening. Zeker terug!" },
  { name: "Sandra K.",   location: "Hoensbroek", rating: 5, body: "Fijn dat ze nu ook online bestellen hebben. Makkelijk, snel bezorgd en altijd vers. Top zaak!" },
];

const today = getCurrentDayKey();

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[90svh] flex items-center overflow-hidden" style={{ backgroundColor: "rgb(var(--accent))" }}>
        {/* Achtergrond: foto of geometrisch groen patroon */}
        {restaurant.heroImage ? (
          <>
            <Image
              src={restaurant.heroImage}
              alt="Broodjes & Meer Broodje Gebrook"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/60" />
          </>
        ) : (
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-[60%] h-full bg-[rgb(var(--accent-soft)/0.15)] rounded-bl-[40%]" />
            <div className="absolute bottom-0 left-0 w-[40%] h-[50%] bg-white/5 rounded-tr-[50%]" />
            <div className="absolute top-16 right-16 w-48 h-48 rounded-full bg-[rgb(var(--warm)/0.25)] blur-3xl" />
            <div className="absolute bottom-24 left-8 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
          </div>
        )}

        <div className="relative z-10 w-full mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12 py-16 sm:py-24">
          <div className="grid sm:grid-cols-12 gap-8 items-center">
            <div className="sm:col-span-7">
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/85 mb-6 flex items-center gap-3 font-medium">
                <span className="h-px w-8 bg-white/60" />
                Hoensbroek. NL
              </p>
              <h1 className="font-display font-bold leading-[0.9] tracking-[-0.02em]">
                <span className="block text-[15vw] sm:text-[10vw] lg:text-[8rem] text-white">Vers</span>
                <span className="block text-[15vw] sm:text-[10vw] lg:text-[8rem] -mt-2 text-white italic">belegd.</span>
                <span className="block text-[15vw] sm:text-[10vw] lg:text-[8rem] -mt-2 text-white">Elke dag.</span>
              </h1>
            </div>
            <div className="sm:col-span-4 sm:col-start-9 flex flex-col gap-5 sm:items-end">
              <OpenStatus service="delivery" />
              <p className="text-sm sm:text-right text-white/90 leading-relaxed max-w-xs">
                Ambachtelijke broodjes, burgers, salades en meer. Middenin Hoensbroek, elke dag met liefde bereid.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/menukaart"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 h-11 text-[12px] uppercase tracking-[0.18em] font-semibold text-[rgb(var(--accent))] hover:bg-white/90 transition-colors"
                >
                  Bekijk het menu <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <a
                href={`mailto:${restaurant.email}`}
                className="group flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                <span className="font-mono text-[12px] tracking-[0.12em] border-b border-transparent group-hover:border-white/40">{restaurant.email}</span>
              </a>
            </div>
          </div>

          <div className="border-t border-white/25 mt-12 pt-5 flex items-center justify-between">
            <div className="text-[11px] uppercase tracking-[0.25em] text-white/70 font-medium">{dayLabels[today]}</div>
            <a href="#aanbod" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-white/85 hover:text-white transition-colors font-medium">
              Ontdek <ArrowDown className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <Marquee />

      {/* SIGNATURE DUO */}
      <section id="aanbod" className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12 mb-10 sm:mb-14">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="h-1 w-10 bg-[rgb(var(--accent))] mb-4 rounded-full" />
              <h2 className="font-display text-4xl sm:text-6xl font-bold leading-[0.9] text-[rgb(var(--text))]">
                Onze twee<br />specialiteiten.
              </h2>
            </div>
            <Link href="/menukaart" className="hidden sm:inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-[rgb(var(--text-soft))] hover:text-[rgb(var(--accent))] transition-colors group">
              Volledig menu <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-px bg-[rgb(var(--border))]">
          <SignatureCard
            number="01" kicker="Ambachtelijk" title="Stokbroodjes" tagline="Krokant van buiten. Vers van binnen."
            body="Achttien varianten stokbroodje. Van carpaccio met truffelmayo tot klassiek ham en kaas. Elke dag vers gebakken brood, rijkelijk belegd."
            placeholder="bg-amber-100"
            alt="Vers stokbroodje van Broodje Gebrook"
            href="/menukaart#cat-stokbroodjes"
          />
          <SignatureCard
            number="02" kicker="Van de grill" title="Burgers" tagline="Vers rundvlees. Elke dag."
            body="Zes burgers van vers rundvlees. Van de klassieke hamburger tot de royale hamburger speciaal met gebakken ei en ui."
            placeholder="bg-red-100"
            alt="Sappige burger van Broodje Gebrook"
            href="/menukaart#cat-burgers"
            invert
          />
        </div>
      </section>

      {/* CATEGORIEËN */}
      <section className="py-20 sm:py-28 bg-[rgb(var(--bg))]">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-8 mb-12 sm:mb-14">
            <div className="lg:col-span-6">
              <div className="h-1 w-10 bg-[rgb(var(--accent))] mb-4 rounded-full" />
              <h2 className="font-display text-4xl sm:text-5xl font-bold leading-[0.95] text-balance text-[rgb(var(--text))]">
                Elf categorieën.<br />Voor elk moment.
              </h2>
            </div>
            <p className="lg:col-span-5 lg:col-start-8 text-[rgb(var(--text-soft))] leading-relaxed self-end">
              Van ambachtelijke stokbroodjes tot sappige burgers, van frisse salades tot warme tosti's. Voor de lunch, voor onderweg, voor thuis.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {CATEGORY_CARDS.map((c) => (
              <Link
                key={c.id}
                href={`/menukaart#cat-${c.id}`}
                className={`group relative overflow-hidden rounded-2xl border ${c.border} ${c.bg} aspect-[4/5] transition-all duration-200 hover:shadow-md hover:scale-[1.02] hover:border-[rgb(var(--accent)/0.4)]`}
              >
                {/* Emoji */}
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-300 group-hover:scale-110"
                  style={{ paddingBottom: "28%" }}
                >
                  <span className="text-6xl sm:text-7xl select-none">{c.emoji}</span>
                </div>

                {/* Pijl rechtsboven */}
                <div className="absolute top-3 right-3">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/70 group-hover:bg-[rgb(var(--accent))] transition-colors duration-200">
                    <ArrowUpRight className="h-3.5 w-3.5 text-[rgb(var(--text-soft))] group-hover:text-white transition-colors duration-200" />
                  </span>
                </div>

                {/* Tekst onderaan */}
                <div className="absolute bottom-0 inset-x-0 p-4">
                  <h3 className="font-display text-xl sm:text-2xl font-bold leading-tight text-[rgb(var(--text))] group-hover:text-[rgb(var(--accent))] transition-colors duration-200">
                    {c.name}
                  </h3>
                  <p className="mt-1 text-[11px] text-[rgb(var(--text-soft))] leading-relaxed line-clamp-2">{c.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAIR */}
      <section className="relative py-20 sm:py-32 bg-white">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-5 lg:sticky lg:top-32">
              <div className="h-1 w-10 bg-[rgb(var(--accent))] mb-4 rounded-full" />
              <h2 className="font-display text-4xl sm:text-5xl font-bold leading-[0.95] text-balance text-[rgb(var(--text))]">
                Het beste<br />van het huis.
              </h2>
              <p className="mt-5 text-[rgb(var(--text-soft))] leading-relaxed max-w-md">
                De gerechten waar onze gasten keer op keer voor terugkomen. Elke dag met zorg bereid.
              </p>

              {/* Decoratief kleurvlak als placeholder voor foto */}
              <div className="mt-8 relative aspect-[4/5] max-w-sm overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-gradient-to-br from-green-50 to-amber-50 flex items-center justify-center">
                <div className="text-center p-8">
                  <span className="text-6xl">🥖</span>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.3em] text-[rgb(var(--text-soft))]">Vers in de keuken. Vandaag.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <ul className="divide-y divide-[rgb(var(--border))]">
                {popular.map((item, i) => (
                  <li key={item.id} className="py-6 first:pt-0 last:pb-0">
                    <article className="group">
                      <div className="flex items-baseline gap-4 sm:gap-6">
                        <span className="font-mono text-[11px] tabular-nums text-[rgb(var(--text-soft)/0.5)] shrink-0 w-6">{String(i + 1).padStart(2, "0")}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-3 flex-wrap">
                            <h3 className="font-display text-xl sm:text-2xl font-bold leading-tight text-[rgb(var(--text))] group-hover:text-[rgb(var(--accent))] transition-colors">{item.name}</h3>
                            <span className="flex-1 mx-1 hidden sm:block border-b border-dashed border-[rgb(var(--border))] translate-y-[-6px]" />
                            <span className="font-display text-xl sm:text-2xl tabular-nums text-[rgb(var(--accent))] font-bold">€{item.price.toFixed(2).replace(".", ",")}</span>
                          </div>
                          <p className="mt-1.5 text-sm text-[rgb(var(--text-soft))] leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Link href="/menukaart" className="inline-flex items-center gap-2 h-12 px-7 rounded-full border border-[rgb(var(--border))] bg-transparent hover:bg-[rgb(var(--accent))] hover:border-[rgb(var(--accent))] hover:text-white text-[rgb(var(--text))] font-mono text-[12px] uppercase tracking-[0.2em] transition-all">
                  Bekijk alle gerechten <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OPENINGSTIJDEN */}
      <section className="relative bg-[rgb(var(--accent)/0.04)] border-y border-[rgb(var(--border))] py-20 sm:py-28">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-10 mb-12">
            <div className="lg:col-span-5">
              <div className="h-1 w-10 bg-[rgb(var(--accent))] mb-4 rounded-full" />
              <h2 className="font-display text-4xl sm:text-5xl font-bold leading-[0.95] text-[rgb(var(--text))]">Wanneer.</h2>
            </div>
            <p className="lg:col-span-5 lg:col-start-8 text-[rgb(var(--text-soft))] leading-relaxed self-end">
              Maandag tot en met vrijdag bezorgen en afhalen. Zaterdag alleen afhalen.{" "}
              <span className="text-[rgb(var(--text))] font-medium">Zondag rusten we uit.</span>
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <HoursColumn label="Bezorging" service="delivery" today={today} />
            <HoursColumn label="Afhalen" service="pickup" today={today} />
          </div>

          {/* Adres CTA */}
          <div className="mt-10 flex items-center gap-3">
            <a
              href={restaurant.social.googleMaps ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-[rgb(var(--accent))] text-white text-[12px] uppercase tracking-[0.18em] font-semibold hover:bg-[rgb(var(--accent-soft))] transition-colors"
            >
              <MapPin className="h-4 w-4" />
              {restaurant.address.street}, {restaurant.address.city}
            </a>
          </div>
        </div>
      </section>

      {/* BEOORDELINGEN */}
      <section id="reviews" className="py-20 sm:py-32 bg-white">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
          <div className="text-center mb-14 sm:mb-20">
            <div className="mx-auto h-1 w-10 bg-[rgb(var(--accent))] mb-4 rounded-full" />
            <h2 className="font-display text-4xl sm:text-6xl font-bold leading-[0.9] text-balance max-w-3xl mx-auto text-[rgb(var(--text))]">
              Wat gasten<br />over ons zeggen.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <figure key={r.name} className="relative bg-[rgb(var(--bg))] border border-[rgb(var(--border))] rounded-2xl p-8 sm:p-10">
                <Quote className="absolute top-6 right-6 h-7 w-7 text-[rgb(var(--accent)/0.12)]" />
                <p className="text-[14px] text-[rgb(var(--accent))] mb-3">{"★".repeat(r.rating)}</p>
                <blockquote className="font-display text-xl sm:text-2xl leading-[1.4] text-[rgb(var(--text)/0.85)] italic text-balance">"{r.body}"</blockquote>
                <figcaption className="mt-8 pt-5 border-t border-[rgb(var(--border))]">
                  <p className="text-sm font-semibold text-[rgb(var(--text))]">{r.name}</p>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[rgb(var(--text-soft))] mt-1 font-medium">{r.location}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative bg-[rgb(var(--accent))] py-24 sm:py-36 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[50%] h-full bg-[rgb(var(--accent-soft)/0.2)] rounded-bl-[40%]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        </div>
        <div className="relative z-10 mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
          <div className="max-w-2xl">
            <div className="h-1 w-10 bg-white/40 mb-6 rounded-full" />
            <h2 className="font-display text-5xl sm:text-7xl font-bold leading-[0.85] text-balance text-white">
              Honger?<br /><span className="text-white/70 italic">Wij staan klaar.</span>
            </h2>
            <p className="mt-6 text-lg text-white/70 max-w-md leading-relaxed">
              Bestel online of stuur een mail. Afhalen kan maandag tot en met zaterdag.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/menukaart" className="inline-flex items-center gap-2 rounded-full bg-white h-12 px-7 text-[12px] uppercase tracking-[0.2em] font-semibold text-[rgb(var(--accent))] hover:bg-white/90 transition-colors">
                Bestel nu <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={`mailto:${restaurant.email}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 text-white hover:bg-white/20 h-12 px-7 text-[12px] uppercase tracking-[0.2em] font-medium transition-colors"
              >
                <Mail className="h-4 w-4" /> Mail ons
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function SignatureCard({ number, kicker, title, tagline, body, placeholder, alt, href, invert }: {
  number: string; kicker: string; title: string; tagline: string; body: string;
  placeholder: string; alt: string; href: string; invert?: boolean;
}) {
  return (
    <Link href={href} className={`group relative block aspect-[4/5] sm:aspect-[5/6] overflow-hidden ${placeholder}`}>
      {/* Decoratief patroon als placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[12rem] opacity-10 select-none">{title === "Stokbroodjes" ? "🥖" : "🍔"}</span>
      </div>
      <div className={`absolute inset-0 ${invert ? "bg-gradient-to-t from-black/40 via-black/10 to-transparent" : "bg-gradient-to-t from-black/30 via-transparent to-transparent"}`} />

      <div className="relative h-full flex flex-col justify-between p-7 sm:p-12">
        <div className="flex items-start justify-between">
          <span className="text-[11px] uppercase tracking-[0.25em] text-[rgb(var(--accent))] font-semibold bg-white/80 px-3 py-1 rounded-full">{kicker}</span>
          <ArrowUpRight className="h-5 w-5 text-white/60 bg-black/20 rounded-full p-0.5 group-hover:bg-[rgb(var(--accent))] group-hover:text-white transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
        </div>
        <div>
          <h3 className="font-display text-5xl sm:text-8xl font-bold leading-[0.9] text-white drop-shadow-lg">{title}</h3>
          <p className="mt-3 font-display text-lg sm:text-xl italic text-white/80">"{tagline}"</p>
          <p className="mt-4 max-w-sm text-sm text-white/70 leading-relaxed">{body}</p>
        </div>
      </div>
    </Link>
  );
}

function HoursColumn({ label, service, today }: { label: string; service: "delivery" | "pickup"; today: DayKey }) {
  return (
    <div className="bg-white rounded-2xl border border-[rgb(var(--border))] p-6 sm:p-8">
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
