'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package, Tag, PhoneCall, MessageCircle, AlertCircle, ShieldCheck
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
// Cart Page — line items, live quantity controls, exact itemized summary
// Clean All-Inclusive Pricing (zero separate GST jargon), Call & WhatsApp checkout
// Direct Call & WhatsApp order routing to +91 88002 32363
// ─────────────────────────────────────────────────────────────────────────────

const ORDER_PHONE_NUMBER = '+91 88002 32363';
const ORDER_PHONE_CLEAN = '918800232363';

const CartPage: React.FC = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const cartStore = useCartStore();
  const { items, subtotal, grandTotal, itemCount, updateQuantity, removeItem, clearCart } = cartStore;
  const { addNotification } = useUIStore();
  const { user, isAuthenticated } = useAuthStore();
  const [isCalling, setIsCalling] = useState(false);
  const [isWhatsapping, setIsWhatsapping] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const shippingFree = subtotal >= 50000;
  const shippingCharge = items.length > 0 ? (shippingFree ? 0 : 750) : 0;
  const finalPayable = items.length > 0 ? subtotal + shippingCharge : 0;

  // ── Place Order on Call ──────────────────────────────────────────────────
  const handlePlaceOrderOnCall = async () => {
    if (items.length === 0) return;

    if (!isAuthenticated || !user) {
      addNotification({
        type: 'info',
        title: 'Sign In Required',
        message: 'Please sign in to your retailer account to place your order.',
        duration: 6000,
      });
      router.push('/auth/login');
      return;
    }

    setIsCalling(true);
    try {
      const buyerId = user.id || 'ANONYMOUS_BUYER';
      const buyerName = `${user.firstName} ${user.lastName || ''}`.trim() || 'Verified Retailer';

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

    if (!isAuthenticated || !user) {
      addNotification({
        type: 'info',
        title: 'Sign In Required',
        message: 'Please sign in to your retailer account to confirm your order on WhatsApp.',
        duration: 6000,
      });
      router.push('/auth/login');
      return;
    }

    setIsWhatsapping(true);
    try {
      const buyerId = user.id || 'ANONYMOUS_BUYER';
      const buyerName = `${user.firstName} ${user.lastName || ''}`.trim() || 'Verified Retailer';
      const shopName = (user as any)?.businessName ? ` (${(user as any).businessName})` : '';
      const buyerEmail = user.email || 'N/A';
      const buyerPhone = user.phone || 'N/A';

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

      // Build rich, elegant, professional WhatsApp message
      const dateStr = new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      
      const itemRows = items.map((item, idx) => {
        const lineTotal = item.unitPrice * item.quantity;
        return `${idx + 1}️⃣ *${item.productName}*\n   ▫️ *SKU:* \`${item.productSku}\`\n   ▫️ *Shop/Seller:* ${item.sellerName || 'Hindustan Wholesale'}\n   ▫️ *Quantity:* ${item.quantity} ${item.unit || 'piece'}s\n   ▫️ *Rate:* ₹${item.unitPrice.toLocaleString('en-IN')}/${item.unit || 'piece'}\n   ▫️ *Item Total:* ₹${lineTotal.toLocaleString('en-IN')}`;
      }).join('\n\n');

      const messageText = `🙏 *NAMASTE HINDUSTAN WHOLESALE TEAM*
I would like to confirm and place a new wholesale order for my business. Please find my order details below:

📋 *ORDER ID:* #${orderId}
📅 *DATE:* ${dateStr}

👤 *BUYER INFORMATION:*
• *Name:* ${buyerName}${shopName}
• *Phone:* ${buyerPhone}
• *Email:* ${buyerEmail}

📦 *ORDERED PRODUCTS (${items.length} product${items.length > 1 ? 's' : ''}, ${itemCount} units):*
━━━━━━━━━━━━━━━━━━━━━━━━━━
${itemRows}
━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 *ORDER VALUE SUMMARY:*
• *Total Cart Value:* ₹${subtotal.toLocaleString('en-IN')}
• *Delivery / Logistics:* ${shippingFree ? 'FREE Delivery' : '₹750'}
🏷️ *GRAND TOTAL PAYABLE:* ₹${finalPayable.toLocaleString('en-IN')}

━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ *Please confirm order availability, dispatch schedule, and wholesale GST bill.*
Thank you!`;

      addNotification({
        type: 'success',
        title: 'Order Generated!',
        message: `Order #${orderId} saved. Opening WhatsApp chat (+91 88002 32363) with your order details...`,
        duration: 8000,
      });

      // Clear cart
      clearCart();

      // Open WhatsApp chat directly to +91 88002 32363
      const encodedMsg = encodeURIComponent(messageText);
      const whatsappUrl = `https://wa.me/918800232363?text=${encodedMsg}`;
      window.open(whatsappUrl, '_blank');
    } catch (err: any) {
      console.error('Failed to log WhatsApp order:', err);
      // Fallback: still open WhatsApp
      const fallbackMsg = encodeURIComponent(`🙏 Namaste Hindustan Wholesale Team,\nI would like to place a new wholesale order of ${items.length} product(s) for total cart value ₹${finalPayable.toLocaleString('en-IN')}.\nPlease share order details and dispatch timeline.`);
      window.open(`https://wa.me/918800232363?text=${fallbackMsg}`, '_blank');
    } finally {
      setIsWhatsapping(false);
    }
  };

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>
          <ShoppingCart size={48} />
        </div>
        <h2 className={styles.emptyTitle}>Your Wholesale Cart is Empty</h2>
        <p className={styles.emptyDesc}>
          Browse genuine automobile parts from verified manufacturers and add inventory to your cart.
        </p>
        <Link href="/categories/automobile">
          <Button variant="primary" size="md" rightIcon={<ArrowRight size={16} />}>
            Explore Automobile Categories
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Wholesale Cart</h1>
          <p className={styles.subtitle}>
            {items.length} product{items.length > 1 ? 's' : ''} ({itemCount} units) · Direct B2B Wholesale Procurement
          </p>
        </div>
        <Button variant="ghost" size="sm" leftIcon={<Trash2 size={15} />} onClick={clearCart}>
          Clear all items
        </Button>
      </div>

      <div className={styles.layout}>
        {/* ── Line Items ─────────────────────────────────────────────── */}
        <div className={styles.itemsList}>
          {items.map((item) => {
            const lineTotal = item.unitPrice * item.quantity;
            return (
              <div key={item.productId} className={styles.itemCard}>
                <div className={styles.itemImageWrap}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.productImageUrl}
                    alt={item.productName}
                    className={styles.itemImage}
                  />
                </div>

                <div className={styles.itemDetails}>
                  <div className={styles.itemHeader}>
                    <div>
                      <span className={styles.sellerName}>Sold by: {item.sellerName}</span>
                      <h3 className={styles.itemName}>
                        <Link href={ROUTES.BUYER.PRODUCT(item.productId)} className={styles.itemLink}>
                          {item.productName}
                        </Link>
                      </h3>
                      <span className={styles.itemSku}>SKU: {item.productSku}</span>
                    </div>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeItem(item.productId)}
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className={styles.itemFooter}>
                    {/* Quantity Controls */}
                    <div className={styles.qtyControl}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(item.productId, item.quantity - item.moq)}
                        disabled={item.quantity <= item.moq}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className={styles.qtyValue}>
                        {item.quantity} {item.unit}s
                      </span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(item.productId, item.quantity + item.moq)}
                        disabled={item.quantity + item.moq > item.stock}
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <div className={styles.itemPricing}>
                      <span className={styles.unitPrice}>
                        {formatCurrency(item.unitPrice, item.currency)}/{item.unit}
                      </span>
                      <span className={styles.lineTotal}>
                        {formatCurrency(lineTotal, item.currency)}
                      </span>
                    </div>
                  </div>

                  {item.quantity < item.moq && (
                    <div className={styles.moqWarning}>
                      Minimum order quantity is {item.moq} {item.unit}s
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Order Summary Sidebar (Pure Itemized & Shipping Only) ────────────────────── */}
        <div className={styles.sidebar}>
          <h2 className={styles.summaryTitle}>Order Summary</h2>

          {/* Itemized List */}
          <div style={{
            background: 'var(--bg-base)',
            borderRadius: 10,
            padding: '12px 14px',
            marginBottom: 16,
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

          {/* Clean Breakdown — ZERO separate GST text */}
          <div className={styles.breakdown}>
            <div className={styles.breakdownRow}>
              <span>Items Total ({items.length} product{items.length > 1 ? 's' : ''}, {itemCount} units)</span>
              <span>{formatCurrency(subtotal, 'INR')}</span>
            </div>
            <div className={styles.breakdownRow}>
              <span>Delivery / Shipping</span>
              <span className={shippingFree ? styles.free : ''}>
                {shippingFree ? 'FREE' : formatCurrency(750, 'INR')}
              </span>
            </div>
            {!shippingFree && (
              <p className={styles.shippingNote}>
                Add {formatCurrency(50000 - subtotal, 'INR')} more for free delivery
              </p>
            )}
            <div className={styles.divider} />
            <div className={styles.breakdownTotal}>
              <span>Grand Total</span>
              <span>{formatCurrency(finalPayable, 'INR')}</span>
            </div>
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
                boxShadow: '0 4px 14px rgba(139, 0, 0, 0.3)',
                transition: 'all 0.2s ease',
              }}
            >
              <PhoneCall size={18} />
              <span>Place order on call</span>
            </button>
          </div>

          <div className={styles.securityBadge}>
            <ShieldCheck size={16} />
            <span>Official dispatch &amp; billing via Hindustan Wholesale Support (+91 88002 32363)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
