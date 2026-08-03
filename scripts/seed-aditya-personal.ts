/**
 * Seed Personal Account — hn.aditya321@gmail.com
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app  = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

async function seedPersonal() {
  const email = 'hn.aditya321@gmail.com';
  const password = 'Password@123';
  const firstName = 'Aditya';
  const lastName = 'Mathur';
  const phone = '+919876543210';
  const businessName = 'Aditya Motors & Spares';

  console.log(`🚀 Seeding personal account for ${email}...`);

  let uid = '';
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    uid = userCred.user.uid;
    await updateProfile(userCred.user, { displayName: `${firstName} ${lastName}` });
  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use') {
      uid = `buyer_hn_aditya321`;
    } else {
      console.error('Error:', err.message);
    }
  }

  const now = Timestamp.now();

  await setDoc(doc(db, 'users', uid), {
    email,
    phone,
    firstName,
    lastName,
    role: 'buyer',
    status: 'active',
    createdAt: now,
    updatedAt: now,
  }, { merge: true });

  await setDoc(doc(db, 'buyer_profiles', uid), {
    userId: uid,
    companyName: businessName,
    businessName,
    gstNumber: '07AAACA8888A1Z8',
    businessType: 'proprietorship',
    industryType: 'Automotive Spares',
    primaryContact: { name: `${firstName} ${lastName}`, email, phone },
    shippingAddresses: [{
      id: 'addr-1',
      line1: '45 Trade Center',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      country: 'India',
      isDefault: true,
    }],
    billingAddress: {
      id: 'addr-1',
      line1: '45 Trade Center',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      country: 'India',
      isDefault: true,
    },
    creditLimit: 200000,
    createdAt: now,
    updatedAt: now,
  }, { merge: true });

  console.log(`✅ Personal account for ${email} seeded successfully!`);
}

seedPersonal().catch(console.error);
