// ─────────────────────────────────────────────────────────────────────────────
// Firestore — Buyer Profiles Collection Service
// ─────────────────────────────────────────────────────────────────────────────

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config';
import type { BuyerProfile } from '@/types/user.types';

const COLLECTION = 'buyer_profiles';

export async function getBuyerProfile(uid: string, email?: string): Promise<BuyerProfile | null> {
  try {
    const snap = await getDoc(doc(db, COLLECTION, uid));
    if (snap.exists()) {
      return { userId: snap.id, ...snap.data() } as BuyerProfile;
    }
    if (email) {
      const emailUid = email.replace(/[^a-z0-9]/gi, '_');
      const altSnap = await getDoc(doc(db, COLLECTION, emailUid));
      if (altSnap.exists()) {
        return { userId: altSnap.id, ...altSnap.data() } as BuyerProfile;
      }
    }
  } catch (err) {
    console.warn('getBuyerProfile error:', err);
  }
  return null;
}

export async function createBuyerProfile(
  uid: string,
  data: Omit<BuyerProfile, 'userId' | 'kycVerified'>
): Promise<void> {
  await setDoc(doc(db, COLLECTION, uid), {
    ...data,
    userId: uid,
    kycVerified: false,
    kycDocuments: [],
    shippingAddresses: data.shippingAddresses ?? [],
    updatedAt: serverTimestamp(),
  });
}

export async function updateBuyerProfile(
  uid: string,
  data: Partial<BuyerProfile>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function submitKyc(
  uid: string,
  gstin: string,
  panNumber: string,
  businessName: string,
  docMetadata: { fileName: string; storagePath: string }[]
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, uid), {
    gstNumber: gstin,
    panNumber,
    companyName: businessName,
    kycDocuments: docMetadata.map((d) => ({
      ...d,
      uploadedAt: new Date().toISOString(),
    })),
    updatedAt: serverTimestamp(),
  });
}

export async function verifyKyc(uid: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, uid), {
    kycVerified: true,
    updatedAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'users', uid), {
    status: 'active',
    updatedAt: serverTimestamp(),
  });
}
