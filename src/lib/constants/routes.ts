// ─────────────────────────────────────────────────────────────────────────────
// Application Routes — single source of truth for all navigation paths
// ─────────────────────────────────────────────────────────────────────────────

export const ROUTES = {
  // ── Public ────────────────────────────────────────────────────────────────
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',

  // ── Auth ──────────────────────────────────────────────────────────────────
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    VERIFY_OTP: '/auth/verify-otp',
    VERIFY_BUSINESS: '/auth/verify-business',
  },

  // ── Buyer ─────────────────────────────────────────────────────────────────
  BUYER: {
    DASHBOARD: '/buyer/dashboard',
    CATALOG: '/buyer/catalog',
    PRODUCT: (slug: string) => `/buyer/catalog/${slug}`,
    CART: '/buyer/cart',
    CHECKOUT: '/buyer/checkout',
    ORDERS: '/buyer/orders',
    ORDER_DETAIL: (id: string) => `/buyer/orders/${id}`,
    RFQ: '/buyer/rfq',
    WISHLIST: '/buyer/wishlist',
    PROFILE: '/buyer/profile',
    ADDRESSES: '/buyer/profile/addresses',
  },

  // ── Seller ────────────────────────────────────────────────────────────────
  SELLER: {
    DASHBOARD: '/seller/dashboard',
    LISTINGS: '/seller/listings',
    LISTING_NEW: '/seller/listings/new',
    LISTING_EDIT: (id: string) => `/seller/listings/${id}/edit`,
    ORDERS: '/seller/orders',
    ORDER_DETAIL: (id: string) => `/seller/orders/${id}`,
    ANALYTICS: '/seller/analytics',
    PROFILE: '/seller/profile',
    PAYMENTS: '/seller/payments',
  },

  // ── Admin ─────────────────────────────────────────────────────────────────
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    SELLERS: '/admin/sellers',
    BUYERS: '/admin/buyers',
    CATEGORIES: '/admin/categories',
    ORDERS: '/admin/orders',
    ANALYTICS: '/admin/analytics',
    SETTINGS: '/admin/settings',
  },
} as const;
