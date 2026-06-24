"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SimpleCartLine = {
  uid: string;
  itemId: string;
  name: string;
  basePrice: number;
  qty: number;
  size?: string;
  sauce?: string;
  extras: { name: string; price: number }[];
  removed: string[];
  note: string;
};

type State = {
  lines: SimpleCartLine[];
  add: (line: Omit<SimpleCartLine, "uid">) => void;
  inc: (uid: string) => void;
  dec: (uid: string) => void;
  remove: (uid: string) => void;
  clear: () => void;
};

const safeLine = (l: Partial<SimpleCartLine>): SimpleCartLine => ({
  uid: l.uid ?? "",
  itemId: l.itemId ?? "",
  name: l.name ?? "",
  basePrice: typeof l.basePrice === "number" ? l.basePrice : 0,
  qty: typeof l.qty === "number" ? l.qty : 1,
  size: l.size,
  sauce: l.sauce,
  extras: Array.isArray(l.extras) ? l.extras : [],
  removed: Array.isArray(l.removed) ? l.removed : [],
  note: l.note ?? "",
});

const makeUid = (l: Omit<SimpleCartLine, "uid" | "qty">) =>
  [
    l.itemId,
    l.size ?? "",
    l.sauce ?? "",
    (l.extras ?? []).map((e) => e.name).sort().join(","),
    (l.removed ?? []).slice().sort().join(","),
    l.note ?? "",
  ].join("#");

export const useSimpleCart = create<State>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (raw) => {
        const line = safeLine(raw);
        const uid = makeUid(line);
        const existing = get().lines.find((l) => l.uid === uid);
        if (existing) {
          set({ lines: get().lines.map((l) => (l.uid === uid ? { ...l, qty: l.qty + (line.qty ?? 1) } : l)) });
          return;
        }
        set({ lines: [...get().lines, { ...line, uid }] });
      },
      inc: (uid) => set({ lines: get().lines.map((l) => (l.uid === uid ? { ...l, qty: l.qty + 1 } : l)) }),
      dec: (uid) => set({ lines: get().lines.map((l) => (l.uid === uid ? { ...l, qty: l.qty - 1 } : l)).filter((l) => l.qty > 0) }),
      remove: (uid) => set({ lines: get().lines.filter((l) => l.uid !== uid) }),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "eufraat-simple-cart",
      version: 2,
      migrate: (persisted) => {
        const lines = ((persisted as { lines?: Partial<SimpleCartLine>[] })?.lines ?? []).map(safeLine);
        return { lines };
      },
    },
  ),
);

export function linePrice(l: SimpleCartLine): number {
  const base = typeof l.basePrice === "number" ? l.basePrice : 0;
  const extras = Array.isArray(l.extras) ? l.extras : [];
  const qty = typeof l.qty === "number" ? l.qty : 1;
  return (base + extras.reduce((s, e) => s + (e?.price ?? 0), 0)) * qty;
}

export function cartTotal(lines: SimpleCartLine[]): number {
  if (!Array.isArray(lines)) return 0;
  return lines.reduce((s, l) => s + linePrice(l), 0);
}
