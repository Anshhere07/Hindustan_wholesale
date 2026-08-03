'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, Download, Eye } from 'lucide-react';
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
// Orders Page — filterable order history with status tabs
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
  const { user } = useAuthStore();

  useEffect(() => {
    async function loadOrders() {
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
      }
    }
    loadOrders();
  }, [user]);

  const filtered = orders.filter((o) => {
    const matchesTab = activeTab === 'all' || o.status === activeTab;
    const matchesSearch = !search || o.orderNumber.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Orders</h1>
          <p className={styles.subtitle}>{orders.length} total orders</p>
        </div>
        <Button variant="secondary" size="sm" leftIcon={<Download size={14} />}>
          Export CSV
        </Button>
      </div>

      {/* Tabs */}
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

      {/* Orders Table */}
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
                  No orders found
                </td>
              </tr>
            ) : (
              filtered.map((order) => (
                <tr key={order.id} className={styles.tableRow}>
                  <td>
                    <span className={styles.orderNum}>{order.orderNumber}</span>
                  </td>
                  <td className={styles.dateCell}>{formatDate(order.createdAt)}</td>
                  <td>
                    <div className={styles.itemsCell}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={order.items[0].productImageUrl} alt="" className={styles.itemThumb} />
                      <span>{order.items[0].productName.slice(0, 28)}{order.items[0].productName.length > 28 ? '…' : ''}
                        {order.items.length > 1 && ` +${order.items.length - 1} more`}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.amount}>{formatCurrency(order.grandTotal, 'INR')}</span>
                  </td>
                  <td>
                    <span className={styles.payment}>{order.paymentStatus}</span>
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Tracking Banner */}
      {MOCK_ORDERS.some((o) => o.status === 'shipped') && (
        <div className={styles.trackingBanner}>
          <div className={styles.trackingDot} aria-hidden="true" />
          <p>
            <strong>1 shipment in transit</strong> — HW-2026-00002 · BD2026070512345 (Blue Dart) ·
            Est. delivery 8 Jul 2026
          </p>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
