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
      setUser: (user: User | null) => set({ user, isAuthenticated: !!user }),

      // ── Initialize Firebase auth state listener ───────────────────────────
      // Runs once on app mount. NEVER sets user=null unless Firebase explicitly
      // says the session is gone (fbUser === null), preventing the "Guest" flash.
      initAuthListener: () => {
        return onAuthChange(async (fbUser) => {
          if (fbUser) {
            try {
              const userDoc = await fetchUserDoc(fbUser.uid);
              if (userDoc) {
                // Full Firestore document found — use it
                set({ user: userDoc, isAuthenticated: true, isLoading: false });
              } else {
                // Firestore doc missing (background write still pending)
                // Keep existing persisted state if it belongs to the same user
                const persisted = get().user;
                if (persisted && persisted.id === fbUser.uid) {
                  // Same user — just mark authenticated, don't overwrite rich data
                  set({ isAuthenticated: true, isLoading: false });
                } else {
                  // Different/new user — build minimal user from Firebase token
                  const displayName = fbUser.displayName || '';
                  const parts = displayName.split(' ');
                  const firstName = parts[0] || 'User';
                  const lastName = parts.slice(1).join(' ');
                  set({
                    user: {
                      id: fbUser.uid,
                      email: fbUser.email || '',
                      firstName,
                      lastName,
                      phone: '',
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
              // Firestore unavailable — preserve persisted state, never flash Guest
              set({ isLoading: false });
            }
          } else {
            // Explicit sign-out from Firebase — clear session
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
