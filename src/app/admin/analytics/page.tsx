export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Platform Analytics' };
export default function AdminAnalyticsPage() {
  return <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 8 }}>Platform Analytics</h1><p style={{ color: 'var(--text-secondary)' }}>Deep-dive into platform-wide metrics and trends.</p></div>;
}
