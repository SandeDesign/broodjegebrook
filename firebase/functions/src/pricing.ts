import type { MenuItem, SubmitOrderInput, OrderLine } from "@eufraat/schemas";
import { HttpsError } from "firebase-functions/v2/https";

/**
 * Server-side prijsberekening. Vertrouw NOOIT prijzen die de client stuurt.
 * Itereert lines, valideert modifier-keuzes, en geeft genormaliseerde OrderLine[] terug.
 */
export function calculateLines(
  input: SubmitOrderInput["lines"],
  itemsById: Map<string, MenuItem>,
): { lines: OrderLine[]; subtotal: number } {
  const lines: OrderLine[] = [];
  let subtotal = 0;

  for (const reqLine of input) {
    const item = itemsById.get(reqLine.itemId);
    if (!item) {
      throw new HttpsError("not-found", `Item ${reqLine.itemId} bestaat niet`);
    }
    if (!item.visible) {
      throw new HttpsError("failed-precondition", `${item.name} is niet beschikbaar`);
    }
    if (item.soldOut) {
      throw new HttpsError("failed-precondition", `${item.name} is uitverkocht`);
    }

    // Valideer alle required modifier groups en bereken delta.
    let modifierDelta = 0;
    const modifiers: OrderLine["modifiers"] = [];

    for (const group of item.modifierGroups) {
      const sel = reqLine.modifierSelections.find((s) => s.groupId === group.id);
      const chosen = sel?.optionIds ?? [];

      if (group.required && chosen.length < group.min) {
        throw new HttpsError(
          "invalid-argument",
          `${item.name}: kies a.u.b. ${group.name.toLowerCase()}`,
        );
      }
      if (chosen.length > group.max) {
        throw new HttpsError(
          "invalid-argument",
          `${item.name}: te veel opties voor ${group.name}`,
        );
      }

      for (const optionId of chosen) {
        const opt = group.options.find((o) => o.id === optionId);
        if (!opt) {
          throw new HttpsError(
            "invalid-argument",
            `Onbekende optie ${optionId} voor ${group.name}`,
          );
        }
        modifierDelta += opt.priceDelta;
        modifiers.push({
          groupId: group.id,
          groupName: group.name,
          optionId: opt.id,
          optionName: opt.name,
          priceDelta: opt.priceDelta,
        });
      }
    }

    const unitPrice = item.price + modifierDelta;
    const lineTotal = unitPrice * reqLine.qty;
    subtotal += lineTotal;

    lines.push({
      itemId: item.id,
      name: item.name,
      qty: reqLine.qty,
      unitPrice,
      modifiers,
      note: reqLine.note,
      lineTotal,
    });
  }

  return { lines, subtotal };
}
