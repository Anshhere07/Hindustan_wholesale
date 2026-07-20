import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Add New Product' };
export default function NewListingPage() {
  return (
    <div style={{ padding: 'var(--space-8)', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 8 }}>Add New Product</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Fill in product details, pricing tiers, and inventory.</p>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 32, display: 'flex', flexDirection: 'column', gap: 24, boxShadow: 'var(--shadow-sm)' }}>
        {['Product Name', 'SKU', 'Category', 'Brand', 'Base Price (₹)', 'MOQ', 'Stock Quantity', 'GST Rate (%)'].map((label) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</label>
            <input placeholder={`Enter ${label.toLowerCase()}…`} style={{ height: 44, border: '1.5px solid var(--border-default)', borderRadius: 10, padding: '0 16px', fontFamily: 'inherit', fontSize: 14, color: 'var(--text-primary)', outline: 'none', background: 'var(--bg-surface)' }} />
          </div>
        ))}
        <button style={{ height: 52, background: 'var(--color-brand-600)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'inherit', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginTop: 8 }}>
          Save Listing
        </button>
      </div>
    </div>
  );
}
