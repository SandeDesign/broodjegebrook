import { restaurant, dayOrder, type DayKey, type OpeningWindow } from "@/data/restaurant";

export type ServiceType = "delivery" | "pickup";

function nowInAmsterdam(): Date {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Amsterdam",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  });
  const p = fmt.formatToParts(new Date()).reduce<Record<string, string>>((a, x) => { a[x.type] = x.value; return a; }, {});
  return new Date(+p.year, +p.month - 1, +p.day, +p.hour === 24 ? 0 : +p.hour, +p.minute, +p.second);
}

export function getCurrentDayKey(d: Date = nowInAmsterdam()): DayKey {
  return dayOrder[(d.getDay() + 6) % 7];
}

function parseHHMM(t: string) {
  const [h, m] = t.split(":").map(Number);
  return { h, m };
}

function isWithinWindow(w: OpeningWindow, now: Date): boolean {
  const openMin = parseHHMM(w.open).h * 60 + parseHHMM(w.open).m;
  let closeMin = parseHHMM(w.close).h * 60 + parseHHMM(w.close).m;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  if (closeMin <= openMin) {
    closeMin += 24 * 60;
    if (nowMin < openMin) return nowMin < closeMin - 24 * 60;
    return nowMin >= openMin && nowMin < closeMin;
  }
  return nowMin >= openMin && nowMin < closeMin;
}

function isPrevDayLateNight(w: OpeningWindow, now: Date): boolean {
  const openMin = parseHHMM(w.open).h * 60 + parseHHMM(w.open).m;
  const closeMin = parseHHMM(w.close).h * 60 + parseHHMM(w.close).m;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return closeMin <= openMin ? nowMin < closeMin : false;
}

export interface OpenStatusResult { isOpen: boolean; label: string; nextChange?: string; }

export function getOpenStatus(service: ServiceType): OpenStatusResult {
  const now = nowInAmsterdam();
  const today = getCurrentDayKey(now);
  const prevDay = dayOrder[(dayOrder.indexOf(today) + 6) % 7];
  const prevWindow = restaurant.hours[service][prevDay];

  if (prevWindow && isPrevDayLateNight(prevWindow, now)) {
    return { isOpen: true, label: "Nu open", nextChange: prevWindow.close };
  }

  const w = restaurant.hours[service][today];
  if (!w) return { isOpen: false, label: "Vandaag gesloten" };

  if (isWithinWindow(w, now)) return { isOpen: true, label: "Nu open", nextChange: w.close };

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const openMin = parseHHMM(w.open).h * 60 + parseHHMM(w.open).m;
  if (nowMin < openMin) return { isOpen: false, label: `Opent om ${w.open}`, nextChange: w.open };
  return { isOpen: false, label: "Nu gesloten" };
}
