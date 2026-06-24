import { describe, it, expect } from "vitest";
import { MenuItem, SubmitOrderInput, tierForPoints, eur, toCents } from "../index";

describe("MenuItem schema", () => {
  it("accepts a minimal item", () => {
    const parsed = MenuItem.parse({
      id: "x",
      name: "Test",
      price: 1000,
    });
    expect(parsed.visible).toBe(true);
    expect(parsed.halal).toBe(true);
    expect(parsed.modifierGroups).toEqual([]);
  });

  it("rejects negative price", () => {
    expect(() => MenuItem.parse({ id: "x", name: "T", price: -1 })).toThrow();
  });
});

describe("SubmitOrderInput", () => {
  it("requires at least one line", () => {
    const r = SubmitOrderInput.safeParse({
      mode: "pickup",
      requestedTimeIso: new Date().toISOString(),
      lines: [],
      customer: { name: "Jan", phone: "0612345678", email: "j@example.com" },
      paymentMethod: "cash",
    });
    expect(r.success).toBe(false);
  });

  it("rejects invalid postcode", () => {
    const r = SubmitOrderInput.safeParse({
      mode: "delivery",
      requestedTimeIso: new Date().toISOString(),
      lines: [{ itemId: "x", qty: 1 }],
      customer: {
        name: "Jan",
        phone: "0612345678",
        email: "j@example.com",
        postcode: "invalid",
      },
      paymentMethod: "cash",
    });
    expect(r.success).toBe(false);
  });

  it("accepts valid order", () => {
    const r = SubmitOrderInput.safeParse({
      mode: "pickup",
      requestedTimeIso: new Date().toISOString(),
      lines: [{ itemId: "pizza-margherita", qty: 2 }],
      customer: { name: "Jan", phone: "0612345678", email: "j@example.com" },
      paymentMethod: "pin_on_pickup",
    });
    expect(r.success).toBe(true);
  });
});

describe("loyalty", () => {
  it("brons until 500", () => {
    expect(tierForPoints(0)).toBe("brons");
    expect(tierForPoints(499)).toBe("brons");
  });
  it("zilver from 500", () => {
    expect(tierForPoints(500)).toBe("zilver");
    expect(tierForPoints(1499)).toBe("zilver");
  });
  it("goud from 1500", () => {
    expect(tierForPoints(1500)).toBe("goud");
    expect(tierForPoints(99999)).toBe("goud");
  });
});

describe("money", () => {
  it("formats cents to EUR NL", () => {
    expect(eur(1250)).toMatch(/12,50/);
    expect(eur(0)).toMatch(/0,00/);
  });
  it("converts euros to cents safely", () => {
    expect(toCents(12.5)).toBe(1250);
    expect(toCents(0.1 + 0.2)).toBe(30); // floating-point safe
  });
});
