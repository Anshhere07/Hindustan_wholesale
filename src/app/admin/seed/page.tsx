'use client';

import { useEffect, useState } from 'react';
import { collection, doc, setDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// ─────────────────────────────────────────────────────────────────────────────
// Firestore Seeder — creates all required collections & sample documents
// Visit /admin/seed to run. Protected by admin session.
// ─────────────────────────────────────────────────────────────────────────────

const SEED_COLLECTIONS = [
  { name: 'users', desc: 'All registered users (buyers, sellers, admins)' },
  { name: 'buyer_profiles', desc: 'Buyer-specific profiles & KYC data' },
  { name: 'seller_profiles', desc: 'Seller business profiles & GST details' },
  { name: 'products', desc: 'Wholesale product catalog' },
  { name: 'categories', desc: 'Product categories' },
  { name: 'orders', desc: 'All buyer orders' },
  { name: 'carts', desc: 'Active buyer shopping carts' },
  { name: 'rfqs', desc: 'Request for Quotation submissions' },
  { name: 'reviews', desc: 'Product reviews & ratings' },
  { name: 'notifications', desc: 'User notifications' },
  { name: 'admin_logs', desc: 'Admin activity logs' },
];

export default function FirestoreSeeder() {
  const [logs, setLogs] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const log = (msg: string) => setLogs((p) => [...p, msg]);

  const seedFirestore = async () => {
    setRunning(true);
    setLogs([]);
    log('🚀 Starting Firestore collection setup...');

    const now = serverTimestamp();

    try {
      // 1. CATEGORIES
      log('📁 Creating categories collection...');
      const categories = [
        { id: 'cat-1', name: 'Engine Parts', slug: 'engine-parts', productCount: 1240, imageUrl: '' },
        { id: 'cat-2', name: 'Brakes & Suspension', slug: 'brakes-suspension', productCount: 860, imageUrl: '' },
        { id: 'cat-3', name: 'Electrical & Lighting', slug: 'electrical-lighting', productCount: 1540, imageUrl: '' },
        { id: 'cat-4', name: 'Body & Exterior', slug: 'body-exterior', productCount: 720, imageUrl: '' },
        { id: 'cat-5', name: 'Tyres & Wheels', slug: 'tyres-wheels', productCount: 430, imageUrl: '' },
        { id: 'cat-6', name: 'Filters & Fluids', slug: 'filters-fluids', productCount: 980, imageUrl: '' },
        { id: 'cat-7', name: 'Transmission', slug: 'transmission', productCount: 340, imageUrl: '' },
        { id: 'cat-8', name: 'AC & Cooling', slug: 'ac-cooling', productCount: 560, imageUrl: '' },
      ];
      for (const cat of categories) {
        await setDoc(doc(db, 'categories', cat.id), { ...cat, createdAt: now });
      }
      log(`  ✅ Created ${categories.length} categories`);

      // 2. SAMPLE ADMIN USER
      log('📁 Creating admin user document...');
      await setDoc(doc(db, 'users', 'admin-shaband-001'), {
        email: 'shabanadmin01@gmail.com',
        firstName: 'Shaban',
        lastName: 'Admin',
        phone: '',
        role: 'admin',
        status: 'active',
        createdAt: now,
        updatedAt: now,
      });
      log('  ✅ Admin user document created');

      // 3. PLACEHOLDER COLLECTIONS (create with _meta doc so they appear in console)
      const placeholderCols = ['buyer_profiles', 'seller_profiles', 'orders', 'carts', 'rfqs', 'reviews', 'notifications', 'admin_logs'];
      for (const col of placeholderCols) {
        await setDoc(doc(db, col, '_placeholder'), {
          _note: `This is a placeholder document for the ${col} collection. Real documents are created when users register and interact with the platform.`,
          createdAt: now,
        });
        log(`  ✅ Collection "${col}" initialized`);
      }

      // 4. SAMPLE PRODUCT
      log('📁 Creating sample product...');
      await setDoc(doc(db, 'products', 'prod-sample-001'), {
        sku: 'EP-BOSCH-001',
        name: 'Bosch Fuel Injector Set — Maruti Suzuki',
        slug: 'bosch-fuel-injector-set-maruti-suzuki',
        description: 'Premium OEM-spec fuel injector set for Maruti Suzuki Swift, Dzire, Baleno. Improved atomization for better mileage and performance.',
        shortDescription: 'Bosch Fuel Injector Set',
        categoryId: 'cat-1',
        categoryName: 'Engine Parts',
        sellerId: 'seller-sample-001',
        sellerName: 'AutoParts Direct',
        sellerRating: 4.8,
        images: [{ id: 'img-1', url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80', altText: 'Fuel Injector', isPrimary: true, order: 1 }],
        specifications: [
          { name: 'Brand', value: 'Bosch' },
          { name: 'Part Number', value: 'EP-BOSCH-001' },
          { name: 'Compatibility', value: 'Maruti Suzuki Swift, Dzire, Baleno 2015+' },
        ],
        priceTiers: [
          { minQty: 4, price: 4800, currency: 'INR' },
          { minQty: 10, price: 4500, currency: 'INR' },
          { minQty: 25, price: 4200, currency: 'INR' },
        ],
        basePrice: 4800,
        currency: 'INR',
        unit: 'set',
        moq: 4,
        stock: 240,
        leadTimeDays: 3,
        tags: ['Bosch', 'Engine Parts', 'Fuel Injector'],
        brand: 'Bosch',
        partNumber: 'EP-BOSCH-001',
        compatibleVehicles: ['Maruti Suzuki Swift', 'Maruti Suzuki Dzire', 'Maruti Suzuki Baleno'],
        isGstExempt: false,
        gstRate: 18,
        status: 'active',
        isFeatured: true,
        rating: 4.6,
        reviewCount: 128,
        createdAt: now,
        updatedAt: now,
      });
      log('  ✅ Sample product created');

      log('');
      log('🎉 All Firestore collections created successfully!');
      log('');
      log('Collections created:');
      SEED_COLLECTIONS.forEach((c) => log(`  • ${c.name} — ${c.desc}`));
      setDone(true);
    } catch (err: any) {
      log(`❌ Error: ${err.message}`);
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#e5e5e5',
      fontFamily: "'Inter', monospace",
      padding: '40px 24px',
    }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#8B0000,#D4AF37)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🔧</div>
          <div>
            <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: 0 }}>Firestore Database Seeder</h1>
            <p style={{ color: '#666', fontSize: 13, margin: 0 }}>Hindustan Wholesale — Admin Tool</p>
          </div>
        </div>

        <div style={{ background: '#111', border: '1px solid #222', borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <h2 style={{ color: '#D4AF37', fontSize: 14, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Collections to create</h2>
          {SEED_COLLECTIONS.map((c) => (
            <div key={c.name} style={{ display: 'flex', gap: 12, padding: '6px 0', borderBottom: '1px solid #1a1a1a' }}>
              <span style={{ color: '#10B981', fontWeight: 600, minWidth: 160, fontSize: 13 }}>{c.name}</span>
              <span style={{ color: '#555', fontSize: 13 }}>{c.desc}</span>
            </div>
          ))}
        </div>

        <button
          onClick={seedFirestore}
          disabled={running || done}
          style={{
            width: '100%', height: 52,
            background: done ? '#1a3a1a' : running ? '#333' : 'linear-gradient(135deg,#8B0000,#60020B)',
            color: done ? '#10B981' : '#fff',
            border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700,
            cursor: (running || done) ? 'not-allowed' : 'pointer',
            marginBottom: 24,
          }}
        >
          {done ? '✅ All Collections Created' : running ? '⏳ Creating collections...' : '🚀 Initialize Firestore Collections'}
        </button>

        {logs.length > 0 && (
          <div style={{
            background: '#0d0d0d', border: '1px solid #222', borderRadius: 12,
            padding: 20, fontFamily: 'monospace', fontSize: 13, lineHeight: 1.8,
            maxHeight: 400, overflowY: 'auto',
          }}>
            {logs.map((line, i) => (
              <div key={i} style={{ color: line.startsWith('❌') ? '#f87171' : line.startsWith('🎉') ? '#10B981' : line.startsWith('•') ? '#93c5fd' : '#a3a3a3' }}>
                {line || <br />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
