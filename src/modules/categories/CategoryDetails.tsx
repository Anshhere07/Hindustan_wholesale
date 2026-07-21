'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star, MapPin, ChevronRight, Shield, BadgePercent } from 'lucide-react';
import styles from './CategoryDetails.module.css';
import landingStyles from '../landing/LandingPage.module.css';
import { PublicHeader, PublicFooter, CATEGORIES, DEALS, BRANDS } from '../landing/LandingPage';

interface CategoryDetailsProps {
  categoryId: string;
}

const HINDI_MAP: Record<string, string> = {
  'fmcg': 'किराना',
  'kitchenware': 'रसोई',
  'apparel': 'कपड़ा',
  'electronics': 'इलेक्ट्रॉनिक्स',
  'personal-care': 'देखभाल',
  'stationery': 'स्टेशनरी',
  'home-decor': 'घर सजावट',
  'toys': 'खिलौने',
  'hardware': 'हार्डवेयर',
  'packaging': 'पैकेजिंग',
  'beauty': 'सौंदर्य',
  'agri': 'कृषि',
};

// Map deals to categories for demo purposes
const CATEGORY_DEALS_MAP: Record<string, number[]> = {
  'fmcg': [1], // We'll manually add Annapurna Toor Dal to DEALS array or mock it here, but let's just use what's in DEALS
  'apparel': [2],
  'electronics': [3],
  'kitchenware': [4],
  'personal-care': [5],
  'toys': [6],
  'beauty': [7],
  'home-decor': [8],
};

const CategoryDetails: React.FC<CategoryDetailsProps> = ({ categoryId }) => {
  const category = CATEGORIES.find(c => c.id === categoryId);
  const hindiName = category ? HINDI_MAP[category.id] || category.name : '';

  if (!category) {
    return notFound();
  }

  // Get deals for this category, or just show all if none mapped
  const dealIds = CATEGORY_DEALS_MAP[category.id] || [];
  let categoryDeals = DEALS.filter(d => dealIds.includes(d.id));
  
  // To match the image for FMCG exactly, let's inject a mock deal if it's FMCG
  if (categoryId === 'fmcg' && categoryDeals.length === 1) {
    categoryDeals.push({
      id: 99,
      brandInitials: 'AF',
      bgColor: '#f9a825',
      badgeLeft: 'TRENDING',
      badgeRight: '19% off',
      brandName: 'Annapurna Foods',
      productName: 'Annapurna Toor Dal Premium 30 kg Sack',
      price: '₹3,780',
      originalPrice: '₹4,660',
      unit: '/ sack',
      moq: 'MOQ 5 sack',
      hsn: 'HSN 0713 · GST 0%',
      rating: '4.8',
      reviews: '412',
      location: 'Jaipur',
    });
  }

  // If no deals found, just fallback to first 4 deals
  if (categoryDeals.length === 0) {
    categoryDeals = DEALS.slice(0, 4);
  }

  // Extract unique brands from the current deals
  const uniqueBrandNames = Array.from(new Set(categoryDeals.map(d => d.brandName)));

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
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{category.name}</span>
        </div>

        {/* Hero Banner */}
        <div className={styles.hero} style={{ background: category.color }}>
          <div className={styles.heroLeft}>
            <div className={styles.heroIcon}>{category.icon}</div>
            <h1 className={styles.heroTitle}>{category.name}</h1>
            <div className={styles.heroHindi}>{hindiName}</div>
            <div className={styles.heroSubtext}>{category.subtext}</div>
          </div>
          
          <div className={styles.heroRight}>
            <div className={styles.statBlock}>
              <span className={styles.statLabel}>SKUS</span>
              <span className={styles.statValue}>12,480+</span>
            </div>
            <div className={styles.statBlock}>
              <span className={styles.statLabel}>BRANDS</span>
              <span className={styles.statValue}>{uniqueBrandNames.length}</span>
            </div>
            <div className={styles.statBlock}>
              <span className={styles.statLabel}>DELIVERY</span>
              <span className={styles.statValue}>2-5d</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filterBar}>
          <div className={styles.brandPills}>
            <div className={`${styles.pill} ${styles.pillActive}`}>All brands</div>
            {uniqueBrandNames.map(brand => (
              <div key={brand} className={styles.pill}>{brand}</div>
            ))}
          </div>
          
          <div className={styles.sortBlock}>
            <span>Sort by:</span>
            <select className={styles.sortSelect}>
              <option>Most popular</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest arrivals</option>
            </select>
          </div>
        </div>

        {/* Products Grid - Using landingStyles for consistency with home page */}
        <div className={styles.productGrid}>
          {categoryDeals.map(deal => (
            <Link key={deal.id} href={`/products/${deal.id}`} className={landingStyles.dealCard} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div 
                className={landingStyles.dealImageWrap}
                style={{ background: deal.bgColor }}
              >
                {/* Badges */}
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
                {/* Initials fallback */}
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
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default CategoryDetails;
