'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, Cart } from '@/types/order.types';

// SSR-safe localStorage wrapper
const ssrSafeLocalStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Cart Store — persisted to localStorage, SSR-safe via persist middleware
// ─────────────────────────────────────────────────────────────────────────────

interface CartStore extends Cart {
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  getItemQuantity: (productId: string) => number;
}

function computeCartTotals(items: CartItem[]): Pick<Cart, 'subtotal' | 'totalGst' | 'totalDiscount' | 'grandTotal' | 'itemCount'> {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalGst = 0; // Prices are all-inclusive of 10% platform margin and GST
  const totalDiscount = 0;
  const grandTotal = subtotal - totalDiscount;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { subtotal, totalGst, totalDiscount, grandTotal, itemCount };
}

const EMPTY_CART: Cart = {
  items: [],
  subtotal: 0,
  totalGst: 0,
  totalDiscount: 0,
  grandTotal: 0,
  currency: 'INR',
  itemCount: 0,
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      ...EMPTY_CART,

      addItem: (newItem: CartItem) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === newItem.productId);
          let items: CartItem[];

          if (existing) {
            const newQty = Math.min(existing.quantity + newItem.quantity, newItem.stock);
            items = state.items.map((i) =>
              i.productId === newItem.productId ? { ...i, quantity: newQty } : i
            );
          } else {
            items = [...state.items, newItem];
          }

          return { items, ...computeCartTotals(items), currency: newItem.currency };
        });
      },

      removeItem: (productId: string) => {
        set((state) => {
          const items = state.items.filter((i) => i.productId !== productId);
          return { items, ...computeCartTotals(items) };
        });
      },

      updateQuantity: (productId: string, quantity: number) => {
        set((state) => {
          if (quantity <= 0) {
            const items = state.items.filter((i) => i.productId !== productId);
            return { items, ...computeCartTotals(items) };
          }
          const items = state.items.map((i) => {
            if (i.productId !== productId) return i;
            const clampedQty = Math.min(Math.max(quantity, i.moq), i.stock);
            return { ...i, quantity: clampedQty };
          });
          return { items, ...computeCartTotals(items) };
        });
      },

      clearCart: () => set({ ...EMPTY_CART }),

      isInCart: (productId: string) => get().items.some((i) => i.productId === productId),

      getItemQuantity: (productId: string) =>
        get().items.find((i) => i.productId === productId)?.quantity ?? 0,
    }),
    {
      name: 'hw-cart',
      storage: createJSONStorage(() => ssrSafeLocalStorage),
      skipHydration: true,
    }
  )
);
