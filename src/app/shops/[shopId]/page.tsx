'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Store, ShieldCheck, MapPin, Star, Package, ArrowLeft, Phone, Mail, Search, CheckCircle2
} from 'lucide-react';
import { PublicHeader, PublicFooter } from '@/modules/landing/LandingPage';
import ProductCard from '@/components/shared/ProductCard';
import { getProducts } from '@/lib/firebase/collections/products';
import { MOCK_PRODUCTS } from '@/lib/api/mock-data';
import type { ProductListItem } from '@/types/product.types';
import { useAuthStore } from '@/stores/auth.store';

export default function ShopDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const shopIdParam = typeof params.shopId === 'string' ? decodeURIComponent(params.shopId) : '';
  const { isAuthenticated } = useAuthStore();

  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [shopName, setShopName] = useState<string>(shopIdParam || 'Wholesale Auto Store');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadShopProducts() {
      setLoading(true);
      try {
        const { products: liveProducts } = await getProducts();
        const all = [...liveProducts, ...MOCK_PRODUCTS];

        // Filter products matching this seller / shop
        const matching = all.filter((p) => {
          const sName = (p.sellerName || '').toLowerCase().trim();
          const sId = ((p as any).sellerId || '').toLowerCase().trim();
          const querySlug = shopIdParam.toLowerCase().trim();

          return (
            sName === querySlug ||
            sId === querySlug ||
            sName.replace(/[^a-z0-9]/gi, '-') === querySlug ||
            sName.includes(querySlug) ||
            querySlug.includes(sName)
          );
        });

        // Deduplicate
        const map = new Map<string, ProductListItem>();
        matching.forEach((item) => map.set(item.id, item));
        const list = Array.from(map.values());

        setProducts(list.length > 0 ? list : all.slice(0, 4));
        if (matching.length > 0 && matching[0].sellerName) {
          setShopName(matching[0].sellerName);
        }
      } catch (err) {
        console.error('Failed to load shop products:', err);
      } finally {
        setLoading(false);
      }
    }
    if (shopIdParam) {
      loadShopProducts();
    }
  }, [shopIdParam]);

  const filtered = products.filter((p) =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase()) ||
    (p.brand || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader />

      <main style={{ flex: 1, maxWidth: 1300, width: '100%', margin: '0 auto', padding: '24px 20px' }}>
        {/* Back Link */}
        <button
          onClick={() => router.back()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: 13.5,
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: 20,
            padding: 0,
          }}
        >
          <ArrowLeft size={16} /> Back to Catalog
        </button>

        {/* Shop Profile Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fdf2f4 100%)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 20,
          padding: '32px 28px',
          marginBottom: 32,
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: '#8B0000',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px rgba(139,0,0,0.25)',
              fontSize: 32,
            }}>
              <Store size={36} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {shopName}
                </h1>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 8px',
                  borderRadius: 12,
                  background: '#ECFDF5',
                  color: '#059669',
                  border: '1px solid #A7F3D0',
                  fontSize: 11,
                  fontWeight: 700,
                }}>
                  <ShieldCheck size={13} /> VERIFIED SELLER
                </span>
              </div>

              <p style={{ margin: '0 0 10px', fontSize: 13.5, color: 'var(--text-secondary)' }}>
                Official Wholesale Distributor &amp; Manufacturer Store
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', fontSize: 12.5, color: 'var(--text-secondary)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Star size={14} fill="#F59E0B" color="#F59E0B" /> <strong>4.8</strong> (140+ reviews)
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={14} /> Delhi NCR / Mumbai Hub
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Package size={14} /> <strong>{products.length}</strong> Listed Products
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <a
              href="tel:+918800232363"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: '#ffffff',
                border: '1.5px solid #8B0000',
                color: '#8B0000',
                padding: '10px 18px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              <Phone size={14} /> Contact Store
            </a>
          </div>
        </div>

        {/* Store Products Section */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Products from this Store ({filtered.length})
            </h2>
            <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              Procure directly with genuine warranty &amp; wholesale GST invoice
            </p>
          </div>

          <div style={{ position: 'relative', width: '100%', maxWidth: 280 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search store inventory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                height: 38,
                borderRadius: 10,
                border: '1px solid var(--border-default)',
                paddingLeft: 36,
                paddingRight: 12,
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading store inventory...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', background: '#fff', borderRadius: 16 }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>No products found in this store.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 20,
          }}>
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                view="grid"
                hidePrice={!isAuthenticated}
              />
            ))}
          </div>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
