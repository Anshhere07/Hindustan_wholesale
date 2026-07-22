'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star, MapPin, ChevronRight, Shield, BadgePercent, Shirt, Scissors, Package, CarFront } from 'lucide-react';
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

  if (!category && categoryId !== 'clothing' && categoryId !== 'automobile') {
    return notFound();
  }

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

  const AUTOMOBILE_SUBCATEGORIES = [
    { id: '1-wheeler', name: '1-wheeler', icon: '🚲', count: '120+ Brands' },
    { id: '2-wheeler', name: '2-wheeler', icon: '🏍️', count: '450+ Brands' },
    { id: '3-wheeler', name: '3-wheeler', icon: '🛺', count: '80+ Brands' },
    { id: '4-wheeler', name: '4-wheeler', icon: '🚗', count: '600+ Brands' },
    { id: 'agriculture', name: 'Agriculture wheeler', icon: '🚜', count: '150+ Brands' },
  ];

  const displayCategory = category || { id: 'automobile', name: 'Automobile', color: 'var(--color-navy-800)', icon: <CarFront size={32} /> };

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
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{displayCategory.name}</span>
        </div>

        {/* Hero Banner */}
        <div className={styles.hero} style={{ background: displayCategory.color }}>
          <div className={styles.heroLeft}>
            <div className={styles.heroIcon}>{displayCategory.icon}</div>
            <div className={styles.heroInfo}>
              <h1 className={styles.heroTitle}>{displayCategory.name} Wholesale</h1>
              <p className={styles.heroSubtitle}>Source directly from verified manufacturers</p>
            </div>
          </div>
          <div className={styles.heroRight}>
          </div>
        </div>

        {/* Conditional Grid: Subcategories for Automobile, Products for others */}
        {categoryId === 'automobile' ? (
          <div className={styles.productGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '24px' }}>
            {AUTOMOBILE_SUBCATEGORIES.map(sub => (
              <Link key={sub.id} href={`/categories/automobile/${sub.id}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 16px', background: 'white', borderRadius: '12px', border: '1px solid var(--border-subtle)', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ fontSize: '56px', marginBottom: '24px' }}>{sub.icon}</div>
                <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>{sub.name}</h3>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{sub.count}</span>
              </Link>
            ))}
          </div>
        ) : (
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
        )}
      </main>

      <PublicFooter />
    </div>
  );
};

export default CategoryDetails;
