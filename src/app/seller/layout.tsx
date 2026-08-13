'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import PageShell from '@/components/layout/PageShell';

// ─────────────────────────────────────────────────────────────────────────────
// Seller Layout — Auth Guard
// Prevents unauthenticated URL access AND browser back button bypass after logout
// ─────────────────────────────────────────────────────────────────────────────

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Wait for Zustand to rehydrate from localStorage
    useAuthStore.persist?.rehydrate?.();
  }, []);

  useEffect(() => {
    // Timeout safeguard — if auth is still loading after 3s, check current state
    const timeout = setTimeout(() => {
      const authState = useAuthStore.getState();
      const authed = authState.isAuthenticated && !!authState.user;
      if (!authed) {
        router.replace('/auth/login');
      } else {
        setChecked(true);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [router]);

  useEffect(() => {
    if (isLoading) return;

    const authState = useAuthStore.getState();
    const authed = authState.isAuthenticated && !!authState.user;

    if (!authed) {
      // Replace history so back button doesn't bring them back
      router.replace('/auth/login');
    } else if (authState.user?.role !== 'seller' && authState.user?.role !== 'admin') {
      // Wrong role — redirect to their portal
      router.replace('/buyer/dashboard');
    } else {
      setChecked(true);
    }
  }, [isAuthenticated, user, isLoading, router]);


  if (!checked) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base, #f8f9fa)',
      }}>
        <div style={{
          width: 36, height: 36,
          border: '3px solid rgba(139,0,0,0.15)',
          borderTopColor: '#8b0000',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <PageShell>{children}</PageShell>;
}
