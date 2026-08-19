// ─────────────────────────────────────────────────────────────────────────────
// Firestore — Users Collection Service
// ─────────────────────────────────────────────────────────────────────────────

import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config';
import type { UserProfile } from '@/types/user.types';

const COLLECTION = 'users';

export async function getUserById(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, COLLECTION, uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as UserProfile;
}

export async function getUserByEmail(email: string): Promise<UserProfile | null> {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const q = query(
      collection(db, COLLECTION),
      where('email', '==', cleanEmail)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const d = snap.docs[0];
      return { id: d.id, ...d.data() } as UserProfile;
    }
  } catch (err) {
    console.warn('getUserByEmail query error:', err);
  }

  // Fallback by docId
  const docId = cleanEmail.replace(/[^a-z0-9]/gi, '_');
  const directSnap = await getDoc(doc(db, COLLECTION, docId));
  if (directSnap.exists()) {
    return { id: directSnap.id, ...directSnap.data() } as UserProfile;
  }
  return null;
}

export async function createUser(
  uid: string,
  data: Omit<UserProfile, 'id'>
): Promise<void> {
  await setDoc(doc(db, COLLECTION, uid), {
    ...data,
    id: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUser(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteUser(uid: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, uid));
  try {
    await deleteDoc(doc(db, 'buyer_profiles', uid));
  } catch {}
  try {
    await deleteDoc(doc(db, 'seller_profiles', uid));
  } catch {}
}

export async function getUsersByRole(role: 'buyer' | 'seller' | 'admin'): Promise<UserProfile[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('role', '==', role)
    );
    const snap = await getDocs(q);
    const users = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as UserProfile);
    return users.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  } catch (err) {
    console.warn(`getUsersByRole error for ${role}:`, err);
    try {
      const snap = await getDocs(collection(db, COLLECTION));
      return snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as UserProfile)
        .filter((u) => u.role === role);
    } catch {
      return [];
    }
  }
}
