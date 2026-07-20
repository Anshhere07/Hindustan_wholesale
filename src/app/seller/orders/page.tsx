import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Seller Orders' };
export default function SellerOrdersPage() {
  return (
    <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 8 }}>Order Management</h1>
      <p style={{ color: 'var(--text-secondary)' }}>Fulfill, ship, and track your customer orders.</p>
    </div>
  );
}
