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
      isLoading: true, // Start as loading until Firebase resolves

      // ── Firebase Email/Password sign-in ───────────────────────────────────
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const fbUser = await signInWithPassword(email, password);
          const userDoc = await fetchUserDoc(fbUser.uid);
          if (userDoc) {
            await updateLastLogin(fbUser.uid);
            set({ user: userDoc, isAuthenticated: true, isLoading: false });
          } else {
            // Build minimal profile from Firebase auth token
            const displayName = fbUser.displayName || '';
            const parts = displayName.split(' ');
            const firstName = parts[0] || email.split('@')[0] || 'User';
            const lastName = parts.slice(1).join(' ');
            const minUser: User = {
              id: fbUser.uid,
              email: fbUser.email || email,
              firstName,
              lastName,
              phone: fbUser.phoneNumber || '',
              role: 'buyer',
              status: 'active',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            set({ user: minUser, isAuthenticated: true, isLoading: false });
          }
        } finally {
          set((s) => ({ isLoading: s.isLoading ? false : s.isLoading }));
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
        set({ user: null, isAuthenticated: false, isLoading: false });

        // Prevent browser back button from returning to portal pages after logout
        if (typeof window !== 'undefined') {
          // Replace every history entry so there's nothing to go back to
          window.history.pushState(null, '', '/auth/login');
          window.history.pushState(null, '', '/auth/login');
          window.addEventListener('popstate', function onPopState() {
            window.history.pushState(null, '', '/auth/login');
          });
        }
      },

      setLoading: (isLoading: boolean) => set({ isLoading }),
      setUser: (user: User | null) => set({ user, isAuthenticated: !!user }),

      // ── Initialize Firebase auth state listener ───────────────────────────
      // Runs once on app mount. Reads the REAL Firestore user doc first.
      // Falls back gracefully if Firestore is slow.
      initAuthListener: () => {
        return onAuthChange(async (fbUser) => {
          if (fbUser) {
            try {
              const userDoc = await fetchUserDoc(fbUser.uid);
              if (userDoc) {
                // Full Firestore document found — always prefer this
                set({ user: userDoc, isAuthenticated: true, isLoading: false });
              } else {
                // Firestore doc missing — check if persisted user matches
                const persisted = get().user;
                if (persisted && persisted.id === fbUser.uid) {
                  // Same user already in store — preserve their data
                  set({ isAuthenticated: true, isLoading: false });
                } else {
                  // Build user from Firebase Auth token
                  const displayName = fbUser.displayName || '';
                  const parts = displayName.split(' ');
                  const firstName = parts[0] || fbUser.email?.split('@')[0] || 'User';
                  const lastName = parts.slice(1).join(' ');
                  set({
                    user: {
                      id: fbUser.uid,
                      email: fbUser.email || '',
                      firstName,
                      lastName,
                      phone: fbUser.phoneNumber || '',
                      role: 'buyer',
                      status: 'active',
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    },
                    isAuthenticated: true,
                    isLoading: false,
                  });
                }
              }
            } catch {
              // Firestore unavailable — preserve persisted state
              const persisted = get().user;
              if (persisted && persisted.id === fbUser.uid) {
                set({ isAuthenticated: true, isLoading: false });
              } else {
                // Cannot verify user identity, sign out safely
                await signOutUser();
                set({ user: null, isAuthenticated: false, isLoading: false });
              }
            }
          } else {
            // Explicit sign-out from Firebase — clear everything
            set({ user: null, isAuthenticated: false, isLoading: false });
          }
        });
      },
    }),
    {
      name:       'hw-auth',
      storage:    createJSONStorage(() => ssrSafeLocalStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
      skipHydration: false, // Allow immediate hydration so layout guards work
    }
  )
);
