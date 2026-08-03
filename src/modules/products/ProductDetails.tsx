'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star, MapPin, CheckCircle, Shield, Truck, CreditCard, RotateCcw, Check, Lock, ShoppingCart } from 'lucide-react';
import styles from './ProductDetails.module.css';
import { PublicHeader, PublicFooter, DEALS, CATEGORIES } from '../landing/LandingPage';
import { getProductById, getProductBySlug } from '@/lib/firebase/collections/products';
import type { Product } from '@/types/product.types';
import { useCartStore } from '@/stores/cart.store';
import { useUIStore } from '@/stores/ui.store';

interface ProductDetailsProps {
  productId: string;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ productId }) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();
  const { addNotification } = useUIStore();

  useEffect(() => {
    async function loadProduct() {
      try {
        let p = await getProductById(productId);
        if (!p) {
          p = await getProductBySlug(productId);
        }
        if (p) setProduct(p);
      } catch (err) {
        console.error('Failed to load product from Firestore:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  const deal = DEALS.find(d => d.id.toString() === productId || d.productName.toLowerCase().includes(productId.toLowerCase()));

  const displayTitle = product?.name || deal?.productName || 'Wholesale Auto Part';
  const displayPrice = product ? `₹${product.basePrice.toLocaleString('en-IN')}` : (deal?.price || '₹4,800');
  const displayOriginalPrice = product ? `₹${Math.round(product.basePrice * 1.25).toLocaleString('en-IN')}` : (deal?.originalPrice || '₹6,000');
  const displayMoq = product ? `MOQ ${product.moq} ${product.unit}s` : (deal?.moq || 'MOQ 4 sets');
  const displayBrand = product?.brand || deal?.brandName || 'Authorized Distributor';
  const displayCategory = product?.categoryName || 'Auto Parts';
  const displayLocation = product ? 'Mumbai, MH' : (deal?.location || 'Delhi, IN');

  const handleAddToCart = () => {
    if (product) {
      addItem({
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        productImageUrl: product.images[0]?.url || '',
        sellerId: product.sellerId,
        sellerName: product.sellerName,
        quantity: product.moq,
        unitPrice: product.basePrice,
        currency: product.currency,
        unit: product.unit,
        moq: product.moq,
        stock: product.stock,
        gstRate: product.gstRate || 18,
      });
      addNotification({
        type: 'success',
        title: 'Added to Cart',
        message: `${product.name} (Qty: ${product.moq}) added to your cart.`,
      });
    } else {
      addNotification({
        type: 'info',
        title: 'Sample Product',
        message: 'Product added to procurement list.',
      });
    }
  };

  return (
    <div className={styles.page}>
      <PublicHeader />

      <main className={styles.main}>
        <div className={styles.breadcrumb}>
          <Link href="/">Home</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <Link href={`/categories/${product?.categoryId || 'auto-parts'}`}>{displayCategory}</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{displayTitle}</span>
        </div>

        <div className={styles.topSection}>
          {/* Left Column: Images */}
          <div className={styles.gallery}>
            <div className={styles.mainImage} style={{ background: deal?.bgColor || 'var(--color-primary-50)' }}>
              <span className={styles.mainImageBadge}>BESTSELLER</span>
              {product?.brand?.slice(0, 2) || deal?.brandInitials || 'HW'}
            </div>
            <div className={styles.thumbnailStrip}>
              <div className={`${styles.thumbnail} ${styles.thumbnailActive}`} style={{ background: deal?.bgColor || 'var(--color-primary-50)' }}></div>
              <div className={styles.thumbnail} style={{ background: deal?.bgColor || 'var(--color-primary-50)' }}></div>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className={styles.details}>
            <div className={styles.brandRow}>
              <span className={styles.brandName}>
                {displayBrand} <CheckCircle size={14} color="#10B981" />
              </span>
              <span className={styles.rating}>
                <Star size={12} fill="#F59E0B" color="#F59E0B" />
                {product?.rating || deal?.rating || 4.8} ({product?.reviewCount || deal?.reviews || 120})
              </span>
            </div>

            <h1 className={styles.title}>{displayTitle}</h1>

            <div className={styles.badgesRow}>
              <span className={`${styles.badgePill} ${styles.badgeBlue}`}>{deal?.hsn?.split('·')[0].trim() || 'HSN 8708'}</span>
              <span className={`${styles.badgePill} ${styles.badgeBlue}`}>{deal?.hsn?.split('·')[1]?.trim() || `GST ${product?.gstRate || 18}%`}</span>
              <span className={`${styles.badgePill} ${styles.badgeOrange}`}>{displayMoq}</span>
              <span className={styles.badgeLocation}>
                <MapPin size={12} />
                Ships from {displayLocation}
              </span>
            </div>

            <div className={styles.priceCard}>
              <div className={styles.priceRow}>
                <span className={styles.mainPrice}>{displayPrice}</span>
                <span className={styles.strikePrice}>{displayOriginalPrice}</span>
                {deal?.badgeRight && (
                  <span className={styles.discountBadge}>{deal.badgeRight.toUpperCase()}</span>
                )}
              </div>
              <p className={styles.priceSubtext}>
                Wholesale price / {product?.unit || 'set'} · exclusive of GST · retailer margin ~21%
              </p>

              <div className={styles.sectionTitle}>BULK PRICE TIERS</div>
              <div className={styles.bulkTiers}>
                {product?.priceTiers && product.priceTiers.length > 0 ? (
                  product.priceTiers.map((tier, idx) => (
                    <div key={idx} className={styles.tierBox}>
                      <div className={styles.tierQty}>{tier.minQty}+ {product.unit}s</div>
                      <div className={styles.tierPrice}>₹{tier.price.toLocaleString('en-IN')}</div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className={styles.tierBox}>
                      <div className={styles.tierQty}>20+ units</div>
                      <div className={styles.tierPrice}>{displayPrice}</div>
                    </div>
                    <div className={styles.tierBox}>
                      <div className={styles.tierQty}>50+ units</div>
                      <div className={styles.tierPrice}>₹{Math.floor((product?.basePrice || 4800) * 0.95).toLocaleString('en-IN')}</div>
                    </div>
                  </>
                )}
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
              <button className={styles.btnPrimary} onClick={handleAddToCart}>
                <ShoppingCart size={16} /> Add to Cart
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
                <span className={styles.specLabel}>HSN / Part No.</span>
                <span className={styles.specValue}>{product?.partNumber || deal?.hsn?.split('·')[0]?.replace('HSN', '')?.trim() || '8708-9900'}</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specLabel}>GST Rate</span>
                <span className={styles.specValue}>{product ? `${product.gstRate}%` : (deal?.hsn?.split('·')[1]?.replace('GST', '')?.trim() || '18%')}</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specLabel}>MOQ</span>
                <span className={styles.specValue}>{displayMoq}</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specLabel}>Stock available</span>
                <span className={styles.specValue}>{product ? `${product.stock.toLocaleString('en-IN')} units` : '8,400 units'}</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specLabel}>Origin / Ships From</span>
                <span className={styles.specValue}>{displayLocation}</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specLabel}>Category</span>
                <span className={styles.specValue}>{displayCategory}</span>
              </div>
              <div className={styles.specRow}>
                <span className={styles.specLabel}>Brand</span>
                <span className={styles.specValue}>{displayBrand}</span>
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
