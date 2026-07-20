'use client';

import { create } from 'zustand';

// ─────────────────────────────────────────────────────────────────────────────
// UI Store — theme, sidebar, notifications
// ─────────────────────────────────────────────────────────────────────────────

type Theme = 'light' | 'dark';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface UIStore {
  theme: Theme;
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  notifications: Notification[];
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleMobileMenu: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  addNotification: (n: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

let notifIdCounter = 0;

export const useUIStore = create<UIStore>((set, get) => ({
  theme: 'light',
  sidebarCollapsed: false,
  mobileMenuOpen: false,
  notifications: [],

  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    set({ theme: next });
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', next);
    }
  },

  setTheme: (theme: Theme) => {
    set({ theme });
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  },

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),

  addNotification: (n) => {
    const id = `notif-${++notifIdCounter}`;
    const notification: Notification = { ...n, id, duration: n.duration ?? 4000 };
    set((s) => ({ notifications: [...s.notifications, notification] }));
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => get().removeNotification(id), notification.duration);
    }
  },

  removeNotification: (id) =>
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
}));
