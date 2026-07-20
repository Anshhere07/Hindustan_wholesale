import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Seller Analytics' };
export default function SellerAnalyticsPage() {
  return (
    <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 8 }}>Analytics</h1>
      <p style={{ color: 'var(--text-secondary)' }}>Deep-dive revenue, conversion, and product analytics.</p>
    </div>
  );
}
