'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUIStore } from '@/stores/ui.store';
import { Building2, User, Mail, Phone, Lock, FileText, ShieldCheck, ArrowLeft, Eye, EyeOff } from 'lucide-react';

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addNotification } = useUIStore();

  const roleParam = searchParams.get('role');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');

  useEffect(() => {
    if (roleParam === 'seller') {
      setRole('seller');
    } else {
      setRole('buyer');
    }
  }, [roleParam]);

  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Send OTP to email first
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send verification code to email');
      }

      // 2. Save draft registration details in localStorage for OTP verification step
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('hw-otp-email', cleanEmail);
        window.localStorage.setItem('hw-otp-role', role);
        window.localStorage.setItem('hw-otp-name', fullName.trim());
        window.localStorage.setItem('hw-otp-business', businessName.trim());
        window.localStorage.setItem('hw-otp-gst', gstNumber.trim());
        window.localStorage.setItem('hw-otp-phone', phone.trim());
        window.localStorage.setItem('hw-otp-pass', password);
      }

      addNotification({
        type: 'info',
        title: 'Verification Code Sent',
        message: `A 6-digit OTP code has been sent to ${cleanEmail}. Please verify to complete registration.`,
      });

      // 3. Redirect to OTP verification page
      router.push('/auth/verify-otp');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to send OTP code. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      {/* Top Header */}
      <header style={{
        height: 64,
        background: 'linear-gradient(135deg, #8B0000 0%, #60020B 100%)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36,
            height: 36,
            background: 'linear-gradient(135deg, #8b0000, #d4af37)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(212, 175, 55, 0.4)',
          }}>
            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
              <circle cx="16" cy="16" r="14" fill="white" fillOpacity="0.2"/>
              <circle cx="16" cy="16" r="8" fill="white" fillOpacity="0.4"/>
              <circle cx="16" cy="16" r="3" fill="white"/>
            </svg>
          </div>
          <div>
            <div style={{ color: '#ffffff', fontWeight: 800, fontSize: 16, lineHeight: 1.2 }}>Hindustan Wholesale</div>
            <div style={{ color: '#d4af37', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em' }}>B2B WHOLESALE MARKETPLACE</div>
          </div>
        </Link>

        <Link href="/auth/login" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          color: '#ffffff',
          fontSize: 13,
          fontWeight: 600,
          textDecoration: 'none',
          background: 'rgba(255, 255, 255, 0.12)',
          padding: '6px 14px',
          borderRadius: 8,
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}>
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
      </header>

      {/* Main Registration Form */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '36px 16px' }}>
        <div style={{
          width: '100%',
          maxWidth: 520,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 20,
          padding: '36px 28px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 20,
              background: '#fdf2f4',
              color: '#8B0000',
              border: '1px solid rgba(139, 0, 0, 0.2)',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 12,
            }}>
              <ShieldCheck size={16} /> B2B Verified Registration
            </span>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
              {role === 'seller' ? 'Create Seller / Manufacturer Account' : 'Create Retailer Account'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13.5 }}>
              {role === 'seller'
                ? 'Start selling wholesale auto parts to verified retailers across India'
                : 'Join 10,000+ verified auto retailers on Hindustan Wholesale'}
            </p>
          </div>

          {error && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              padding: '12px 16px',
              borderRadius: 10,
              fontSize: 13,
              marginBottom: 20,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: 14, top: 14, color: '#9CA3AF' }} />
                <input
                  id="fullNameInput"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ravi Sharma"
                  style={{
                    width: '100%',
                    height: 46,
                    border: '1.5px solid var(--border-default)',
                    borderRadius: 10,
                    paddingLeft: 42,
                    paddingRight: 14,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Business / Shop Name */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                {role === 'seller' ? 'Company / Manufacturer Name' : 'Shop / Business Name'}
              </label>
              <div style={{ position: 'relative' }}>
                <Building2 size={18} style={{ position: 'absolute', left: 14, top: 14, color: '#9CA3AF' }} />
                <input
                  id="businessNameInput"
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder={role === 'seller' ? 'e.g. Acme Auto Components Pvt Ltd' : 'e.g. Sharma Auto Spares'}
                  style={{
                    width: '100%',
                    height: 46,
                    border: '1.5px solid var(--border-default)',
                    borderRadius: 10,
                    paddingLeft: 42,
                    paddingRight: 14,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* GSTIN */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                GSTIN / Trade License {role === 'seller' ? '(Required)' : '(Optional)'}
              </label>
              <div style={{ position: 'relative' }}>
                <FileText size={18} style={{ position: 'absolute', left: 14, top: 14, color: '#9CA3AF' }} />
                <input
                  id="gstInput"
                  type="text"
                  required={role === 'seller'}
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  placeholder="e.g. 07AAACA9999A1Z9"
                  style={{
                    width: '100%',
                    height: 46,
                    border: '1.5px solid var(--border-default)',
                    borderRadius: 10,
                    paddingLeft: 42,
                    paddingRight: 14,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Email Address */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: 14, top: 14, color: '#9CA3AF' }} />
                <input
                  id="emailInput"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@business.in"
                  style={{
                    width: '100%',
                    height: 46,
                    border: '1.5px solid var(--border-default)',
                    borderRadius: 10,
                    paddingLeft: 42,
                    paddingRight: 14,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Phone Number */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>Phone Number (Optional)</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: 14, top: 14, color: '#9CA3AF' }} />
                <input
                  id="phoneInput"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+9198xxxxxxxxx"
                  style={{
                    width: '100%',
                    height: 46,
                    border: '1.5px solid var(--border-default)',
                    borderRadius: 10,
                    paddingLeft: 42,
                    paddingRight: 14,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 14, top: 14, color: '#9CA3AF' }} />
                <input
                  id="passwordInput"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    height: 46,
                    border: '1.5px solid var(--border-default)',
                    borderRadius: 10,
                    paddingLeft: 42,
                    paddingRight: 40,
                    fontSize: 14,
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              id="createAccountBtn"
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                height: 50,
                background: '#8B0000',
                color: '#ffffff',
                border: 'none',
                borderRadius: 12,
                fontFamily: 'inherit',
                fontWeight: 700,
                fontSize: 15,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                boxShadow: '0 4px 14px rgba(139,0,0,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {isLoading ? 'Sending OTP Code...' : 'Continue & Verify Email'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: '#8B0000', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B0000', fontWeight: 600 }}>Loading registration...</div>}>
      <RegisterFormContent />
    </Suspense>
  );
}
