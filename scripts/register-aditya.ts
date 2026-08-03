/**
 * Register Script — Aditya Mathur (Aditya Traders)
 * ─────────────────────────────────────────────────
 * Creates retailer account in Firebase Auth & Firestore
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

async function registerAditya() {
  const email = 'adiasfreelancer@gmail.com';
  const password = '11223344';
  const firstName = 'Aditya';
  const lastName = 'Mathur';
  const phone = '+919876543210';
  const businessName = 'Aditya Traders';
  const gstNumber = '07AAACA9999A1Z9';

  console.log(`🚀 Creating Retailer Account for ${firstName} ${lastName} (${email})...`);

  let uid = '';
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    uid = userCred.user.uid;
    await updateProfile(userCred.user, { displayName: `${firstName} ${lastName}` });
    console.log('  ✓ Firebase Auth user created cleanly!');
  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use') {
      console.log('  ℹ Account already exists in Firebase Auth. Updating Firestore profile...');
      uid = `buyer_aditya_mathur`;
    } else {
      console.error('  ❌ Auth error:', err.message);
      throw err;
    }
  }

  const now = Timestamp.now();

  // Create/Update user document in Firestore
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

  // Create/Update buyer profile in Firestore
  await setDoc(doc(db, 'buyer_profiles', uid), {
    userId: uid,
    businessName,
    gstNumber,
    isGstVerified: true,
    shippingAddresses: [{
      id: 'addr-1',
      line1: '12 Commercial Complex, Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      country: 'India',
      isDefault: true,
    }],
    billingAddress: {
      id: 'addr-1',
      line1: '12 Commercial Complex, Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      country: 'India',
      isDefault: true,
    },
    creditLimit: 150000,
    availableCredit: 150000,
    createdAt: now,
    updatedAt: now,
  }, { merge: true });

  console.log(`\n🎉 Retailer Account Successfully Created!`);
  console.log(`   - Name: ${firstName} ${lastName}`);
  console.log(`   - Business: ${businessName}`);
  console.log(`   - Email: ${email}`);
  console.log(`   - Password: ${password}`);
  console.log(`   - Role: Retailer / Buyer`);
}

registerAditya().catch((err) => {
  console.error('Registration failed:', err);
  process.exit(1);
});
