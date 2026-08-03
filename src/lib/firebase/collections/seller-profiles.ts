// ─────────────────────────────────────────────────────────────────────────────
// Firestore — Seller Profiles Collection Service
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
import type { SellerProfile } from '@/types/user.types';

const COLLECTION = 'seller_profiles';

export async function getSellerProfile(uid: string): Promise<SellerProfile | null> {
  const snap = await getDoc(doc(db, COLLECTION, uid));
  if (!snap.exists()) return null;
  return { userId: snap.id, ...snap.data() } as SellerProfile;
}

export async function createSellerProfile(
  uid: string,
  data: Omit<SellerProfile, 'userId' | 'rating' | 'totalOrders' | 'approvalStatus' | 'approvedAt'>
): Promise<void> {
  await setDoc(doc(db, COLLECTION, uid), {
    ...data,
    userId: uid,
    rating: 0,
    totalOrders: 0,
    approvalStatus: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateSellerProfile(
  uid: string,
  data: Partial<SellerProfile>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function getPendingSellers(): Promise<SellerProfile[]> {
  const q = query(
    collection(db, COLLECTION),
    where('approvalStatus', '==', 'pending'),
    orderBy('updatedAt', 'desc'),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ userId: d.id, ...d.data() }) as SellerProfile);
}

export async function approveSeller(uid: string, adminUid: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, uid), {
    approvalStatus: 'approved',
    approvedAt: serverTimestamp(),
    approvedBy: adminUid,
    updatedAt: serverTimestamp(),
  });
  // Also update user status
  await updateDoc(doc(db, 'users', uid), {
    status: 'active',
    updatedAt: serverTimestamp(),
  });
}

export async function rejectSeller(uid: string, notes: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, uid), {
    approvalStatus: 'rejected',
    approvalNotes: notes,
    updatedAt: serverTimestamp(),
  });
}

export async function getApprovedSellers(pageSize = 50): Promise<SellerProfile[]> {
  const q = query(
    collection(db, COLLECTION),
    where('approvalStatus', '==', 'approved'),
    orderBy('rating', 'desc'),
    limit(pageSize)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ userId: d.id, ...d.data() }) as SellerProfile);
}
