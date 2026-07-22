'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle, Shield } from 'lucide-react';
import styles from './BrandsPage.module.css';
import { PublicHeader, PublicFooter, BRANDS } from '../landing/LandingPage';

// Removed static category mapping since all brands are Automobile now

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
            <Link href={`/brands/${brand.name.toLowerCase().replace(/ /g, '-')}`} key={brand.name} className={styles.card} style={{ textDecoration: 'none' }}>
              
              <div className={styles.cardTop}>
                <div 
                  className={styles.iconWrap}
                  style={{ background: '#FFF', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}
                >
                  <img src={brand.logo} alt={brand.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
                  Automobile
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
