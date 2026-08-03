// ─────────────────────────────────────────────────────────────────────────────
// Firestore — Carts Collection Service
// One document per buyer: carts/{uid}
// ─────────────────────────────────────────────────────────────────────────────

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config';
import type { Cart } from '@/types/order.types';

const COLLECTION = 'carts';

export async function getCart(userId: string): Promise<Cart | null> {
  const snap = await getDoc(doc(db, COLLECTION, userId));
  if (!snap.exists()) return null;
  return snap.data() as Cart;
}

export async function saveCart(userId: string, cart: Cart): Promise<void> {
  await setDoc(
    doc(db, COLLECTION, userId),
    { ...cart, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function clearCart(userId: string): Promise<void> {
  await setDoc(doc(db, COLLECTION, userId), {
    items: [],
    subtotal: 0,
    totalGst: 0,
    totalDiscount: 0,
    grandTotal: 0,
    currency: 'INR',
    itemCount: 0,
    updatedAt: serverTimestamp(),
  });
}
