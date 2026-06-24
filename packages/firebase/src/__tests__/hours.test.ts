import { describe, it, expect } from "vitest";
import { isOpenAt, generateSlots } from "../hours";
import type { OpeningHours } from "@eufraat/schemas";

const EUFRAAT_HOURS: OpeningHours = {
  mon: {
    pickup: [{ open: "15:30", close: "00:50", endsNextDay: true }],
    delivery: [{ open: "16:00", close: "00:45", endsNextDay: true }],
  },
  tue: { pickup: [], delivery: [] },
  wed: {
    pickup: [{ open: "15:30", close: "00:50", endsNextDay: true }],
    delivery: [{ open: "16:00", close: "00:45", endsNextDay: true }],
  },
  thu: {
    pickup: [{ open: "15:30", close: "00:50", endsNextDay: true }],
    delivery: [{ open: "16:00", close: "00:45", endsNextDay: true }],
  },
  fri: {
    pickup: [{ open: "15:30", close: "00:50", endsNextDay: true }],
    delivery: [{ open: "16:00", close: "00:45", endsNextDay: true }],
  },
  sat: {
    pickup: [{ open: "15:30", close: "00:50", endsNextDay: true }],
    delivery: [{ open: "16:00", close: "00:45", endsNextDay: true }],
  },
  sun: {
    pickup: [{ open: "15:30", close: "00:50", endsNextDay: true }],
    delivery: [{ open: "16:00", close: "00:45", endsNextDay: true }],
  },
};

// Pick a known Monday: 2026-06-01 is a Monday.
const monAt = (h: number, m = 0) => {
  const d = new Date(2026, 5, 1, h, m, 0, 0); // June is month 5 (0-indexed)
  return d;
};
const tueAt = (h: number, m = 0) => {
  const d = new Date(2026, 5, 2, h, m, 0, 0);
  return d;
};

describe("isOpenAt", () => {
  it("open Monday at 16:00 pickup", () => {
    expect(isOpenAt(EUFRAAT_HOURS, "pickup", monAt(16))).toBe(true);
  });
  it("open Monday at 23:00 delivery", () => {
    expect(isOpenAt(EUFRAAT_HOURS, "delivery", monAt(23))).toBe(true);
  });
  it("open early Tuesday 00:30 pickup (rolled from Mon)", () => {
    expect(isOpenAt(EUFRAAT_HOURS, "pickup", tueAt(0, 30))).toBe(true);
  });
  it("CLOSED Tuesday 16:00 (dinsdag gesloten)", () => {
    expect(isOpenAt(EUFRAAT_HOURS, "pickup", tueAt(16))).toBe(false);
  });
  it("CLOSED Monday 15:00 (voor opening)", () => {
    expect(isOpenAt(EUFRAAT_HOURS, "pickup", monAt(15))).toBe(false);
  });
  it("delivery STRICTER than pickup at 15:45", () => {
    expect(isOpenAt(EUFRAAT_HOURS, "pickup", monAt(15, 45))).toBe(true);
    expect(isOpenAt(EUFRAAT_HOURS, "delivery", monAt(15, 45))).toBe(false);
  });
});

describe("generateSlots", () => {
  it("returns 15-min slots respecting min lead time", () => {
    const from = monAt(17, 0);
    const slots = generateSlots(EUFRAAT_HOURS, "pickup", from, 30, 15);
    expect(slots.length).toBeGreaterThan(0);
    // First slot at least 30 min after start, rounded to next 15.
    expect(slots[0]!.getTime()).toBeGreaterThanOrEqual(from.getTime() + 30 * 60_000);
  });

  it("returns no slots when closed", () => {
    const slots = generateSlots(EUFRAAT_HOURS, "pickup", tueAt(17), 30, 15);
    expect(slots.length).toBe(0);
  });
});
