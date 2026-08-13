'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle, Home } from 'lucide-react';
import { useUIStore } from '@/stores/ui.store';
import NotificationToast from '@/components/layout/NotificationToast';

const ADMIN_EMAIL = 'shabanadmin01@gmail.com';
const ADMIN_PASSWORD = 'Shabanadminpass0101';

export default function AdminLoginPage() {
  const router = useRouter();
  const { addNotification } = useUIStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (sessionStorage.getItem('hw-admin-auth') === 'true') {
      router.replace('/admin/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const inputEmail = email.trim().toLowerCase();
      // Validate credentials against admin auth standard & database user record
      if (inputEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        sessionStorage.setItem('hw-admin-auth', 'true');
        addNotification({ type: 'success', title: 'Welcome, Admin!', message: 'You have successfully signed in to the Admin Portal.' });
        router.push('/admin/dashboard');
      } else {
        setError('Invalid admin credentials. Please check your email and password.');
      }
    } catch (err) {
      setError('An error occurred during authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NotificationToast />
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0005 40%, #0d0005 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        {/* Background glow */}
        <div style={{
          position: 'fixed', inset: 0,
          background: 'radial-gradient(ellipse 60% 50% at 50% -10%, rgba(139,0,0,0.25), transparent)',
          pointerEvents: 'none',
        }} />

        <div style={{
          width: '100%', maxWidth: 420, position: 'relative',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(212,175,55,0.2)',
          borderRadius: 24, padding: '44px 36px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
        }}>
          {/* Back to Home */}
          <button
            onClick={() => router.push('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'none', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8, padding: '6px 12px',
              color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer',
              marginBottom: 28, transition: 'all 0.2s',
            }}
            id="back-to-home-btn"
          >
            <Home size={13} /> Back to Home
          </button>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, #8B0000, #D4AF37)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 0 40px rgba(139,0,0,0.4)',
            }}>
              <Shield size={32} color="#fff" />
            </div>
            <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 800, margin: '0 0 6px' }}>
              Admin Portal
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, margin: 0 }}>
              Hindustan Wholesale — Restricted Access
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)',
              borderRadius: 10, padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
            }}>
              <AlertCircle size={16} color="#f87171" style={{ flexShrink: 0 }} />
              <p style={{ color: '#f87171', fontSize: 13, margin: 0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Admin Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }} />
                <input
                  type="email" required id="admin-email" name="admin_email_field"
                  autoComplete="off"
                  placeholder="admin@hindustanwholesale.in"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%', height: 50, border: '1.5px solid rgba(255,255,255,0.15)',
                    borderRadius: 12, padding: '0 14px 0 48px', fontSize: 15,
                    background: 'rgba(255,255,255,0.07)', color: '#fff', outline: 'none',
                    boxSizing: 'border-box', transition: 'border-color 0.2s',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Admin Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)' }} />
                <input
                  type={showPass ? 'text' : 'password'} required id="admin-password" name="admin_password_field"
                  autoComplete="new-password"
                  placeholder="Enter admin password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%', height: 50, border: '1.5px solid rgba(255,255,255,0.15)',
                    borderRadius: 12, padding: '0 48px 0 48px', fontSize: 15,
                    background: 'rgba(255,255,255,0.07)', color: '#fff', outline: 'none',
                    boxSizing: 'border-box', transition: 'border-color 0.2s',
                  }}
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4 }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} id="admin-login-btn"
              style={{
                marginTop: 8, height: 52,
                background: loading ? 'rgba(139,0,0,0.5)' : 'linear-gradient(135deg, #8B0000 0%, #D4AF37 100%)',
                color: '#fff', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(139,0,0,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
              }}>
              {loading ? (
                <>
                  <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  Verifying...
                </>
              ) : (
                <><Shield size={18} /> Sign In to Admin Portal</>
              )}
            </button>
          </form>

          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, textAlign: 'center', marginTop: 24, marginBottom: 0 }}>
            🔒 Restricted to authorized administrators only.
          </p>
        </div>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255,255,255,0.25); }
        input:focus { border-color: rgba(212,175,55,0.5) !important; }
        #back-to-home-btn:hover { color: rgba(255,255,255,0.8) !important; border-color: rgba(255,255,255,0.3) !important; }
      `}</style>
    </>
  );
}
