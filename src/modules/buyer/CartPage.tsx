'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package, Tag, PhoneCall, MessageCircle, AlertCircle
} from 'lucide-react';
import styles from './CartPage.module.css';
import Button from '@/components/ui/Button';
import { useCartStore } from '@/stores/cart.store';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { formatCurrency } from '@/lib/utils/format';
import { ROUTES } from '@/lib/constants/routes';
import { placeOrder } from '@/lib/firebase/collections/orders';

// ─────────────────────────────────────────────────────────────────────────────
// Cart Page — line items, live quantity controls, exact itemized summary, Call & WhatsApp checkout
// Direct Call & WhatsApp order routing to +91 88002 32363
// ─────────────────────────────────────────────────────────────────────────────

const ORDER_PHONE_NUMBER = '+91 88002 32363';
const ORDER_PHONE_CLEAN = '918800232363';

const CartPage: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const cartStore = useCartStore();
  const { items, subtotal, totalGst, grandTotal, itemCount, updateQuantity, removeItem, clearCart } = cartStore;
  const { addNotification } = useUIStore();
  const { user } = useAuthStore();
  const [coupon, setCoupon] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [isWhatsapping, setIsWhatsapping] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const shippingFree = grandTotal >= 50000;
  const finalPayable = items.length > 0 ? grandTotal + (shippingFree ? 0 : 750) : 0;

  // ── Place Order on Call ──────────────────────────────────────────────────
  const handlePlaceOrderOnCall = async () => {
    if (items.length === 0) return;
    setIsCalling(true);
    try {
      const buyerId = user?.id || 'ANONYMOUS_BUYER';
      const buyerName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Verified Retailer';

      // Save order in Firestore
      const orderId = await placeOrder(
        cartStore,
        buyerId,
        buyerName,
        undefined,
        { id: 'addr-1', line1: 'Primary Business Address', city: 'Delhi / NCR', state: 'Delhi', pincode: '110001', country: 'India' },
        { id: 'addr-1', line1: 'Primary Business Address', city: 'Delhi / NCR', state: 'Delhi', pincode: '110001', country: 'India' },
        'call'
      );

      addNotification({
        type: 'success',
        title: 'Order Placed on Call!',
        message: `Order #${orderId} logged. Connecting you with wholesale dispatch team at ${ORDER_PHONE_NUMBER}...`,
        duration: 8000,
      });

      // Clear cart
      clearCart();

      // Trigger telephone dialer
      window.location.href = `tel:+${ORDER_PHONE_CLEAN}`;
    } catch (err: any) {
      console.error('Failed to log call order:', err);
      // Fallback: still dial
      window.location.href = `tel:+${ORDER_PHONE_CLEAN}`;
    } finally {
      setIsCalling(false);
    }
  };

  // ── Confirm Order on WhatsApp ───────────────────────────────────────────
  const handleConfirmOnWhatsApp = async () => {
    if (items.length === 0) return;
    setIsWhatsapping(true);
    try {
      const buyerId = user?.id || 'ANONYMOUS_BUYER';
      const buyerName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Retail Buyer';
      const buyerEmail = user?.email || 'N/A';
      const buyerPhone = user?.phone || 'N/A';

      // Save order in Firestore
      const orderId = await placeOrder(
        cartStore,
        buyerId,
        buyerName,
        undefined,
        { id: 'addr-1', line1: 'Primary Business Address', city: 'Delhi / NCR', state: 'Delhi', pincode: '110001', country: 'India' },
        { id: 'addr-1', line1: 'Primary Business Address', city: 'Delhi / NCR', state: 'Delhi', pincode: '110001', country: 'India' },
        'whatsapp'
      );

      // Build structured message for WhatsApp
      const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      
      const itemRows = items.map((item, idx) => {
        return `${idx + 1}. *${item.productName}*\n   • SKU: \`${item.productSku}\`\n   • Qty: ${item.quantity} ${item.unit}s × ₹${item.unitPrice.toLocaleString('en-IN')}\n   • Seller: ${item.sellerName}\n   • Item Total: ₹${(item.unitPrice * item.quantity).toLocaleString('en-IN')}`;
      }).join('\n\n');

      const messageText = `🛒 *NEW B2B WHOLESALE ORDER - HINDUSTAN WHOLESALE*
Order ID: #${orderId}
Date: ${dateStr}

👤 *BUYER DETAILS:*
• Name: ${buyerName}
• Email: ${buyerEmail}
• Phone: ${buyerPhone}

📦 *ORDERED PRODUCTS (${items.length} products, ${itemCount} units):*
${itemRows}

━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 *Subtotal:* ₹${subtotal.toLocaleString('en-IN')}
📊 *GST (18%):* ₹${totalGst.toLocaleString('en-IN')}
🚚 *Shipping:* ${shippingFree ? 'FREE' : '₹750'}
🏷️ *GRAND TOTAL:* ₹${finalPayable.toLocaleString('en-IN')}
━━━━━━━━━━━━━━━━━━━━━━━━━━

Please confirm order acceptance, GST invoice generation, and dispatch timeline. Thank you!`;

      addNotification({
        type: 'success',
        title: 'Order Generated!',
        message: `Order #${orderId} saved. Opening WhatsApp with order summary for +91 88002 32363...`,
        duration: 8000,
      });

      // Clear cart
      clearCart();

      // Open WhatsApp Web / App
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${ORDER_PHONE_CLEAN}&text=${encodeURIComponent(messageText)}`;
      window.open(whatsappUrl, '_blank');
    } catch (err: any) {
      console.error('Failed to log WhatsApp order:', err);
      const fallbackMsg = `Hello Hindustan Wholesale (+91 88002 32363), I want to confirm my wholesale order of ${items.length} products worth ₹${finalPayable.toLocaleString('en-IN')}.`;
      window.open(`https://api.whatsapp.com/send?phone=${ORDER_PHONE_CLEAN}&text=${encodeURIComponent(fallbackMsg)}`, '_blank');
    } finally {
      setIsWhatsapping(false);
    }
  };

  if (!mounted) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Loading your cart...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}><ShoppingCart size={48} /></div>
        <h1 className={styles.emptyTitle}>Your cart is empty</h1>
        <p className={styles.emptySub}>You have not added any products to your cart yet. Browse the catalog to start ordering.</p>
        <Link href={ROUTES.BUYER.CATALOG}>
          <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
            Browse Catalog
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Cart</h1>
          <p className={styles.subtitle}>
            {items.length} product{items.length !== 1 ? 's' : ''} ({itemCount} total units) from {new Set(items.map((i) => i.sellerName)).size} seller{new Set(items.map((i) => i.sellerName)).size !== 1 ? 's' : ''}
          </p>
        </div>
        <button className={styles.clearBtn} onClick={clearCart}>
          <Trash2 size={14} /> Clear all items
        </button>
      </div>

      <div className={styles.layout}>
        {/* Items List */}
        <div className={styles.itemsList}>
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
                        title="Remove product from cart"
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

        {/* Order Summary */}
        <div className={styles.summary}>
          <h2 className={styles.summaryTitle}>Order Summary</h2>

          {/* Itemized Cart List Preview */}
          <div style={{
            background: 'var(--bg-surface-alt)',
            borderRadius: 12,
            padding: '12px 14px',
            border: '1px solid var(--border-subtle)',
          }}>
            <p style={{
              fontSize: 11.5,
              fontWeight: 700,
              color: 'var(--text-secondary)',
              margin: '0 0 10px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Selected Products ({items.length})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map((it) => (
                <div key={it.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5 }}>
                  <div style={{ minWidth: 0, paddingRight: 8 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {it.productName}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                      {it.quantity} {it.unit}s × {formatCurrency(it.unitPrice, it.currency)}
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)', flexShrink: 0 }}>
                    {formatCurrency(it.unitPrice * it.quantity, it.currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>

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
              <span>Subtotal ({items.length} product{items.length > 1 ? 's' : ''}, {itemCount} units)</span>
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
              <span>{formatCurrency(finalPayable, 'INR')}</span>
            </div>
            <p className={styles.gstNote}>Calculated dynamically for your selected products</p>
          </div>

          {/* Direct Order Actions: Call & WhatsApp */}
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Button 1: Confirm Order on WhatsApp */}
            <button
              type="button"
              onClick={handleConfirmOnWhatsApp}
              disabled={isWhatsapping || isCalling || items.length === 0}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: 12,
                padding: '14px 18px',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
                transition: 'all 0.2s ease',
              }}
            >
              <MessageCircle size={20} />
              <span>Confirm order on WhatsApp</span>
            </button>

            {/* Button 2: Place Order on Call */}
            <button
              type="button"
              onClick={handlePlaceOrderOnCall}
              disabled={isCalling || isWhatsapping || items.length === 0}
              style={{
                width: '100%',
                background: '#8B0000',
                color: '#ffffff',
                border: 'none',
                borderRadius: 12,
                padding: '14px 18px',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                boxShadow: '0 4px 14px rgba(139, 0, 0, 0.25)',
                transition: 'all 0.2s ease',
              }}
            >
              <PhoneCall size={18} />
              <span>Place order on call</span>
            </button>

            <div style={{
              textAlign: 'center',
              fontSize: 12,
              color: 'var(--text-secondary)',
              marginTop: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}>
              <span>Direct Wholesale Desk:</span>
              <strong style={{ color: '#8B0000' }}>{ORDER_PHONE_NUMBER}</strong>
            </div>
          </div>

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
