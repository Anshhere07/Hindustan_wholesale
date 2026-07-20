import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'My Profile' };
export default function BuyerProfilePage() {
  return (
    <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 8 }}>Buyer Profile</h1>
      <p style={{ color: 'var(--text-secondary)' }}>Manage your company profile, KYC, and contact details.</p>
    </div>
  );
}
