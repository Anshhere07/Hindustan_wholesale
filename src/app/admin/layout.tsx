'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AdminSidebar from '@/components/layout/AdminSidebar';
import NotificationToast from '@/components/layout/NotificationToast';
import { useUIStore } from '@/stores/ui.store';
import styles from './adminLayout.module.css';

// ─────────────────────────────────────────────────────────────────────────────
// Admin Layout — auth guard + responsive sidebar + notifications
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { addNotification } = useUIStore();
  const [checked, setChecked] = useState(() => typeof window !== 'undefined' && sessionStorage.getItem('hw-admin-auth') === 'true');

  const isLoginPage = pathname === '/admin/login' || pathname === '/admin/seed';

  useEffect(() => {
    if (isLoginPage) {
      setChecked(true);
      return;
    }
    const isAdmin = typeof window !== 'undefined' && sessionStorage.getItem('hw-admin-auth') === 'true';
    if (!isAdmin) {
      router.replace('/admin/login');
    } else {
      setChecked(true);
    }
  }, [router, isLoginPage]);

  const handleSignOut = useCallback(() => {
    sessionStorage.removeItem('hw-admin-auth');
    addNotification({ type: 'info', title: 'Signed Out', message: 'You have been signed out of the Admin Portal.' });
    router.replace('/admin/login');
  }, [router, addNotification]);

  // Full-screen spinner while checking auth
  if (!checked) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0005 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: 40, height: 40,
          border: '3px solid rgba(212,175,55,0.2)',
          borderTopColor: '#D4AF37',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Login / seed pages — no sidebar
  if (isLoginPage) {
    return (
      <>
        <NotificationToast />
        {children}
      </>
    );
  }

  // Admin portal — sidebar + content
  return (
    <div className={styles.adminContainer}>
      <AdminSidebar onSignOut={handleSignOut} />
      <main className={styles.adminMain}>
        {children}
      </main>
      <NotificationToast />
    </div>
  );
}

