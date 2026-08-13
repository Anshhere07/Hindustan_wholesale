'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Store, Users, ShoppingBag, Package,
  Tag, BarChart3, Settings, ChevronLeft, ChevronRight,
  Menu, X, Shield, LogOut,
} from 'lucide-react';
import { useUIStore } from '@/stores/ui.store';
import styles from './AdminSidebar.module.css';
import HWLogo from '@/components/ui/HWLogo';

// ─────────────────────────────────────────────────────────────────────────────
// Admin Sidebar — responsive, collapsible, role-locked to admin
// ─────────────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: 'Dashboard',   href: '/admin/dashboard',   icon: LayoutDashboard },
  { label: 'Products',    href: '/admin/products',    icon: Package },
  { label: 'Sellers',     href: '/admin/sellers',     icon: Store },
  { label: 'Buyers',      href: '/admin/buyers',      icon: Users },
  { label: 'Orders',      href: '/admin/orders',      icon: ShoppingBag },
  { label: 'Categories',  href: '/admin/categories',  icon: Tag },
  { label: 'Analytics',   href: '/admin/analytics',   icon: BarChart3 },
  { label: 'Settings',    href: '/admin/settings',    icon: Settings },
];

interface AdminSidebarProps {
  onSignOut: () => void;
}

export default function AdminSidebar({ onSignOut }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className={styles.mobileToggle}
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={22} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className={styles.overlay} onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}>
        {/* Header */}
        <div className={styles.header}>
          <Link href="/admin/dashboard" className={styles.logo} onClick={() => setMobileOpen(false)}>
            <HWLogo showText={!collapsed} size="sm" subtitle="Admin Portal" />
          </Link>

          {/* Close on mobile */}
          <button className={styles.mobileClose} onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>

          {/* Collapse on desktop */}
          <button
            className={styles.collapseBtn}
            onClick={() => setCollapsed(c => !c)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Admin badge */}
        {!collapsed && (
          <div className={styles.adminBadge}>
            <Shield size={11} /> Admin Console
          </div>
        )}

        {/* Navigation */}
        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={() => setMobileOpen(false)}
                className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} className={styles.navIcon} />
                {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                {active && !collapsed && <div className={styles.activeIndicator} />}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <button className={styles.signOut} onClick={onSignOut} title={collapsed ? 'Sign Out' : undefined}>
          <LogOut size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </aside>
    </>
  );
}
