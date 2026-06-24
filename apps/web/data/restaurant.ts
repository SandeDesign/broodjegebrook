export type DayKey = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
export interface OpeningWindow { open: string; close: string; }

export const restaurant = {
  name: "Pizzeria Shoarma Eufraat",
  shortName: "Eufraat",
  logo: "https://d1rhw9bys454w3.cloudfront.net/library/43810/conversions/logo_465x320-(20)-size-sm.webp",
  phone: "+31464106745",
  phoneDisplay: "046 410 6745",
  email: "Sefkan.yildiz@live.nl",
  address: { street: "Rijksweg Centrum 38", city: "Geleen", postcode: "6161 EG" },
  social: {
    whatsapp: "https://wa.me/31464106745",
    googleMaps: "https://www.google.com/maps/search/?api=1&query=Pizzeria+Shoarma+Eufraat+Geleen",
  },
  hours: {
    delivery: {
      monday:    { open: "16:00", close: "00:45" },
      tuesday:   null,
      wednesday: { open: "16:00", close: "00:45" },
      thursday:  { open: "16:00", close: "00:45" },
      friday:    { open: "16:00", close: "00:45" },
      saturday:  { open: "16:00", close: "00:45" },
      sunday:    { open: "16:00", close: "00:45" },
    } as Record<DayKey, OpeningWindow | null>,
    pickup: {
      monday:    { open: "15:30", close: "00:50" },
      tuesday:   null,
      wednesday: { open: "15:30", close: "00:50" },
      thursday:  { open: "15:30", close: "00:50" },
      friday:    { open: "15:30", close: "00:50" },
      saturday:  { open: "15:30", close: "00:50" },
      sunday:    { open: "15:30", close: "00:50" },
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
