// ─────────────────────────────────────────────────────────────────────────────
// Firestore — Orders Collection Service
// ─────────────────────────────────────────────────────────────────────────────

import {
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  collection,
  serverTimestamp,
  runTransaction,
} from 'firebase/firestore';
import { db } from '../config';
import type { Order, Cart } from '@/types/order.types';

const COLLECTION = 'orders';
const COUNTER_DOC = 'counters/orders';

// ── Generate sequential order number ─────────────────────────────────────────
// Uses a Firestore transaction to atomically increment the counter

async function generateOrderNumber(): Promise<string> {
  const counterRef = doc(db, 'counters', 'orders');
  const year = new Date().getFullYear();

  const orderNumber = await runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const current = snap.exists() ? (snap.data().count as number) : 0;
    const next = current + 1;
    tx.set(counterRef, { count: next }, { merge: true });
    return `HW-${year}-${String(next).padStart(5, '0')}`;
  });

  return orderNumber;
}

// ── Place order from cart ─────────────────────────────────────────────────────

export async function placeOrder(
  cart: Cart,
  buyerId: string,
  buyerName: string,
  buyerGst: string | undefined,
  shippingAddress: Order['shippingAddress'],
  billingAddress: Order['billingAddress'],
  paymentMethod: Order['paymentMethod'],
  purchaseOrderNumber?: string,
  notes?: string
): Promise<string> {
  const orderNumber = await generateOrderNumber();

  // Extract unique seller IDs from cart items (needed for Firestore query)
  const sellerIds = [...new Set(cart.items.map((i) => i.sellerId))];

  const orderData: Omit<Order, 'id'> = {
    orderNumber,
    buyerId,
    buyerName,
    buyerGst,
    items: cart.items.map((item) => ({
      id: crypto.randomUUID(),
      productId: item.productId,
      productName: item.productName,
      productSku: item.productSku,
      productImageUrl: item.productImageUrl,
      sellerId: item.sellerId,
      sellerName: item.sellerName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.unitPrice * item.quantity,
      currency: item.currency,
      unit: item.unit,
      gstRate: item.gstRate,
      gstAmount: (item.unitPrice * item.quantity * item.gstRate) / 100,
      discount: 0,
      netPrice: item.unitPrice * item.quantity * (1 + item.gstRate / 100),
    })),
    status: 'pending_confirmation',
    paymentStatus: 'pending',
    paymentMethod,
    shippingAddress,
    billingAddress,
    subtotal: cart.subtotal,
    totalDiscount: cart.totalDiscount,
    totalGst: cart.totalGst,
    shippingCharge: cart.grandTotal >= 50000 ? 0 : 750,
    grandTotal: cart.grandTotal + (cart.grandTotal >= 50000 ? 0 : 750),
    currency: cart.currency,
    notes,
    purchaseOrderNumber,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const ref = await addDoc(collection(db, COLLECTION), {
    ...orderData,
    sellerIds,                        // top-level array for array-contains queries
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

// ── Get buyer orders ──────────────────────────────────────────────────────────

export async function getBuyerOrders(buyerId: string, pageSize = 20): Promise<Order[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('buyerId', '==', buyerId),
      limit(pageSize)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order);
    return list.sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());
  } catch (err) {
    console.warn('getBuyerOrders error:', err);
    return [];
  }
}

// ── Get seller orders ─────────────────────────────────────────────────────────

export async function getSellerOrders(sellerId: string, pageSize = 20): Promise<Order[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('sellerIds', 'array-contains', sellerId),
      limit(pageSize)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order);
    return list.sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime());
  } catch (err) {
    console.warn('getSellerOrders error:', err);
    return [];
  }
}

// ── Get all platform orders (admin) ──────────────────────────────────────────

export async function getAllOrders(pageSize = 50): Promise<Order[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order);
    return list
      .sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime())
      .slice(0, pageSize);
  } catch (err) {
    console.warn('getAllOrders error:', err);
    return [];
  }
}

// ── Get order by ID ───────────────────────────────────────────────────────────

export async function getOrderById(id: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Order;
}

// ── Update order status ───────────────────────────────────────────────────────

export async function updateOrderStatus(
  id: string,
  status: Order['status'],
  extra?: Partial<Pick<Order, 'tracking' | 'invoiceUrl'>>
): Promise<void> {
  const now = serverTimestamp();
  const update: Record<string, unknown> = {
    status,
    updatedAt: now,
    ...extra,
  };

  if (status === 'confirmed') update.confirmedAt = now;
  if (status === 'shipped') update.shippedAt = now;
  if (status === 'delivered') update.deliveredAt = now;

  await updateDoc(doc(db, COLLECTION, id), update);
}

export async function updatePaymentStatus(
  id: string,
  paymentStatus: Order['paymentStatus']
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    paymentStatus,
    updatedAt: serverTimestamp(),
  });
}
