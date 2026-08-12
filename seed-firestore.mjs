/**
 * Hindustan Wheels — Firestore Database Seeder
 * Uses Firestore REST API — no Admin SDK or service account needed.
 * 
 * IMPORTANT: Before running, temporarily set Firestore rules to:
 *   allow read, write: if true;
 *
 * Run with:  node seed-firestore.mjs
 */

const PROJECT_ID = 'hindustan-wheels-7465a';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function strVal(v)    { return { stringValue: String(v) }; }
function intVal(v)    { return { integerValue: String(v) }; }
function dblVal(v)    { return { doubleValue: Number(v) }; }
function boolVal(v)   { return { booleanValue: Boolean(v) }; }
function tsVal(d)     { return { timestampValue: (d || new Date()).toISOString() }; }
function arrVal(arr)  { return { arrayValue: { values: arr } }; }
function mapVal(obj)  { return { mapValue: { fields: obj } }; }
function nullVal()    { return { nullValue: null }; }

function fields(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) out[k] = nullVal();
    else if (typeof v === 'boolean')   out[k] = boolVal(v);
    else if (typeof v === 'number')    out[k] = Number.isInteger(v) ? intVal(v) : dblVal(v);
    else if (v instanceof Date)        out[k] = tsVal(v);
    else if (Array.isArray(v))         out[k] = arrVal(v.map(i => typeof i === 'object' ? mapVal(fields(i)) : typeof i === 'string' ? strVal(i) : intVal(i)));
    else if (typeof v === 'object')    out[k] = mapVal(fields(v));
    else                               out[k] = strVal(v);
  }
  return out;
}

async function upsert(collection, docId, data) {
  const url = `${BASE_URL}/${collection}/${docId}`;
  const body = JSON.stringify({ fields: fields(data) });
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`[${collection}/${docId}] ${err.error?.message || res.statusText}`);
  }
  console.log(`  ✅  ${collection}/${docId}`);
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const now = new Date();

async function seedAll() {
  console.log('\n🔥 Hindustan Wheels — Firestore Seeder\n');

  // ── 1. CATEGORIES ──────────────────────────────────────────────────────────
  console.log('📁 categories');
  const cats = [
    { id: 'cat-engine-parts',       name: 'Engine Parts',         slug: 'engine-parts',         productCount: 1240 },
    { id: 'cat-brakes-suspension',  name: 'Brakes & Suspension',  slug: 'brakes-suspension',     productCount: 860  },
    { id: 'cat-electrical',         name: 'Electrical & Lighting', slug: 'electrical-lighting',  productCount: 1540 },
    { id: 'cat-body-exterior',      name: 'Body & Exterior',      slug: 'body-exterior',         productCount: 720  },
    { id: 'cat-tyres-wheels',       name: 'Tyres & Wheels',       slug: 'tyres-wheels',          productCount: 430  },
    { id: 'cat-filters-fluids',     name: 'Filters & Fluids',     slug: 'filters-fluids',        productCount: 980  },
    { id: 'cat-transmission',       name: 'Transmission',         slug: 'transmission',          productCount: 340  },
    { id: 'cat-ac-cooling',         name: 'AC & Cooling',         slug: 'ac-cooling',            productCount: 560  },
    { id: 'cat-steering',           name: 'Steering & Linkages',  slug: 'steering-linkages',     productCount: 290  },
    { id: 'cat-exhaust',            name: 'Exhaust Systems',      slug: 'exhaust-systems',       productCount: 215  },
  ];
  for (const c of cats) await upsert('categories', c.id, { ...c, imageUrl: '', createdAt: now, updatedAt: now });

  // ── 2. ADMIN USER ──────────────────────────────────────────────────────────
  console.log('\n📁 users (admin)');
  await upsert('users', 'admin-shaban-001', {
    email: 'shabanadmin01@gmail.com', firstName: 'Shaban', lastName: 'Admin',
    phone: '', role: 'admin', status: 'active', createdAt: now, updatedAt: now,
  });

  // ── 3. SAMPLE SELLER USER ─────────────────────────────────────────────────
  console.log('\n📁 users (sample seller)');
  await upsert('users', 'seller-sample-001', {
    email: 'seller@autopartsdirect.in', firstName: 'Ramesh', lastName: 'Sharma',
    phone: '+91 98765 43210', role: 'seller', status: 'active', createdAt: now, updatedAt: now,
  });

  // ── 4. SAMPLE BUYER USER ──────────────────────────────────────────────────
  console.log('\n📁 users (sample buyer)');
  await upsert('users', 'buyer-sample-001', {
    email: 'buyer@kiranaworks.in', firstName: 'Sunita', lastName: 'Patel',
    phone: '+91 87654 32109', role: 'buyer', status: 'active', createdAt: now, updatedAt: now,
  });

  // ── 5. SELLER PROFILE ─────────────────────────────────────────────────────
  console.log('\n📁 seller_profiles');
  await upsert('seller_profiles', 'seller-sample-001', {
    userId: 'seller-sample-001',
    businessName: 'AutoParts Direct Pvt Ltd',
    gstNumber: '27AAACR5055K1ZS',
    panNumber: 'AAACR5055K',
    businessType: 'manufacturer',
    city: 'Mumbai', state: 'Maharashtra', pincode: '400001',
    address: '5th Floor, Trade Tower, Lower Parel, Mumbai',
    bankAccountName: 'AutoParts Direct Pvt Ltd',
    bankAccountNumber: '004601012345',
    ifscCode: 'HDFC0000046',
    verificationStatus: 'verified',
    rating: 4.8, totalOrders: 1240, totalRevenue: 12400000,
    createdAt: now, updatedAt: now,
  });

  // ── 6. BUYER PROFILE ──────────────────────────────────────────────────────
  console.log('\n📁 buyer_profiles');
  await upsert('buyer_profiles', 'buyer-sample-001', {
    userId: 'buyer-sample-001',
    businessName: 'Kirana Auto Works',
    gstNumber: '29ABCDE1234F1Z5',
    city: 'Bengaluru', state: 'Karnataka', pincode: '560001',
    address: '12 MG Road, Bengaluru',
    verificationStatus: 'verified',
    creditLimit: 500000, totalOrders: 87, totalSpend: 2175000,
    createdAt: now, updatedAt: now,
  });

  // ── 7. PRODUCTS ───────────────────────────────────────────────────────────
  console.log('\n📁 products');
  const products = [
    {
      id: 'prod-bosch-injector-001',
      sku: 'EP-BOSCH-001',
      name: 'Bosch Fuel Injector Set — Maruti Suzuki',
      slug: 'bosch-fuel-injector-set-maruti-suzuki',
      description: 'Premium OEM-spec fuel injector set for Maruti Suzuki Swift, Dzire, Baleno. Improved atomization for better mileage and performance.',
      categoryId: 'cat-engine-parts', categoryName: 'Engine Parts',
      sellerId: 'seller-sample-001', sellerName: 'AutoParts Direct',
      brand: 'Bosch', partNumber: 'EP-BOSCH-001',
      basePrice: 4800, currency: 'INR', unit: 'set', moq: 4, stock: 240, leadTimeDays: 3,
      gstRate: 18, isGstExempt: false,
      status: 'active', isFeatured: true, rating: 4.6, reviewCount: 128,
      compatibleVehicles: ['Maruti Suzuki Swift', 'Maruti Suzuki Dzire', 'Maruti Suzuki Baleno'],
      tags: ['Bosch', 'Fuel Injector', 'Engine'],
      imageUrl: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80',
    },
    {
      id: 'prod-minda-indicator-002',
      sku: 'EL-MINDA-002',
      name: 'Minda LED Indicator Lamp Set — Universal',
      slug: 'minda-led-indicator-lamp-set-universal',
      description: 'High-brightness LED indicator lamp set compatible with all major Indian two-wheelers and passenger vehicles.',
      categoryId: 'cat-electrical', categoryName: 'Electrical & Lighting',
      sellerId: 'seller-sample-001', sellerName: 'AutoParts Direct',
      brand: 'Minda', partNumber: 'EL-MINDA-002',
      basePrice: 850, currency: 'INR', unit: 'set', moq: 10, stock: 1400, leadTimeDays: 2,
      gstRate: 18, isGstExempt: false,
      status: 'active', isFeatured: true, rating: 4.4, reviewCount: 312,
      compatibleVehicles: ['Universal'],
      tags: ['Minda', 'LED', 'Indicator', 'Electrical'],
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    },
    {
      id: 'prod-tvs-brake-pad-003',
      sku: 'BR-TVS-003',
      name: 'TVS Genuine Brake Pad Set — Honda & Hero',
      slug: 'tvs-genuine-brake-pad-set-honda-hero',
      description: 'Factory-grade brake pads providing consistent stopping power and long life for Honda Activa, Hero Splendor and similar models.',
      categoryId: 'cat-brakes-suspension', categoryName: 'Brakes & Suspension',
      sellerId: 'seller-sample-001', sellerName: 'AutoParts Direct',
      brand: 'TVS', partNumber: 'BR-TVS-003',
      basePrice: 620, currency: 'INR', unit: 'set', moq: 12, stock: 980, leadTimeDays: 2,
      gstRate: 18, isGstExempt: false,
      status: 'active', isFeatured: false, rating: 4.7, reviewCount: 201,
      compatibleVehicles: ['Honda Activa', 'Hero Splendor', 'Hero HF Deluxe'],
      tags: ['TVS', 'Brake Pad', 'Two Wheeler'],
      imageUrl: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80',
    },
    {
      id: 'prod-mobil-oil-004',
      sku: 'FF-MOBIL-004',
      name: 'Mobil Super Engine Oil 10W-40 — 1L Pack (Carton of 12)',
      slug: 'mobil-super-engine-oil-10w40-1l',
      description: 'Mobil Super 10W-40 mineral engine oil for petrol engines. GST invoice provided. Carton of 12 x 1L bottles.',
      categoryId: 'cat-filters-fluids', categoryName: 'Filters & Fluids',
      sellerId: 'seller-sample-001', sellerName: 'AutoParts Direct',
      brand: 'Mobil', partNumber: 'FF-MOBIL-004',
      basePrice: 3840, currency: 'INR', unit: 'carton', moq: 5, stock: 320, leadTimeDays: 3,
      gstRate: 18, isGstExempt: false,
      status: 'active', isFeatured: true, rating: 4.5, reviewCount: 445,
      compatibleVehicles: ['Universal Petrol Engines'],
      tags: ['Mobil', 'Engine Oil', 'Lubricant'],
      imageUrl: 'https://images.unsplash.com/photo-1581093458791-9d42e3c7e117?w=800&q=80',
    },
    {
      id: 'prod-mrf-tyre-005',
      sku: 'TW-MRF-005',
      name: 'MRF Nylogrip Zapper-X Tyre — 80/100-18',
      slug: 'mrf-nylogrip-zapper-x-tyre-80-100-18',
      description: 'MRF premium two-wheeler tyre with improved grip and durability. Suitable for Hero, Bajaj, TVS 125-150cc bikes.',
      categoryId: 'cat-tyres-wheels', categoryName: 'Tyres & Wheels',
      sellerId: 'seller-sample-001', sellerName: 'AutoParts Direct',
      brand: 'MRF', partNumber: 'TW-MRF-005',
      basePrice: 1650, currency: 'INR', unit: 'piece', moq: 6, stock: 500, leadTimeDays: 4,
      gstRate: 28, isGstExempt: false,
      status: 'active', isFeatured: true, rating: 4.8, reviewCount: 728,
      compatibleVehicles: ['Hero Splendor', 'Bajaj Platina', 'TVS Star City'],
      tags: ['MRF', 'Tyre', 'Two Wheeler'],
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    },
  ];
  for (const p of products) {
    const { id, ...data } = p;
    await upsert('products', id, { ...data, createdAt: now, updatedAt: now });
  }

  // ── 8. SAMPLE ORDER ───────────────────────────────────────────────────────
  console.log('\n📁 orders');
  await upsert('orders', 'order-sample-001', {
    orderNumber: 'HW-2024-00001',
    buyerId: 'buyer-sample-001', buyerName: 'Sunita Patel', buyerEmail: 'buyer@kiranaworks.in',
    sellerId: 'seller-sample-001', sellerName: 'AutoParts Direct',
    status: 'delivered',
    items: [
      { productId: 'prod-bosch-injector-001', name: 'Bosch Fuel Injector Set', qty: 4, price: 4800, subtotal: 19200 },
      { productId: 'prod-mobil-oil-004', name: 'Mobil Super 10W-40', qty: 2, price: 3840, subtotal: 7680 },
    ],
    subtotal: 26880, gstAmount: 4838, shippingCharge: 0, grandTotal: 31718,
    paymentMethod: 'bank_transfer', paymentStatus: 'paid',
    shippingAddress: { name: 'Sunita Patel', address: '12 MG Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001', phone: '+91 87654 32109' },
    createdAt: new Date('2024-11-15'), updatedAt: now,
  });

  // ── 9. SAMPLE CART ────────────────────────────────────────────────────────
  console.log('\n📁 carts (placeholder)');
  await upsert('carts', '_placeholder', {
    _note: 'Carts are created per buyer UID when they add their first item. Structure: { buyerId, items: [{productId, qty, price, name}], updatedAt }',
    createdAt: now,
  });

  // ── 10. RFQs ──────────────────────────────────────────────────────────────
  console.log('\n📁 rfqs (placeholder)');
  await upsert('rfqs', '_placeholder', {
    _note: 'RFQ documents: { rfqNumber, buyerId, sellerId, productId, qty, message, status, createdAt }',
    createdAt: now,
  });

  // ── 11. REVIEWS ───────────────────────────────────────────────────────────
  console.log('\n📁 reviews');
  await upsert('reviews', 'review-sample-001', {
    productId: 'prod-bosch-injector-001', userId: 'buyer-sample-001',
    userName: 'Sunita Patel', rating: 5,
    title: 'Excellent quality, fast delivery!',
    body: 'Genuine Bosch parts, packaging was intact. Delivered in 2 days. Highly recommend for bulk orders.',
    verified: true, helpful: 23, createdAt: new Date('2024-11-20'), updatedAt: now,
  });

  // ── 12. NOTIFICATIONS (placeholder) ───────────────────────────────────────
  console.log('\n📁 notifications (placeholder)');
  await upsert('notifications', '_placeholder', {
    _note: 'Notification documents: { userId, type, title, message, read, createdAt }',
    createdAt: now,
  });

  // ── 13. ADMIN LOGS (placeholder) ──────────────────────────────────────────
  console.log('\n📁 admin_logs (placeholder)');
  await upsert('admin_logs', 'log-001', {
    action: 'database_seeded', adminId: 'admin-shaban-001',
    details: 'Initial Firestore database seeding completed.',
    createdAt: now,
  });

  console.log('\n🎉 All done! Collections created:\n');
  const allCols = ['categories (10)', 'users (3)', 'seller_profiles (1)', 'buyer_profiles (1)',
    'products (5)', 'orders (1)', 'carts', 'rfqs', 'reviews (1)', 'notifications', 'admin_logs (1)'];
  allCols.forEach(c => console.log(`  • ${c}`));
  console.log();
}

seedAll().catch((err) => {
  console.error('\n❌ Seeding failed:', err.message);
  process.exit(1);
});
