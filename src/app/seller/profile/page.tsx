import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Seller Profile' };
export default function SellerProfilePage() {
  return (
    <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 8 }}>Store Profile</h1>
      <p style={{ color: 'var(--text-secondary)' }}>Manage your business profile, GST, and bank details.</p>
    </div>
  );
}
