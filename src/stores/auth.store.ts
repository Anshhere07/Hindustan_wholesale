'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types/user.types';
import { MOCK_BUYER } from '@/lib/api/mock-data';

// SSR-safe localStorage wrapper — returns undefined during SSR, real localStorage on client
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
// Auth Store — In production, integrate with NextAuth or custom JWT flow
// ─────────────────────────────────────────────────────────────────────────────

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, _password: string) => Promise<void>;
  loginAsBuyer: () => void;
  loginAsSeller: () => void;
  loginAsAdmin: () => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, _password: string) => {
        set({ isLoading: true });
        // Simulate API call
        await new Promise((r) => setTimeout(r, 800));
        set({ user: { ...MOCK_BUYER, email }, isAuthenticated: true, isLoading: false });
      },

      loginAsBuyer: () => {
        set({ user: MOCK_BUYER, isAuthenticated: true });
      },

      loginAsSeller: () => {
        set({
          user: {
            ...MOCK_BUYER,
            id: 'usr-2',
            role: 'seller',
            firstName: 'Priya',
            lastName: 'Sharma',
            email: 'priya@autopartsdirect.in',
          },
          isAuthenticated: true,
        });
      },

      loginAsAdmin: () => {
        set({
          user: {
            ...MOCK_BUYER,
            id: 'usr-3',
            role: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@hindustanwheels.in',
          },
          isAuthenticated: true,
        });
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      setLoading: (isLoading: boolean) => set({ isLoading }),
    }),
    {
      name: 'hw-auth',
      storage: createJSONStorage(() => ssrSafeLocalStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      skipHydration: true,
    }
  )
);
