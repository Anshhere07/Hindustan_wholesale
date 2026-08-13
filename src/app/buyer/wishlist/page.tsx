export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Wishlist' };
export default function WishlistPage() {
  return (
    <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 8 }}>Wishlist</h1>
      <p style={{ color: 'var(--text-secondary)' }}>Coming soon — save products for quick access.</p>
    </div>
  );
}
