export type DayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
export interface OpeningWindow { open: string; close: string; }

export const restaurant = {
  name: "Broodjes & Meer Broodje Gebrook",
  shortName: "Broodje Gebrook",
  logo: "/logo_broodjes_gebrook.png",
  heroImage: "/hero.jpg" as string | null,
  phone: null as null,
  phoneDisplay: null as null,
  email: "info@broodjegebrook.nl",
  address: { street: "Nieuwstraat 23", city: "Hoensbroek", postcode: "6431 KP" },
  social: {
    whatsapp: null as null,
    googleMaps: "https://www.google.com/maps/search/?api=1&query=Broodjes+Meer+Broodje+Gebrook+Hoensbroek",
  },
  hours: {
    delivery: {
      monday:    { open: "10:00", close: "15:00" },
      tuesday:   { open: "10:00", close: "14:30" },
      wednesday: { open: "10:00", close: "14:00" },
      thursday:  { open: "10:00", close: "14:00" },
      friday:    { open: "10:00", close: "15:00" },
      saturday:  null,
      sunday:    null,
    } as Record<DayKey, OpeningWindow | null>,
    pickup: {
      monday:    { open: "10:00", close: "15:00" },
      tuesday:   { open: "10:00", close: "15:00" },
      wednesday: { open: "10:00", close: "15:00" },
      thursday:  { open: "10:00", close: "15:00" },
      friday:    { open: "10:00", close: "15:00" },
      saturday:  { open: "10:00", close: "14:00" },
      sunday:    null,
    } as Record<DayKey, OpeningWindow | null>,
  },
};

export const dayLabels: Record<DayKey, string> = {
  monday: "Maandag", tuesday: "Dinsdag", wednesday: "Woensdag",
  thursday: "Donderdag", friday: "Vrijdag", saturday: "Zaterdag", sunday: "Zondag",
};

export const dayOrder: DayKey[] = [
  "monday","tuesday","wednesday","thursday","friday","saturday","sunday",
];
