import { z } from "zod";

export const LoyaltyTier = z.enum(["brons", "zilver", "goud"]);
export type LoyaltyTier = z.infer<typeof LoyaltyTier>;

export const CustomerAddress = z.object({
  label: z.string().max(40).default("Thuis"),
  street: z.string().min(2).max(120),
  postcode: z.string().regex(/^[1-9][0-9]{3}\s?[A-Za-z]{2}$/),
  city: z.string().min(2).max(60),
  note: z.string().max(120).default(""),
});
export type CustomerAddress = z.infer<typeof CustomerAddress>;

export const Customer = z.object({
  id: z.string(),
  name: z.string().min(2).max(80),
  email: z.string().email(),
  phone: z.string().min(8).max(20),
  addresses: z.array(CustomerAddress).default([]),
  favorites: z.array(z.string()).default([]),
  loyalty: z.object({
    points: z.number().int().min(0).default(0),
    tier: LoyaltyTier.default("brons"),
    lastOrderAt: z.string().datetime().nullable().default(null),
  }),
  consents: z.object({
    marketingEmail: z.boolean().default(false),
    marketingSms: z.boolean().default(false),
  }),
  createdAt: z.string().datetime(),
});
export type Customer = z.infer<typeof Customer>;

export function tierForPoints(points: number): LoyaltyTier {
  if (points >= 1500) return "goud";
  if (points >= 500) return "zilver";
  return "brons";
}
