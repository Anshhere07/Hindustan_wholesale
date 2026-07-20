import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Platform Settings' };
export default function AdminSettingsPage() {
  return <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}><h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 8 }}>Settings</h1><p style={{ color: 'var(--text-secondary)' }}>Configure platform-wide settings, fees, and notifications.</p></div>;
}
