'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingCart, Package, TrendingUp, Clock,
  ArrowRight, Star, Truck, CreditCard,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import styles from './BuyerDashboard.module.css';
import StatCard from '@/components/shared/StatCard';
import { OrderStatusBadge } from '@/components/ui/Badge';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import { MOCK_ORDERS, MOCK_PRODUCTS, MOCK_BUYER_SPEND } from '@/lib/api/mock-data';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils/format';
import { ROUTES } from '@/lib/constants/routes';
import Button from '@/components/ui/Button';
import { getBuyerOrders, getAllOrders } from '@/lib/firebase/collections/orders';
import { getFeaturedProducts } from '@/lib/firebase/collections/products';
import type { Order } from '@/types/order.types';
import type { ProductListItem } from '@/types/product.types';

// ─────────────────────────────────────────────────────────────────────────────
// Buyer Dashboard — personalized overview of spend, orders, and recommendations
// ─────────────────────────────────────────────────────────────────────────────

const BuyerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { grandTotal, itemCount } = useCartStore();

  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [featured, setFeatured] = useState<ProductListItem[]>(MOCK_PRODUCTS.filter((p) => p.isFeatured));

  useEffect(() => {
    async function loadData() {
      try {
        const [ordRes, featRes] = await Promise.all([
          user?.id ? getBuyerOrders(user.id, 5) : getAllOrders(5),
          getFeaturedProducts(4)
        ]);
        if (ordRes.length > 0) setOrders(ordRes);
        const combinedFeat = [...featRes];
        MOCK_PRODUCTS.forEach((p) => {
          if (!combinedFeat.some((item) => item.id === p.id)) {
            combinedFeat.unshift(p);
          }
        });
        setFeatured(combinedFeat.length > 0 ? combinedFeat.slice(0, 8) : MOCK_PRODUCTS.slice(0, 8));
      } catch (err) {
        console.error('Failed to load BuyerDashboard data:', err);
      }
    }
    loadData();
  }, [user]);

  const recentOrders = orders.slice(0, 3);

  return (
    <div className={styles.page}>
      {/* ── Welcome ─────────────────────────────────────────────────────── */}
      <div className={styles.welcome}>
        <div>
          <h1 className={styles.greeting}>
            Good morning, {user?.firstName ?? 'Buyer'} 👋
          </h1>
          <p className={styles.subGreeting}>
            Here&apos;s what&apos;s happening with your procurement today.
          </p>
        </div>
        <div className={styles.welcomeActions}>
          <Link href={ROUTES.BUYER.CATALOG}>
            <Button variant="primary" rightIcon={<ArrowRight size={16} />}>
              Browse Catalog
            </Button>
          </Link>
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────────── */}
      <div className={styles.statsGrid}>
        <StatCard
          label="Total Spent (YTD)"
          value={formatCurrency(2175629, 'INR', { compact: true })}
          trend={18.4}
          trendLabel="vs last year"
          icon={<TrendingUp size={20} />}
          iconBg="#fff1f2"
          iconColor="#8b0000"
        />
        <StatCard
          label="Active Orders"
          value="3"
          subValue="2 in transit"
          trend={12.5}
          trendLabel="vs last month"
          icon={<Package size={20} />}
          iconBg="#ecfdf5"
          iconColor="#10b981"
        />
        <StatCard
          label="Cart Value"
          value={itemCount > 0 ? formatCurrency(grandTotal, 'INR') : '₹0'}
          subValue={`${itemCount} item${itemCount !== 1 ? 's' : ''}`}
          icon={<ShoppingCart size={20} />}
          iconBg="#fffbeb"
          iconColor="#f59e0b"
        />
        <StatCard
          label="Avg. Order Value"
          value={formatCurrency(56780, 'INR', { compact: true })}
          trend={-3.2}
          trendLabel="vs last month"
          icon={<CreditCard size={20} />}
          iconBg="#fff1f2"
          iconColor="#c8102e"
        />
      </div>

      {/* ── Spend Chart + Recent Orders ─────────────────────────────────── */}
      <div className={styles.mainGrid}>
        {/* Spend Trend */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Monthly Spend</h2>
              <p className={styles.sectionSub}>Procurement spend trend — 2026</p>
            </div>
            <span className={styles.totalSpend}>{formatCurrency(2175629, 'INR', { compact: true })} YTD</span>
          </div>
          <div className={styles.chartWrap}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={MOCK_BUYER_SPEND} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#8b0000" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8b0000" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-gray-500)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--color-gray-500)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₹${v / 1000}K`} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', fontSize: 12, boxShadow: '0 8px 16px rgba(0,0,0,0.08)' }}
                  formatter={(v: any) => [formatCurrency(v, 'INR'), 'Spend']}
                />
                <Area type="monotone" dataKey="spend" stroke="#8b0000" strokeWidth={2.5} fill="url(#spendGrad)" dot={false} activeDot={{ r: 6, fill: '#8b0000' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders */}
        <div className={styles.ordersCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.sectionTitle}>Recent Orders</h2>
            <Link href={ROUTES.BUYER.ORDERS} className={styles.viewAll}>
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className={styles.ordersList}>
            {recentOrders.map((order) => (
              <Link key={order.id} href={ROUTES.BUYER.ORDER_DETAIL(order.id)} className={styles.orderRow}>
                <div className={styles.orderInfo}>
                  <p className={styles.orderNum}>{order.orderNumber}</p>
                  <p className={styles.orderMeta}>
                    {order.items.length} item{order.items.length > 1 ? 's' : ''} ·{' '}
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className={styles.orderRight}>
                  <p className={styles.orderAmount}>{formatCurrency(order.grandTotal, 'INR')}</p>
                  <OrderStatusBadge status={order.status} size="sm" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick Status ────────────────────────────────────────────────── */}
      <div className={styles.quickStatus}>
        {[
          { icon: Truck, label: 'In Transit', value: '1 shipment', color: '#8b0000', bg: '#fff1f2' },
          { icon: Clock, label: 'Awaiting Confirmation', value: '1 order', color: '#d97706', bg: '#fffbeb' },
          { icon: Star, label: 'Pending Reviews', value: '3 products', color: '#c8102e', bg: '#fff1f2' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className={styles.quickStatusItem}>
              <div className={styles.quickStatusIcon} style={{ background: item.bg, color: item.color }}>
                <Icon size={18} aria-hidden="true" />
              </div>
              <div>
                <p className={styles.quickStatusValue}>{item.value}</p>
                <p className={styles.quickStatusLabel}>{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Featured Products ────────────────────────────────────────────── */}
      <div className={styles.featuredSection}>
        <div className={styles.cardHeader}>
          <h2 className={styles.sectionTitle}>Recommended for You</h2>
          <Link href={ROUTES.BUYER.CATALOG} className={styles.viewAll}>
            Browse all <ArrowRight size={13} />
          </Link>
        </div>
        <div className={styles.featuredGrid}>
          {featured.map((product) => (
            <Link key={product.id} href={ROUTES.BUYER.PRODUCT(product.slug)} className={styles.featuredCard}>
              <div className={styles.featuredImageWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.primaryImage.url} alt={product.primaryImage.altText} className={styles.featuredImage} />
              </div>
              <div className={styles.featuredContent}>
                <p className={styles.featuredBrand}>{product.brand}</p>
                <p className={styles.featuredName}>{product.name}</p>
                <div className={styles.featuredFooter}>
                  <span className={styles.featuredPrice}>{formatCurrency(product.basePrice, 'INR')}</span>
                  <span className={styles.featuredMoq}>MOQ {product.moq}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;

