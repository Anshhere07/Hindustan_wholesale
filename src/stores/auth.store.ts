'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types/user.types';
import {
  onAuthChange,
  signInWithPassword,
  signOutUser,
  fetchUserDoc,
  updateLastLogin,
  sendOtpEmail,
} from '@/lib/firebase/auth';

// SSR-safe localStorage wrapper
const ssrSafeLocalStorage = {
  getItem:    (key: string) => typeof window !== 'undefined' ? localStorage.getItem(key) : null,
  setItem:    (key: string, value: string) => { if (typeof window !== 'undefined') localStorage.setItem(key, value); },
  removeItem: (key: string) => { if (typeof window !== 'undefined') localStorage.removeItem(key); },
};

// ─────────────────────────────────────────────────────────────────────────────
// Auth Store — backed by Firebase Auth + Firestore user document
// ─────────────────────────────────────────────────────────────────────────────

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Firebase Auth actions
  login: (email: string, password: string) => Promise<void>;
  sendOtp: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;

  // Internal — called by the auth listener
  setUser: (user: User | null) => void;
  initAuthListener: () => () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // ── Firebase Email/Password sign-in ───────────────────────────────────
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const fbUser = await signInWithPassword(email, password);
          const userDoc = await fetchUserDoc(fbUser.uid);
          if (userDoc) {
            await updateLastLogin(fbUser.uid);
            set({ user: userDoc, isAuthenticated: true });
          }
        } finally {
          set({ isLoading: false });
        }
      },

      // ── Send OTP email link ───────────────────────────────────────────────
      sendOtp: async (email: string) => {
        set({ isLoading: true });
        try {
          await sendOtpEmail(email);
        } finally {
          set({ isLoading: false });
        }
      },

      // ── Sign out ──────────────────────────────────────────────────────────
      logout: async () => {
        await signOutUser();
        set({ user: null, isAuthenticated: false });
      },

      setLoading: (isLoading: boolean) => set({ isLoading }),
      setUser:    (user: User | null) =>
        set({ user, isAuthenticated: !!user }),

      // ── Initialize Firebase auth state listener ───────────────────────────
      // Call this once on app mount; it returns an unsubscribe function.
      initAuthListener: () => {
        return onAuthChange(async (fbUser) => {
          if (fbUser) {
            const userDoc = await fetchUserDoc(fbUser.uid);
            set({ user: userDoc, isAuthenticated: !!userDoc, isLoading: false });
          } else {
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        });
      },
    }),
    {
      name:       'hw-auth',
      storage:    createJSONStorage(() => ssrSafeLocalStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      skipHydration: true,
    }
  )
);
