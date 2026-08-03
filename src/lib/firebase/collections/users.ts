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
  limit,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config';
import type { User, UserRole } from '@/types/user.types';

const COLLECTION = 'users';

export async function getUserById(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, COLLECTION, uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as User;
}

export async function createUser(uid: string, data: Omit<User, 'id'>): Promise<void> {
  await setDoc(doc(db, COLLECTION, uid), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUser(uid: string, data: Partial<User>): Promise<void> {
  await updateDoc(doc(db, COLLECTION, uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function getUsersByRole(role: UserRole, pageSize = 20): Promise<User[]> {
  const q = query(
    collection(db, COLLECTION),
    where('role', '==', role),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as User);
}

export async function getAllBuyers(pageSize = 50): Promise<User[]> {
  return getUsersByRole('buyer', pageSize);
}

export async function getAllSellers(pageSize = 50): Promise<User[]> {
  return getUsersByRole('seller', pageSize);
}
