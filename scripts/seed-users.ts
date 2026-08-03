/**
 * Seed Script — 5 Buyers & 5 Sellers for Hindustan Wheels
 * ───────────────────────────────────────────────────────
 * Populates Firebase Auth & Firestore with:
 *  - 5 Buyer users + buyer_profiles
 *  - 5 Seller users + seller_profiles
 *
 * Run with:
 *   npx tsx scripts/seed-users.ts
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

// Load .env.local
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

const DEFAULT_PASSWORD = 'Password@123';

// ── 5 BUYERS ──────────────────────────────────────────────────────────────────

const BUYERS = [
  {
    email: 'buyer1@hindustanwheels.com',
    firstName: 'Ravi', lastName: 'Sharma',
    phone: '+919811001122',
    businessName: 'Sharma Kirana & Auto Spares',
    gstNumber: '07AAACS1234A1Z1',
    address: { line1: '14/A Karol Bagh', city: 'New Delhi', state: 'Delhi', pincode: '110005', country: 'India' },
  },
  {
    email: 'buyer2@hindustanwheels.com',
    firstName: 'Anish', lastName: 'Patel',
    phone: '+919822002233',
    businessName: 'Patel Motor Stores',
    gstNumber: '24AAACP5678B1Z2',
    address: { line1: '102 SG Highway', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015', country: 'India' },
  },
  {
    email: 'buyer3@hindustanwheels.com',
    firstName: 'Priya', lastName: 'Sundaram',
    phone: '+919833003344',
    businessName: 'Southern Auto Components',
    gstNumber: '33AAACS9012C1Z3',
    address: { line1: '88 Anna Salai', city: 'Chennai', state: 'Tamil Nadu', pincode: '600002', country: 'India' },
  },
  {
    email: 'buyer4@hindustanwheels.com',
    firstName: 'Vikram', lastName: 'Singh',
    phone: '+919844004455',
    businessName: 'Rajputana Auto Trade',
    gstNumber: '08AAACR3456D1Z4',
    address: { line1: '45 MI Road', city: 'Jaipur', state: 'Rajasthan', pincode: '302001', country: 'India' },
  },
  {
    email: 'buyer5@hindustanwheels.com',
    firstName: 'Meera', lastName: 'Nair',
    phone: '+919855005566',
    businessName: 'Kochi Vehicle Spares Hub',
    gstNumber: '32AAACK7890E1Z5',
    address: { line1: '12 MG Road', city: 'Kochi', state: 'Kerala', pincode: '682016', country: 'India' },
  },
];

// ── 5 SELLERS ─────────────────────────────────────────────────────────────────

const SELLERS = [
  {
    email: 'seller1@hindustanwheels.com',
    firstName: 'Rajesh', lastName: 'Gupta',
    phone: '+919711001122',
    businessName: 'AutoParts Direct',
    gstNumber: '07AAAGA1234F1Z1',
    panNumber: 'AAAGA1234F',
    approvalStatus: 'approved',
    categories: ['Engine Parts', 'Brakes & Suspension', 'AC & Cooling'],
  },
  {
    email: 'seller2@hindustanwheels.com',
    firstName: 'Sunil', lastName: 'Verma',
    phone: '+919722002233',
    businessName: 'Bosch Authorized Spares India',
    gstNumber: '27AAAGB5678G1Z2',
    panNumber: 'AAAGB5678G',
    approvalStatus: 'approved',
    categories: ['Engine Parts', 'Electrical & Lighting'],
  },
  {
    email: 'seller3@hindustanwheels.com',
    firstName: 'Amit', lastName: 'Shah',
    phone: '+919733003344',
    businessName: 'Brembo Brake Systems India',
    gstNumber: '24AAAGC9012H1Z3',
    panNumber: 'AAAGC9012H',
    approvalStatus: 'approved',
    categories: ['Brakes & Suspension'],
  },
  {
    email: 'seller4@hindustanwheels.com',
    firstName: 'Karan', lastName: 'Kapoor',
    phone: '+919744004455',
    businessName: 'Mahindra Genuine Parts Traders',
    gstNumber: '03AAAGK3456I1Z4',
    panNumber: 'AAAGK3456I',
    approvalStatus: 'pending',
    categories: ['Body & Exterior', 'Transmission'],
  },
  {
    email: 'seller5@hindustanwheels.com',
    firstName: 'Suresh', lastName: 'Reddy',
    phone: '+919755005566',
    businessName: 'MRF Regional Tyres Outlet',
    gstNumber: '36AAAGR7890J1Z5',
    panNumber: 'AAAGR7890J',
    approvalStatus: 'approved',
    categories: ['Tyres & Wheels'],
  },
];

async function seedAccounts() {
  console.log('🚀 Seeding 5 Buyer & 5 Seller accounts in Firebase Auth & Firestore...\n');

  // 1. Seed Buyers
  console.log('👤 Creating Buyers...');
  for (const buyer of BUYERS) {
    let uid = '';
    try {
      const userCred = await createUserWithEmailAndPassword(auth, buyer.email, DEFAULT_PASSWORD);
      uid = userCred.user.uid;
      await updateProfile(userCred.user, { displayName: `${buyer.firstName} ${buyer.lastName}` });
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        console.log(`  ℹ ${buyer.email} already exists in Auth, using email-based document ID...`);
        uid = `buyer_${buyer.email.split('@')[0]}`;
      } else {
        console.error(`  ❌ Error creating ${buyer.email}:`, err.message);
        continue;
      }
    }

    const now = Timestamp.now();
    // User doc
    await setDoc(doc(db, 'users', uid), {
      email: buyer.email,
      phone: buyer.phone,
      firstName: buyer.firstName,
      lastName: buyer.lastName,
      role: 'buyer',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    }, { merge: true });

    // Buyer profile doc
    await setDoc(doc(db, 'buyer_profiles', uid), {
      userId: uid,
      businessName: buyer.businessName,
      gstNumber: buyer.gstNumber,
      isGstVerified: true,
      shippingAddresses: [{ id: 'addr-1', isDefault: true, ...buyer.address }],
      billingAddress: { id: 'addr-1', isDefault: true, ...buyer.address },
      creditLimit: 250000,
      availableCredit: 250000,
      createdAt: now,
      updatedAt: now,
    }, { merge: true });

    console.log(`  ✓ Buyer: ${buyer.firstName} ${buyer.lastName} (${buyer.email})`);
  }

  // 2. Seed Sellers
  console.log('\n🏬 Creating Sellers...');
  for (const seller of SELLERS) {
    let uid = '';
    try {
      const userCred = await createUserWithEmailAndPassword(auth, seller.email, DEFAULT_PASSWORD);
      uid = userCred.user.uid;
      await updateProfile(userCred.user, { displayName: `${seller.firstName} ${seller.lastName}` });
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        console.log(`  ℹ ${seller.email} already exists in Auth, using email-based document ID...`);
        uid = `seller_${seller.email.split('@')[0]}`;
      } else {
        console.error(`  ❌ Error creating ${seller.email}:`, err.message);
        continue;
      }
    }

    const now = Timestamp.now();
    // User doc
    await setDoc(doc(db, 'users', uid), {
      email: seller.email,
      phone: seller.phone,
      firstName: seller.firstName,
      lastName: seller.lastName,
      role: 'seller',
      status: seller.approvalStatus === 'approved' ? 'active' : 'pending',
      createdAt: now,
      updatedAt: now,
    }, { merge: true });

    // Seller profile doc
    await setDoc(doc(db, 'seller_profiles', uid), {
      userId: uid,
      businessName: seller.businessName,
      gstNumber: seller.gstNumber,
      panNumber: seller.panNumber,
      isGstVerified: true,
      approvalStatus: seller.approvalStatus,
      bankAccount: {
        accountName: seller.businessName,
        accountNumber: '918002003004',
        ifscCode: 'HDFC0001234',
        bankName: 'HDFC Bank',
      },
      warehouseAddresses: [{
        id: 'wh-1',
        line1: 'Plot 45 Industrial Area',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400072',
        country: 'India',
      }],
      categories: seller.categories,
      rating: 4.8,
      reviewCount: 94,
      createdAt: now,
      updatedAt: now,
    }, { merge: true });

    console.log(`  ✓ Seller: ${seller.businessName} (${seller.email}) [Status: ${seller.approvalStatus}]`);
  }

  console.log('\n✅ All 5 Buyers & 5 Sellers successfully created!');
  console.log('Password for all accounts:', DEFAULT_PASSWORD);
}

seedAccounts().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
