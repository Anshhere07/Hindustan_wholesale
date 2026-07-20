'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingUp, Package, ShoppingBag, Star, ArrowUpRight,
  Plus, Clock, CheckCircle, AlertCircle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import styles from './SellerDashboard.module.css';
import StatCard from '@/components/shared/StatCard';
import { OrderStatusBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  MOCK_SELLER_REVENUE, MOCK_ORDERS, MOCK_CATEGORY_BREAKDOWN,
} from '@/lib/api/mock-data';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { ROUTES } from '@/lib/constants/routes';
import { useAuthStore } from '@/stores/auth.store';

// ─────────────────────────────────────────────────────────────────────────────
// Seller Dashboard — revenue analytics, order pipeline, inventory alerts
// ─────────────────────────────────────────────────────────────────────────────

const PIE_COLORS = ['#bd1b13', '#991410', '#0891b2', '#059669', '#64748b'];

const INVENTORY_ALERTS = [
  { sku: 'EP-001', name: 'Bosch Fuel Injector Set', stock: 12, status: 'low' as const },
  { sku: 'AC-506', name: 'Denso AC Compressor', stock: 3, status: 'critical' as const },
  { sku: 'TW-304', name: 'MRF Nylogrip Tyre', stock: 28, status: 'ok' as const },
];

const SellerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const totalRevenue = MOCK_SELLER_REVENUE.reduce((s, m) => s + m.revenue, 0);
  const totalOrders  = MOCK_SELLER_REVENUE.reduce((s, m) => s + m.orders, 0);

  return (
    <div className={styles.page}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Seller Dashboard</h1>
          <p className={styles.subtitle}>
            Welcome back, <strong>{user?.firstName}</strong> · AutoParts Direct
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
          label="Active Listings"
          value="247"
          subValue="8 pending approval"
          icon={<Package size={20} />}
          iconBg="#fffbeb"
          iconColor="#d97706"
        />
        <StatCard
          label="Seller Rating"
          value="4.7 ★"
          subValue="Based on 462 reviews"
          trend={2.1}
          trendLabel="this quarter"
          icon={<Star size={20} />}
          iconBg="#f5f3ff"
          iconColor="#991410"
        />
      </div>

      {/* ── Charts Row ──────────────────────────────────────────────────── */}
      <div className={styles.chartsRow}>
        {/* Revenue Bar Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Monthly Revenue</h2>
              <p className={styles.sectionSub}>2026 performance</p>
            </div>
            <span className={styles.totalRevenue}>
              {formatCurrency(totalRevenue, 'INR', { compact: true })} YTD
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={MOCK_SELLER_REVENUE} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₹${v / 100000}L`} />
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
            <LineChart data={MOCK_SELLER_REVENUE} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
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
            {MOCK_ORDERS.slice(0, 3).map((order) => (
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
            ))}
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className={styles.alertsCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.sectionTitle}>Inventory Alerts</h2>
            <Link href={ROUTES.SELLER.LISTINGS} className={styles.viewAll}>
              Manage <ArrowUpRight size={13} />
            </Link>
          </div>
          <div className={styles.alertsList}>
            {INVENTORY_ALERTS.map((item) => {
              const Icon = item.status === 'critical' ? AlertCircle : item.status === 'low' ? Clock : CheckCircle;
              const color = item.status === 'critical' ? '#dc2626' : item.status === 'low' ? '#d97706' : '#16a34a';
              const bg = item.status === 'critical' ? '#fff1f2' : item.status === 'low' ? '#fffbeb' : '#f0fdf4';
              return (
                <div key={item.sku} className={styles.alertRow}>
                  <div className={styles.alertIcon} style={{ background: bg, color }}>
                    <Icon size={16} aria-hidden="true" />
                  </div>
                  <div className={styles.alertInfo}>
                    <p className={styles.alertSku}>{item.sku}</p>
                    <p className={styles.alertName}>{item.name}</p>
                  </div>
                  <div className={styles.alertStock} style={{ color }}>
                    {item.stock} units
                  </div>
                </div>
              );
            })}
          </div>
          <Button variant="outline" size="sm" fullWidth>Restock All</Button>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;

