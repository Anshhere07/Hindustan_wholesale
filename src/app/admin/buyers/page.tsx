import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Manage Buyers' };
export default function AdminBuyersPage() {
  return <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 8 }}>Buyer Management</h1><p style={{ color: 'var(--text-secondary)' }}>View buyer accounts, KYC status, and credit limits.</p></div>;
}
