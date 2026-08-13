'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell, Search, Menu, X, ShoppingCart,
  LogOut, User, ChevronDown,
} from 'lucide-react';
import styles from './TopNav.module.css';
import { cn } from '@/lib/utils/cn';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { useCartStore } from '@/stores/cart.store';
import Avatar from '@/components/ui/Avatar';
import { ROUTES } from '@/lib/constants/routes';

// ─────────────────────────────────────────────────────────────────────────────
// Top Navigation Bar — search, notifications, user menu, theme toggle
// ─────────────────────────────────────────────────────────────────────────────

import { resolveSearchRoute } from '@/lib/utils/searchRouter';

const TopNav: React.FC = () => {
  const { theme, toggleTheme, sidebarCollapsed, toggleMobileMenu, mobileMenuOpen, addNotification } = useUIStore();
  const { user, logout } = useAuthStore();
  const itemCount = useCartStore((s) => s.itemCount);
  const router = useRouter();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const targetUrl = resolveSearchRoute(searchQuery);
      router.push(targetUrl);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    addNotification({ type: 'info', title: 'Signed out successfully' });
    // Replace current history entry and push login so back button has nowhere to go
    router.replace(ROUTES.AUTH.LOGIN);
  };

  const cartRoute = user?.role === 'buyer' ? ROUTES.BUYER.CART : '#';

  return (
    <header
      className={cn(
        styles.topnav,
        sidebarCollapsed ? styles['topnav--collapsed'] : styles['topnav--expanded']
      )}
      role="banner"
    >
      {/* Left: Mobile menu toggle + Page title */}
      <div className={styles.left}>
        <button
          className={styles.mobileToggle}
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Search */}
        <form onSubmit={handleSearch} className={styles.searchForm} role="search">
          <Search className={styles.searchIcon} size={16} aria-hidden="true" />
          <input
            className={styles.searchInput}
            placeholder="Search parts, brands, vehicles…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search catalog"
          />
          <kbd className={styles.shortcut}>⌘K</kbd>
        </form>
      </div>

      {/* Right: Actions */}
      <div className={styles.right}>


        {/* Notifications */}
        <button className={styles.iconBtn} aria-label="Notifications (3 unread)">
          <Bell size={18} />
          <span className={styles.notifBadge} aria-hidden="true">3</span>
        </button>

        {/* Cart (buyer only) */}
        {user?.role === 'buyer' && (
          <Link href={cartRoute} className={styles.iconBtn} aria-label={`Cart: ${itemCount} items`}>
            <ShoppingCart size={18} />
            {itemCount > 0 && (
              <span className={styles.cartBadge} aria-hidden="true">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>
        )}

        {/* Divider */}
        <div className={styles.divider} aria-hidden="true" />

        {/* User menu */}
        <div className={styles.userMenuWrap}>
          <button
            className={styles.userBtn}
            onClick={() => setUserMenuOpen((p) => !p)}
            aria-label="User menu"
            aria-expanded={userMenuOpen}
            aria-haspopup="menu"
          >
            <Avatar
              src={user?.avatarUrl}
              name={user ? `${user.firstName} ${user.lastName}` : 'User'}
              size="sm"
            />
            <div className={styles.userInfo}>
              <span className={styles.userName}>
                {user ? (user.firstName ? `${user.firstName} ${user.lastName}`.trim() : user.email?.split('@')[0] || 'User') : 'Guest'}
              </span>
              <span className={styles.userRole}>
                {user ? (user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Member') : 'Sign In'}
              </span>
            </div>
            <ChevronDown
              size={14}
              className={cn(styles.chevron, userMenuOpen && styles['chevron--open'])}
              aria-hidden="true"
            />
          </button>

          {userMenuOpen && (
            <>
              <div className={styles.menuOverlay} onClick={() => setUserMenuOpen(false)} />
              <div className={styles.userMenu} role="menu" aria-label="User options">
                <div className={styles.menuHeader}>
                  <Avatar
                    src={user?.avatarUrl}
                    name={user ? `${user.firstName} ${user.lastName}` : 'User'}
                    size="md"
                  />
                  <div>
                    <p className={styles.menuName}>{user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email?.split('@')[0] || 'User'}</p>
                    <p className={styles.menuEmail}>{user?.email}</p>
                  </div>
                </div>
                <div className={styles.menuDivider} />
                <Link
                  href={user?.role === 'seller' ? ROUTES.SELLER.PROFILE : ROUTES.BUYER.PROFILE}
                  className={styles.menuItem}
                  role="menuitem"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <User size={15} /> My Profile
                </Link>
                <div className={styles.menuDivider} />
                <button className={cn(styles.menuItem, styles['menuItem--danger'])} role="menuitem" onClick={handleLogout}>
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;
