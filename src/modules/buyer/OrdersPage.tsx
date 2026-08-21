'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search, Filter, Download, Eye, Package, Calendar, CreditCard,
  ChevronRight, ArrowRight, ShoppingBag, Truck
} from 'lucide-react';
import styles from './OrdersPage.module.css';
import { OrderStatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { MOCK_ORDERS } from '@/lib/api/mock-data';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { ROUTES } from '@/lib/constants/routes';
import type { OrderStatus, Order } from '@/types/order.types';
import { getBuyerOrders, getAllOrders } from '@/lib/firebase/collections/orders';
import { useAuthStore } from '@/stores/auth.store';

// ─────────────────────────────────────────────────────────────────────────────
// Orders Page — bulletproof safe rendering, responsive table + mobile cards
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_TABS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'All Orders', value: 'all' },
  { label: 'Confirmed',  value: 'confirmed' },
  { label: 'Shipped',    value: 'shipped' },
  { label: 'Delivered',  value: 'delivered' },
  { label: 'Cancelled',  value: 'cancelled' },
];

const OrdersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      try {
        let res: Order[] = [];
        if (user?.id) {
          res = await getBuyerOrders(user.id);
        }
        if (res.length === 0) {
          res = await getAllOrders(50);
        }
        if (res.length > 0) setOrders(res);
      } catch (err) {
        console.error('Failed to load orders from Firestore:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [user]);

  const filtered = orders.filter((o) => {
    const matchesTab = activeTab === 'all' || o.status === activeTab;
    const orderNum = (o.orderNumber || o.id || '').toLowerCase();
    const matchesSearch = !search || orderNum.includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = ['Order Number', 'Date', 'Items Count', 'Total Amount', 'Status', 'Payment Status'];
    const rows = filtered.map((o) => [
      o.orderNumber || o.id,
      formatDate(o.createdAt),
      (o.items || []).length,
      o.grandTotal || 0,
      o.status,
      o.paymentStatus || 'pending',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `orders_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Orders</h1>
          <p className={styles.subtitle}>
            {orders.length} wholesale order{orders.length === 1 ? '' : 's'} placed
          </p>
        </div>
        <Button variant="secondary" size="sm" leftIcon={<Download size={14} />} onClick={handleExportCSV}>
          Export CSV
        </Button>
      </div>

      {/* Status Filter Tabs & Search */}
      <div className={styles.tabsWrap}>
        <div className={styles.tabs} role="tablist" aria-label="Filter orders by status">
          {STATUS_TABS.map((tab) => {
            const count = tab.value === 'all'
              ? orders.length
              : orders.filter((o) => o.status === tab.value).length;
            return (
              <button
                key={tab.value}
                role="tab"
                aria-selected={activeTab === tab.value}
                className={`${styles.tab} ${activeTab === tab.value ? styles['tab--active'] : ''}`}
                onClick={() => setActiveTab(tab.value)}
              >
                {tab.label}
                {count > 0 && <span className={styles.tabCount}>{count}</span>}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} aria-hidden="true" />
          <input
            className={styles.searchInput}
            placeholder="Search order number…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search orders"
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className={styles.tableWrap} role="region" aria-label="Orders list">
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Order No.</th>
              <th scope="col">Date</th>
              <th scope="col">Items</th>
              <th scope="col">Amount</th>
              <th scope="col">Payment</th>
              <th scope="col">Status</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.emptyRow}>
                  <div style={{ padding: '32px 0', textAlign: 'center' }}>
                    <ShoppingBag size={36} style={{ color: '#8B0000', opacity: 0.4, margin: '0 auto 12px' }} />
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>No orders found</p>
                    <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: '4px 0 16px' }}>
                      {search ? 'Try adjusting your search query' : 'Your placed wholesale orders will appear here'}
                    </p>
                    <Link href="/categories/automobile">
                      <Button variant="primary" size="sm">Browse Products</Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((order) => {
                const items = order.items || [];
                const firstItem = items[0];
                const rawName = firstItem?.productName || 'Wholesale Auto Parts';
                const displayName = rawName.length > 28 ? `${rawName.slice(0, 28)}…` : rawName;
                const thumbUrl = firstItem?.productImageUrl || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=100&q=80';
                const moreCount = items.length > 1 ? items.length - 1 : 0;

                return (
                  <tr key={order.id} className={styles.tableRow}>
                    <td>
                      <span className={styles.orderNum}>{order.orderNumber || order.id}</span>
                    </td>
                    <td className={styles.dateCell}>{formatDate(order.createdAt)}</td>
                    <td>
                      <div className={styles.itemsCell}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={thumbUrl} alt="" className={styles.itemThumb} />
                        <span>
                          {displayName}
                          {moreCount > 0 && ` +${moreCount} more`}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.amount}>{formatCurrency(order.grandTotal || 0, 'INR')}</span>
                    </td>
                    <td>
                      <span className={styles.payment}>{order.paymentStatus || 'Pending'}</span>
                    </td>
                    <td>
                      <OrderStatusBadge status={order.status} size="sm" />
                    </td>
                    <td>
                      <Link href={ROUTES.BUYER.ORDER_DETAIL(order.id)}>
                        <Button variant="ghost" size="xs" leftIcon={<Eye size={13} />}>
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (< 768px) */}
      <div className={styles.mobileCardsList}>
        {filtered.length === 0 ? (
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '36px 20px',
            textAlign: 'center',
            border: '1px solid var(--border-subtle)',
          }}>
            <ShoppingBag size={40} style={{ color: '#8B0000', opacity: 0.4, margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px' }}>No orders found</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px' }}>
              Explore our verified catalog to place your first wholesale order.
            </p>
            <Link href="/categories/automobile">
              <Button variant="primary" size="sm">Browse Products</Button>
            </Link>
          </div>
        ) : (
          filtered.map((order) => {
            const items = order.items || [];
            const firstItem = items[0];
            const rawName = firstItem?.productName || 'Wholesale Auto Parts';
            const thumbUrl = firstItem?.productImageUrl || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=100&q=80';
            const moreCount = items.length > 1 ? items.length - 1 : 0;

            return (
              <div key={order.id} className={styles.mobileCard}>
                <div className={styles.mobileCardHeader}>
                  <div>
                    <span className={styles.orderNum}>{order.orderNumber || order.id}</span>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <OrderStatusBadge status={order.status} size="sm" />
                </div>

                <div className={styles.mobileCardBody}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumbUrl} alt="" className={styles.mobileCardThumb} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {rawName}
                    </div>
                    {moreCount > 0 && (
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        +{moreCount} other item{moreCount > 1 ? 's' : ''}
                      </div>
                    )}
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#8B0000', marginTop: 4 }}>
                      {formatCurrency(order.grandTotal || 0, 'INR')}
                    </div>
                  </div>
                </div>

                <div className={styles.mobileCardFooter}>
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>
                    Payment: <strong>{order.paymentStatus || 'Pending'}</strong>
                  </span>
                  <Link href={ROUTES.BUYER.ORDER_DETAIL(order.id)}>
                    <Button variant="secondary" size="xs" rightIcon={<ChevronRight size={13} />}>
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Tracking Banner */}
      {orders.some((o) => o.status === 'shipped') && (
        <div className={styles.trackingBanner}>
          <div className={styles.trackingDot} aria-hidden="true" />
          <p>
            <strong>Shipment in transit</strong> — Real-time logistics tracking and GST invoice available in order details.
          </p>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
