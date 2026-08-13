'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  TrendingUp, Package, ShoppingBag, Star, ArrowUpRight,
  Plus, Clock, CheckCircle, AlertCircle, ShieldCheck,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import styles from './SellerDashboard.module.css';
import StatCard from '@/components/shared/StatCard';
import { OrderStatusBadge } from '@/components/ui/Badge';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  MOCK_SELLER_REVENUE, MOCK_ORDERS, MOCK_CATEGORY_BREAKDOWN,
} from '@/lib/api/mock-data';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { ROUTES } from '@/lib/constants/routes';
import { useAuthStore } from '@/stores/auth.store';
import { getSellerOrders } from '@/lib/firebase/collections/orders';
import { getSellerProducts } from '@/lib/firebase/collections/products';
import type { Order } from '@/types/order.types';
import type { ProductListItem } from '@/types/product.types';

// ─────────────────────────────────────────────────────────────────────────────
// Seller Dashboard — revenue analytics, order pipeline, live listings
// ─────────────────────────────────────────────────────────────────────────────

const PIE_COLORS = ['#bd1b13', '#991410', '#0891b2', '#059669', '#64748b'];

const SellerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [sellerProducts, setSellerProducts] = useState<ProductListItem[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        if (user?.id) {
          const [orderRes, prods] = await Promise.all([
            getSellerOrders(user.id, 20),
            getSellerProducts(user.id),
          ]);
          setOrders(orderRes);
          setSellerProducts(prods);
        }
      } catch (err) {
        console.error('Failed to load seller data from Firestore:', err);
      }
    }
    loadData();
  }, [user]);

  const totalRevenue = orders.reduce((acc, o) => acc + o.grandTotal, 0);
  const totalOrders = orders.length;
  const liveProducts = sellerProducts.filter(
    (p) => p.approvalStatus === 'approved' || p.status === 'active'
  );
  const pendingProducts = sellerProducts.filter(
    (p) => !p.approvalStatus || p.approvalStatus === 'pending'
  );

  return (
    <div className={styles.page}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Seller Dashboard</h1>
          <p className={styles.subtitle}>
            Welcome back, <strong>{user?.firstName || 'Seller'}</strong>
            {user?.email ? ` · ${user.email}` : ''}
          </p>
        </div>
        <Link href={ROUTES.SELLER.LISTING_NEW}>
          <Button variant="primary" leftIcon={<Plus size={16} />}>Add Product</Button>
        </Link>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────────── */}
      <div className={styles.kpiGrid}>
        <StatCard
          label="Revenue (YTD)"
          value={formatCurrency(totalRevenue, 'INR', { compact: true })}
          trend={22.4}
          trendLabel="vs last year"
          icon={<TrendingUp size={20} />}
          iconBg="#eef2ff"
          iconColor="#bd1b13"
        />
        <StatCard
          label="Total Orders"
          value={totalOrders}
          trend={15.2}
          trendLabel="vs last year"
          icon={<ShoppingBag size={20} />}
          iconBg="#f0fdf4"
          iconColor="#059669"
        />
        <StatCard
          label="Live Listings"
          value={liveProducts.length}
          subValue={pendingProducts.length > 0 ? `${pendingProducts.length} pending verification` : 'All verified'}
          icon={<Package size={20} />}
          iconBg="#fffbeb"
          iconColor="#d97706"
        />
        <StatCard
          label="Seller Rating"
          value="5.0 ★"
          subValue="Verified Seller"
          trend={0}
          trendLabel="live status"
          icon={<Star size={20} />}
          iconBg="#f5f3ff"
          iconColor="#991410"
        />
      </div>

      {/* ── Live Products Section ────────────────────────────────────────── */}
      {sellerProducts.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border-subtle)', padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 className={styles.sectionTitle}>My Product Listings</h2>
              <p className={styles.sectionSub}>{sellerProducts.length} total — {liveProducts.length} live</p>
            </div>
            <Link href={ROUTES.SELLER.LISTINGS} className={styles.viewAll}>
              View all <ArrowUpRight size={13} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
            {sellerProducts.slice(0, 6).map((prod) => {
              const isLive = prod.approvalStatus === 'approved' || prod.status === 'active';
              const isPending = !prod.approvalStatus || prod.approvalStatus === 'pending';
              return (
                <div key={prod.id} style={{
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 12,
                  overflow: 'hidden',
                  background: '#fafafa',
                }}>
                  <div style={{ position: 'relative', width: '100%', height: 100 }}>
                    <Image
                      src={prod.primaryImage?.url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&q=80'}
                      alt={prod.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      unoptimized
                    />
                    <div style={{ position: 'absolute', top: 6, right: 6 }}>
                      <Badge
                        variant={isLive ? 'success' : isPending ? 'warning' : 'danger'}
                        size="sm"
                      >
                        {isLive ? '✓ LIVE' : isPending ? 'PENDING' : 'REJECTED'}
                      </Badge>
                    </div>
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.name}</div>
                    <div style={{ fontSize: 12, color: '#8B0000', fontWeight: 700 }}>{formatCurrency(prod.basePrice)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>MOQ: {prod.moq} {prod.unit}s · Stock: {prod.stock}</div>
                  </div>
                </div>
              );
            })}
          </div>
          {pendingProducts.length > 0 && (
            <div style={{ marginTop: 14, padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, fontSize: 13, color: '#92400e' }}>
              ⏳ <strong>{pendingProducts.length} product(s)</strong> are pending admin verification before going live on the buyer catalog.
            </div>
          )}
        </div>
      )}

      {/* ── Charts Row ──────────────────────────────────────────────────── */}
      <div className={styles.chartsRow}>
        {/* Revenue Bar Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Monthly Revenue</h2>
              <p className={styles.sectionSub}>Live performance</p>
            </div>
            <span className={styles.totalRevenue}>
              {formatCurrency(totalRevenue, 'INR', { compact: true })} Total
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[{ month: 'Current', revenue: totalRevenue }]} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₹${v}`} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', fontSize: 12 }}
                formatter={(v: any) => [formatCurrency(v, 'INR'), 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#bd1b13" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown Pie */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Category Mix</h2>
              <p className={styles.sectionSub}>Revenue by category</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={MOCK_CATEGORY_BREAKDOWN}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {MOCK_CATEGORY_BREAKDOWN.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{v}</span>} />
              <Tooltip formatter={(v: any) => [`${v}%`, 'Share']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Order Trend Line */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Order Volume</h2>
              <p className={styles.sectionSub}>Orders per month</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={[{ month: 'Current', orders: totalOrders }]} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', fontSize: 12 }} />
              <Line type="monotone" dataKey="orders" stroke="#991410" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Bottom Row ──────────────────────────────────────────────────── */}
      <div className={styles.bottomRow}>
        {/* Recent Orders */}
        <div className={styles.ordersCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.sectionTitle}>Recent Orders to Fulfill</h2>
            <Link href={ROUTES.SELLER.ORDERS} className={styles.viewAll}>
              View all <ArrowUpRight size={13} />
            </Link>
          </div>
          <div className={styles.ordersList}>
            {orders.length === 0 ? (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
                No recent seller orders found in database.
              </div>
            ) : (
              orders.slice(0, 3).map((order) => (
                <div key={order.id} className={styles.orderRow}>
                  <div className={styles.orderInfo}>
                    <p className={styles.orderNum}>{order.orderNumber}</p>
                    <p className={styles.orderBuyer}>{order.buyerName}</p>
                    <p className={styles.orderDate}>{formatDate(order.createdAt)}</p>
                  </div>
                  <div className={styles.orderRight}>
                    <p className={styles.orderAmount}>{formatCurrency(order.grandTotal, 'INR')}</p>
                    <OrderStatusBadge status={order.status} size="sm" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Products Summary */}
        <div className={styles.alertsCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.sectionTitle}>Product Verification Status</h2>
            <Link href={ROUTES.SELLER.LISTINGS} className={styles.viewAll}>
              Manage <ArrowUpRight size={13} />
            </Link>
          </div>
          <div className={styles.alertsList}>
            {sellerProducts.length === 0 ? (
              <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
                No products submitted yet.
              </div>
            ) : (
              sellerProducts.slice(0, 5).map((item) => {
                const isLive = item.approvalStatus === 'approved' || item.status === 'active';
                const isPending = !item.approvalStatus || item.approvalStatus === 'pending';
                const Icon = isLive ? CheckCircle : isPending ? Clock : AlertCircle;
                const color = isLive ? '#16a34a' : isPending ? '#d97706' : '#dc2626';
                const bg = isLive ? '#f0fdf4' : isPending ? '#fffbeb' : '#fff1f2';
                return (
                  <div key={item.id} className={styles.alertRow}>
                    <div className={styles.alertIcon} style={{ background: bg, color }}>
                      <Icon size={16} aria-hidden="true" />
                    </div>
                    <div className={styles.alertInfo}>
                      <p className={styles.alertSku}>{item.sku}</p>
                      <p className={styles.alertName}>{item.name}</p>
                    </div>
                    <div className={styles.alertStock} style={{ color, fontSize: 11, fontWeight: 700 }}>
                      {isLive ? 'LIVE' : isPending ? 'PENDING' : 'REJECTED'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <Link href={ROUTES.SELLER.LISTING_NEW}>
            <Button variant="outline" size="sm" fullWidth leftIcon={<Plus size={14} />}>Add New Product</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
