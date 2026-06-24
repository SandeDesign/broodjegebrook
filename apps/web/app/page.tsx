import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Phone, Quote } from "lucide-react";
import { Marquee } from "@/components/Marquee";
import { OpenStatus } from "@/components/OpenStatus";
import { restaurant, dayLabels, dayOrder, type DayKey } from "@/data/restaurant";
import { getCurrentDayKey } from "@/lib/hours";

const CATEGORY_CARDS = [
  { id: "pizza",        name: "Pizza",        desc: "Versgebakken in de steenoven op 380°C",      emoji: "🍕", gradient: "from-red-900 via-orange-800 to-amber-700" },
  { id: "gevuld",       name: "Calzone",      desc: "Dichtgevouwen pizza, overgoten met saus",    emoji: "🥟", gradient: "from-amber-900 via-orange-800 to-red-800" },
  { id: "schotels",     name: "Schotels",     desc: "Dagvers gemarineerd vlees, saus naar keuze", emoji: "🍖", gradient: "from-stone-900 via-amber-900 to-orange-900" },
  { id: "kapsalon",     name: "Kapsalon",     desc: "Friet, vlees, gesmolten kaas, salade",       emoji: "🍟", gradient: "from-amber-800 via-yellow-700 to-amber-900" },
  { id: "durum",        name: "Dürüm",        desc: "Zacht flatbread met vlees en groenten",       emoji: "🌯", gradient: "from-amber-700 via-orange-700 to-stone-800" },
  { id: "hamburgers",   name: "Hamburgers",   desc: "Handgevormde burgers van de grill",           emoji: "🍔", gradient: "from-amber-800 via-red-900 to-stone-900" },
  { id: "pasta",        name: "Pasta",        desc: "Overbakken met kaas, spaghetti of macaroni",  emoji: "🍝", gradient: "from-red-800 via-amber-800 to-yellow-800" },
  { id: "broodjes",     name: "Broodjes",     desc: "Turks brood of pita. Vers belegd.",            emoji: "🥖", gradient: "from-amber-700 via-yellow-800 to-stone-800" },
  { id: "menus",        name: "Menu's",       desc: "Combinaties met friet en drank erbij",         emoji: "🍱", gradient: "from-orange-900 via-amber-800 to-stone-900" },
  { id: "friet",        name: "Friet",        desc: "Krokant gebakken, klein of groot",             emoji: "🍟", gradient: "from-yellow-700 via-amber-700 to-orange-800" },
  { id: "snacks",       name: "Snacks",       desc: "Klassiekers met een twist",                    emoji: "🌭", gradient: "from-stone-800 via-amber-800 to-orange-800" },
  { id: "bijgerechten", name: "Bijgerechten", desc: "Salades en kleine extra's",                    emoji: "🥗", gradient: "from-emerald-900 via-green-800 to-amber-800" },
  { id: "extras",       name: "Extra's",      desc: "Sauzen en porties naar keuze",                 emoji: "🧂", gradient: "from-stone-800 via-amber-900 to-stone-900" },
  { id: "dranken",      name: "Dranken",      desc: "Fris, traditioneel of warm",                   emoji: "🥤", gradient: "from-blue-900 via-slate-800 to-stone-900" },
] as const;

const popular = [
  { id: "1", name: "Pizza Margherita", description: "Tomatensaus, mozzarella, verse basilicum", price: 9.50, tags: ["populair"] },
  { id: "2", name: "Shoarma groot schotel", description: "Dagvers gemarineerd, met friet, salade en saus naar keuze", price: 14.00, tags: ["populair"] },
  { id: "3", name: "Kapsalon shoarma", description: "Friet, shoarma, gesmolten kaas, salade en saus", price: 12.00, tags: ["populair"] },
  { id: "4", name: "Pizza shoarma speciaal", description: "Mozzarella, shoarmavlees, uien, paprika en saus", price: 13.50, tags: ["populair"] },
  { id: "5", name: "Dürüm kebab", description: "Zacht flatbread, verse groenten, knoflooksaus", price: 9.00, tags: [] },
  { id: "6", name: "Gyros schotel", description: "Gekruid varkensvlees, tzatziki, friet en pita", price: 14.50, tags: [] },
];

const reviews = [
  { name: "Fatima A.", location: "Geleen", rating: 5, body: "Beste pizza van de regio. De bodem is perfect knapperig en de toppings zijn altijd vers. Bestel hier elke week!" },
  { name: "Kevin M.", location: "Sittard", rating: 5, body: "Shoarma is echt geweldig. Sappig, goed gekruid en de sauzen zijn heerlijk. Snel geleverd ook. Aanrader!" },
  { name: "Lotte V.", location: "Geleen", rating: 5, body: "Eindelijk een eigen bestelsite zonder Bistroo. Makkelijk bestellen en altijd lekker. Goede keuze!" },
];

const today = getCurrentDayKey();

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hero-pizza.webp" alt="Pizza uit de steenoven van Eufraat" className="absolute inset-0 h-full w-full object-cover scale-105" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/65 via-ink/40 to-ink" />
        <div className="absolute inset-0 noise" />

        <div className="relative z-10 mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12 h-full flex flex-col">
          <div className="flex-1 flex items-end pb-8 sm:pb-10">
            <div className="grid w-full grid-cols-2 sm:grid-cols-12 gap-4 sm:gap-6 items-end pt-32">
              <div className="sm:col-span-6">
                <p className="text-[11px] uppercase tracking-[0.3em] text-gold mb-6 sm:mb-8 flex items-center gap-3 font-medium">
                  <span className="h-px w-8 bg-gold" />
                  Geleen · NL
                </p>
                <h1 className="font-display font-medium leading-[0.85] tracking-[-0.04em]">
                  <span className="block text-[18vw] sm:text-[12vw] lg:text-[9.5rem] italic text-cream">Vers</span>
                  <span className="block text-[18vw] sm:text-[12vw] lg:text-[9.5rem] -mt-2 sm:-mt-4 text-gold/95">uit</span>
                  <span className="block text-[18vw] sm:text-[12vw] lg:text-[9.5rem] -mt-2 sm:-mt-4 italic text-cream">de oven.</span>
                </h1>
              </div>
              <div className="sm:col-span-4 sm:col-start-9 flex flex-col gap-5 sm:items-end">
                <OpenStatus service="delivery" />
                <p className="text-sm sm:text-right text-cream/75 leading-relaxed max-w-xs">
                  Een familiezaak waar de oven en de grill samenkomen. Vlak in het hart van Geleen.
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <Link href="/menukaart" className="inline-flex items-center gap-2 rounded-full bg-gold px-6 h-11 text-[12px] uppercase tracking-[0.18em] font-semibold text-ink hover:bg-gold-soft transition-colors">
                    Bestellen <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <a href={`tel:${restaurant.phone}`} className="group flex items-center gap-2 text-cream/65 hover:text-cream transition-colors">
                  <Phone className="h-3.5 w-3.5" />
                  <span className="font-mono text-[12px] tracking-[0.15em] border-b border-transparent group-hover:border-gold/40">{restaurant.phoneDisplay}</span>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-line/[0.06] py-5 flex items-center justify-between">
            <div className="text-[11px] uppercase tracking-[0.25em] text-cream/55 font-medium">{dayLabels[today]}</div>
            <a href="#manifesto" className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-cream/70 hover:text-gold transition-colors font-medium">
              Scroll <ArrowDown className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <Marquee />

      {/* SIGNATURE DUO — direct na hero, klikt door naar de juiste categorie */}
      <section id="signature" className="relative pt-16 sm:pt-24">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12 mb-10 sm:mb-14">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="h-px w-12 bg-gold mb-4" />
              <h2 className="font-display text-5xl sm:text-7xl font-medium italic leading-[0.9] text-balance text-cream">De grote twee.</h2>
            </div>
            <Link href="/menukaart" className="hidden sm:inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.3em] text-cream/70 hover:text-gold transition-colors group">
              Volledig menu <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
        <div className="grid md:grid-cols-2">
          <SignatureCard
            number="01" kicker="Steenoven" title="Pizza" tagline="Vuur, deeg, geduld."
            body="Onze pizza's worden gebakken op 380°C. Krokante bodem, romige mozzarella, San Marzano tomatensaus. Klassiek of pittig. Altijd vers."
            image="/hero-pizza.webp" alt="Pizza Margherita uit de steenoven"
            href="/menukaart#cat-pizza"
          />
          <SignatureCard
            number="02" kicker="Van de grill" title="Schotels" tagline="Dagvers gemarineerd."
            body="Onze schotels worden dagvers bereid. Sappig vlees, saus naar keuze, salade en friet. Een complete maaltijd op één bord."
            image="/hero-shoarma.webp" alt="Schotel specialiteit op het bord"
            href="/menukaart#cat-schotels" invert
          />
        </div>
      </section>

      {/* CATEGORIES — alle 14 hoofdstukken, elk klikbaar naar de juiste sectie */}
      <section className="py-20 sm:py-32 bg-ink/60">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-8 mb-12 sm:mb-16">
            <div className="lg:col-span-6">
              <div className="h-px w-12 bg-gold mb-4" />
              <h2 className="font-display text-5xl sm:text-6xl font-medium italic leading-[0.95] text-balance text-cream">
                Alle<br />hoofdstukken.
              </h2>
            </div>
            <p className="lg:col-span-5 lg:col-start-8 text-cream/65 leading-relaxed self-end">
              Veertien categorieën. Van versgebakken pizza tot dagverse shoarma, van krokante kapsalon tot een verzorgde menu-combinatie.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {CATEGORY_CARDS.map((c) => (
              <Link
                key={c.id}
                href={`/menukaart#cat-${c.id}`}
                className="group relative overflow-hidden rounded-2xl border border-line/[0.08] aspect-[4/5] transition-all duration-300 hover:border-gold/50 hover:scale-[1.02]"
              >
                {/* Per-category gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-70 group-hover:opacity-90 transition-opacity duration-500`} />
                {/* Noise + dark overlay for legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                <div className="absolute inset-0 noise" />

                {/* Big emoji centerpiece */}
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-500 group-hover:scale-110"
                  style={{ paddingBottom: "30%" }}
                >
                  <span
                    className="text-7xl sm:text-8xl select-none"
                    style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.45))" }}
                  >
                    {c.emoji}
                  </span>
                </div>

                <div className="relative h-full p-4 sm:p-5 flex flex-col justify-between">
                  <div className="flex justify-end">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink/60 border border-line/15 group-hover:bg-gold group-hover:border-gold transition-all duration-300">
                      <ArrowUpRight className="h-3.5 w-3.5 text-cream/80 group-hover:text-ink transition-colors duration-300" />
                    </span>
                  </div>
                  <div>
                    <h3 className="font-display text-2xl sm:text-3xl font-medium italic leading-tight text-cream group-hover:text-gold transition-colors duration-300">
                      {c.name}
                    </h3>
                    <p className="mt-1.5 text-[11px] sm:text-xs text-cream/65 leading-relaxed line-clamp-2">{c.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR */}
      <section className="relative py-24 sm:py-40 overflow-hidden">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-5 lg:sticky lg:top-32">
              <div className="h-px w-12 bg-gold mb-4" />
              <h2 className="font-display text-5xl sm:text-6xl font-medium italic leading-[0.95] text-balance text-cream">
                Het beste<br />van het huis.
              </h2>
              <p className="mt-6 text-cream/65 leading-relaxed max-w-md">
                De gerechten waar onze gasten keer op keer voor terugkomen. Zorgvuldigheid in elke stap.
              </p>
              <div className="mt-8 relative aspect-[4/5] max-w-sm overflow-hidden border border-line/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/ingredients-flatlay.webp" alt="Mediterrane ingrediënten" className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-ink to-transparent">
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cream/70">Vers in de keuken. Vandaag.</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7">
              <ul className="divide-y divide-line/[0.08]">
                {popular.map((item, i) => (
                  <li key={item.id} className="py-6 first:pt-0 last:pb-0">
                    <article className="group">
                      <div className="flex items-baseline gap-4 sm:gap-6">
                        <span className="font-mono text-[11px] tabular-nums text-cream/40 shrink-0 w-6">{String(i + 1).padStart(2, "0")}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-3 flex-wrap">
                            <h3 className="font-display text-xl sm:text-2xl font-medium leading-tight text-cream group-hover:text-gold transition-colors">{item.name}</h3>
                            <span className="flex-1 mx-1 hidden sm:block border-b border-dashed border-line/15 translate-y-[-6px]" />
                            <span className="font-display text-xl sm:text-2xl tabular-nums text-gold font-medium">€{item.price.toFixed(2).replace(".", ",")}</span>
                          </div>
                          <p className="mt-1.5 text-sm text-cream/55 leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    </article>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Link href="/menukaart" className="inline-flex items-center gap-2 h-12 px-7 rounded-full border border-line/20 bg-transparent hover:bg-line/[0.04] hover:border-gold/50 hover:text-gold text-cream font-mono text-[12px] uppercase tracking-[0.2em] transition-colors">
                  Bekijk alle gerechten <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOURS */}
      <section className="relative bg-ink border-y border-line/[0.06] py-24 sm:py-32">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "url(/restaurant-interior.webp)", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/95 to-ink" />
        <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-10 mb-12">
            <div className="lg:col-span-5">
              <div className="h-px w-12 bg-gold mb-4" />
              <h2 className="font-display text-5xl sm:text-6xl font-medium italic leading-[0.95] text-cream">Wanneer.</h2>
            </div>
            <p className="lg:col-span-5 lg:col-start-8 text-cream/65 leading-relaxed self-end">
              Zes dagen per week staan we voor je klaar. Bezorging vanaf 16:00, afhalen al vanaf 15:30.{" "}
              <span className="text-cream">Dinsdag rusten we uit.</span>
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-px bg-line/[0.06]">
            <HoursColumn label="Bezorging" service="delivery" today={today} />
            <HoursColumn label="Afhalen" service="pickup" today={today} />
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="py-24 sm:py-40">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
          <div className="text-center mb-16 sm:mb-20">
            <div className="mx-auto h-px w-12 bg-gold mb-4" />
            <h2 className="font-display text-5xl sm:text-7xl font-medium italic leading-[0.9] text-balance max-w-4xl mx-auto text-cream">
              Wat gasten<br />over ons zeggen.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-line/[0.06]">
            {reviews.map((r, i) => (
              <figure key={r.name} className="relative bg-card p-8 sm:p-10">
                <Quote className="absolute top-6 right-6 h-8 w-8 text-gold/15" />
                <p className="text-[14px] text-gold mb-4">{"★".repeat(r.rating)}</p>
                <blockquote className="font-display text-xl sm:text-2xl leading-[1.4] text-cream/90 italic text-balance">"{r.body}"</blockquote>
                <figcaption className="mt-8 pt-6 border-t border-line/[0.08]">
                  <p className="text-sm font-medium text-cream">{r.name}</p>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-cream/50 mt-1 font-medium">{r.location}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative h-[80svh] min-h-[520px] overflow-hidden border-t border-line/[0.06]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/shoarma-wrap.webp" alt="Verse shoarma wrap" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-ink/30" />
        <div className="absolute inset-0 noise" />
        <div className="relative z-10 mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12 h-full flex items-center">
          <div className="max-w-2xl">
            <div className="h-px w-12 bg-gold mb-6" />
            <h2 className="font-display text-6xl sm:text-8xl font-medium italic leading-[0.85] text-balance text-cream">
              Honger?<br /><span className="text-gold">Wij staan klaar.</span>
            </h2>
            <p className="mt-6 text-lg text-cream/75 max-w-md">
              Bezorging tot diep in de avond, of bel direct voor afhalen. Klaar in een handomdraai.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/menukaart" className="inline-flex items-center gap-2 rounded-full bg-gold h-12 px-7 text-[12px] uppercase tracking-[0.2em] font-semibold text-ink hover:bg-gold-soft transition-colors">
                Bestel nu <ArrowRight className="h-4 w-4" />
              </Link>
              <a href={`tel:${restaurant.phone}`} className="inline-flex items-center gap-2 rounded-full border border-line/25 bg-line/[0.04] text-cream hover:bg-line/[0.1] h-12 px-7 text-[12px] uppercase tracking-[0.2em] font-medium transition-colors">
                <Phone className="h-4 w-4" /> {restaurant.phoneDisplay}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function SignatureCard({ number, kicker, title, tagline, body, image, alt, href, invert }: {
  number: string; kicker: string; title: string; tagline: string; body: string;
  image: string; alt: string; href: string; invert?: boolean;
}) {
  return (
    <Link href={href} className="group relative block aspect-[4/5] sm:aspect-[5/6] overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt={alt} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
      <div className={`absolute inset-0 ${invert ? "bg-gradient-to-t from-ink via-ink/40 to-ink/20" : "bg-gradient-to-t from-ink via-ink/30 to-ink/10"}`} />
      <div className="relative h-full flex flex-col justify-between p-7 sm:p-12">
        <div className="flex items-start justify-between">
          <span className="text-[11px] uppercase tracking-[0.25em] text-gold font-medium">{kicker}</span>
          <ArrowUpRight className="h-5 w-5 text-cream/60 group-hover:text-gold transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
        </div>
        <div>
          <h3 className="font-display text-7xl sm:text-9xl font-medium italic leading-[0.9] text-cream">{title}</h3>
          <p className="mt-4 font-display text-xl sm:text-2xl italic text-gold/95">"{tagline}"</p>
          <p className="mt-5 max-w-sm text-sm text-cream/70 leading-relaxed">{body}</p>
        </div>
      </div>
    </Link>
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
