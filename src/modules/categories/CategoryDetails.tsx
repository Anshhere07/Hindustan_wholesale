'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  Star, MapPin, ChevronRight, Shield, BadgePercent, Shirt, Scissors,
  Package, CarFront, Filter, Search, Sparkles, CheckCircle2, Lock
} from 'lucide-react';
import styles from './CategoryDetails.module.css';
import landingStyles from '../landing/LandingPage.module.css';
import { PublicHeader, PublicFooter, CATEGORIES, DEALS, BRANDS } from '../landing/LandingPage';
import { getProducts } from '@/lib/firebase/collections/products';
import { MOCK_PRODUCTS } from '@/lib/api/mock-data';
import type { ProductListItem } from '@/types/product.types';
import ProductCard from '@/components/shared/ProductCard';
import { ROUTES } from '@/lib/constants/routes';

interface CategoryDetailsProps {
  categoryId: string;
  subCategoryId?: string;
}

const AUTOMOBILE_SUBCATEGORIES = [
  { id: 'all', name: 'All Automobile', icon: '🚗', count: 'All Segments' },
  { id: '2-wheeler', name: '2-Wheeler', icon: '🏍️', count: 'Bikes & Scooters' },
  { id: '3-wheeler', name: '3-Wheeler', icon: '🛺', count: 'Auto Rickshaws' },
  { id: '4-wheeler', name: '4-Wheeler', icon: '🚙', count: 'Cars, SUVs & Trucks' },
  { id: 'agriculture', name: 'Agriculture', icon: '🚜', count: 'Tractors & Farm' },
];

const CategoryDetails: React.FC<CategoryDetailsProps> = ({ categoryId, subCategoryId }) => {
  const [activeVehicleType, setActiveVehicleType] = useState<string>(
    subCategoryId || (categoryId === '2-wheeler' || categoryId === '3-wheeler' || categoryId === '4-wheeler' ? categoryId : 'all')
  );
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  // ── Load Approved Products from Firestore ────────────────────────────────
  useEffect(() => {
    async function loadApprovedProducts() {
      setLoading(true);
      try {
        const { products: liveProducts } = await getProducts();
        // Also combine with mock products that are active / approved
        const approvedMocks = MOCK_PRODUCTS.filter(p => p.approvalStatus === 'approved' || p.status === 'active');
        
        // Merge without duplicates
        const map = new Map<string, ProductListItem>();
        [...liveProducts, ...approvedMocks].forEach(item => {
          map.set(item.id, item);
        });
        setProducts(Array.from(map.values()));
      } catch (err) {
        console.error('Failed to fetch category products:', err);
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    }
    loadApprovedProducts();
  }, []);

  // Update active vehicle type if prop changes
  useEffect(() => {
    if (subCategoryId) {
      setActiveVehicleType(subCategoryId);
    }
  }, [subCategoryId]);

  if (categoryId === 'clothing') {
    return (
      <div className={styles.page}>
        <PublicHeader />
        <main className={styles.main} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px', textAlign: 'center', minHeight: '70vh' }}>
          <div style={{ display: 'flex', gap: '32px', marginBottom: '32px', color: 'var(--text-accent)' }}>
            <Shirt size={64} />
            <Scissors size={64} />
            <Package size={64} />
          </div>
          <h1 style={{ fontSize: '3rem', color: 'var(--text-primary)', marginBottom: '16px', fontWeight: 700 }}>Clothing Services Coming Soon!</h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', marginBottom: '40px', lineHeight: 1.6 }}>
            We are working hard to bring you the best wholesale clothing catalog. Stay tuned for exciting deals and top brands!
          </p>
          <Link href="/categories/automobile" style={{ display: 'inline-block', background: 'var(--bg-brand)', color: 'white', padding: '16px 40px', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '1.1rem', boxShadow: '0 4px 12px rgba(139, 16, 40, 0.3)' }}>
            Explore Automobile Parts
          </Link>
        </main>
        <PublicFooter />
      </div>
    );
  }

  // Filter products by vehicle category
  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchFilter ||
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (p.brand || '').toLowerCase().includes(searchFilter.toLowerCase());

    if (!matchesSearch) return false;

    if (activeVehicleType === 'all') return true;

    const vType = (p.vehicleType || '4-wheeler').toLowerCase();
    const tagMatch = (p as any).tags?.some((t: string) => t.toLowerCase().includes(activeVehicleType.toLowerCase()));
    return vType === activeVehicleType.toLowerCase() || tagMatch;
  });

  const displayTitle = activeVehicleType === '2-wheeler'
    ? '2-Wheeler Spare Parts & Accessories'
    : activeVehicleType === '3-wheeler'
    ? '3-Wheeler Auto Rickshaw Spare Parts'
    : activeVehicleType === '4-wheeler'
    ? '4-Wheeler Car & Commercial Spares'
    : activeVehicleType === 'agriculture'
    ? 'Agriculture & Tractor Equipment Spares'
    : 'Automobile Spare Parts Wholesale';

  return (
    <div className={styles.page}>
      <PublicHeader />

      <main className={styles.main}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <Link href="/categories">Categories</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Automobile</span>
          {activeVehicleType !== 'all' && (
            <>
              <span style={{ margin: '0 8px' }}>/</span>
              <span style={{ color: '#8B0000', fontWeight: 700, textTransform: 'capitalize' }}>{activeVehicleType}</span>
            </>
          )}
        </div>

        {/* Hero Banner */}
        <div className={styles.hero} style={{ background: 'linear-gradient(135deg, #8B0000 0%, #4a030b 100%)', color: '#fff', borderRadius: 20, padding: '36px 32px', marginBottom: 32 }}>
          <div className={styles.heroLeft}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(212, 175, 55, 0.2)', border: '1px solid rgba(212, 175, 55, 0.4)', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, color: '#d4af37', marginBottom: 12 }}>
              <Shield size={13} /> VERIFIED WHOLESALE CATALOG
            </div>
            <h1 className={styles.heroTitle} style={{ color: '#ffffff', fontSize: 32, fontWeight: 800, margin: '0 0 10px' }}>
              {displayTitle}
            </h1>
            <p className={styles.heroSubtitle} style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 15, margin: 0, maxWidth: 640 }}>
              Direct factory procurement for verified retailers across India. Genuine parts, verified manufacturers, and GST invoices.
            </p>
          </div>
        </div>

        {/* Vehicle Category Tabs */}
        <div style={{ marginBottom: 28, background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: '16px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            {/* Category Pills */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {AUTOMOBILE_SUBCATEGORIES.map((sub) => {
                const isActive = activeVehicleType === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setActiveVehicleType(sub.id)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: 12,
                      border: isActive ? '1.5px solid #8B0000' : '1px solid var(--border-default)',
                      background: isActive ? '#8B0000' : '#f9fafb',
                      color: isActive ? '#ffffff' : 'var(--text-primary)',
                      fontSize: 13.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'all 0.15s ease',
                      boxShadow: isActive ? '0 4px 12px rgba(139,0,0,0.2)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{sub.icon}</span>
                    <span>{sub.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Search */}
            <div style={{ position: 'relative', minWidth: 240 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Search within category..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={{
                  height: 40,
                  width: '100%',
                  paddingLeft: 36,
                  paddingRight: 12,
                  borderRadius: 10,
                  border: '1px solid var(--border-default)',
                  fontSize: 13,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </div>

        {/* Public Notice Banner: Wholesale Price Protected */}
        <div style={{
          background: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderRadius: 12,
          padding: '12px 18px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Lock size={18} style={{ color: '#D97706', flexShrink: 0 }} />
            <span style={{ fontSize: 13.5, color: '#92400E', fontWeight: 600 }}>
              Wholesale pricing is exclusively accessible to verified retailers and businesses.
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link
              href={ROUTES.AUTH.LOGIN}
              style={{
                background: '#8B0000',
                color: '#ffffff',
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Sign In to View Prices
            </Link>
            <Link
              href={ROUTES.AUTH.REGISTER}
              style={{
                background: '#ffffff',
                border: '1px solid #d1d5db',
                color: 'var(--text-primary)',
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Register Shop
            </Link>
          </div>
        </div>

        {/* Product Grid — RENDERED WITHOUT PRICES FOR PUBLIC WEBSITE */}
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading verified automobile products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '48px 24px',
            textAlign: 'center',
            border: '1px solid var(--border-subtle)',
          }}>
            <CarFront size={48} style={{ color: '#8B0000', opacity: 0.5, margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px', color: 'var(--text-primary)' }}>
              No products found in this category segment
            </h3>
            <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: '0 0 20px' }}>
              Products will appear here once verified by our team.
            </p>
            <button
              onClick={() => { setActiveVehicleType('all'); setSearchFilter(''); }}
              style={{
                background: '#8B0000',
                color: '#ffffff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              View All Products
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 20,
          }}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                view="grid"
                hidePrice={true} /* HIDES PRICE ON PUBLIC WEBSITE */
              />
            ))}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
};

export default CategoryDetails;
