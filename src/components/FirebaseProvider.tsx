'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';

// ─────────────────────────────────────────────────────────────────────────────
// FirebaseProvider — initializes Firebase Auth listener on mount
// Wrap this around the root layout so auth state syncs globally.
// ─────────────────────────────────────────────────────────────────────────────

export default function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const { initAuthListener } = useAuthStore();

  useEffect(() => {
    // Start Firebase Auth state listener — returns unsubscribe fn
    const unsubscribe = initAuthListener();
    return () => unsubscribe();
  }, [initAuthListener]);

  return <>{children}</>;
}
