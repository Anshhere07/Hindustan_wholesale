'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import styles from './VerifyOtpPage.module.css';
import Button from '@/components/ui/Button';
import { useUIStore } from '@/stores/ui.store';
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
        // Shift focus to previous input on backspace if current is empty
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
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

    // Simulate OTP verification logic
    await new Promise((r) => setTimeout(r, 1200));

    if (fullCode === '123456' || fullCode === '000000') {
      addNotification({
        type: 'success',
        title: 'Device Verified',
        message: 'Business identity authentication active.',
      });
      router.push(ROUTES.BUYER.DASHBOARD); // Default successful redirect
    } else {
      setIsLoading(false);
      setError('Invalid verification code. Use "123456" for demo.');
      triggerShake();
      setOtp(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleResend = () => {
    setCountdown(30);
    setOtp(Array(6).fill(''));
    inputRefs.current[0]?.focus();
    addNotification({
      type: 'info',
      title: 'Code Sent',
      message: 'A new 6-digit code has been sent to your registered device.',
    });
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
            <h1 className={styles.title}>Two-Factor Verification</h1>
            <p className={styles.subtitle}>
              We sent a 6-digit authentication code to your registered device. Enter the code below to sign in.
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

          {/* Demo notice */}
          <div className={styles.demoNotice}>
            <p>💡 <strong>Demo Mode:</strong> Use code <strong>123456</strong> or <strong>000000</strong> to pass.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
