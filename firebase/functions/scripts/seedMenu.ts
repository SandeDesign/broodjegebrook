/**
 * Seed Firestore (emulator of productie) met restaurant + menu uit Bistroo-data.
 *
 * Lokaal:
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 pnpm seed
 *
 * Productie (via service account, eenmalig):
 *   GOOGLE_APPLICATION_CREDENTIALS=./key.json FIREBASE_PROJECT=eufraat-prod pnpm seed
 */
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import {
  SEED_RESTAURANT,
  SEED_CATEGORIES,
  SEED_ITEMS,
} from "@eufraat/schemas/dist/seed-data.js";

async function main() {
  if (!getApps().length) {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      initializeApp({
        credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
      });
    } else {
      initializeApp({ projectId: process.env.FIREBASE_PROJECT ?? "eufraat-dev" });
    }
  }
  const db = getFirestore();

  console.log("Seeding restaurant…");
  await db
    .collection("restaurants")
    .doc(SEED_RESTAURANT.id)
    .set(SEED_RESTAURANT, { merge: true });

  console.log(`Seeding ${SEED_CATEGORIES.length} categories…`);
  const menuRef = db.collection("restaurants").doc(SEED_RESTAURANT.id).collection("menu");
  for (const cat of SEED_CATEGORIES) {
    await menuRef.doc(cat.id).set(cat, { merge: true });
    const items = SEED_ITEMS[cat.id] ?? [];
    console.log(`  · ${cat.name}: ${items.length} items`);
    for (let i = 0; i < items.length; i++) {
      const it = items[i]!;
      await menuRef.doc(cat.id).collection("items").doc(it.id).set({ ...it, order: i }, { merge: true });
    }
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
