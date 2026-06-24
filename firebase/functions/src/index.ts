import { initializeApp } from "firebase-admin/app";

initializeApp();

export { submitOrder } from "./submitOrder";
export { onOrderCreated } from "./onOrderCreated";
export { onOrderStatusChanged } from "./onOrderStatusChanged";
export { syncStaffClaims } from "./syncStaffClaims";
