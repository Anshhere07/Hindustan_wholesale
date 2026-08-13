// ─────────────────────────────────────────────────────────────────────────────
// Firestore — Users Collection Service
// ─────────────────────────────────────────────────────────────────────────────

import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
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

export async function getUsersByRole(role: 'buyer' | 'seller' | 'admin'): Promise<UserProfile[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('role', '==', role),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as UserProfile);
  } catch (err) {
    console.warn(`getUsersByRole error for ${role}:`, err);
    return [];
  }
}
