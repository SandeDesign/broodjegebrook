import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import type { Order } from "@eufraat/schemas";

export const onOrderCreated = onDocumentCreated(
  {
    document: "restaurants/{restaurantId}/orders/{orderId}",
    region: "europe-west1",
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const order = { id: snap.id, ...(snap.data() as object) } as Order;

    const db = getFirestore();

    // FCM topic-push naar alle ingelogde tablets
    try {
      await getMessaging().send({
        topic: `restaurant-${event.params.restaurantId}`,
        notification: {
          title: `Nieuwe bestelling #${order.number}`,
          body: `${order.mode === "pickup" ? "Afhalen" : "Bezorgen"} · ${order.lines.length} item(s) · € ${(order.total / 100).toFixed(2)}`,
        },
        data: {
          orderId: order.id,
          orderNumber: String(order.number),
          mode: order.mode,
        },
        android: { priority: "high" },
        apns: { headers: { "apns-priority": "10" } },
      });
    } catch (err) {
      logger.warn("FCM push gefaald", err);
    }

    // E-mail naar klant via Firebase Trigger Email extension (/mail collection)
    if (order.customer.email) {
      await db.collection("mail").add({
        to: order.customer.email,
        message: {
          subject: `Eufraat — bestelling #${order.number} ontvangen`,
          html: orderConfirmationHtml(order),
        },
      });
    }
  },
);

function orderConfirmationHtml(order: Order): string {
  const lines = order.lines
    .map(
      (l) =>
        `<tr><td>${l.qty}× ${escape(l.name)}</td><td style="text-align:right">€ ${(l.lineTotal / 100).toFixed(2)}</td></tr>`,
    )
    .join("");
  const when = new Date(order.requestedTime).toLocaleString("nl-NL", {
    dateStyle: "full",
    timeStyle: "short",
  });
  return `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h1 style="color:#c87a2b">Bedankt voor je bestelling!</h1>
      <p>Hi ${escape(order.customer.name)}, we hebben je bestelling #${order.number} ontvangen.</p>
      <p><strong>${order.mode === "pickup" ? "Afhalen" : "Bezorgen"}</strong> rond <strong>${when}</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px">
        ${lines}
        <tr><td colspan="2"><hr/></td></tr>
        <tr><td>Subtotaal</td><td style="text-align:right">€ ${(order.subtotal / 100).toFixed(2)}</td></tr>
        ${order.deliveryFee ? `<tr><td>Bezorgkosten</td><td style="text-align:right">€ ${(order.deliveryFee / 100).toFixed(2)}</td></tr>` : ""}
        <tr><td><strong>Totaal</strong></td><td style="text-align:right"><strong>€ ${(order.total / 100).toFixed(2)}</strong></td></tr>
      </table>
      <p style="margin-top:24px">Betaling: <strong>${order.paymentMethod === "cash" ? "Contant" : "PIN bij afhalen/bezorgen"}</strong></p>
      <p style="color:#666;font-size:14px;margin-top:32px">Vragen? Bel ons op +31 46 410 67 45.</p>
    </div>
  `;
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
