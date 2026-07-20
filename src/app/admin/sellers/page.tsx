import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Manage Sellers' };
export default function AdminSellersPage() {
  return <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 8 }}>Seller Management</h1><p style={{ color: 'var(--text-secondary)' }}>Approve, suspend, and manage all seller accounts.</p></div>;
}
