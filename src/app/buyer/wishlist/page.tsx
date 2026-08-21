'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingCart, ArrowRight, Package } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function WishlistPage() {
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 16 }}>
        <div style={{ background: '#fdf2f4', padding: 10, borderRadius: 12, color: '#8B0000' }}>
          <Heart size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            My Wishlist &amp; Saved Products
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', margin: 0 }}>
            Save regular fast-moving inventory items for 1-click re-ordering.
          </p>
        </div>
      </div>

      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border-subtle)',
        borderRadius: 16,
        padding: '56px 24px',
        textAlign: 'center',
        boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
      }}>
        <div style={{
          width: 64,
          height: 64,
          background: '#fdf2f4',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          color: '#8B0000',
        }}>
          <Heart size={32} />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px', color: 'var(--text-primary)' }}>
          Your Wishlist is Empty
        </h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 440, margin: '0 auto 24px' }}>
          Explore thousands of verified automobile spare parts across 2-wheeler, 3-wheeler, 4-wheeler, and agriculture segments.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/categories/automobile">
            <Button variant="primary" size="md" rightIcon={<ArrowRight size={16} />}>
              Browse Wholesale Catalog
            </Button>
          </Link>
          <Link href="/buyer/cart">
            <Button variant="secondary" size="md" leftIcon={<ShoppingCart size={16} />}>
              View My Cart
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
