'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { PublicHeader, PublicFooter } from '@/modules/landing/LandingPage';
import NotificationToast from '@/components/layout/NotificationToast';

// ─────────────────────────────────────────────────────────────────────────────
// Buyer Pages Layout — Unified Full-Width Public Header/Footer
// Replaces the old buyer portal sidebar with seamless marketplace navigation
// ─────────────────────────────────────────────────────────────────────────────

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Wait for Zustand to rehydrate from localStorage
    useAuthStore.persist?.rehydrate?.();
  }, []);

  useEffect(() => {
    // Public buyer routes that any guest can browse without signing in
    const isPublicRoute =
      pathname === '/buyer/cart' ||
      pathname === '/buyer/catalog' ||
      pathname.startsWith('/buyer/catalog/') ||
      pathname.startsWith('/products/');

    if (isPublicRoute) {
      setChecked(true);
      return;
    }

    if (isLoading) return;

    const authState = useAuthStore.getState();
    const authed = authState.isAuthenticated && !!authState.user;

    if (!authed) {
      router.replace('/auth/login');
    } else if (authState.user?.role === 'seller') {
      router.replace('/seller/dashboard');
    } else {
      setChecked(true);
    }
  }, [isAuthenticated, user, isLoading, router, pathname]);

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

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base, #f8f9fa)' }}>
      <PublicHeader />
      <main style={{ flex: 1, width: '100%', maxWidth: 1280, margin: '0 auto', padding: '24px 16px', boxSizing: 'border-box' }}>
        {children}
      </main>
      <PublicFooter />
      <NotificationToast />
    </div>
  );
}
