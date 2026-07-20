'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';

// ─────────────────────────────────────────────────────────────────────────────
// StoreHydration — manually rehydrates zustand persist stores after client mount
// This prevents SSR hydration mismatch caused by localStorage being unavailable
// on the server. Place this in the root layout as early as possible.
// ─────────────────────────────────────────────────────────────────────────────

export default function StoreHydration() {
  useEffect(() => {
    // Rehydrate both persisted stores from localStorage after client mount
    useAuthStore.persist.rehydrate();
    useCartStore.persist.rehydrate();
  }, []);

  return null; // renders nothing — purely a side-effect component
}
