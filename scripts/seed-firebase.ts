/**
 * Seed Script — Hindustan Wheels Firebase
 * ─────────────────────────────────────────
 * Populates Firestore with:
 *  - categories (8)
 *  - products (8)
 *  - platform_settings
 *  - counters/orders (starts at 0)
 *
 * Run with:
 *   npx tsx scripts/seed-firebase.ts
 *
 * Requirements:
 *  - .env.local must be present with NEXT_PUBLIC_FIREBASE_* vars
 *  - npm install dotenv tsx (already installed via next.js)
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  addDoc,
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

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ── Categories ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'cat-engine',       name: 'Engine Parts',          slug: 'engine-parts',          productCount: 0 },
  { id: 'cat-brakes',       name: 'Brakes & Suspension',   slug: 'brakes-suspension',     productCount: 0 },
  { id: 'cat-electrical',   name: 'Electrical & Lighting', slug: 'electrical-lighting',   productCount: 0 },
  { id: 'cat-body',         name: 'Body & Exterior',       slug: 'body-exterior',         productCount: 0 },
  { id: 'cat-tyres',        name: 'Tyres & Wheels',        slug: 'tyres-wheels',          productCount: 0 },
  { id: 'cat-filters',      name: 'Filters & Fluids',      slug: 'filters-fluids',        productCount: 0 },
  { id: 'cat-transmission', name: 'Transmission',          slug: 'transmission',          productCount: 0 },
  { id: 'cat-ac',           name: 'AC & Cooling',          slug: 'ac-cooling',            productCount: 0 },
];

// ── Products ──────────────────────────────────────────────────────────────────
// NOTE: sellerId is a placeholder — in production, replace with a real seller UID

const SEED_SELLER_ID = 'SEED_SELLER_001';
const SEED_SELLER_NAME = 'AutoParts Direct';

const PRODUCTS = [
  {
    sku: 'EP-001', name: 'Bosch Fuel Injector Set — Maruti Suzuki',
    slug: 'bosch-fuel-injector-set-maruti',
    description: 'Genuine Bosch fuel injectors for Maruti Suzuki K-series engines. Improves fuel efficiency by 8-12%. Pack of 4.',
    shortDescription: 'Genuine Bosch fuel injectors for Maruti Suzuki',
    categoryId: 'cat-engine', categoryName: 'Engine Parts',
    sellerId: SEED_SELLER_ID, sellerName: SEED_SELLER_NAME, sellerRating: 4.7,
    images: [{ id: 'img-1', url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop', altText: 'Bosch Fuel Injector Set', isPrimary: true, order: 1 }],
    specifications: [{ name: 'Brand', value: 'Bosch' }, { name: 'Compatible Vehicles', value: 'Maruti Suzuki K-series' }, { name: 'Pack', value: '4 pieces' }],
    priceTiers: [{ minQty: 4, price: 4800, currency: 'INR' }, { minQty: 20, price: 4560, currency: 'INR' }, { minQty: 100, price: 4320, currency: 'INR' }],
    basePrice: 4800, currency: 'INR', unit: 'set', moq: 4, stock: 240, leadTimeDays: 3,
    tags: ['bosch', 'fuel-injector', 'maruti', 'engine'], brand: 'Bosch', partNumber: 'BFI-K4-001',
    compatibleVehicles: ['Maruti Suzuki Swift', 'Maruti Suzuki Baleno', 'Maruti Suzuki Dzire'],
    isGstExempt: false, gstRate: 18, status: 'active', isFeatured: true, rating: 4.6, reviewCount: 128,
  },
  {
    sku: 'BS-102', name: 'Brembo Brake Disc Pair — Tata Nexon',
    slug: 'brembo-brake-disc-tata-nexon',
    description: 'High-performance Brembo ventilated brake discs for Tata Nexon. Sold as a pair (front axle).',
    shortDescription: 'Brembo ventilated brake discs for Tata Nexon',
    categoryId: 'cat-brakes', categoryName: 'Brakes & Suspension',
    sellerId: SEED_SELLER_ID, sellerName: SEED_SELLER_NAME, sellerRating: 4.7,
    images: [{ id: 'img-2', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop', altText: 'Brembo Brake Disc', isPrimary: true, order: 1 }],
    specifications: [{ name: 'Brand', value: 'Brembo' }, { name: 'Type', value: 'Ventilated' }, { name: 'Position', value: 'Front Axle' }],
    priceTiers: [{ minQty: 2, price: 3200, currency: 'INR' }, { minQty: 10, price: 3040, currency: 'INR' }],
    basePrice: 3200, currency: 'INR', unit: 'pair', moq: 2, stock: 180, leadTimeDays: 2,
    tags: ['brembo', 'brake-disc', 'tata-nexon', 'brakes'], brand: 'Brembo',
    isGstExempt: false, gstRate: 18, status: 'active', isFeatured: true, rating: 4.8, reviewCount: 96,
  },
  {
    sku: 'EL-203', name: 'Philips LED Headlight Bulb H4 (Pack of 10)',
    slug: 'philips-led-headlight-h4-pack10',
    description: 'Philips X-treme Ultinon LED H4 bulbs. 160% more light than standard halogen. IP68 waterproof.',
    shortDescription: 'Philips X-treme LED H4 headlight bulbs',
    categoryId: 'cat-electrical', categoryName: 'Electrical & Lighting',
    sellerId: SEED_SELLER_ID, sellerName: SEED_SELLER_NAME, sellerRating: 4.7,
    images: [{ id: 'img-3', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop', altText: 'Philips LED Headlight', isPrimary: true, order: 1 }],
    specifications: [{ name: 'Brand', value: 'Philips' }, { name: 'Bulb Type', value: 'H4 LED' }, { name: 'Wattage', value: '25W' }, { name: 'IP Rating', value: 'IP68' }],
    priceTiers: [{ minQty: 10, price: 1450, currency: 'INR' }, { minQty: 50, price: 1378, currency: 'INR' }, { minQty: 200, price: 1305, currency: 'INR' }],
    basePrice: 1450, currency: 'INR', unit: 'piece', moq: 10, stock: 500, leadTimeDays: 1,
    tags: ['philips', 'led', 'headlight', 'h4', 'electrical'], brand: 'Philips',
    isGstExempt: false, gstRate: 18, status: 'active', isFeatured: false, rating: 4.5, reviewCount: 312,
  },
  {
    sku: 'TW-304', name: 'MRF Nylogrip Zapper Tyre 175/70 R14',
    slug: 'mrf-nylogrip-zapper-175-70-r14',
    description: 'MRF Nylogrip Zapper — India\'s #1 tyre brand. Superior wet grip and fuel efficiency. Size: 175/70 R14.',
    shortDescription: 'MRF Nylogrip Zapper tubeless tyre 175/70 R14',
    categoryId: 'cat-tyres', categoryName: 'Tyres & Wheels',
    sellerId: SEED_SELLER_ID, sellerName: SEED_SELLER_NAME, sellerRating: 4.7,
    images: [{ id: 'img-4', url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=300&fit=crop', altText: 'MRF Nylogrip Tyre', isPrimary: true, order: 1 }],
    specifications: [{ name: 'Brand', value: 'MRF' }, { name: 'Size', value: '175/70 R14' }, { name: 'Type', value: 'Tubeless' }, { name: 'Load Index', value: '84' }],
    priceTiers: [{ minQty: 4, price: 5600, currency: 'INR' }, { minQty: 20, price: 5320, currency: 'INR' }],
    basePrice: 5600, currency: 'INR', unit: 'piece', moq: 4, stock: 120, leadTimeDays: 4,
    tags: ['mrf', 'tyre', 'nylogrip', '175-70-r14', 'tubeless'], brand: 'MRF',
    isGstExempt: false, gstRate: 28, status: 'active', isFeatured: true, rating: 4.7, reviewCount: 74,
  },
  {
    sku: 'FF-405', name: 'Mann Filter Oil Filter — Universal OE Spec',
    slug: 'mann-filter-oil-universal',
    description: 'Mann+Hummel OE-spec oil filter. Fits most Indian passenger vehicles. Anti-drain-back valve included.',
    shortDescription: 'Mann+Hummel OE oil filter — universal fit',
    categoryId: 'cat-filters', categoryName: 'Filters & Fluids',
    sellerId: SEED_SELLER_ID, sellerName: SEED_SELLER_NAME, sellerRating: 4.7,
    images: [{ id: 'img-5', url: 'https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=400&h=300&fit=crop', altText: 'Mann Filter Oil Filter', isPrimary: true, order: 1 }],
    specifications: [{ name: 'Brand', value: 'Mann Filter' }, { name: 'Type', value: 'Oil Filter' }, { name: 'Thread', value: 'M20×1.5' }],
    priceTiers: [{ minQty: 24, price: 320, currency: 'INR' }, { minQty: 100, price: 304, currency: 'INR' }, { minQty: 500, price: 288, currency: 'INR' }],
    basePrice: 320, currency: 'INR', unit: 'piece', moq: 24, stock: 800, leadTimeDays: 2,
    tags: ['mann-filter', 'oil-filter', 'engine', 'universal'], brand: 'Mann Filter',
    isGstExempt: false, gstRate: 18, status: 'active', isFeatured: false, rating: 4.4, reviewCount: 240,
  },
  {
    sku: 'AC-506', name: 'Denso AC Compressor — Hyundai i20',
    slug: 'denso-ac-compressor-hyundai-i20',
    description: 'Original equipment Denso AC compressor for Hyundai i20 (2014-2023). Includes new O-rings and refrigerant oil.',
    shortDescription: 'Denso OE AC compressor for Hyundai i20',
    categoryId: 'cat-ac', categoryName: 'AC & Cooling',
    sellerId: SEED_SELLER_ID, sellerName: SEED_SELLER_NAME, sellerRating: 4.7,
    images: [{ id: 'img-6', url: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=400&h=300&fit=crop', altText: 'Denso AC Compressor', isPrimary: true, order: 1 }],
    specifications: [{ name: 'Brand', value: 'Denso' }, { name: 'Compatible Models', value: 'Hyundai i20 2014-2023' }, { name: 'Refrigerant', value: 'R134a' }],
    priceTiers: [{ minQty: 1, price: 12500, currency: 'INR' }, { minQty: 5, price: 11875, currency: 'INR' }],
    basePrice: 12500, currency: 'INR', unit: 'piece', moq: 1, stock: 45, leadTimeDays: 5,
    tags: ['denso', 'ac-compressor', 'hyundai', 'i20', 'cooling'], brand: 'Denso',
    isGstExempt: false, gstRate: 18, status: 'active', isFeatured: true, rating: 4.9, reviewCount: 38,
  },
  {
    sku: 'TR-607', name: 'ZF Sachs Clutch Kit — Mahindra Scorpio',
    slug: 'zf-sachs-clutch-kit-mahindra-scorpio',
    description: 'Complete ZF Sachs clutch kit for Mahindra Scorpio 2.5L & 2.6L diesel. Includes clutch disc, pressure plate, and release bearing.',
    shortDescription: 'ZF Sachs complete clutch kit for Mahindra Scorpio',
    categoryId: 'cat-transmission', categoryName: 'Transmission',
    sellerId: SEED_SELLER_ID, sellerName: SEED_SELLER_NAME, sellerRating: 4.7,
    images: [{ id: 'img-7', url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=300&fit=crop', altText: 'ZF Sachs Clutch Kit', isPrimary: true, order: 1 }],
    specifications: [{ name: 'Brand', value: 'ZF Sachs' }, { name: 'Kit Contents', value: 'Disc + Pressure Plate + Release Bearing' }, { name: 'Engine', value: '2.5L & 2.6L Diesel' }],
    priceTiers: [{ minQty: 1, price: 8900, currency: 'INR' }, { minQty: 5, price: 8455, currency: 'INR' }],
    basePrice: 8900, currency: 'INR', unit: 'set', moq: 1, stock: 60, leadTimeDays: 3,
    tags: ['zf-sachs', 'clutch-kit', 'mahindra', 'scorpio', 'transmission'], brand: 'ZF Sachs',
    isGstExempt: false, gstRate: 18, status: 'active', isFeatured: false, rating: 4.6, reviewCount: 55,
  },
  {
    sku: 'BE-708', name: 'Mahindra OE Front Bumper Assembly — XUV700',
    slug: 'mahindra-oe-front-bumper-xuv700',
    description: 'Genuine Mahindra OE front bumper assembly for XUV700 (AX3/AX5/AX7 variants). Includes fog lamp bezels.',
    shortDescription: 'Mahindra OE front bumper assembly for XUV700',
    categoryId: 'cat-body', categoryName: 'Body & Exterior',
    sellerId: SEED_SELLER_ID, sellerName: SEED_SELLER_NAME, sellerRating: 4.7,
    images: [{ id: 'img-8', url: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=400&h=300&fit=crop', altText: 'XUV700 Front Bumper', isPrimary: true, order: 1 }],
    specifications: [{ name: 'Brand', value: 'Mahindra OE' }, { name: 'Variants', value: 'AX3, AX5, AX7' }, { name: 'Color', value: 'Unpainted' }],
    priceTiers: [{ minQty: 1, price: 18500, currency: 'INR' }, { minQty: 5, price: 17575, currency: 'INR' }],
    basePrice: 18500, currency: 'INR', unit: 'piece', moq: 1, stock: 28, leadTimeDays: 7,
    tags: ['mahindra', 'xuv700', 'bumper', 'body', 'oe'], brand: 'Mahindra OE',
    isGstExempt: false, gstRate: 18, status: 'active', isFeatured: false, rating: 4.8, reviewCount: 22,
  },
];

// ── Seed Functions ────────────────────────────────────────────────────────────

async function seedCategories() {
  console.log('📂 Seeding categories...');
  for (const cat of CATEGORIES) {
    await setDoc(doc(db, 'categories', cat.id), {
      name: cat.name,
      slug: cat.slug,
      productCount: 0,
      isActive: true,
      createdAt: Timestamp.now(),
    });
    console.log(`  ✓ ${cat.name}`);
  }
}

async function seedProducts() {
  console.log('\n📦 Seeding products...');
  for (const product of PRODUCTS) {
    const ref = await addDoc(collection(db, 'products'), {
      ...product,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log(`  ✓ ${product.name} (${ref.id})`);
  }
}

async function seedPlatformSettings() {
  console.log('\n⚙️  Seeding platform settings...');
  await setDoc(doc(db, 'platform_settings', 'config'), {
    commissionRate:        0.025,
    freeShippingThreshold: 50000,
    defaultShippingCharge: 750,
    maintenanceMode:       false,
    featuredProductSlots:  8,
    updatedAt:             Timestamp.now(),
  });
  console.log('  ✓ platform_settings/config');
}

async function seedCounters() {
  console.log('\n🔢 Seeding counters...');
  await setDoc(doc(db, 'counters', 'orders'), { count: 0 });
  console.log('  ✓ counters/orders');
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🚀 Seeding Hindustan Wheels Firebase...\n');
  console.log(`   Project: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);
  console.log('');

  await seedCategories();
  await seedProducts();
  await seedPlatformSettings();
  await seedCounters();

  console.log('\n✅ Seeding complete!');
  console.log('\nNext step: Create an admin user in Firebase Auth console and set role to "admin" in users/{uid}');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
