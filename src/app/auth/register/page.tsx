import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Create Account' };
export default function RegisterPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 480, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 40, boxShadow: 'var(--shadow-lg)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 8 }}>Create your account</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 14 }}>Join 10,000+ businesses on Hindustan Wheels</p>
        {['Full Name', 'Business Name', 'GST Number', 'Email Address', 'Phone Number', 'Password'].map((label) => (
          <div key={label} style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>{label}</label>
            <input type={label === 'Password' ? 'password' : label.includes('Email') ? 'email' : 'text'} placeholder={`Enter ${label.toLowerCase()}`} style={{ width: '100%', height: 48, border: '1.5px solid var(--border-default)', borderRadius: 10, padding: '0 16px', fontFamily: 'inherit', fontSize: 14, outline: 'none', boxSizing: 'border-box', background: 'var(--bg-surface)', color: 'var(--text-primary)' }} />
          </div>
        ))}
        <button style={{ width: '100%', height: 52, background: 'var(--color-brand-600)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'inherit', fontWeight: 600, fontSize: 15, cursor: 'pointer', marginTop: 8 }}>
          Create Account
        </button>
      </div>
    </div>
  );
}
