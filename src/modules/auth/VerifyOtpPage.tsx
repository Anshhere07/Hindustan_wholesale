'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import styles from './VerifyOtpPage.module.css';
import Button from '@/components/ui/Button';
import { useUIStore } from '@/stores/ui.store';
import { registerUser } from '@/lib/firebase/auth';

// ─────────────────────────────────────────────────────────────────────────────
// Verify OTP Page — single-input 6-digit OTP entry with 6 visual slot boxes
// Ensures 100% smooth entry across all mobile keypads, keyboards, & paste flows
// ─────────────────────────────────────────────────────────────────────────────

const VerifyOtpPage: React.FC = () => {
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [shake, setShake] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { addNotification } = useUIStore();

  useEffect(() => {
    inputRef.current?.focus();

    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    setOtpCode(digits);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 6) {
      setError('Please enter all 6 digits of the code');
      triggerShake();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const email = typeof window !== 'undefined' ? (window.localStorage.getItem('hw-otp-email') || '') : '';
      const role = typeof window !== 'undefined' ? (window.localStorage.getItem('hw-otp-role') || 'buyer') : 'buyer';
      const fullName = typeof window !== 'undefined' ? (window.localStorage.getItem('hw-otp-name') || 'User') : 'User';
      const businessName = typeof window !== 'undefined' ? (window.localStorage.getItem('hw-otp-business') || '') : '';
      const gstNumber = typeof window !== 'undefined' ? (window.localStorage.getItem('hw-otp-gst') || '') : '';
      const phone = typeof window !== 'undefined' ? (window.localStorage.getItem('hw-otp-phone') || '') : '';
      const password = typeof window !== 'undefined' ? (window.localStorage.getItem('hw-otp-pass') || 'DefaultPass123!') : 'DefaultPass123!';

      if (!email) {
        throw new Error('Session expired. Please go back to registration page.');
      }

      // 1. Verify OTP with backend API
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid verification code');
      }

      // 2. Create user record in Firebase Auth first to get real UID
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || '';
      let firebaseUid = '';

      try {
        const fbUser = await registerUser({
          email,
          password,
          firstName,
          lastName,
          phone,
          role: role as 'buyer' | 'seller',
        });
        firebaseUid = fbUser.uid;
      } catch (authErr: any) {
        console.warn('Firebase Auth note:', authErr.message);
        if (authErr.code === 'auth/email-already-in-use') {
          try {
            const { signInWithPassword } = await import('@/lib/firebase/auth');
            const existingFbUser = await signInWithPassword(email, password);
            firebaseUid = existingFbUser.uid;
          } catch (signinErr: any) {
            console.warn('Could not get Firebase UID from sign-in:', signinErr.message);
            firebaseUid = email.replace(/[^a-z0-9]/gi, '_');
          }
        } else {
          firebaseUid = email.replace(/[^a-z0-9]/gi, '_');
        }
      }

      // Sync user profile with status: 'pending' (Awaiting Admin Approval) and store credentials
      try {
        const { createUser } = await import('@/lib/firebase/collections/users');
        const cleanEmail = email.trim().toLowerCase();
        const userProfileData = {
          email: cleanEmail,
          phone,
          firstName,
          lastName,
          role: role as 'buyer' | 'seller',
          status: 'pending' as const,
          password: password.trim(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await createUser(firebaseUid, userProfileData);

        // Also write to doc with email key for fast guaranteed lookup
        const emailDocId = cleanEmail.replace(/[^a-z0-9]/gi, '_');
        if (emailDocId !== firebaseUid) {
          await createUser(emailDocId, userProfileData);
        }

        if (role === 'buyer') {
          const { createBuyerProfile } = await import('@/lib/firebase/collections/buyer-profiles');
          await createBuyerProfile(firebaseUid, {
            companyName: businessName || `${firstName}'s Shop`,
            businessName: businessName || `${firstName}'s Shop`,
            gstNumber: gstNumber || 'UNVERIFIED',
            businessType: 'proprietorship',
            industryType: 'Automotive Spares',
            primaryContact: { name: `${firstName} ${lastName}`.trim(), email, phone },
            billingAddress: { id: 'addr-1', line1: 'Main Market', city: 'New Delhi', state: 'Delhi', pincode: '110001', country: 'India', isDefault: true },
            shippingAddresses: [{ id: 'addr-1', line1: 'Main Market', city: 'New Delhi', state: 'Delhi', pincode: '110001', country: 'India', isDefault: true }],
            creditLimit: 100000,
          });
        } else {
          const { createSellerProfile } = await import('@/lib/firebase/collections/seller-profiles');
          await createSellerProfile(firebaseUid, {
            businessName: businessName || `${firstName}'s Company`,
            gstNumber: gstNumber || 'UNVERIFIED',
            panNumber: 'UNVERIFIED',
            businessType: 'trader',
            categories: ['Automotive Parts'],
            primaryContact: { name: `${firstName} ${lastName}`.trim(), email, phone },
            warehouseAddresses: [{ id: 'wh-1', line1: 'Industrial Area', city: 'New Delhi', state: 'Delhi', pincode: '110020', country: 'India' }],
          });
        }
      } catch (dbErr) {
        console.warn('Firestore creation note:', dbErr);
      }

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('hw-otp-email');
        window.localStorage.removeItem('hw-otp-role');
        window.localStorage.removeItem('hw-otp-name');
        window.localStorage.removeItem('hw-otp-business');
        window.localStorage.removeItem('hw-otp-gst');
        window.localStorage.removeItem('hw-otp-phone');
        window.localStorage.removeItem('hw-otp-pass');
      }

      addNotification({
        type: 'success',
        title: 'Request Submitted for Account Approval!',
        message: 'Your email has been verified. Your account request has been submitted to the admin for review and approval.',
        duration: 8000,
      });

      router.push('/auth/login?status=pending_approval');
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Invalid verification code');
      triggerShake();
      setOtpCode('');
      inputRef.current?.focus();
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleResend = async () => {
    setCountdown(30);
    setOtpCode('');
    inputRef.current?.focus();

    const email = typeof window !== 'undefined' ? (window.localStorage.getItem('hw-otp-email') || '') : '';
    if (email) {
      try {
        const res = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to resend');
        addNotification({
          type: 'info',
          title: 'New Code Sent',
          message: `A fresh 6-digit code has been sent to ${email}.`,
        });
      } catch (err: any) {
        addNotification({
          type: 'error',
          title: 'Resend Failed',
          message: err.message || 'Could not resend OTP. Please try again.',
        });
      }
    }
  };

  const isFormComplete = otpCode.length === 6;

  return (
    <div className={styles.page}>
      <div className={styles.formPanel}>
        <div className={styles.formInner}>
          <Link href="/auth/register" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to Register
          </Link>

          <div className={styles.header}>
            <div className={styles.iconWrap}>
              <ShieldCheck size={28} />
            </div>
            <h1 className={styles.title}>Email OTP Verification</h1>
            <p className={styles.subtitle}>
              Enter the 6-digit verification code sent to your registered email.
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div
              className={`${styles.otpGroup} ${shake ? styles.shake : ''}`}
              onClick={() => inputRef.current?.focus()}
              role="group"
              aria-label="6 digit verification code"
            >
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                className={styles.hiddenInput}
                value={otpCode}
                onChange={handleOtpChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={isLoading}
                autoComplete="one-time-code"
                aria-label="6-digit verification code"
              />

              {Array.from({ length: 6 }).map((_, idx) => {
                const char = otpCode[idx] || '';
                const isBoxFocused = isFocused && (otpCode.length === idx || (idx === 5 && otpCode.length === 6));
                return (
                  <div
                    key={idx}
                    className={`${styles.otpBox} ${isBoxFocused ? styles.otpBoxFocused : ''} ${char ? styles.otpBoxFilled : ''}`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>

            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              disabled={!isFormComplete || isLoading}
            >
              Verify Code & Submit Request
            </Button>
          </form>

          <div className={styles.resendWrap}>
            <p className={styles.resendText}>
              Didn&apos;t receive the code?
            </p>
            {countdown > 0 ? (
              <span className={styles.countdown}>
                Resend in {countdown} seconds
              </span>
            ) : (
              <button
                type="button"
                className={styles.resendBtn}
                onClick={handleResend}
                disabled={isLoading}
              >
                <RefreshCw size={14} /> Resend OTP Code
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
