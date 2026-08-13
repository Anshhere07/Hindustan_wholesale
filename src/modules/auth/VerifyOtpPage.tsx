'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import styles from './VerifyOtpPage.module.css';
import Button from '@/components/ui/Button';
import { useUIStore } from '@/stores/ui.store';
import { registerUser } from '@/lib/firebase/auth';

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
    inputRefs.current[0]?.focus();

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
        body: JSON.stringify({ email, otp: fullCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid verification code');
      }

      // 2. Create user record with pending approval status
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || '';
      const uid = email.replace(/[^a-z0-9]/gi, '_');

      try {
        await registerUser({
          email,
          password,
          firstName,
          lastName,
          phone,
          role: role as 'buyer' | 'seller',
        });
      } catch (authErr: any) {
        console.warn('Firebase Auth note:', authErr.message);
      }

      // Sync user profile with status: 'pending' (Awaiting Admin Approval)
      try {
        const { createUser } = await import('@/lib/firebase/collections/users');
        await createUser(uid, {
          email,
          phone,
          firstName,
          lastName,
          role: role as 'buyer' | 'seller',
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        if (role === 'buyer') {
          const { createBuyerProfile } = await import('@/lib/firebase/collections/buyer-profiles');
          await createBuyerProfile(uid, {
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
          await createSellerProfile(uid, {
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

      // Clear temporary registration storage
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('hw-otp-email');
        window.localStorage.removeItem('hw-otp-role');
        window.localStorage.removeItem('hw-otp-name');
        window.localStorage.removeItem('hw-otp-business');
        window.localStorage.removeItem('hw-otp-gst');
        window.localStorage.removeItem('hw-otp-phone');
        window.localStorage.removeItem('hw-otp-pass');
      }

      // Display required notification toast
      addNotification({
        type: 'success',
        title: 'Request Submitted for Account Approval!',
        message: 'Your email has been verified. Your account request has been submitted to the admin for review and approval.',
        duration: 8000,
      });

      // Redirect user to login page until admin approves
      router.push('/auth/login?status=pending_approval');
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
