import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import { SubmitOrderInput, type MenuItem, type Restaurant } from "@eufraat/schemas";
import { calculateLines } from "./pricing";
import { isOpenAt } from "./hours";

const RESTAURANT_ID = "eufraat";
const REGION = "europe-west1";

export const submitOrder = onCall(
  {
    region: REGION,
    cors: true,
    enforceAppCheck: false, // zet aan zodra App Check geconfigureerd is
  },
  async (request) => {
    const parsed = SubmitOrderInput.safeParse(request.data);
    if (!parsed.success) {
      throw new HttpsError("invalid-argument", parsed.error.message);
    }
    const input = parsed.data;
    const db = getFirestore();

    // 1) Restaurant + openingsuren ophalen
    const restRef = db.collection("restaurants").doc(RESTAURANT_ID);
    const restSnap = await restRef.get();
    if (!restSnap.exists) {
      throw new HttpsError("failed-precondition", "Restaurant niet gevonden");
    }
    const rest = restSnap.data() as Restaurant;

    const requestedTime = new Date(input.requestedTimeIso);
    if (Number.isNaN(requestedTime.getTime())) {
      throw new HttpsError("invalid-argument", "Ongeldige tijd");
    }

    if (rest.pauseUntil && new Date(rest.pauseUntil) > new Date()) {
      throw new HttpsError("failed-precondition", "We zijn even pauze, probeer het zo opnieuw.");
    }
    if (input.mode === "pickup" && !rest.pickupEnabled) {
      throw new HttpsError("failed-precondition", "Afhalen is uitgeschakeld");
    }
    if (input.mode === "delivery" && !rest.deliveryEnabled) {
      throw new HttpsError("failed-precondition", "Bezorgen is uitgeschakeld");
    }
    if (!isOpenAt(rest.openingHours, input.mode, requestedTime)) {
      throw new HttpsError(
        "failed-precondition",
        `Gekozen tijd valt buiten ${input.mode === "pickup" ? "afhaaltijden" : "bezorgtijden"}`,
      );
    }

    // 2) Menu-items in batches ophalen
    const uniqueIds = Array.from(new Set(input.lines.map((l) => l.itemId)));
    const itemsById = new Map<string, MenuItem>();
    // Items zitten genest onder /restaurants/{id}/menu/{cat}/items/{itemId}.
    // Voor v1 doen we een collectionGroup query.
    const itemsSnap = await db
      .collectionGroup("items")
      .where("__name__", "in", uniqueIds.map((id) =>
        // collectionGroup filter on document id requires path-like ref; use simpler approach: fetch all visible items.
        id,
      ).slice(0, 10))
      .get()
      .catch(() => null);

    // Fallback: simpel ophalen van alle categorieën en items (kleine catalogus, OK voor v1).
    if (!itemsSnap || itemsSnap.empty) {
      const cats = await restRef.collection("menu").get();
      for (const cat of cats.docs) {
        const items = await cat.ref.collection("items").get();
        for (const it of items.docs) {
          itemsById.set(it.id, { id: it.id, ...(it.data() as object) } as MenuItem);
        }
      }
    } else {
      for (const doc of itemsSnap.docs) {
        itemsById.set(doc.id, { id: doc.id, ...(doc.data() as object) } as MenuItem);
      }
    }

    // 3) Server herberekent prijzen
    const { lines, subtotal } = calculateLines(input.lines, itemsById);

    // 4) Bezorgkosten + min-order check
    let deliveryFee = 0;
    if (input.mode === "delivery") {
      const pc = input.customer.postcode?.replace(/\s/g, "").substring(0, 4);
      if (!pc) {
        throw new HttpsError("invalid-argument", "Postcode is verplicht bij bezorgen");
      }
      const zone = rest.deliveryZones.find((z) => z.postcodePrefix === pc);
      if (!zone) {
        throw new HttpsError(
          "out-of-range",
          "We bezorgen helaas niet op dit postcodegebied. Kies afhalen.",
        );
      }
      if (subtotal < zone.minOrder) {
        throw new HttpsError(
          "failed-precondition",
          `Minimaal bestelbedrag voor bezorgen in ${pc} is € ${(zone.minOrder / 100).toFixed(2)}`,
        );
      }
      deliveryFee = zone.fee;
    }

    const total = subtotal + deliveryFee;

    // 5) Order-nummer claimen (dagelijkse counter, atomic)
    const today = new Date();
    const dateKey = today.toISOString().slice(0, 10);
    const counterRef = db.collection("counters").doc(dateKey);
    const orderRef = restRef.collection("orders").doc();

    const auth = request.auth;
    const customerId = auth?.uid ?? null;

    const nowIso = new Date().toISOString();

    await db.runTransaction(async (tx) => {
      const counterSnap = await tx.get(counterRef);
      const lastNumber = (counterSnap.exists ? (counterSnap.data()?.lastOrderNumber as number) : 0) || 0;
      const number = lastNumber + 1;

      tx.set(counterRef, { lastOrderNumber: number, updatedAt: FieldValue.serverTimestamp() }, { merge: true });

      tx.set(orderRef, {
        number,
        createdAt: nowIso,
        source: "web",
        mode: input.mode,
        requestedTime: requestedTime.toISOString(),
        status: "new",
        lines,
        subtotal,
        deliveryFee,
        discount: 0,
        total,
        customer: input.customer,
        customerId,
        bezorgerId: null,
        driverLocation: null,
        paymentMethod: input.paymentMethod,
        statusHistory: [
          { status: "new", at: nowIso, by: customerId ?? "guest" },
        ],
        _createdAt: FieldValue.serverTimestamp(),
      });
    });

    return {
      orderId: orderRef.id,
      total,
      requestedTime: requestedTime.toISOString(),
    };
  },
);
