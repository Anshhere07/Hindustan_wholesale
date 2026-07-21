'use client';

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle, MapPin, Shield, Star } from 'lucide-react';
import styles from './BrandDetails.module.css';
import landingStyles from '../landing/LandingPage.module.css';
import { PublicHeader, PublicFooter, BRANDS, DEALS } from '../landing/LandingPage';

interface BrandDetailsProps {
  brandId: string;
}

// Reuse category mapping from BrandsPage for consistency
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

const BrandDetails: React.FC<BrandDetailsProps> = ({ brandId }) => {
  const brand = BRANDS.find(b => b.initials === brandId);

  if (!brand) {
    return notFound();
  }

  // Find deals associated with this brand
  const brandDeals = DEALS.filter(deal => deal.brandName === brand.name);
  const categoryName = BRAND_CATEGORIES[brand.initials] || 'Uncategorized';
  
  // Dummy GSTIN generation based on initials to match the image format
  const mockGSTIN = `27${brand.initials}CDE1234F1Z5`;

  return (
    <div className={styles.page}>
      <PublicHeader />

      <main className={styles.main}>
        <div className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <Link href="/brands">Brands</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{brand.name}</span>
        </div>

        {/* Brand Banner */}
        <div className={styles.banner}>
          <div className={styles.iconWrap} style={{ background: brand.color }}>
            {brand.initials}
          </div>
          
          <div className={styles.bannerInfo}>
            <div className={styles.titleRow}>
              <h1 className={styles.brandTitle}>{brand.name}</h1>
              <span className={styles.verifiedPill}>
                <CheckCircle size={12} /> Verified
              </span>
            </div>
            
            <div className={styles.metaRow}>
              <span className={styles.metaLocation}>
                <MapPin size={14} /> {brand.location}
              </span>
              <span className={`${styles.metaPill} ${styles.pillBlue}`}>
                {categoryName}
              </span>
              <span className={`${styles.metaPill} ${styles.pillGray}`}>
                GSTIN {mockGSTIN}
              </span>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <h2 className={styles.sectionTitle}>
          Products from {brand.name} ({brandDeals.length})
        </h2>

        <div className={styles.productGrid}>
          {brandDeals.map(deal => (
            <Link key={deal.id} href={`/products/${deal.id}`} className={landingStyles.dealCard} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className={landingStyles.dealImageWrap} style={{ background: deal.bgColor }}>
                <div className={landingStyles.dealBadges}>
                  {deal.badgeLeft ? (
                    <span className={`${landingStyles.badge} ${landingStyles.badgeWhite}`}>
                      {deal.badgeLeft}
                    </span>
                  ) : <span />}
                  {deal.badgeRight && (
                    <span className={`${landingStyles.badge} ${landingStyles.badgeDark}`}>
                      {deal.badgeRight}
                    </span>
                  )}
                </div>
                <div className={landingStyles.dealImagePlaceholder}>
                  {deal.brandInitials}
                </div>
              </div>

              <div className={landingStyles.dealContent}>
                <div className={landingStyles.dealBrandRow}>
                  <span className={landingStyles.dealBrand}>{deal.brandName}</span>
                  <Shield size={12} className={landingStyles.verifiedIcon} />
                </div>
                
                <h3 className={landingStyles.dealTitle}>{deal.productName}</h3>
                
                <div className={landingStyles.dealPriceRow}>
                  <div className={landingStyles.dealPriceGroup}>
                    <span className={landingStyles.dealPrice}>{deal.price}</span>
                    <span className={landingStyles.dealOriginalPrice}>{deal.originalPrice}</span>
                  </div>
                  <span className={landingStyles.dealUnit}>{deal.unit}</span>
                </div>

                <div className={landingStyles.dealMetaRow}>
                  <span className={landingStyles.moqBadge}>{deal.moq}</span>
                  <span className={landingStyles.hsnBadge}>{deal.hsn}</span>
                </div>
              </div>

              <div className={landingStyles.dealFooter}>
                <div className={landingStyles.dealRating}>
                  <Star size={14} fill="#F4B400" color="#F4B400" />
                  <span className={landingStyles.ratingScore}>{deal.rating}</span>
                  <span className={landingStyles.ratingCount}>{deal.reviews}</span>
                </div>
                <div className={landingStyles.dealLocation}>
                  <MapPin size={12} />
                  {deal.location}
                </div>
              </div>
            </Link>
          ))}
          
          {brandDeals.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', gridColumn: '1 / -1', background: 'white', borderRadius: '16px', border: '1px dashed var(--border-subtle)' }}>
              No products found for this brand yet.
            </div>
          )}
        </div>

      </main>
      <PublicFooter />
    </div>
  );
};

export default BrandDetails;
