'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Store, Building2 } from 'lucide-react';
import styles from './LoginPage.module.css';
import { useUIStore } from '@/stores/ui.store';
import { ROUTES } from '@/lib/constants/routes';

// ─────────────────────────────────────────────────────────────────────────────
// LoginPage — sends OTP via SMTP and redirects to verify-otp page
// Uses local state for loading (NOT auth store) to prevent stuck loading bugs
// ─────────────────────────────────────────────────────────────────────────────

const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [activeRole, setActiveRole] = useState<'retailer' | 'seller'>('retailer');

  const [fullName, setFullName] = useState('');
  const [shopName, setShopName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const { addNotification } = useUIStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      addNotification({ type: 'error', title: 'Invalid Email', message: 'Please enter a valid email address.' });
      return;
    }

    setIsLoading(true);
    try {
      // Send OTP via our SMTP API route
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP email');
      }

      // Persist email + role so verify-otp page can use them
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('hw-otp-email', email.trim().toLowerCase());
        window.localStorage.setItem('hw-otp-role', activeRole);
        if (activeTab === 'register') {
          window.localStorage.setItem('hw-otp-name', fullName);
          window.localStorage.setItem('hw-otp-shop', shopName);
          window.localStorage.setItem('hw-otp-mobile', mobile);
        }
      }

      addNotification({
        type: 'success',
        title: '6-Digit OTP Sent!',
        message: `We've sent a 6-digit verification code to ${email}. Please check your inbox (and spam folder).`,
      });

      window.location.href = `${ROUTES.AUTH.VERIFY_OTP}?email=${encodeURIComponent(email)}&role=${activeRole}&tab=${activeTab}`;
    } catch (err: any) {
      addNotification({
        type: 'error',
        title: 'Failed to Send OTP',
        message: err.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* ── Left Content ─────────────────────────────────────────────────────────── */}
        <div className={styles.leftContent}>
          <span className={styles.badge}>FREE ACCOUNT · 60 SECONDS</span>
          <h1 className={styles.heading}>
            Join India&apos;s fastest-growing<br/>B2B wholesale marketplace.
          </h1>
          <p className={styles.subheading}>
            Verified sellers, MOQ pricing, GST invoices and pan-India delivery —<br/>everything your business needs, in one place.
          </p>

          <div className={styles.featuresList}>
            <div className={styles.featureItem}>
              <CheckCircle2 size={18} className={styles.featureIcon} />
              <span>One-time email OTP · no passwords to remember</span>
            </div>
            <div className={styles.featureItem}>
              <CheckCircle2 size={18} className={styles.featureIcon} />
              <span>GST-compliant e-invoicing on every order</span>
            </div>
            <div className={styles.featureItem}>
              <CheckCircle2 size={18} className={styles.featureIcon} />
              <span>Seller onboarding &amp; KYC in under 5 minutes</span>
            </div>
          </div>
        </div>

        {/* ── Right Content (Form Card) ────────────────────────────────────────────── */}
        <div className={styles.card}>
          <div className={styles.tabs}>
            <div
              className={`${styles.tab} ${activeTab === 'signin' ? styles.active : ''}`}
              onClick={() => setActiveTab('signin')}
              role="tab"
              aria-selected={activeTab === 'signin'}
            >
              Sign in
            </div>
            <div
              className={`${styles.tab} ${activeTab === 'register' ? styles.active : ''}`}
              onClick={() => setActiveTab('register')}
              role="tab"
              aria-selected={activeTab === 'register'}
            >
              Register
            </div>
          </div>

          <span className={styles.sectionLabel}>I AM A</span>
          <div className={styles.roleGrid}>
            <div
              className={`${styles.roleCard} ${activeRole === 'retailer' ? styles.active : ''}`}
              onClick={() => setActiveRole('retailer')}
            >
              <Store size={20} className={styles.roleIcon} />
              <div className={styles.roleTitle}>Retailer</div>
              <div className={styles.roleDesc}>Buy wholesale</div>
            </div>
            <div
              className={`${styles.roleCard} ${activeRole === 'seller' ? styles.active : ''}`}
              onClick={() => setActiveRole('seller')}
            >
              <Building2 size={20} className={styles.roleIcon} />
              <div className={styles.roleTitle}>Seller</div>
              <div className={styles.roleDesc}>Sell to retailers</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.formGrid} noValidate>
            {activeTab === 'register' && (
              <>
                <div className={styles.field}>
                  <label className={styles.label}>YOUR FULL NAME</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. Ravi Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>SHOP / BUSINESS NAME</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. Sharma Auto Parts"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className={styles.field}>
              <label className={styles.label}>MOBILE NUMBER (OPTIONAL)</label>
              <input
                type="tel"
                className={styles.input}
                placeholder="98xxxxxxxxx"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>EMAIL ADDRESS</label>
              <input
                type="email"
                className={styles.input}
                placeholder="you@business.in"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
              style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
            >
              {isLoading
                ? 'Sending OTP...'
                : activeTab === 'register'
                ? 'Send Registration Code'
                : 'Sign in to Account'}
            </button>
          </form>

          <div className={styles.disclaimer}>
            By continuing you agree to our <Link href="#">Terms</Link> &amp; <Link href="#">Privacy Policy</Link>.
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
