import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Reset Password' };
export default function ForgotPasswordPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420, background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 40, boxShadow: 'var(--shadow-lg)' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 8 }}>Reset your password</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32, fontSize: 14 }}>Enter your email and we&apos;ll send you a reset link.</p>
        <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Email address</label>
        <input type="email" placeholder="your@email.com" style={{ width: '100%', height: 48, border: '1.5px solid var(--border-default)', borderRadius: 10, padding: '0 16px', fontFamily: 'inherit', fontSize: 14, outline: 'none', boxSizing: 'border-box', background: 'var(--bg-surface)', marginBottom: 24, display: 'block', color: 'var(--text-primary)' }} />
        <button style={{ width: '100%', height: 52, background: 'var(--color-brand-600)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'inherit', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
          Send Reset Link
        </button>
      </div>
    </div>
  );
}
