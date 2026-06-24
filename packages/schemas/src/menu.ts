import { z } from "zod";
import { Cents } from "./money";

export const ModifierOption = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  priceDelta: z.number().int().default(0),
});
export type ModifierOption = z.infer<typeof ModifierOption>;

export const ModifierGroup = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  required: z.boolean().default(false),
  min: z.number().int().min(0).default(0),
  max: z.number().int().min(1).default(1),
  options: z.array(ModifierOption).min(1),
});
export type ModifierGroup = z.infer<typeof ModifierGroup>;

export const MenuItem = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(""),
  price: Cents,
  photo: z.string().nullable().default(null),
  allergens: z.array(z.string()).default([]),
  halal: z.boolean().default(true),
  visible: z.boolean().default(true),
  soldOut: z.boolean().default(false),
  order: z.number().int().default(0),
  modifierGroups: z.array(ModifierGroup).default([]),
});
export type MenuItem = z.infer<typeof MenuItem>;

export const MenuCategory = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(""),
  order: z.number().int().default(0),
  visible: z.boolean().default(true),
});
export type MenuCategory = z.infer<typeof MenuCategory>;
