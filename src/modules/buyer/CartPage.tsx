'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package, Tag } from 'lucide-react';
import styles from './CartPage.module.css';
import Button from '@/components/ui/Button';
import { useCartStore } from '@/stores/cart.store';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { formatCurrency } from '@/lib/utils/format';
import { ROUTES } from '@/lib/constants/routes';
import { placeOrder } from '@/lib/firebase/collections/orders';

// ─────────────────────────────────────────────────────────────────────────────
// Cart Page — line items, quantity controls, GST breakdown, checkout
// ─────────────────────────────────────────────────────────────────────────────

const CartPage: React.FC = () => {
  const cartStore = useCartStore();
  const { items, subtotal, totalGst, grandTotal, itemCount, updateQuantity, removeItem, clearCart } = cartStore;
  const { addNotification } = useUIStore();
  const { user } = useAuthStore();
  const [coupon, setCoupon] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const buyerId = user?.id || 'ANONYMOUS_BUYER';
      const buyerName = user ? `${user.firstName} ${user.lastName}` : 'Guest Retailer';
      const orderId = await placeOrder(
        cartStore,
        buyerId,
        buyerName,
        undefined,
        { id: 'addr-1', line1: '123 Industrial Area', city: 'New Delhi', state: 'Delhi', pincode: '110020', country: 'India' },
        { id: 'addr-1', line1: '123 Industrial Area', city: 'New Delhi', state: 'Delhi', pincode: '110020', country: 'India' },
        'credit_line'
      );
      addNotification({
        type: 'success',
        title: 'Order Placed Successfully!',
        message: `Order saved in Firestore (ID: ${orderId}). ₹${grandTotal.toLocaleString('en-IN')} will be invoiced.`,
        duration: 6000,
      });
      clearCart();
    } catch (err: any) {
      console.error('Failed to place order in Firestore:', err);
      addNotification({
        type: 'error',
        title: 'Checkout Error',
        message: err.message || 'Failed to place order',
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}><ShoppingCart size={48} /></div>
        <h1 className={styles.emptyTitle}>Your cart is empty</h1>
        <p className={styles.emptySub}>Add products from the catalog to start your order.</p>
        <Link href={ROUTES.BUYER.CATALOG}>
          <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
            Browse Catalog
          </Button>
        </Link>
      </div>
    );
  }

  const shippingFree = grandTotal >= 50000;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Cart</h1>
          <p className={styles.subtitle}>{itemCount} item{itemCount !== 1 ? 's' : ''} from {new Set(items.map((i) => i.sellerName)).size} seller{new Set(items.map((i) => i.sellerName)).size !== 1 ? 's' : ''}</p>
        </div>
        <button className={styles.clearBtn} onClick={clearCart}>
          <Trash2 size={14} /> Clear cart
        </button>
      </div>

      <div className={styles.layout}>
        {/* Items */}
        <div className={styles.itemsList}>
          {/* Group by seller */}
          {Array.from(new Set(items.map((i) => i.sellerId))).map((sellerId) => {
            const sellerItems = items.filter((i) => i.sellerId === sellerId);
            const sellerName = sellerItems[0].sellerName;
            return (
              <div key={sellerId} className={styles.sellerGroup}>
                <div className={styles.sellerHeader}>
                  <Package size={14} aria-hidden="true" />
                  <span>Sold by <strong>{sellerName}</strong></span>
                </div>
                {sellerItems.map((item) => (
                  <div key={item.productId} className={styles.cartItem}>
                    <div className={styles.itemImageWrap}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.productImageUrl} alt={item.productName} className={styles.itemImage} />
                    </div>
                    <div className={styles.itemInfo}>
                      <p className={styles.itemSku}>SKU: {item.productSku}</p>
                      <h3 className={styles.itemName}>{item.productName}</h3>
                      <p className={styles.itemPrice}>
                        {formatCurrency(item.unitPrice, item.currency)} / {item.unit}
                      </p>
                      <p className={styles.itemGst}>+ GST {item.gstRate}%</p>
                    </div>
                    <div className={styles.itemActions}>
                      <div className={styles.qtyControl} role="group" aria-label={`Quantity for ${item.productName}`}>
                        <button
                          className={styles.qtyBtn}
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          aria-label="Decrease quantity"
                          disabled={item.quantity <= item.moq}
                        >
                          <Minus size={13} />
                        </button>
                        <span className={styles.qtyValue}>{item.quantity}</span>
                        <button
                          className={styles.qtyBtn}
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          aria-label="Increase quantity"
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus size={13} />
                        </button>
                      </div>
                      <p className={styles.itemTotal}>
                        {formatCurrency(item.unitPrice * item.quantity, item.currency)}
                      </p>
                      <button
                        className={styles.removeBtn}
                        onClick={() => removeItem(item.productId)}
                        aria-label={`Remove ${item.productName} from cart`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className={styles.summary}>
          <h2 className={styles.summaryTitle}>Order Summary</h2>

          {/* Coupon */}
          <div className={styles.couponWrap}>
            <div className={styles.couponInput}>
              <Tag size={14} aria-hidden="true" />
              <input
                className={styles.couponField}
                placeholder="Coupon / Promo code"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                aria-label="Coupon code"
              />
            </div>
            <Button variant="secondary" size="sm">Apply</Button>
          </div>

          {/* Breakdown */}
          <div className={styles.breakdown}>
            <div className={styles.breakdownRow}>
              <span>Subtotal ({itemCount} items)</span>
              <span>{formatCurrency(subtotal, 'INR')}</span>
            </div>
            <div className={styles.breakdownRow}>
              <span>GST (avg. 18%)</span>
              <span>{formatCurrency(totalGst, 'INR')}</span>
            </div>
            <div className={styles.breakdownRow}>
              <span>Shipping</span>
              <span className={shippingFree ? styles.free : ''}>
                {shippingFree ? 'FREE' : formatCurrency(750, 'INR')}
              </span>
            </div>
            {!shippingFree && (
              <p className={styles.shippingNote}>
                Add {formatCurrency(50000 - grandTotal, 'INR')} more for free shipping
              </p>
            )}
            <div className={styles.divider} />
            <div className={styles.breakdownTotal}>
              <span>Grand Total</span>
              <span>{formatCurrency(grandTotal + (shippingFree ? 0 : 750), 'INR')}</span>
            </div>
            <p className={styles.gstNote}>All prices inclusive of applicable GST</p>
          </div>

          {/* Payment Method */}
          <div className={styles.paymentSection}>
            <p className={styles.paymentLabel}>Payment Method</p>
            <div className={styles.paymentOptions}>
              {['Credit Line', 'Bank Transfer', 'UPI'].map((method, i) => (
                <label key={method} className={styles.paymentOption}>
                  <input type="radio" name="payment" defaultChecked={i === 0} className={styles.paymentRadio} />
                  <span>{method}</span>
                </label>
              ))}
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isCheckingOut}
            onClick={handleCheckout}
            rightIcon={<ArrowRight size={18} />}
          >
            Place Order · {formatCurrency(grandTotal + (shippingFree ? 0 : 750), 'INR')}
          </Button>

          <p className={styles.terms}>
            By placing an order you agree to our <Link href="#">Terms of Service</Link> and{' '}
            <Link href="#">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
