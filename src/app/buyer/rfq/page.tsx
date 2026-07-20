import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Request for Quotation' };
export default function RFQPage() {
  return (
    <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 8 }}>Request for Quotation</h1>
      <p style={{ color: 'var(--text-secondary)' }}>Submit RFQs to multiple sellers and compare quotes.</p>
    </div>
  );
}
