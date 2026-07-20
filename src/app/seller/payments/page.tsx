import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Seller Payments' };
export default function SellerPaymentsPage() {
  return (
    <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 8 }}>Payments & Payouts</h1>
      <p style={{ color: 'var(--text-secondary)' }}>Track earnings, settlements, and invoices.</p>
    </div>
  );
}
