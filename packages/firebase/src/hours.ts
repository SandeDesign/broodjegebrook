import type { OpeningHours, OrderMode, Weekday } from "@eufraat/schemas";

const WEEKDAY: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function weekdayKey(d: Date): Weekday {
  return WEEKDAY[d.getDay()]!;
}

function setTime(d: Date, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const out = new Date(d);
  out.setHours(h!, m!, 0, 0);
  return out;
}

/**
 * Is the restaurant open at `when` for `mode`?
 * Handles windows that end after midnight (close < open + endsNextDay).
 */
export function isOpenAt(
  hours: OpeningHours,
  mode: OrderMode,
  when: Date,
): boolean {
  // Check today's windows.
  const today = hours[weekdayKey(when)];
  if (today) {
    const windows = mode === "pickup" ? today.pickup : today.delivery;
    for (const w of windows) {
      const open = setTime(when, w.open);
      let close = setTime(when, w.close);
      if (w.endsNextDay) close.setDate(close.getDate() + 1);
      if (when >= open && when <= close) return true;
    }
  }
  // Check yesterday's late-night window that rolled past midnight.
  const yesterday = new Date(when);
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = weekdayKey(yesterday);
  const yDay = hours[yKey];
  if (yDay) {
    const windows = mode === "pickup" ? yDay.pickup : yDay.delivery;
    for (const w of windows) {
      if (!w.endsNextDay) continue;
      const open = setTime(yesterday, w.open);
      const close = setTime(yesterday, w.close);
      close.setDate(close.getDate() + 1);
      if (when >= open && when <= close) return true;
    }
  }
  return false;
}

/**
 * Generate selectable 15-minute pickup/delivery slots from `from` until close.
 * Excludes slots earlier than `from + minLeadMinutes`.
 */
export function generateSlots(
  hours: OpeningHours,
  mode: OrderMode,
  from: Date,
  minLeadMinutes = 30,
  stepMinutes = 15,
): Date[] {
  const slots: Date[] = [];
  const start = new Date(from.getTime() + minLeadMinutes * 60_000);
  // Round up to next step.
  start.setSeconds(0, 0);
  const overshoot = start.getMinutes() % stepMinutes;
  if (overshoot) start.setMinutes(start.getMinutes() + (stepMinutes - overshoot));

  const horizon = new Date(start.getTime() + 6 * 60 * 60_000); // 6h horizon
  const cursor = new Date(start);
  while (cursor <= horizon) {
    if (isOpenAt(hours, mode, cursor)) slots.push(new Date(cursor));
    cursor.setMinutes(cursor.getMinutes() + stepMinutes);
  }
  return slots;
}
