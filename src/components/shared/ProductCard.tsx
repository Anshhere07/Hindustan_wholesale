'use client';

import React from 'react';
import Link from 'next/link';
import { Star, Package, Clock, ShieldCheck } from 'lucide-react';
import styles from './ProductCard.module.css';
import { cn } from '@/lib/utils/cn';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils/format';
import { useCartStore } from '@/stores/cart.store';
import { useUIStore } from '@/stores/ui.store';
import { ROUTES } from '@/lib/constants/routes';
import type { ProductListItem } from '@/types/product.types';

// ─────────────────────────────────────────────────────────────────────────────
// ProductCard — catalog grid/list item with add-to-cart action
// ─────────────────────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: ProductListItem;
  view?: 'grid' | 'list';
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, view = 'grid', className }) => {
  const { addItem, isInCart } = useCartStore();
  const { addNotification } = useUIStore();
  const inCart = isInCart(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      productImageUrl: product.primaryImage.url,
      sellerId: 'sel-1',
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
      title: 'Added to cart',
      message: `${product.moq} ${product.unit}(s) of "${product.name.slice(0, 32)}…"`,
    });
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
              <p className={styles.seller}>by {product.sellerName}</p>
            </div>
            <div className={styles.listPriceBlock}>
              <p className={styles.price}>{formatCurrency(product.basePrice, product.currency)}</p>
              <p className={styles.priceUnit}>per {product.unit}</p>
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
          <Button
            variant={inCart ? 'secondary' : 'primary'}
            size="sm"
            onClick={handleAddToCart}
          >
            {inCart ? 'In Cart' : 'Add to Cart'}
          </Button>
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
        <p className={styles.seller}>by {product.sellerName}</p>

        <div className={styles.meta}>
          <span className={styles.metaChip}>
            <Package size={11} aria-hidden="true" /> MOQ {product.moq}
          </span>
          <span className={styles.metaChip}>
            <Clock size={11} aria-hidden="true" /> {product.leadTimeDays}d
          </span>
        </div>

        <div className={styles.footer}>
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
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
