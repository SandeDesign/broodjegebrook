import { z } from "zod";
import { Cents } from "./money";

export const OrderMode = z.enum(["pickup", "delivery"]);
export type OrderMode = z.infer<typeof OrderMode>;

export const PaymentMethod = z.enum(["cash", "pin_on_pickup"]);
export type PaymentMethod = z.infer<typeof PaymentMethod>;

export const OrderStatus = z.enum([
  "new",
  "accepted",
  "preparing",
  "ready",
  "out_for_delivery",
  "completed",
  "cancelled",
]);
export type OrderStatus = z.infer<typeof OrderStatus>;

export const OrderLineModifier = z.object({
  groupId: z.string(),
  groupName: z.string(),
  optionId: z.string(),
  optionName: z.string(),
  priceDelta: z.number().int().default(0),
});
export type OrderLineModifier = z.infer<typeof OrderLineModifier>;

export const OrderLine = z.object({
  itemId: z.string(),
  name: z.string(),
  qty: z.number().int().min(1).max(50),
  unitPrice: Cents,
  modifiers: z.array(OrderLineModifier).default([]),
  note: z.string().max(280).default(""),
  lineTotal: Cents,
});
export type OrderLine = z.infer<typeof OrderLine>;

export const CustomerContact = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().min(8).max(20),
  email: z.string().email(),
  address: z.string().max(120).optional(),
  postcode: z
    .string()
    .regex(/^[1-9][0-9]{3}\s?[A-Za-z]{2}$/, "Geen geldige NL postcode")
    .optional(),
  city: z.string().max(60).optional(),
  note: z.string().max(280).default(""),
});
export type CustomerContact = z.infer<typeof CustomerContact>;

// Wat de client naar `submitOrder` Cloud Function stuurt.
// Bewust GEEN prijzen — server herberekent vanuit Firestore.
export const SubmitOrderInput = z.object({
  mode: OrderMode,
  requestedTimeIso: z.string().datetime(),
  lines: z
    .array(
      z.object({
        itemId: z.string(),
        qty: z.number().int().min(1).max(50),
        modifierSelections: z
          .array(
            z.object({
              groupId: z.string(),
              optionIds: z.array(z.string()).min(1),
            }),
          )
          .default([]),
        note: z.string().max(280).default(""),
      }),
    )
    .min(1),
  customer: CustomerContact,
  paymentMethod: PaymentMethod,
  promoCode: z.string().optional(),
});
export type SubmitOrderInput = z.infer<typeof SubmitOrderInput>;

export const StatusHistoryEntry = z.object({
  status: OrderStatus,
  at: z.string().datetime(),
  by: z.string(),
});

export const DriverLocation = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  at: z.string().datetime(),
});
export type DriverLocation = z.infer<typeof DriverLocation>;

export const Order = z.object({
  id: z.string(),
  number: z.number().int().min(1),
  createdAt: z.string().datetime(),
  source: z.literal("web"),
  mode: OrderMode,
  requestedTime: z.string().datetime(),
  status: OrderStatus,
  lines: z.array(OrderLine).min(1),
  subtotal: Cents,
  deliveryFee: Cents,
  discount: Cents.default(0),
  total: Cents,
  customer: CustomerContact,
  customerId: z.string().nullable(),
  bezorgerId: z.string().nullable().default(null),
  driverLocation: DriverLocation.nullable().default(null),
  paymentMethod: PaymentMethod,
  statusHistory: z.array(StatusHistoryEntry).default([]),
});
export type Order = z.infer<typeof Order>;
