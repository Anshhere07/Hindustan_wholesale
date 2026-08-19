// ─────────────────────────────────────────────────────────────────────────────
// Firebase Auth Helpers — Hindustan Wholesale
// Handles: Email/Password, Email Link (OTP flow), session management
// ─────────────────────────────────────────────────────────────────────────────

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  type User as FirebaseUser,
  type ActionCodeSettings,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './config';
import type { User, UserRole } from '@/types/user.types';

// ── Email Link (OTP) settings ─────────────────────────────────────────────────

const actionCodeSettings: ActionCodeSettings = {
  // URL the user is redirected to after clicking the email link
  url: typeof window !== 'undefined'
    ? `${window.location.origin}/auth/verify-otp`
    : 'http://localhost:3000/auth/verify-otp',
  handleCodeInApp: true,
};

// ── Send sign-in / registration OTP email link ────────────────────────────────

export async function sendOtpEmail(email: string): Promise<void> {
  // Store email locally so we can complete sign-in on redirect
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('hw-otp-email', email);
  }
  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
  } catch (err: any) {
    console.warn('Firebase Email Link warning (Dev mode fallback active):', err.message);
  }
}

// ── Complete Email Link sign-in (called on the /auth/verify-otp page) ─────────

export async function completeEmailLinkSignIn(
  email: string,
  emailLink: string
): Promise<FirebaseUser> {
  if (!isSignInWithEmailLink(auth, emailLink)) {
    throw new Error('Invalid sign-in link.');
  }
  const result = await signInWithEmailLink(auth, email, emailLink);
  return result.user;
}

// ── Classic Email/Password sign-in ───────────────────────────────────────────

export async function signInWithPassword(
  email: string,
  password: string
): Promise<FirebaseUser> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

// ── Register new user + create Firestore user document ────────────────────────

export async function registerUser(params: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
}): Promise<FirebaseUser> {
  const { email, password, firstName, lastName, phone, role } = params;

  // 1. Create Firebase Auth account
  const { user } = await createUserWithEmailAndPassword(auth, email, password);

  // 2. Update Firebase Auth displayName
  try {
    await updateProfile(user, { displayName: `${firstName} ${lastName}`.trim() });
  } catch (profErr: any) {
    console.warn('updateProfile notice:', profErr.message);
  }

  const isoNow = new Date().toISOString();
  const userDoc: Omit<User, 'id'> = {
    email,
    phone,
    firstName,
    lastName,
    role,
    status: 'pending',
    createdAt: isoNow,
    updatedAt: isoNow,
  };

  await setDoc(doc(db, 'users', user.uid), {
    ...userDoc,
    id: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return user;
}

// ── Fetch Firestore user document by UID ──────────────────────────────────────

export async function fetchUserDoc(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as User;
}

// ── Update last login timestamp ───────────────────────────────────────────────

export async function updateLastLogin(uid: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), {
      lastLoginAt: serverTimestamp(),
    });
  } catch {
    // Non-critical — don't throw
  }
}

// ── Send password reset email ─────────────────────────────────────────────────

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

// ── Sign out ──────────────────────────────────────────────────────────────────

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

// ── Auth state listener ───────────────────────────────────────────────────────

export function onAuthChange(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

export { auth };
export type { FirebaseUser };
