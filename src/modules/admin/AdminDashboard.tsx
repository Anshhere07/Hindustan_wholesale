'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users, Store, ShoppingBag, DollarSign, TrendingUp,
  AlertTriangle, CheckCircle, ArrowUpRight, Shield,
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
import { ROUTES } from '@/lib/constants/routes';
import { getAllOrders } from '@/lib/firebase/collections/orders';
import { getPendingSellers, approveSeller, rejectSeller } from '@/lib/firebase/collections/seller-profiles';
import { getUsersByRole } from '@/lib/firebase/collections/users';
import type { Order } from '@/types/order.types';
import type { SellerProfile } from '@/types/user.types';
import { useAuthStore } from '@/stores/auth.store';

// ─────────────────────────────────────────────────────────────────────────────
// Admin Dashboard — platform-wide overview, seller approvals, revenue
// All numbers come from live Firestore — no mock data
// ─────────────────────────────────────────────────────────────────────────────

interface PlatformStats {
  totalBuyers: number;
  totalSellers: number;
  totalOrders: number;
  totalGmv: number;
  totalCommission: number;
  pendingSellerCount: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingSellers, setPendingSellers] = useState<SellerProfile[]>([]);
  const [stats, setStats] = useState<PlatformStats>({
    totalBuyers: 0,
    totalSellers: 0,
    totalOrders: 0,
    totalGmv: 0,
    totalCommission: 0,
    pendingSellerCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAdminData() {
      setLoading(true);
      try {
        // Run all Firestore queries in parallel for speed
        const [ordRes, sellerRes, buyers, sellers] = await Promise.all([
          getAllOrders(50),          // Get up to 50 orders for stats
          getPendingSellers(),
          getUsersByRole('buyer'),
          getUsersByRole('seller'),
        ]);

        // Count active sellers vs pending sellers
        const activeSellersCount = sellers.filter((s) => s.status === 'active').length;
        const pendingSellersCount = sellers.filter((s) => s.status === 'pending' || s.status === 'pending_approval').length;

        setOrders(ordRes.slice(0, 10)); // Show only 10 in the list
        setPendingSellers(sellerRes.filter((s) => s.approvalStatus === 'pending'));

        const gmv = ordRes.reduce((acc, o) => acc + (o.grandTotal || 0), 0);
        const commission = Math.round(gmv * 0.025);

        setStats({
          totalBuyers: buyers.length,
          totalSellers: activeSellersCount,
          totalOrders: ordRes.length,
          totalGmv: gmv,
          totalCommission: commission,
          pendingSellerCount: pendingSellersCount,
        });
      } catch (err) {
        console.error('Failed to load AdminDashboard data from Firestore:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const handleApprove = async (sellerUid: string) => {
    try {
      await approveSeller(sellerUid, user?.id || 'ADMIN');
      setPendingSellers((p) => p.filter((s) => s.userId !== sellerUid));
      setStats((s) => ({ ...s, pendingSellerCount: Math.max(0, s.pendingSellerCount - 1) }));
    } catch (err) {
      console.error('Failed to approve seller:', err);
    }
  };

  const handleReject = async (sellerUid: string) => {
    try {
      await rejectSeller(sellerUid, 'KYC documentation insufficient');
      setPendingSellers((p) => p.filter((s) => s.userId !== sellerUid));
      setStats((s) => ({ ...s, pendingSellerCount: Math.max(0, s.pendingSellerCount - 1) }));
    } catch (err) {
      console.error('Failed to reject seller:', err);
    }
  };

  // Build chart data from real orders grouped by month
  const chartData = React.useMemo(() => {
    const monthMap: Record<string, { month: string; gmv: number; commission: number; orders: number }> = {};
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    orders.forEach((order) => {
      const date = order.createdAt
        ? new Date(typeof order.createdAt === 'string' ? order.createdAt : (order.createdAt as any).seconds * 1000)
        : new Date();
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!monthMap[key]) {
        monthMap[key] = { month: monthNames[date.getMonth()], gmv: 0, commission: 0, orders: 0 };
      }
      monthMap[key].gmv += order.grandTotal || 0;
      monthMap[key].commission += Math.round((order.grandTotal || 0) * 0.025);
      monthMap[key].orders += 1;
    });

    const result = Object.values(monthMap).sort((a, b) =>
      monthNames.indexOf(a.month) - monthNames.indexOf(b.month)
    );

    // If no data, show empty placeholder
    return result.length > 0 ? result : [{ month: 'No data', gmv: 0, commission: 0, orders: 0 }];
  }, [orders]);

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
          value={stats.totalGmv > 0 ? formatCurrency(stats.totalGmv, 'INR', { compact: true }) : '₹0'}
          trend={0}
          trendLabel="live database"
          icon={<TrendingUp size={20} />}
          iconBg="#eef2ff"
          iconColor="#bd1b13"
        />
        <StatCard
          label="Commission Earned"
          value={stats.totalCommission > 0 ? formatCurrency(stats.totalCommission, 'INR', { compact: true }) : '₹0'}
          trend={0}
          trendLabel="2.5% of GMV"
          icon={<DollarSign size={20} />}
          iconBg="#f0fdf4"
          iconColor="#059669"
        />
        <StatCard
          label="Registered Buyers"
          value={stats.totalBuyers.toLocaleString()}
          trend={0}
          trendLabel="live database"
          icon={<Users size={20} />}
          iconBg="#fffbeb"
          iconColor="#d97706"
        />
        <StatCard
          label="Active Sellers"
          value={stats.totalSellers.toLocaleString()}
          subValue={stats.pendingSellerCount > 0 ? `${stats.pendingSellerCount} pending approval` : 'No pending approvals'}
          trend={0}
          icon={<Store size={20} />}
          iconBg="#f5f3ff"
          iconColor="#991410"
        />
        <StatCard
          label="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          trend={0}
          trendLabel="live database"
          icon={<ShoppingBag size={20} />}
          iconBg="#ecfeff"
          iconColor="#0891b2"
        />
        <StatCard
          label="Pending Approvals"
          value={stats.pendingSellerCount}
          trend={0}
          trendLabel="seller requests"
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
              <p className={styles.sectionSub}>Gross Merchandise Value — live database</p>
            </div>
            <span className={styles.chartValue}>{stats.totalGmv > 0 ? formatCurrency(stats.totalGmv, 'INR', { compact: true }) : '₹0'}</span>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gmvGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#bd1b13" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#bd1b13" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₹${v > 0 ? (v / 100000).toFixed(1) + 'L' : '0'}`} />
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
              {stats.totalCommission > 0 ? formatCurrency(stats.totalCommission, 'INR', { compact: true }) : '₹0'}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `₹${v > 0 ? (v / 1000).toFixed(1) + 'K' : '0'}`} />
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
            <p className={styles.sectionSub}>{pendingSellers.length} sellers awaiting KYC verification</p>
          </div>
          <Link href={ROUTES.ADMIN.SELLERS} className={styles.viewAll}>
            View all <ArrowUpRight size={13} />
          </Link>
        </div>
        <div className={styles.approvalsTable}>
          {loading ? (
            <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
              Loading from database…
            </div>
          ) : pendingSellers.length === 0 ? (
            <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
              No pending seller approval requests in database.
            </div>
          ) : (
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
                {pendingSellers.map((seller) => (
                  <tr key={seller.userId} className={styles.tableRow}>
                    <td className={styles.sellerName}>{seller.businessName}</td>
                    <td><Badge variant="primary" size="sm">{seller.categories?.[0] || 'Auto Parts'}</Badge></td>
                    <td className={styles.city}>{seller.warehouseAddresses?.[0]?.city || 'India'}</td>
                    <td><span className={styles.gst}>{seller.gstNumber || '—'}</span></td>
                    <td>
                      <div className={styles.approvalActions}>
                        <Button variant="primary" size="xs" leftIcon={<CheckCircle size={12} />} onClick={() => handleApprove(seller.userId)}>Approve</Button>
                        <Button variant="danger" size="xs" onClick={() => handleReject(seller.userId)}>Reject</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
          {loading ? (
            <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
              Loading from database…
            </div>
          ) : orders.length === 0 ? (
            <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
              No platform orders found in database.
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className={styles.orderRow}>
                <div className={styles.orderInfo}>
                  <p className={styles.orderNum}>{order.orderNumber}</p>
                  <p className={styles.orderMeta}>{order.buyerName || '—'} · {order.items?.length || 0} item(s)</p>
                </div>
                <div className={styles.orderMid}>
                  <p className={styles.orderDate}>{formatDate(order.createdAt)}</p>
                </div>
                <div className={styles.orderRight}>
                  <p className={styles.orderAmount}>{formatCurrency(order.grandTotal, 'INR')}</p>
                  <span className={`${styles.orderStatus} ${styles[`orderStatus--${order.status}`]}`}>
                    {order.status?.replace('_', ' ') || '—'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
