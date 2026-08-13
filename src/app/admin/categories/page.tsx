export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Categories' };
export default function AdminCategoriesPage() {
  return <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 8 }}>Category Management</h1><p style={{ color: 'var(--text-secondary)' }}>Add, edit, and reorder product categories.</p></div>;
}
