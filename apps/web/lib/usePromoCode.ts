"use client";
import * as React from "react";
import {
  collection, query, where, getDocs, doc, increment, updateDoc,
} from "firebase/firestore";
import { db, RESTAURANT_ID } from "@/lib/firebase";

export interface ValidPromo {
  id: string;
  code: string;
  type: "percent" | "amount";
  value: number;
  minOrder: number;
  maxUses: number;
  usedCount: number;
}

export type PromoError =
  | "not_found"
  | "inactive"
  | "min_order"
  | "max_uses"
  | "expired"
  | "unknown";

export function calcDiscount(promo: ValidPromo, subtotal: number): number {
  if (subtotal < (promo.minOrder ?? 0)) return 0;
  if (promo.type === "percent") {
    return Math.round((subtotal * promo.value) / 100 * 100) / 100;
  }
  return Math.min(promo.value, subtotal);
}

export function usePromoCode() {
  const [promo, setPromo] = React.useState<ValidPromo | null>(null);
  const [error, setError] = React.useState<PromoError | null>(null);
  const [validating, setValidating] = React.useState(false);

  const validate = async (code: string, subtotal: number) => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      setPromo(null); setError(null);
      return;
    }
    setValidating(true);
    setError(null);
    try {
      const snap = await getDocs(
        query(
          collection(db(), "restaurants", RESTAURANT_ID, "promotions"),
          where("code", "==", normalized),
        ),
      );
      if (snap.empty) {
        setPromo(null);
        setError("not_found");
        return;
      }
      const docSnap = snap.docs[0];
      const data = docSnap.data() as any;

      if (!data.active) {
        setPromo(null); setError("inactive"); return;
      }
      if (data.maxUses && data.usedCount >= data.maxUses) {
        setPromo(null); setError("max_uses"); return;
      }
      if (subtotal < (data.minOrder ?? 0)) {
        setPromo(null); setError("min_order"); return;
      }
      // Check dates if set
      const now = Date.now();
      if (data.validFrom?.seconds && data.validFrom.seconds * 1000 > now) {
        setPromo(null); setError("expired"); return;
      }
      if (data.validTo?.seconds && data.validTo.seconds * 1000 < now) {
        setPromo(null); setError("expired"); return;
      }

      setPromo({
        id: docSnap.id,
        code: data.code,
        type: data.type,
        value: data.value,
        minOrder: data.minOrder ?? 0,
        maxUses: data.maxUses ?? 0,
        usedCount: data.usedCount ?? 0,
      });
    } catch {
      setPromo(null);
      setError("unknown");
    } finally {
      setValidating(false);
    }
  };

  const clear = () => { setPromo(null); setError(null); };

  return { promo, error, validating, validate, clear };
}

export async function consumePromo(promoId: string): Promise<void> {
  try {
    await updateDoc(
      doc(db(), "restaurants", RESTAURANT_ID, "promotions", promoId),
      { usedCount: increment(1) },
    );
  } catch {
    // non-fatal
  }
}

export const PROMO_MESSAGES: Record<PromoError, string> = {
  not_found: "Code niet gevonden.",
  inactive: "Deze code is niet actief.",
  min_order: "Minimaal orderbedrag niet bereikt.",
  max_uses: "Code is niet meer geldig.",
  expired: "Code is verlopen of nog niet geldig.",
  unknown: "Kon code niet controleren.",
};
