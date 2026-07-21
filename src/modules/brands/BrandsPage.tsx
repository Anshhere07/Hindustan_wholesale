'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle, Shield } from 'lucide-react';
import styles from './BrandsPage.module.css';
import { PublicHeader, PublicFooter, BRANDS } from '../landing/LandingPage';

// Static category mapping to perfectly match the reference design
const BRAND_CATEGORIES: Record<string, string> = {
  'SM': 'FMCG & Grocery',
  'RT': 'Apparel & Textiles',
  'AF': 'FMCG & Grocery',
  'SK': 'Kitchenware',
  'VE': 'Electronics',
  'HV': 'Personal Care',
  'WT': 'Stationery & Office',
  'GD': 'Home & Decor',
  'UG': 'Toys & Gifting',
  'LH': 'Hardware & Tools',
  'PM': 'Packaging',
  'RC': 'Beauty & Cosmetics',
};

const BrandsPage: React.FC = () => {
  return (
    <div className={styles.page}>
      <PublicHeader />

      <main className={styles.main}>
        <div className={styles.header}>
          <span className={styles.badge}>
            <Shield size={14} /> VERIFIED SUPPLIERS
          </span>
          <h1 className={styles.title}>India&apos;s most-loved wholesale brands</h1>
          <p className={styles.subtitle}>
            Every brand is GSTIN + PAN verified, KYC-checked and physically inspected by our category team.
          </p>
        </div>

        <div className={styles.grid}>
          {BRANDS.map(brand => (
            <Link href={`/brands/${brand.initials}`} key={brand.initials} className={styles.card} style={{ textDecoration: 'none' }}>
              
              <div className={styles.cardTop}>
                <div 
                  className={styles.iconWrap}
                  style={{ background: brand.color }}
                >
                  {brand.initials}
                </div>
                <div className={styles.brandInfo}>
                  <div className={styles.brandName}>
                    {brand.name} <CheckCircle size={12} color="#10B981" />
                  </div>
                  <div className={styles.brandLocation}>
                    {brand.location}
                  </div>
                </div>
              </div>

              <div className={styles.cardBottom}>
                <span className={styles.categoryPill}>
                  {BRAND_CATEGORIES[brand.initials] || 'Uncategorized'}
                </span>
                <span className={styles.shopLink}>
                  View &rarr;
                </span>
              </div>
              
            </Link>
          ))}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default BrandsPage;
