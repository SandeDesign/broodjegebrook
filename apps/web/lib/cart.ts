"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MenuItem, OrderMode } from "@eufraat/schemas";

export type CartLine = {
  uid: string; // unieke line-id (item + modifiers-hash)
  itemId: string;
  name: string;
  qty: number;
  unitPriceEstimate: number; // alleen voor UI! server herberekent
  modifierSelections: { groupId: string; optionIds: string[]; labels: string[] }[];
  note: string;
};

type CartState = {
  mode: OrderMode;
  postcode: string;
  requestedTimeIso: string | null;
  lines: CartLine[];
  add: (item: MenuItem, selections: CartLine["modifierSelections"], note: string) => void;
  inc: (uid: string) => void;
  dec: (uid: string) => void;
  remove: (uid: string) => void;
  clear: () => void;
  setMode: (m: OrderMode) => void;
  setPostcode: (p: string) => void;
  setTime: (iso: string | null) => void;
};

function lineUid(itemId: string, selections: CartLine["modifierSelections"]): string {
  const sig = selections
    .map((s) => `${s.groupId}:${s.optionIds.slice().sort().join(",")}`)
    .sort()
    .join("|");
  return `${itemId}#${sig}`;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      mode: "pickup",
      postcode: "",
      requestedTimeIso: null,
      lines: [],
      add: (item, selections, note) => {
        const uid = lineUid(item.id, selections);
        const modDelta = selections.reduce((sum, s) => {
          const group = item.modifierGroups.find((g) => g.id === s.groupId);
          return (
            sum +
            s.optionIds.reduce((g, oid) => {
              const opt = group?.options.find((o) => o.id === oid);
              return g + (opt?.priceDelta ?? 0);
            }, 0)
          );
        }, 0);
        const unitPriceEstimate = item.price + modDelta;
        const existing = get().lines.find((l) => l.uid === uid);
        if (existing) {
          set({
            lines: get().lines.map((l) =>
              l.uid === uid ? { ...l, qty: l.qty + 1 } : l,
            ),
          });
          return;
        }
        set({
          lines: [
            ...get().lines,
            {
              uid,
              itemId: item.id,
              name: item.name,
              qty: 1,
              unitPriceEstimate,
              modifierSelections: selections,
              note,
            },
          ],
        });
      },
      inc: (uid) =>
        set({
          lines: get().lines.map((l) => (l.uid === uid ? { ...l, qty: l.qty + 1 } : l)),
        }),
      dec: (uid) =>
        set({
          lines: get()
            .lines.map((l) => (l.uid === uid ? { ...l, qty: l.qty - 1 } : l))
            .filter((l) => l.qty > 0),
        }),
      remove: (uid) => set({ lines: get().lines.filter((l) => l.uid !== uid) }),
      clear: () => set({ lines: [] }),
      setMode: (mode) => set({ mode }),
      setPostcode: (postcode) => set({ postcode }),
      setTime: (iso) => set({ requestedTimeIso: iso }),
    }),
    { name: "eufraat-cart" },
  ),
);

export function subtotalCents(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.unitPriceEstimate * l.qty, 0);
}
