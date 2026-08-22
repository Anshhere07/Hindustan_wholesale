'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, MapPin, CheckCircle, Shield, Truck, CreditCard, RotateCcw, Check, ShoppingCart, ArrowLeft, Package, Clock, Lock } from 'lucide-react';
import styles from './ProductDetails.module.css';
import { getProductById, getProductBySlug } from '@/lib/firebase/collections/products';
import { MOCK_PRODUCTS } from '@/lib/api/mock-data';
import type { Product } from '@/types/product.types';
import { useCartStore } from '@/stores/cart.store';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { ROUTES } from '@/lib/constants/routes';

interface ProductDetailsProps {
  productId: string;
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80';

const ProductDetails: React.FC<ProductDetailsProps> = ({ productId }) => {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem, isInCart } = useCartStore();
  const { addNotification } = useUIStore();
  const { isAuthenticated, user } = useAuthStore();

  const isLoggedIn = isAuthenticated && !!user;

  useEffect(() => {
    async function loadProduct() {
      try {
        let p = await getProductById(productId);
        if (!p) {
          p = await getProductBySlug(productId);
        }
        if (!p) {
          const match = MOCK_PRODUCTS.find(
            (item) => item.id === productId || item.slug === productId || item.sku.toLowerCase() === productId.toLowerCase()
          );
          if (match) {
            p = {
              id: match.id,
              sku: match.sku,
              name: match.name,
              slug: match.slug,
              description: `${match.name} — High performance automotive component engineered for max durability. Certified wholesale supply with GST invoice.`,
              categoryId: match.categoryId || 'cat-1',
              categoryName: match.categoryName,
              sellerId: 'sel-1',
              sellerName: match.sellerName,
              sellerRating: match.sellerRating,
              images: [match.primaryImage],
              specifications: [
                { name: 'Brand', value: match.brand || 'Genuine OE' },
                { name: 'Part Number', value: match.sku },
                { name: 'Category', value: match.categoryName },
              ],
              priceTiers: [
                { minQty: match.moq, price: match.basePrice, currency: match.currency },
                { minQty: match.moq * 2, price: Math.floor(match.basePrice * 0.95), currency: match.currency },
                { minQty: match.moq * 5, price: Math.floor(match.basePrice * 0.90), currency: match.currency },
              ],
              basePrice: match.basePrice,
              currency: match.currency,
              unit: match.unit,
              moq: match.moq,
              stock: match.stock,
              leadTimeDays: match.leadTimeDays,
              tags: [match.brand || 'OE', match.categoryName],
              brand: match.brand,
              partNumber: match.sku,
              isGstExempt: false,
              gstRate: 18,
              status: match.status,
              isFeatured: match.isFeatured,
              rating: match.rating,
              reviewCount: match.reviewCount,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          }
        }
        if (p) setProduct(p);
      } catch (err) {
        console.error('Failed to load product details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  const inCart = product ? isInCart(product.id) : false;

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      addNotification({
        type: 'info',
        title: 'Sign In Required',
        message: 'Please sign in to your retailer account to view wholesale prices and add products to your cart.',
        duration: 6000,
      });
      router.push('/auth/login');
      return;
    }

    if (!product) return;
    addItem({
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      productImageUrl: product.images[0]?.url || DEFAULT_IMAGE,
      sellerId: product.sellerId || 'sel-1',
      sellerName: product.sellerName || 'AutoParts Direct',
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
      title: 'Added to Cart!',
      message: `${product.moq} ${product.unit}(s) of "${product.name}" added to your cart.`,
    });
  };

  const handleCartNavigation = (e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      addNotification({
        type: 'info',
        title: 'Sign In Required',
        message: 'Please sign in to view your wholesale cart and place orders.',
        duration: 6000,
      });
      router.push('/auth/login');
    }
  };

  const displayTitle = product?.name || 'Wholesale Auto Component';
  const displayPrice = product ? `₹${product.basePrice.toLocaleString('en-IN')}` : '₹1,450';
  const displayOriginalPrice = product ? `₹${Math.round(product.basePrice * 1.25).toLocaleString('en-IN')}` : '₹1,850';
  const displayMoq = product ? `MOQ ${product.moq} ${product.unit}s` : 'MOQ 5 pcs';
  const displayBrand = product?.brand || 'Genuine OE';
  const displayCategory = product?.categoryName || 'Auto Parts';
  const imgUrl = product?.images[0]?.url || DEFAULT_IMAGE;

  return (
    <div className={styles.productDetailsContainer}>
      {/* Breadcrumb Navigation */}
      <div className={styles.breadcrumb}>
        <Link href={ROUTES.BUYER.CATALOG} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ArrowLeft size={14} /> Back to Catalog
        </Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span>{displayCategory}</span>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{displayTitle}</span>
      </div>

      <div className={styles.topSection}>
        {/* Left Column: Product Image */}
        <div className={styles.gallery}>
          <div className={styles.mainImage} style={{ padding: 0, overflow: 'hidden' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgUrl}
              alt={displayTitle}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 16 }}
            />
            <span className={styles.mainImageBadge}>VERIFIED SUPPLIER</span>
          </div>
          <div className={styles.thumbnailStrip}>
            <div className={`${styles.thumbnail} ${styles.thumbnailActive}`} style={{ overflow: 'hidden' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgUrl} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>
        </div>

        {/* Right Column: Product Information & Purchase Actions */}
        <div className={styles.details}>
          <div className={styles.brandRow}>
            <span className={styles.brandName}>
              {displayBrand} <CheckCircle size={14} color="#10B981" />
            </span>
            <span className={styles.rating}>
              <Star size={13} fill="#F59E0B" color="#F59E0B" />
              {product?.rating || 4.8} ({product?.reviewCount || 45} reviews)
            </span>
          </div>

          <h1 className={styles.title}>{displayTitle}</h1>

          <div className={styles.badgesRow}>
            <span className={`${styles.badgePill} ${styles.badgeBlue}`}>SKU: {product?.sku || 'HW-9021'}</span>
            <span className={`${styles.badgePill} ${styles.badgeOrange}`}>{displayMoq}</span>
            <span className={styles.badgeLocation}>
              <MapPin size={12} />
              Ships Pan-India (2-3 Days)
            </span>
          </div>

          {/* Price Block: Conditional on Login */}
          <div className={styles.priceCard}>
            {isLoggedIn ? (
              <>
                <div className={styles.priceRow}>
                  <span className={styles.mainPrice}>{displayPrice}</span>
                  <span className={styles.strikePrice}>{displayOriginalPrice}</span>
                  <span className={styles.discountBadge}>SAVE 20%</span>
                </div>
                <p className={styles.priceSubtext}>
                  All-inclusive wholesale price per {product?.unit || 'piece'} · platform margin &amp; GST included
                </p>

                <div className={styles.sectionTitle}>BULK WHOLESALE TIERS</div>
                <div className={styles.bulkTiers}>
                  {product?.priceTiers && product.priceTiers.length > 0 ? (
                    product.priceTiers.map((tier, idx) => (
                      <div key={idx} className={styles.tierBox}>
                        <div className={styles.tierQty}>{tier.minQty}+ {product?.unit || 'pcs'}</div>
                        <div className={styles.tierPrice}>₹{tier.price.toLocaleString('en-IN')}</div>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className={styles.tierBox}>
                        <div className={styles.tierQty}>{product?.moq || 5}+ pcs</div>
                        <div className={styles.tierPrice}>{displayPrice}</div>
                      </div>
                      <div className={styles.tierBox}>
                        <div className={styles.tierQty}>{(product?.moq || 5) * 2}+ pcs</div>
                        <div className={styles.tierPrice}>₹{Math.floor((product?.basePrice || 1450) * 0.95).toLocaleString('en-IN')}</div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div style={{ padding: '8px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8B0000', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
                  <Lock size={18} /> Wholesale Price Locked
                </div>
                <p style={{ margin: '0 0 16px', fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Sign in to your registered buyer/retailer account to unlock direct factory pricing, bulk discount tiers, and add to cart.
                </p>
                <Link
                  href="/auth/login"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    background: '#8B0000',
                    color: '#ffffff',
                    padding: '12px 22px',
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 14,
                    textDecoration: 'none',
                    boxShadow: '0 4px 14px rgba(139,0,0,0.25)',
                  }}
                >
                  Sign In to View Price &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Actions: Add to Cart */}
          <div className={styles.actionsRow}>
            <button
              className={styles.btnPrimary}
              onClick={handleAddToCart}
              style={{
                background: inCart ? '#10b981' : '#8B0000',
                color: '#ffffff',
                height: 52,
                borderRadius: 12,
                fontSize: 16,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(139,0,0,0.25)',
                flex: 1,
              }}
            >
              <ShoppingCart size={18} />
              {inCart ? 'Item Added to Cart ✓' : isLoggedIn ? 'Add to Cart' : 'Sign in to Add to Cart'}
            </button>

            <Link
              href={ROUTES.BUYER.CART}
              onClick={handleCartNavigation}
              className={styles.btnSecondary}
              style={{
                height: 52,
                borderRadius: 12,
                padding: '0 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                fontWeight: 600,
                border: '1.5px solid var(--border-default)',
                color: 'var(--text-primary)',
              }}
            >
              Go to Cart
            </Link>
          </div>

          <div style={{ marginTop: 24 }}>
            <div className={styles.featuresRow}>
              <div className={styles.featureItem}>
                <div className={styles.featureIconRow}>
                  <Truck size={14} color="#8B0000" /> Fast Delivery
                </div>
                <div className={styles.featureDesc}>{product?.leadTimeDays || 3} days pan-India</div>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIconRow}>
                  <CreditCard size={14} color="#8B0000" /> Payment Terms
                </div>
                <div className={styles.featureDesc}>UPI · GST Invoice · Credit</div>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIconRow}>
                  <RotateCcw size={14} color="#8B0000" /> Guarantee
                </div>
                <div className={styles.featureDesc}>Replacement covered</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Specifications & Description */}
      <div className={styles.bottomSection}>
        <div>
          <h3 className={styles.bottomHeader}>Product Overview</h3>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
            {product?.description || `${displayTitle} is a premium automotive spare component manufactured to OE specifications.`}
          </p>
          <div className={styles.highlightsList}>
            <div className={styles.highlightItem}>
              <Check size={16} className={styles.highlightIcon} /> 100% genuine wholesale quality
            </div>
            <div className={styles.highlightItem}>
              <Check size={16} className={styles.highlightIcon} /> Direct factory sourcing from verified manufacturers
            </div>
            <div className={styles.highlightItem}>
              <Check size={16} className={styles.highlightIcon} /> GST invoice included with every order
            </div>
          </div>
        </div>

        <div>
          <h3 className={styles.bottomHeader}>Specifications</h3>
          <div className={styles.specsTable}>
            <div className={styles.specRow}>
              <span className={styles.specLabel}>Part Number / SKU</span>
              <span className={styles.specValue}>{product?.sku || 'HW-9021'}</span>
            </div>
            <div className={styles.specRow}>
              <span className={styles.specLabel}>Brand</span>
              <span className={styles.specValue}>{displayBrand}</span>
            </div>
            <div className={styles.specRow}>
              <span className={styles.specLabel}>Category</span>
              <span className={styles.specValue}>{displayCategory}</span>
            </div>
            <div className={styles.specRow}>
              <span className={styles.specLabel}>Minimum Order Qty</span>
              <span className={styles.specValue}>{displayMoq}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
