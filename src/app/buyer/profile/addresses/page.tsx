import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Addresses' };
export default function AddressesPage() {
  return (
    <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 8 }}>Shipping Addresses</h1>
      <p style={{ color: 'var(--text-secondary)' }}>Manage your delivery and billing addresses.</p>
    </div>
  );
}
