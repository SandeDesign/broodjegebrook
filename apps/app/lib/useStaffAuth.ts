"use client";
import * as React from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export type StaffRole = "owner" | "manager" | "kitchen" | "cashier" | "bezorger" | null;

export function useStaffAuth() {
  const [user, setUser] = React.useState<User | null>(null);
  const [role, setRole] = React.useState<StaffRole>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth(), async (u) => {
      setUser(u);
      if (u) {
        // Probeer eerst custom claim (snelste, werkt overal)
        const token = await u.getIdTokenResult();
        let resolved = (token.claims.role as StaffRole) ?? null;
        // Fallback: lees rol uit Firestore /staff/{uid} (werkt direct na registratie,
        // ook als syncStaffClaims Cloud Function nog niet gedraaid heeft)
        if (!resolved) {
          try {
            const snap = await getDoc(doc(db(), "staff", u.uid));
            if (snap.exists()) resolved = (snap.data().role as StaffRole) ?? null;
          } catch {
            // negeer — rules kunnen lezen blokkeren als user nog geen claim heeft
          }
        }
        setRole(resolved);
      } else {
        setRole(null);
      }
      setReady(true);
    });
    return () => unsub();
  }, []);

  return { user, role, ready, isStaff: !!role };
}

export function can(role: StaffRole, action:
  | "view_orders"
  | "update_status"
  | "view_deliveries"
  | "update_driver_location"
  | "edit_menu"
  | "edit_hours"
  | "edit_promotions"
  | "view_customers"
  | "view_reports"
  | "manage_staff",
): boolean {
  if (!role) return false;
  switch (action) {
    case "view_orders":
    case "update_status":
      return role !== "bezorger";
    case "view_deliveries":
    case "update_driver_location":
      return true; // alle rollen zien bezorgingen, bezorger heeft speciale view
    case "edit_menu":
    case "edit_hours":
    case "edit_promotions":
    case "view_customers":
      return role === "owner" || role === "manager";
    case "view_reports":
    case "manage_staff":
      return role === "owner";
  }
}
