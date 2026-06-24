import { z } from "zod";

// Alle bedragen in centen (integers). Voorkomt floating-point fouten.
export const Cents = z.number().int().min(0).max(1_000_000);
export type Cents = z.infer<typeof Cents>;

export function eur(cents: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function toCents(euros: number): number {
  return Math.round(euros * 100);
}
