import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { tierForPoints, type Order } from "@eufraat/schemas";
import { logger } from "firebase-functions";

export const onOrderStatusChanged = onDocumentUpdated(
  {
    document: "restaurants/{restaurantId}/orders/{orderId}",
    region: "europe-west1",
  },
  async (event) => {
    const before = event.data?.before.data() as Order | undefined;
    const after = event.data?.after.data() as Order | undefined;
    if (!before || !after) return;
    if (before.status === after.status) return;

    logger.info(`Order #${after.number}: ${before.status} → ${after.status}`);

    // Loyalty: punten bij completed
    if (after.status === "completed" && after.customerId) {
      const db = getFirestore();
      const custRef = db.collection("customers").doc(after.customerId);
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(custRef);
        if (!snap.exists) return;
        const data = snap.data() ?? {};
        const currentPoints = ((data.loyalty?.points as number) ?? 0) | 0;
        const earned = Math.floor(after.total / 100); // 1 punt per euro
        const newPoints = currentPoints + earned;
        tx.update(custRef, {
          "loyalty.points": newPoints,
          "loyalty.tier": tierForPoints(newPoints),
          "loyalty.lastOrderAt": new Date().toISOString(),
        });
      });
    }
  },
);
