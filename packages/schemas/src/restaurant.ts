import { z } from "zod";
import { Cents } from "./money";

export const Weekday = z.enum([
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
]);
export type Weekday = z.infer<typeof Weekday>;

// "HH:MM" — "00:50" met endsNextDay: true betekent sluitingstijd 0:50 de volgende dag.
export const TimeWindow = z.object({
  open: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/),
  close: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/),
  endsNextDay: z.boolean().default(false),
});
export type TimeWindow = z.infer<typeof TimeWindow>;

export const DaySchedule = z.object({
  pickup: z.array(TimeWindow).default([]),
  delivery: z.array(TimeWindow).default([]),
});
export type DaySchedule = z.infer<typeof DaySchedule>;

export const OpeningHours = z.record(Weekday, DaySchedule);
export type OpeningHours = z.infer<typeof OpeningHours>;

export const DeliveryZone = z.object({
  postcodePrefix: z.string().regex(/^[1-9][0-9]{3}$/),
  fee: Cents,
  minOrder: Cents,
  maxDistanceKm: z.number().positive().optional(),
});
export type DeliveryZone = z.infer<typeof DeliveryZone>;

export const Restaurant = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  postcode: z.string(),
  city: z.string(),
  phone: z.string(),
  timezone: z.string().default("Europe/Amsterdam"),
  openingHours: OpeningHours,
  deliveryZones: z.array(DeliveryZone).default([]),
  pickupEnabled: z.boolean().default(true),
  deliveryEnabled: z.boolean().default(true),
  prepTimeMinutes: z.number().int().min(5).max(120).default(30),
  pauseUntil: z.string().datetime().nullable().default(null),
});
export type Restaurant = z.infer<typeof Restaurant>;
