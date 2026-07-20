'use client';

import React from 'react';
import styles from './PageShell.module.css';
import { cn } from '@/lib/utils/cn';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { useUIStore } from '@/stores/ui.store';
import NotificationToast from './NotificationToast';

// ─────────────────────────────────────────────────────────────────────────────
// PageShell — composes Sidebar + TopNav + main content area
// Used by all authenticated portal layouts
// ─────────────────────────────────────────────────────────────────────────────

interface PageShellProps {
  children: React.ReactNode;
}

const PageShell: React.FC<PageShellProps> = ({ children }) => {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className={styles.shell}>
      <Sidebar />
      <TopNav />
      <main
        className={cn(
          styles.main,
          sidebarCollapsed ? styles['main--collapsed'] : styles['main--expanded']
        )}
        id="main-content"
      >
        <div className={styles.content}>
          {children}
        </div>
      </main>
      <NotificationToast />
    </div>
  );
};

export default PageShell;
