import {
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import type { Order, MenuCategory, MenuItem, Restaurant, Customer } from "@eufraat/schemas";

function typedConverter<T extends { id: string }>(): FirestoreDataConverter<T> {
  return {
    toFirestore(model: T) {
      const { id: _omit, ...rest } = model;
      return rest as Record<string, unknown>;
    },
    fromFirestore(snap: QueryDocumentSnapshot): T {
      return { id: snap.id, ...(snap.data() as object) } as T;
    },
  };
}

export const orderConverter = typedConverter<Order>();
export const menuCategoryConverter = typedConverter<MenuCategory>();
export const menuItemConverter = typedConverter<MenuItem>();
export const restaurantConverter = typedConverter<Restaurant>();
export const customerConverter = typedConverter<Customer>();
