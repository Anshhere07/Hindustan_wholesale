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

export async function getSellerProfile(uid: string, email?: string): Promise<SellerProfile | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTION, uid));
    if (snap.exists()) {
      return { userId: snap.id, ...snap.data() } as SellerProfile;
    }
    if (email) {
      const emailUid = email.replace(/[^a-z0-9]/gi, '_');
      const altSnap = await getDoc(doc(db, COLLECTION, emailUid));
      if (altSnap.exists()) {
        return { userId: altSnap.id, ...altSnap.data() } as SellerProfile;
      }
    }
  } catch (err) {
    console.warn('getSellerProfile error:', err);
  }
  return null;
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
  try {
    const q = query(
      collection(db, COLLECTION),
      where('approvalStatus', '==', 'pending'),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ userId: d.id, ...d.data() }) as SellerProfile);
  } catch (err) {
    console.warn('getPendingSellers error:', err);
    return [];
  }
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
