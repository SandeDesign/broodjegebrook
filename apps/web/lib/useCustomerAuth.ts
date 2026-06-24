"use client";
import * as React from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type CustomerUser = User;

type State = {
  user: CustomerUser | null;
  loading: boolean;
};

export function useCustomerAuth(): State {
  const [state, setState] = React.useState<State>({ user: null, loading: true });

  React.useEffect(() => {
    const unsub = onAuthStateChanged(auth(), (u) => {
      setState({ user: u, loading: false });
    });
    return unsub;
  }, []);

  return state;
}

export async function loginWithEmail(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth(), email, password);
}

export async function registerWithEmail(
  email: string,
  password: string,
  name: string,
): Promise<void> {
  const safeName = (name ?? "").trim() || "Klant";
  const safeEmail = (email ?? "").trim();
  const cred = await createUserWithEmailAndPassword(auth(), safeEmail, password);
  await updateProfile(cred.user, { displayName: safeName });
  // Write customer doc to Firestore — no undefined allowed
  await setDoc(doc(db(), "customers", cred.user.uid), {
    uid: cred.user.uid,
    name: safeName,
    email: safeEmail,
    createdAt: serverTimestamp(),
    loyalty: { points: 0, tier: "brons" },
  });
}

export async function logout(): Promise<void> {
  await signOut(auth());
}
