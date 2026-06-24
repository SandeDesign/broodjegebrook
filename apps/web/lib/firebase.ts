"use client";
import { initFirebase } from "@eufraat/firebase";
import { FIREBASE_CONFIG } from "./firebase-config";

if (typeof window !== "undefined") {
  initFirebase(FIREBASE_CONFIG);
}

export { db, auth, functions, storage, RESTAURANT_ID } from "@eufraat/firebase";
