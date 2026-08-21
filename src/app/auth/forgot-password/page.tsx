'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/stores/ui.store';
import {
  KeyRound, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, AlertCircle, ShieldCheck
} from 'lucide-react';
import { getUserByEmail, updateUserPasswordByEmail } from '@/lib/firebase/collections/users';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { addNotification } = useUIStore();

  const [step, setStep] = useState<'form' | 'otp'>('form');

  // Form Fields
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP Fields
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Send OTP for Password Reset
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid registered email address.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Verify user exists in Firestore
      const user = await getUserByEmail(cleanEmail);
      if (!user) {
        setError('No account found with this email address. Please check your email or register.');
        setIsLoading(false);
        return;
      }

      // 2. Send 6-digit OTP code to registered email
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP code to your email.');
      }

      addNotification({
        type: 'info',
        title: 'Verification Code Sent!',
        message: `A 6-digit password reset OTP has been sent to ${cleanEmail}.`,
        duration: 6000,
      });

      // 3. Move to OTP step
      setStep('otp');
    } catch (err: any) {
      console.error('Password reset request error:', err);
      setError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP & Change Password
  const handleVerifyOtpAndChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (!cleanOtp || cleanOtp.length < 6) {
      setError('Please enter the complete 6-digit OTP sent to your email.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Verify OTP with backend endpoint
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, otp: cleanOtp }),
      });
      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.error || 'Incorrect OTP. Please enter the correct verification code sent to your email.';
        setError(errorMsg);
        addNotification({
          type: 'error',
          title: 'Invalid OTP Code',
          message: errorMsg,
          duration: 6000,
        });
        setIsLoading(false);
        return;
      }

      // 2. OTP is valid! Update password in Firestore
      await updateUserPasswordByEmail(cleanEmail, newPassword.trim());

      addNotification({
        type: 'success',
        title: 'Password Changed Successfully!',
        message: 'Your account password has been updated. Please sign in with your new password.',
        duration: 8000,
      });

      // 3. Redirect to login page
      router.push('/auth/login');
    } catch (err: any) {
      console.error('Password change error:', err);
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setError(null);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      });
      if (!res.ok) throw new Error('Failed to resend code');

      addNotification({
        type: 'success',
        title: 'New Code Sent',
        message: `A fresh 6-digit OTP code has been sent to ${cleanEmail}.`,
      });
    } catch (err: any) {
      setError('Could not resend OTP. Please try again in a moment.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      {/* Header */}
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

      {/* Main Container */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '36px 16px' }}>
        <div style={{
          width: '100%',
          maxWidth: 480,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 20,
          padding: '36px 28px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: '#fdf2f4',
              color: '#8B0000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              border: '1px solid rgba(139, 0, 0, 0.2)',
            }}>
              <KeyRound size={26} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
              {step === 'form' ? 'Reset Account Password' : 'Enter Verification OTP'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13.5 }}>
              {step === 'form'
                ? 'Enter your registered email and new password to receive a verification OTP.'
                : `Enter the 6-digit OTP code sent to ${email} to confirm your new password.`}
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
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>{error}</div>
            </div>
          )}

          {step === 'form' ? (
            /* STEP 1 FORM */
            <form onSubmit={handleRequestOtp}>
              {/* Registered Email */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                  REGISTERED EMAIL ADDRESS
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: 14, top: 14, color: '#9CA3AF' }} />
                  <input
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

              {/* New Password */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                  NEW PASSWORD
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: 14, top: 14, color: '#9CA3AF' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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

              {/* Confirm New Password */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                  CONFIRM NEW PASSWORD
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: 14, top: 14, color: '#9CA3AF' }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
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
                {isLoading ? 'Sending Verification OTP...' : 'Confirm & Change Password'}
              </button>
            </form>
          ) : (
            /* STEP 2 OTP FORM */
            <form onSubmit={handleVerifyOtpAndChangePassword}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>
                  6-DIGIT EMAIL OTP CODE
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  style={{
                    width: '100%',
                    height: 54,
                    border: '2px solid #8B0000',
                    borderRadius: 12,
                    fontSize: 24,
                    letterSpacing: '0.3em',
                    textAlign: 'center',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    outline: 'none',
                    boxSizing: 'border-box',
                    background: '#fff',
                  }}
                />
              </div>

              <button
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
                  marginBottom: 16,
                }}
              >
                {isLoading ? 'Verifying & Updating...' : 'Verify OTP & Change Password'}
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                <button
                  type="button"
                  onClick={() => { setStep('form'); setError(null); }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}
                >
                  ← Edit details
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  style={{ background: 'none', border: 'none', color: '#8B0000', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  {isResending ? 'Sending...' : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
            Remembered your password?{' '}
            <Link href="/auth/login" style={{ color: '#8B0000', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
