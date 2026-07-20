'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingCart, ClipboardList,
  BarChart3, Settings, Users, Tag, Store, ChevronLeft,
  ChevronRight, MessageSquare, Heart, MapPin, CreditCard,
} from 'lucide-react';
import styles from './Sidebar.module.css';
import { cn } from '@/lib/utils/cn';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { ROUTES } from '@/lib/constants/routes';
import type { UserRole } from '@/types/user.types';

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar Navigation — role-aware, collapsible
// ─────────────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string | number;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

const NAV_CONFIG: Record<UserRole, NavGroup[]> = {
  buyer: [
    {
      items: [
        { label: 'Dashboard',   href: ROUTES.BUYER.DASHBOARD, icon: LayoutDashboard },
        { label: 'Browse Catalog', href: ROUTES.BUYER.CATALOG, icon: Package },
        { label: 'My Cart',     href: ROUTES.BUYER.CART,     icon: ShoppingCart },
        { label: 'My Orders',   href: ROUTES.BUYER.ORDERS,   icon: ClipboardList },
        { label: 'Wishlist',    href: ROUTES.BUYER.WISHLIST,  icon: Heart },
        { label: 'RFQ',         href: ROUTES.BUYER.RFQ,       icon: MessageSquare },
      ],
    },
    {
      label: 'Account',
      items: [
        { label: 'Profile',     href: ROUTES.BUYER.PROFILE,   icon: Users },
        { label: 'Addresses',   href: ROUTES.BUYER.ADDRESSES,  icon: MapPin },
        { label: 'Payments',    href: '#',                     icon: CreditCard },
      ],
    },
  ],
  seller: [
    {
      items: [
        { label: 'Dashboard',  href: ROUTES.SELLER.DASHBOARD, icon: LayoutDashboard },
        { label: 'Listings',   href: ROUTES.SELLER.LISTINGS,  icon: Package },
        { label: 'Orders',     href: ROUTES.SELLER.ORDERS,    icon: ClipboardList },
        { label: 'Analytics',  href: ROUTES.SELLER.ANALYTICS, icon: BarChart3 },
        { label: 'Payments',   href: ROUTES.SELLER.PAYMENTS,  icon: CreditCard },
      ],
    },
    {
      label: 'Account',
      items: [
        { label: 'Store Profile', href: ROUTES.SELLER.PROFILE, icon: Store },
        { label: 'Settings',      href: '#',                    icon: Settings },
      ],
    },
  ],
  admin: [
    {
      items: [
        { label: 'Dashboard',   href: ROUTES.ADMIN.DASHBOARD,  icon: LayoutDashboard },
        { label: 'Sellers',     href: ROUTES.ADMIN.SELLERS,    icon: Store },
        { label: 'Buyers',      href: ROUTES.ADMIN.BUYERS,     icon: Users },
        { label: 'Orders',      href: ROUTES.ADMIN.ORDERS,     icon: ClipboardList },
        { label: 'Categories',  href: ROUTES.ADMIN.CATEGORIES, icon: Tag },
        { label: 'Analytics',   href: ROUTES.ADMIN.ANALYTICS,  icon: BarChart3 },
        { label: 'Settings',    href: ROUTES.ADMIN.SETTINGS,   icon: Settings },
      ],
    },
  ],
};

const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar, mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const { user } = useAuthStore();
  const pathname = usePathname();

  const role: UserRole = user?.role ?? 'buyer';
  const navGroups = NAV_CONFIG[role];

  const isActive = (href: string) => {
    if (href === '#') return false;
    if (href.endsWith('/dashboard')) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className={styles.overlay}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          styles.sidebar,
          sidebarCollapsed && styles['sidebar--collapsed'],
          mobileMenuOpen && styles['sidebar--open']
        )}
        aria-label="Sidebar navigation"
      >
        {/* Logo */}
        <div className={styles.logoWrap}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                <circle cx="16" cy="16" r="14" fill="white" fillOpacity="0.2"/>
                <circle cx="16" cy="16" r="8" fill="white" fillOpacity="0.4"/>
                <circle cx="16" cy="16" r="3" fill="white"/>
                <path d="M16 2 L16 6 M16 26 L16 30 M2 16 L6 16 M26 16 L30 16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            {!sidebarCollapsed && (
              <div className={styles.logoText}>
                <span className={styles.logoName}>Hindustan</span>
                <span className={styles.logoTagline}>Wheels B2B</span>
              </div>
            )}
          </Link>

          {/* Collapse toggle — desktop only */}
          <button
            className={styles.collapseBtn}
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className={styles.nav} aria-label="Main navigation">
          {navGroups.map((group, gi) => (
            <div key={gi} className={styles.group}>
              {group.label && !sidebarCollapsed && (
                <p className={styles.groupLabel}>{group.label}</p>
              )}
              <ul role="list" className={styles.list}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(styles.navItem, active && styles['navItem--active'])}
                        aria-current={active ? 'page' : undefined}
                        title={sidebarCollapsed ? item.label : undefined}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className={styles.navIcon}>
                          <Icon size={18} />
                        </span>
                        {!sidebarCollapsed && (
                          <>
                            <span className={styles.navLabel}>{item.label}</span>
                            {item.badge && (
                              <span className={styles.navBadge}>{item.badge}</span>
                            )}
                          </>
                        )}
                        {sidebarCollapsed && item.badge && (
                          <span className={styles.collapsedBadge}>{item.badge}</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        {!sidebarCollapsed && (
          <div className={styles.sidebarFooter}>
            <div className={styles.versionBadge}>
              <span>B2B Platform</span>
              <span className={styles.version}>v2.0 Beta</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
