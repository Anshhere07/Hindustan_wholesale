'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Star, Package, Clock, ShieldCheck, Store, Lock } from 'lucide-react';
import styles from './ProductCard.module.css';
import { cn } from '@/lib/utils/cn';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/format';
import { useCartStore } from '@/stores/cart.store';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { ROUTES } from '@/lib/constants/routes';
import type { ProductListItem } from '@/types/product.types';

// ─────────────────────────────────────────────────────────────────────────────
// ProductCard — catalog grid/list item with auth-guarded cart & dynamic pricing
// ─────────────────────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: ProductListItem;
  view?: 'grid' | 'list';
  className?: string;
  hidePrice?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, view = 'grid', className, hidePrice = false }) => {
  const router = useRouter();
  const { addItem, isInCart } = useCartStore();
  const { addNotification } = useUIStore();
  const { isAuthenticated, user } = useAuthStore();

  const isLoggedIn = isAuthenticated && !!user;
  const isPriceHidden = hidePrice || !isLoggedIn;
  const inCart = isInCart(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

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

    addItem({
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      productImageUrl: product.primaryImage.url,
      sellerId: (product as any).sellerId || 'sel-1',
      sellerName: product.sellerName,
      quantity: product.moq,
      unitPrice: product.basePrice,
      currency: product.currency,
      unit: product.unit,
      moq: product.moq,
      stock: product.stock,
      gstRate: 18,
    });

    addNotification({
      type: 'success',
      title: 'Added to Cart',
      message: `${product.moq} ${product.unit}(s) of "${product.name.slice(0, 32)}…"`,
    });
  };

  const handleShopClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shopSlug = (product.sellerName || 'AutoParts Direct').trim();
    router.push(`/shops/${encodeURIComponent(shopSlug)}`);
  };

  const productUrl = ROUTES.BUYER.PRODUCT(product.slug);

  if (view === 'list') {
    return (
      <Link href={productUrl} className={cn(styles.listCard, className)} aria-label={product.name}>
        <div className={styles.listImageWrap}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.primaryImage.url} alt={product.primaryImage.altText} className={styles.listImage} />
        </div>
        <div className={styles.listContent}>
          <div className={styles.listTop}>
            <div>
              <p className={styles.brand}>{product.brand}</p>
              <h3 className={styles.listName}>{product.name}</h3>
              <button
                type="button"
                onClick={handleShopClick}
                style={{
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  padding: '3px 8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#8B0000',
                  cursor: 'pointer',
                  margin: '4px 0',
                  transition: 'all 0.15s',
                }}
                title="View all products from this shop"
              >
                <Store size={12} />
                <span>{product.sellerName}</span>
              </button>
            </div>
            <div className={styles.listPriceBlock}>
              {!isPriceHidden ? (
                <>
                  <p className={styles.price}>{formatCurrency(product.basePrice, product.currency)}</p>
                  <p className={styles.priceUnit}>per {product.unit}</p>
                </>
              ) : (
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#8B0000', background: '#fdf2f2', padding: '3px 8px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Lock size={12} /> Wholesale Price
                  </span>
                  <p style={{ fontSize: 11, color: 'var(--text-tertiary)', margin: '2px 0 0' }}>Login to view pricing</p>
                </div>
              )}
              {product.isFeatured && <Badge variant="primary" size="sm">Featured</Badge>}
            </div>
          </div>
          <div className={styles.listMeta}>
            <span className={styles.metaItem}>
              <Star size={13} aria-hidden="true" />
              {product.rating.toFixed(1)} ({product.reviewCount})
            </span>
            <span className={styles.metaItem}>
              <Package size={13} aria-hidden="true" />
              MOQ: {product.moq} {product.unit}
            </span>
            <span className={styles.metaItem}>
              <Clock size={13} aria-hidden="true" />
              {product.leadTimeDays}d lead time
            </span>
            <span className={styles.metaItem}>
              <ShieldCheck size={13} aria-hidden="true" />
              {product.stock} in stock
            </span>
          </div>
        </div>
        <div className={styles.listAction}>
          {!isPriceHidden ? (
            <Button
              variant={inCart ? 'secondary' : 'primary'}
              size="sm"
              onClick={handleAddToCart}
            >
              {inCart ? 'In Cart' : 'Add to Cart'}
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleAddToCart}
            >
              Login to Buy
            </Button>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link href={productUrl} className={cn(styles.card, className)} aria-label={product.name}>
      <div className={styles.imageWrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.primaryImage.url} alt={product.primaryImage.altText} className={styles.image} />
        {product.isFeatured && (
          <span className={styles.featuredBadge}>Featured</span>
        )}
        <div className={styles.imageOverlay} aria-hidden="true" />
      </div>

      <div className={styles.content}>
        <div className={styles.topRow}>
          <span className={styles.category}>{product.categoryName}</span>
          <span className={styles.rating}>
            <Star size={11} aria-hidden="true" />
            {product.rating.toFixed(1)}
          </span>
        </div>

        {product.brand && <p className={styles.brand}>{product.brand}</p>}
        <h3 className={styles.name}>{product.name}</h3>
        
        {/* Clickable Shop / Seller Badge */}
        <div style={{ margin: '3px 0 6px' }}>
          <button
            type="button"
            onClick={handleShopClick}
            style={{
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: 6,
              padding: '2.5px 7px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11.5,
              fontWeight: 600,
              color: '#8B0000',
              cursor: 'pointer',
              transition: 'all 0.15s',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={`View all products from ${product.sellerName}`}
          >
            <Store size={11.5} style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.sellerName}</span>
          </button>
        </div>

        <div className={styles.meta}>
          <span className={styles.metaChip}>
            <Package size={11} aria-hidden="true" /> MOQ {product.moq}
          </span>
          <span className={styles.metaChip}>
            <Clock size={11} aria-hidden="true" /> {product.leadTimeDays}d
          </span>
        </div>

        <div className={styles.footer}>
          {!isPriceHidden ? (
            <>
              <div className={styles.priceBlock}>
                <p className={styles.price}>{formatCurrency(product.basePrice, product.currency)}</p>
                <p className={styles.priceUnit}>/{product.unit}</p>
              </div>
              <Button
                variant={inCart ? 'secondary' : 'primary'}
                size="xs"
                onClick={handleAddToCart}
                aria-label={inCart ? 'Already in cart' : `Add ${product.name} to cart`}
              >
                {inCart ? 'In Cart' : '+ Cart'}
              </Button>
            </>
          ) : (
            <>
              <div className={styles.priceBlock}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: '#8B0000', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <Lock size={11} /> Wholesale Price
                </span>
                <p className={styles.priceUnit}>Login to view price</p>
              </div>
              <Button
                variant="secondary"
                size="xs"
                onClick={handleAddToCart}
                aria-label="Login to view price"
              >
                Login to Buy
              </Button>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
