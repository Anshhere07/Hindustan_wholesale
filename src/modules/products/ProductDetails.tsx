'use client';

import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star, MapPin, CheckCircle, Shield, Truck, CreditCard, RotateCcw, Check, Lock } from 'lucide-react';
import styles from './ProductDetails.module.css';
import { PublicHeader, PublicFooter, DEALS, CATEGORIES } from '../landing/LandingPage';

interface ProductDetailsProps {
  productId: string;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ productId }) => {
  const deal = DEALS.find(d => d.id.toString() === productId);

  if (!deal) {
    return notFound();
  }

  // Attempt to map category based on deal ID (similar logic used before)
  let categoryName = 'Category';
  let categoryId = 'categories';
  if ([1].includes(deal.id)) { categoryName = 'FMCG & Grocery'; categoryId = 'fmcg'; }
  else if ([2].includes(deal.id)) { categoryName = 'Apparel & Textiles'; categoryId = 'apparel'; }
  else if ([3].includes(deal.id)) { categoryName = 'Electronics'; categoryId = 'electronics'; }
  else if ([4].includes(deal.id)) { categoryName = 'Kitchenware'; categoryId = 'kitchenware'; }
  else if ([5].includes(deal.id)) { categoryName = 'Personal Care'; categoryId = 'personal-care'; }
  
  // Clean price to calculate bulk tiers roughly
  const numericPrice = parseInt(deal.price.replace(/[^\d]/g, '')) || 398;
  const tier2Price = Math.floor(numericPrice * 0.967); // roughly 3% off
  const tier3Price = Math.floor(numericPrice * 0.934); // roughly 6% off

  return (
    <div className={styles.page}>
      <PublicHeader />

      <main className={styles.main}>
        <div className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <Link href={`/categories/${categoryId}`}>{categoryName}</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{deal.productName}</span>
        </div>

        <div className={styles.topSection}>
          {/* Left Column: Images */}
          <div className={styles.gallery}>
            <div className={styles.mainImage} style={{ background: deal.bgColor }}>
              <span className={styles.mainImageBadge}>BESTSELLER</span>
              {deal.brandInitials}
            </div>
            <div className={styles.thumbnailStrip}>
              <div className={`${styles.thumbnail} ${styles.thumbnailActive}`} style={{ background: deal.bgColor }}></div>
              <div className={styles.thumbnail} style={{ background: deal.bgColor }}></div>
              <div className={styles.thumbnail} style={{ background: deal.bgColor, opacity: 0.4 }}></div>
              <div className={styles.thumbnail} style={{ background: deal.bgColor, opacity: 0.8 }}></div>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className={styles.details}>
            <div className={styles.brandRow}>
              <span className={styles.brandName}>
                {deal.brandName} <CheckCircle size={14} color="#10B981" />
              </span>
              <span className={styles.rating}>
                <Star size={12} fill="#F59E0B" color="#F59E0B" />
                {deal.rating} ({deal.reviews})
              </span>
            </div>

            <h1 className={styles.title}>{deal.productName}</h1>

            <div className={styles.badgesRow}>
              <span className={`${styles.badgePill} ${styles.badgeBlue}`}>{deal.hsn.split('·')[0].trim()}</span>
              <span className={`${styles.badgePill} ${styles.badgeBlue}`}>{deal.hsn.split('·')[1]?.trim() || 'GST 5%'}</span>
              <span className={`${styles.badgePill} ${styles.badgeOrange}`}>{deal.moq}</span>
              <span className={styles.badgeLocation}>
                <MapPin size={12} />
                Ships from {deal.location}, IN
              </span>
            </div>

            <div className={styles.priceCard}>
              <div className={styles.priceRow}>
                <span className={styles.mainPrice}>{deal.price}</span>
                <span className={styles.strikePrice}>{deal.originalPrice}</span>
                {deal.badgeRight && (
                  <span className={styles.discountBadge}>{deal.badgeRight.toUpperCase()}</span>
                )}
              </div>
              <p className={styles.priceSubtext}>
                Wholesale price {deal.unit.replace('/', 'per ')} · exclusive of 0% GST · retailer margin ~21%
              </p>

              <div className={styles.sectionTitle}>BULK PRICE TIERS</div>
              <div className={styles.bulkTiers}>
                <div className={styles.tierBox}>
                  <div className={styles.tierQty}>20+ {deal.unit.replace('/ ', '')}</div>
                  <div className={styles.tierPrice}>₹{numericPrice.toLocaleString()}</div>
                </div>
                <div className={styles.tierBox}>
                  <div className={styles.tierQty}>50+ {deal.unit.replace('/ ', '')}</div>
                  <div className={styles.tierPrice}>₹{tier2Price.toLocaleString()}</div>
                </div>
                <div className={styles.tierBox}>
                  <div className={styles.tierQty}>150+ {deal.unit.replace('/ ', '')}</div>
                  <div className={styles.tierPrice}>₹{tier3Price.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className={styles.variantsGroup}>
              <div className={styles.sectionTitle}>VARIANTS</div>
              <div className={styles.variantPills}>
                <div className={styles.variantPill}>5 kg</div>
                <div className={`${styles.variantPill} ${styles.variantPillActive}`}>10 kg</div>
                <div className={styles.variantPill}>25 kg</div>
              </div>
            </div>

            <div className={styles.actionsRow}>
              <button className={styles.btnPrimary}>
                <Lock size={16} /> Sign in to place order
              </button>
              <button className={styles.btnSecondary}>
                Add to wishlist
              </button>
            </div>
            <p className={styles.actionSubtext}>
              Prices visible to verified retailers only. Free registration in 30 seconds.
            </p>

            <div style={{ marginTop: '24px' }}>
              <div className={styles.featuresRow}>
                <div className={styles.featureItem}>
                  <div className={styles.featureIconRow}>
                    <Truck size={14} color="#0EA5E9" /> 2-5 day delivery
                  </div>
                  <div className={styles.featureDesc}>Pan-India managed 3PL</div>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIconRow}>
                    <CreditCard size={14} color="#0EA5E9" /> Multiple payments
                  </div>
                  <div className={styles.featureDesc}>UPI · Card · COD · BNPL</div>
                </div>
                <div className={styles.featureItem}>
                  <div className={styles.featureIconRow}>
                    <RotateCcw size={14} color="#0EA5E9" /> Return protection
                  </div>
                  <div className={styles.featureDesc}>Damage & shortage covered</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Highlights & Specs */}
        <div className={styles.bottomSection}>
          <div>
            <h3 className={styles.bottomHeader}>Product highlights</h3>
            <div className={styles.highlightsList}>
              <div className={styles.highlightItem}>
                <Check size={16} className={styles.highlightIcon} /> 100% genuine wholesale quality
              </div>
              <div className={styles.highlightItem}>
                <Check size={16} className={styles.highlightIcon} /> Direct from authorized distributors
              </div>
              <div className={styles.highlightItem}>
                <Check size={16} className={styles.highlightIcon} /> Retailer margin ~21%
              </div>
              <div className={styles.highlightItem}>
                <Check size={16} className={styles.highlightIcon} /> Ships in 2 days pan-India
              </div>
            </div>
          </div>
          
          <div>
            <h3 className={styles.bottomHeader}>Specifications</h3>
            <div className={styles.specsTable}>
              <div className={styles.specRow}>
                <span className={styles.specLabel}>HSN Code</span>
                <span className={styles.specValue}>{deal.hsn.split('·')[0].replace('HSN', '').trim()}</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specLabel}>GST Rate</span>
                <span className={styles.specValue}>{deal.hsn.split('·')[1]?.replace('GST', '').trim() || '0%'}</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specLabel}>MOQ</span>
                <span className={styles.specValue}>{deal.moq.replace('MOQ', '').trim()}</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specLabel}>Stock available</span>
                <span className={styles.specValue}>8,400 units</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specLabel}>Origin</span>
                <span className={styles.specValue}>{deal.location}, IN</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specLabel}>Category</span>
                <span className={styles.specValue}>{categoryName}</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specLabel}>Brand</span>
                <span className={styles.specValue}>{deal.brandName}</span>
              </div>
            </div>
          </div>
        </div>

      </main>
      <PublicFooter />
    </div>
  );
};

export default ProductDetails;
