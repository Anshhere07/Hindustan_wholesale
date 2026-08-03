'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, Store, ShoppingBag, DollarSign, TrendingUp,
  AlertTriangle, CheckCircle, Clock, ArrowUpRight, Shield,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import styles from './AdminDashboard.module.css';
import StatCard from '@/components/shared/StatCard';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { MOCK_SELLER_REVENUE, MOCK_ORDERS } from '@/lib/api/mock-data';
import { ROUTES } from '@/lib/constants/routes';
import { getAllOrders } from '@/lib/firebase/collections/orders';
import { getPendingSellers, approveSeller, rejectSeller } from '@/lib/firebase/collections/seller-profiles';
import type { Order } from '@/types/order.types';
import type { SellerProfile } from '@/types/user.types';
import { useAuthStore } from '@/stores/auth.store';

// ─────────────────────────────────────────────────────────────────────────────
// Admin Dashboard — platform-wide overview, seller approvals, revenue
// ─────────────────────────────────────────────────────────────────────────────

const PENDING_SELLERS_MOCK = [
  { id: 's-1', name: 'Kapoor Spares Pvt. Ltd.', category: 'Engine Parts', city: 'Ludhiana', applied: '2026-07-12', gst: '03AABCK1234A1Z5' },
  { id: 's-2', name: 'South Auto Components', category: 'Electrical', city: 'Chennai', applied: '2026-07-11', gst: '33AABCS5678B1Z1' },
  { id: 's-3', name: 'RK Tyre Distributors', category: 'Tyres & Wheels', city: 'Jaipur', applied: '2026-07-10', gst: '08AABRK9012C1Z8' },
];

const PLATFORM_REVENUE = MOCK_SELLER_REVENUE.map((m) => ({
  month: m.month,
  gmv: m.revenue,
  commission: Math.round(m.revenue * 0.025),
  orders: m.orders,
}));

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [pendingSellers, setPendingSellers] = useState<SellerProfile[]>([]);

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [ordRes, sellerRes] = await Promise.all([
          getAllOrders(10),
          getPendingSellers()
        ]);
        if (ordRes.length > 0) setOrders(ordRes);
        setPendingSellers(sellerRes);
      } catch (err) {
        console.error('Failed to load AdminDashboard data from Firestore:', err);
      }
    }
    loadAdminData();
  }, []);

  const handleApprove = async (sellerUid: string) => {
    try {
      await approveSeller(sellerUid, user?.id || 'ADMIN');
      setPendingSellers((p) => p.filter((s) => s.userId !== sellerUid));
    } catch (err) {
      console.error('Failed to approve seller:', err);
    }
  };

  const handleReject = async (sellerUid: string) => {
    try {
      await rejectSeller(sellerUid, 'KYC documentation insufficient');
      setPendingSellers((p) => p.filter((s) => s.userId !== sellerUid));
    } catch (err) {
      console.error('Failed to reject seller:', err);
    }
  };
  const totalGmv = PLATFORM_REVENUE.reduce((s, m) => s + m.gmv, 0);
  const totalCommission = PLATFORM_REVENUE.reduce((s, m) => s + m.commission, 0);

  return (
    <div className={styles.page}>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div>
          <div className={styles.adminBadge}>
            <Shield size={13} aria-hidden="true" /> Admin Console
          </div>
          <h1 className={styles.title}>Platform Overview</h1>
          <p className={styles.subtitle}>Real-time metrics across all buyers, sellers, and orders.</p>
        </div>
      </div>

      {/* ── KPI Grid ────────────────────────────────────────────────────── */}
      <div className={styles.kpiGrid}>
        <StatCard
          label="Platform GMV (YTD)"
          value={formatCurrency(totalGmv, 'INR', { compact: true })}
          trend={28.4}
          trendLabel="vs last year"
          icon={<TrendingUp size={20} />}
          iconBg="#eef2ff"
          iconColor="#bd1b13"
        />
        <StatCard
          label="Commission Earned"
          value={formatCurrency(totalCommission, 'INR', { compact: true })}
          trend={31.2}
          trendLabel="vs last year"
          icon={<DollarSign size={20} />}
          iconBg="#f0fdf4"
          iconColor="#059669"
        />
        <StatCard
          label="Registered Buyers"
          value="10,482"
          trend={14.6}
          trendLabel="this month"
          icon={<Users size={20} />}
          iconBg="#fffbeb"
          iconColor="#d97706"
        />
        <StatCard
          label="Active Sellers"
          value="4,918"
          subValue="83 pending approval"
          trend={9.3}
          icon={<Store size={20} />}
          iconBg="#f5f3ff"
          iconColor="#991410"
        />
        <StatCard
          label="Total Orders (YTD)"
          value="1,24,800"
          trend={22.1}
          icon={<ShoppingBag size={20} />}
          iconBg="#ecfeff"
          iconColor="#0891b2"
        />
        <StatCard
          label="Dispute Rate"
          value="0.8%"
          trend={-12.5}
          trendLabel="improvement"
          icon={<AlertTriangle size={20} />}
          iconBg="#fff1f2"
          iconColor="#dc2626"
        />
      </div>

      {/* ── Charts ──────────────────────────────────────────────────────── */}
      <div className={styles.chartsRow}>
        {/* GMV Area Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Platform GMV</h2>
              <p className={styles.sectionSub}>Gross Merchandise Value — 2026</p>
            </div>
            <span className={styles.chartValue}>{formatCurrency(totalGmv, 'INR', { compact: true })}</span>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={PLATFORM_REVENUE} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#bd1b13" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#bd1b13" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₹${v / 100000}L`} />
              <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', fontSize: 12 }} formatter={(v: any) => [formatCurrency(v, 'INR'), 'GMV']} />
              <Area type="monotone" dataKey="gmv" stroke="#bd1b13" strokeWidth={2.5} fill="url(#gmvGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Commission Bar Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Commission Revenue</h2>
              <p className={styles.sectionSub}>Platform earnings (2.5% of GMV)</p>
            </div>
            <span className={styles.chartValue} style={{ color: 'var(--color-success-600)' }}>
              {formatCurrency(totalCommission, 'INR', { compact: true })}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={PLATFORM_REVENUE} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₹${v / 1000}K`} />
              <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '12px', fontSize: 12 }} formatter={(v: any) => [formatCurrency(v, 'INR'), 'Commission']} />
              <Bar dataKey="commission" fill="#059669" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Seller Approvals ─────────────────────────────────────────────── */}
      <div className={styles.approvalCard}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Pending Seller Approvals</h2>
            <p className={styles.sectionSub}>{pendingSellers.length > 0 ? pendingSellers.length : PENDING_SELLERS_MOCK.length} sellers awaiting KYC verification</p>
          </div>
          <Link href={ROUTES.ADMIN.SELLERS} className={styles.viewAll}>
            View all <ArrowUpRight size={13} />
          </Link>
        </div>
        <div className={styles.approvalsTable}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Business Name</th>
                <th scope="col">Category</th>
                <th scope="col">Location</th>
                <th scope="col">GST Number</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingSellers.length > 0 ? (
                pendingSellers.map((seller) => (
                  <tr key={seller.userId} className={styles.tableRow}>
                    <td className={styles.sellerName}>{seller.businessName}</td>
                    <td><Badge variant="primary" size="sm">{seller.categories?.[0] || 'Auto Parts'}</Badge></td>
                    <td className={styles.city}>{seller.warehouseAddresses?.[0]?.city || 'India'}</td>
                    <td><span className={styles.gst}>{seller.gstNumber}</span></td>
                    <td>
                      <div className={styles.approvalActions}>
                        <Button variant="primary" size="xs" leftIcon={<CheckCircle size={12} />} onClick={() => handleApprove(seller.userId)}>Approve</Button>
                        <Button variant="danger" size="xs" onClick={() => handleReject(seller.userId)}>Reject</Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                PENDING_SELLERS_MOCK.map((seller) => (
                  <tr key={seller.id} className={styles.tableRow}>
                    <td className={styles.sellerName}>{seller.name}</td>
                    <td><Badge variant="primary" size="sm">{seller.category}</Badge></td>
                    <td className={styles.city}>{seller.city}</td>
                    <td><span className={styles.gst}>{seller.gst}</span></td>
                    <td>
                      <div className={styles.approvalActions}>
                        <Button variant="primary" size="xs" leftIcon={<CheckCircle size={12} />}>Approve</Button>
                        <Button variant="danger" size="xs">Reject</Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Recent Orders ────────────────────────────────────────────────── */}
      <div className={styles.ordersCard}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Recent Platform Orders</h2>
            <p className={styles.sectionSub}>Across all buyers and sellers</p>
          </div>
          <Link href={ROUTES.ADMIN.ORDERS} className={styles.viewAll}>
            View all <ArrowUpRight size={13} />
          </Link>
        </div>
        <div className={styles.ordersList}>
          {orders.map((order) => (
            <div key={order.id} className={styles.orderRow}>
              <div className={styles.orderInfo}>
                <p className={styles.orderNum}>{order.orderNumber}</p>
                <p className={styles.orderMeta}>{order.buyerName} · {order.items.length} item(s)</p>
              </div>
              <div className={styles.orderMid}>
                <p className={styles.orderDate}>{formatDate(order.createdAt)}</p>
              </div>
              <div className={styles.orderRight}>
                <p className={styles.orderAmount}>{formatCurrency(order.grandTotal, 'INR')}</p>
                <span className={`${styles.orderStatus} ${styles[`orderStatus--${order.status}`]}`}>
                  {order.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

