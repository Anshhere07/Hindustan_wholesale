/**
 * Smart Search Intent Router — maps user search queries to relevant pages or catalog search
 */

import { ROUTES } from '@/lib/constants/routes';

export function resolveSearchRoute(query: string): string {
  const q = query.trim().toLowerCase();
  if (!q) return ROUTES.HOME;

  // 1. Contact & Support Intent
  if (
    q.includes('contact') ||
    q.includes('touch') ||
    q.includes('help') ||
    q.includes('support') ||
    q.includes('phone') ||
    q.includes('email') ||
    q.includes('address') ||
    q.includes('office') ||
    q.includes('helpline') ||
    q.includes('customer care')
  ) {
    return ROUTES.CONTACT;
  }

  // 2. Press & News Intent
  if (
    q.includes('press') ||
    q.includes('news') ||
    q.includes('release') ||
    q.includes('launch') ||
    q.includes('media') ||
    q.includes('announcement') ||
    q.includes('shaban')
  ) {
    return ROUTES.PRESS;
  }

  // 3. About & Company Intent
  if (
    q.includes('about') ||
    q.includes('company') ||
    q.includes('story') ||
    q.includes('mission') ||
    q.includes('who we are')
  ) {
    return ROUTES.ABOUT;
  }

  // 4. Brands Intent
  if (
    q.includes('brand') ||
    q.includes('shakti') ||
    q.includes('raja') ||
    q.includes('voltek') ||
    q.includes('steelo') ||
    q.includes('herbal') ||
    q.includes('utsav') ||
    q.includes('roopvati') ||
    q.includes('gharana') ||
    q.includes('yamaha') ||
    q.includes('bosch') ||
    q.includes('brembo') ||
    q.includes('mrf') ||
    q.includes('mahindra')
  ) {
    if (q.includes('shakti')) return '/brands/shakti-mills';
    if (q.includes('raja')) return '/brands/raja-textiles';
    if (q.includes('voltek')) return '/brands/voltek-electricals';
    if (q.includes('steelo')) return '/brands/steelo-kitchen';
    if (q.includes('herbal')) return '/brands/herbal-veda';
    if (q.includes('utsav')) return '/brands/utsav-gifting';
    if (q.includes('roopvati')) return '/brands/roopvati-cosmetics';
    if (q.includes('gharana')) return '/brands/gharana-decor';
    if (q.includes('yamaha')) return '/brands/yamaha';
    if (q.includes('bosch')) return '/brands/bosch';
    if (q.includes('brembo')) return '/brands/brembo';
    if (q.includes('mrf')) return '/brands/mrf';
    if (q.includes('mahindra')) return '/brands/mahindra';

    return '/brands';
  }

  // 5. Categories Intent
  if (
    q.includes('category') ||
    q.includes('categories') ||
    q.includes('automobile') ||
    q.includes('clothing') ||
    q.includes('wheeler')
  ) {
    if (q.includes('automobile')) return '/categories/automobile';
    if (q.includes('clothing')) return '/categories/clothing';
    return '/categories';
  }

  // 6. Registration & Seller Onboarding Intent
  if (
    q.includes('register') ||
    q.includes('signup') ||
    q.includes('sign up') ||
    q.includes('seller') ||
    q.includes('supplier') ||
    q.includes('onboard') ||
    q.includes('vendor')
  ) {
    return ROUTES.AUTH.REGISTER;
  }

  // 7. Login / Account Intent
  if (
    q.includes('login') ||
    q.includes('signin') ||
    q.includes('sign in') ||
    q.includes('account') ||
    q.includes('profile')
  ) {
    return ROUTES.AUTH.LOGIN;
  }

  // 8. Cart Intent
  if (q.includes('cart') || q.includes('basket') || q.includes('checkout')) {
    return ROUTES.BUYER.CART;
  }

  // 9. Orders Intent
  if (q.includes('order') || q.includes('tracking')) {
    return ROUTES.BUYER.ORDERS;
  }

  // 10. RFQ / Bulk Quote Intent
  if (q.includes('rfq') || q.includes('quote') || q.includes('quotation')) {
    return ROUTES.BUYER.RFQ;
  }

  // Default: Product / SKU Catalog search query
  return `${ROUTES.BUYER.CATALOG}?query=${encodeURIComponent(query.trim())}`;
}
