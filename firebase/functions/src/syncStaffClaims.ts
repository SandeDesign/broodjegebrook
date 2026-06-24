import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { getAuth } from "firebase-admin/auth";
import { logger } from "firebase-functions";

const ROLES = ["owner", "manager", "kitchen", "cashier", "bezorger"] as const;
type Role = (typeof ROLES)[number];

export const syncStaffClaims = onDocumentWritten(
  {
    document: "staff/{uid}",
    region: "europe-west1",
  },
  async (event) => {
    const uid = event.params.uid;
    const after = event.data?.after.data();
    const auth = getAuth();

    if (!after) {
      // Document verwijderd → claims wissen
      await auth.setCustomUserClaims(uid, null);
      logger.info(`Cleared staff claims for ${uid}`);
      return;
    }

    const role = after.role as Role | undefined;
    if (!role || !ROLES.includes(role)) {
      logger.warn(`Skipping ${uid}: invalid role ${role}`);
      return;
    }

    await auth.setCustomUserClaims(uid, { role, staff: true });
    logger.info(`Set claims for ${uid}: ${role}`);
  },
);
