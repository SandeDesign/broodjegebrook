"use client";
import * as React from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export interface StaffSummary {
  uid: string;
  name: string;
  email?: string;
  role?: string;
}

/**
 * Live cache of all staff members keyed by uid.
 * Returns a getter to resolve a uid into a display name quickly.
 */
export function useStaffDirectory() {
  const [staffByUid, setStaffByUid] = React.useState<Record<string, StaffSummary>>({});

  React.useEffect(() => {
    let unsub: (() => void) | undefined;
    try {
      unsub = onSnapshot(collection(db(), "staff"), (snap) => {
        const next: Record<string, StaffSummary> = {};
        snap.docs.forEach((d) => {
          const data = d.data() as any;
          next[d.id] = {
            uid: d.id,
            name: data.displayName ?? data.email ?? "Onbekend",
            email: data.email,
            role: data.role,
          };
        });
        setStaffByUid(next);
      });
    } catch {
      // Firebase not initialized — will retry on next mount
    }
    return () => unsub?.();
  }, []);

  const resolve = React.useCallback(
    (uid?: string) => {
      if (!uid) return "—";
      return staffByUid[uid]?.name ?? uid.substring(0, 6);
    },
    [staffByUid],
  );

  return { staffByUid, resolve };
}

/** Get the current staff member's display name (from their /staff doc if available). */
export function useCurrentStaffName(): { uid: string; name: string } {
  const { staffByUid } = useStaffDirectory();
  const [authState, setAuthState] = React.useState<{ uid?: string; displayName?: string | null; email?: string | null }>({});

  React.useEffect(() => {
    // Only access Firebase on the client, after mount
    try {
      const u = auth().currentUser;
      if (u) setAuthState({ uid: u.uid, displayName: u.displayName, email: u.email });
    } catch {
      // Firebase not initialized yet — will refresh on next render
    }
  }, []);

  const uid = authState.uid ?? "staff";
  const name = (uid && staffByUid[uid]?.name)
    ?? authState.displayName
    ?? authState.email?.split("@")[0]
    ?? "Medewerker";
  return { uid, name };
}
