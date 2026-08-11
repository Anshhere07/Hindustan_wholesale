'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import styles from './VerifyOtpPage.module.css';
import Button from '@/components/ui/Button';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { ROUTES } from '@/lib/constants/routes';

// ─────────────────────────────────────────────────────────────────────────────
// VerifyOtpPage — 6-digit focus-shifting OTP entry page with shake animations
// ─────────────────────────────────────────────────────────────────────────────

const VerifyOtpPage: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [shake, setShake] = useState(false);

  const inputRefs = useRef<HTMLInputElement[]>([]);
  const router = useRouter();
  const { addNotification } = useUIStore();

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();

    // Timer for resend code
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (value: string, index: number) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (!numericValue) return;

    const newOtp = [...otp];
    newOtp[index] = numericValue.substring(numericValue.length - 1);
    setOtp(newOtp);
    setError(null);

    // Shift focus to next input if filled
    if (index < 5 && newOtp[index]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (!newOtp[index] && index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        newOtp[index] = '';
        setOtp(newOtp);
      }
      setError(null);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pastedData)) {
      setError('Please paste a valid 6-digit numeric code');
      return;
    }

    const digits = pastedData.split('');
    setOtp(digits);
    setError(null);
    inputRefs.current[5]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otp.join('');
    if (fullCode.length < 6) {
      setError('Please enter all 6 digits of the code');
      triggerShake();
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const email = typeof window !== 'undefined'
        ? (window.localStorage.getItem('hw-otp-email') || '')
        : '';
      const role = typeof window !== 'undefined'
        ? (window.localStorage.getItem('hw-otp-role') || 'retailer')
        : 'retailer';

      if (!email) {
        throw new Error('Session expired. Please go back and enter your email again.');
      }

      // Call API route to verify OTP
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: fullCode }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid verification code');
      }

      // Set user session in auth store & sync to Firestore
      const uid = email.replace(/[^a-z0-9]/gi, '_');
      const userRole = role === 'seller' ? 'seller' : 'buyer';
      const userFirstName = typeof window !== 'undefined' ? (window.localStorage.getItem('hw-otp-name')?.split(' ')[0] || 'User') : 'User';
      const userLastName = typeof window !== 'undefined' ? (window.localStorage.getItem('hw-otp-name')?.split(' ').slice(1).join(' ') || '') : '';
      const userPhone = typeof window !== 'undefined' ? (window.localStorage.getItem('hw-otp-mobile') || '') : '';
      const userShop = typeof window !== 'undefined' ? (window.localStorage.getItem('hw-otp-shop') || `${userFirstName}'s Store`) : `${userFirstName}'s Store`;

      const newUser = {
        id: uid,
        email,
        phone: userPhone,
        firstName: userFirstName,
        lastName: userLastName,
        role: userRole as 'buyer' | 'seller',
        status: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Try syncing to Firestore (non-blocking if Firestore network rules/offline)
      try {
        const { getUserById, createUser } = await import('@/lib/firebase/collections/users');
        const existingUser = await getUserById(uid);
        if (!existingUser) {
          await createUser(uid, {
            email,
            phone: userPhone,
            firstName: userFirstName,
            lastName: userLastName,
            role: userRole as 'buyer' | 'seller',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });

          if (userRole === 'buyer') {
            const { createBuyerProfile } = await import('@/lib/firebase/collections/buyer-profiles');
            await createBuyerProfile(uid, {
              companyName: userShop,
              businessName: userShop,
              businessType: 'proprietorship',
              industryType: 'Automotive Spares',
              primaryContact: { name: `${userFirstName} ${userLastName}`.trim(), email, phone: userPhone },
              billingAddress: { id: 'addr-1', line1: 'Main Market', city: 'New Delhi', state: 'Delhi', pincode: '110001', country: 'India', isDefault: true },
              shippingAddresses: [{ id: 'addr-1', line1: 'Main Market', city: 'New Delhi', state: 'Delhi', pincode: '110001', country: 'India', isDefault: true }],
            });
          } else {
            const { createSellerProfile } = await import('@/lib/firebase/collections/seller-profiles');
            await createSellerProfile(uid, {
              businessName: userShop,
              gstNumber: 'UNVERIFIED',
              panNumber: 'UNVERIFIED',
              businessType: 'trader',
              categories: ['Automotive Parts'],
              primaryContact: { name: `${userFirstName} ${userLastName}`.trim(), email, phone: userPhone },
              warehouseAddresses: [{ id: 'wh-1', line1: 'Industrial Area', city: 'New Delhi', state: 'Delhi', pincode: '110020', country: 'India' }],
            });
          }
        }
      } catch (fsErr) {
        console.warn('Firestore sync note:', fsErr);
      }

      const { setUser } = useAuthStore.getState();
      setUser(newUser);

      addNotification({
        type: 'success',
        title: 'OTP Verified ✓',
        message: 'You are now signed in. Welcome to Hindustan Wheels!',
      });

      // Redirect based on stored role
      if (role === 'seller') {
        router.push(ROUTES.SELLER.DASHBOARD);
      } else {
        router.push(ROUTES.BUYER.DASHBOARD);
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'Invalid verification code');
      triggerShake();
      setOtp(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleResend = async () => {
    setCountdown(30);
    setOtp(Array(6).fill(''));
    inputRefs.current[0]?.focus();

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

  const isFormComplete = otp.every((d) => d !== '');

  return (
    <div className={styles.page}>
      <div className={styles.formPanel}>
        <div className={styles.formInner}>
          {/* Back link */}
          <Link href={ROUTES.AUTH.LOGIN} className={styles.backLink}>
            <ArrowLeft size={16} /> Back to Sign In
          </Link>

          {/* Heading */}
          <div className={styles.header}>
            <div className={styles.iconWrap}>
              <ShieldCheck size={28} />
            </div>
            <h1 className={styles.title}>Email OTP Verification</h1>
            <p className={styles.subtitle}>
              We sent a 6-digit authentication code to your registered email.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={`${styles.otpGroup} ${shake ? styles.shake : ''}`} role="group" aria-label="6 digit verification code">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { if (el) inputRefs.current[idx] = el; }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  className={styles.otpInput}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  onPaste={handlePaste}
                  disabled={isLoading}
                  autoComplete="one-time-code"
                  aria-label={`Digit ${idx + 1}`}
                />
              ))}
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
              Verify & Proceed
            </Button>
          </form>

          {/* Resend Action */}
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
