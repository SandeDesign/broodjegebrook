// Duplicate van packages/firebase/src/hours.ts maar inline om Node-only build
// van Cloud Functions niet te koppelen aan client-Firebase package.
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

export function isOpenAt(hours: OpeningHours, mode: OrderMode, when: Date): boolean {
  const today = hours[weekdayKey(when)];
  if (today) {
    const windows = mode === "pickup" ? today.pickup : today.delivery;
    for (const w of windows) {
      const open = setTime(when, w.open);
      const close = setTime(when, w.close);
      if (w.endsNextDay) close.setDate(close.getDate() + 1);
      if (when >= open && when <= close) return true;
    }
  }
  const yesterday = new Date(when);
  yesterday.setDate(yesterday.getDate() - 1);
  const yDay = hours[weekdayKey(yesterday)];
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
