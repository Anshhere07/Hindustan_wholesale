export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Platform Orders' };
export default function AdminOrdersPage() {
  return <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 8 }}>All Orders</h1><p style={{ color: 'var(--text-secondary)' }}>Monitor and manage every order on the platform.</p></div>;
}
