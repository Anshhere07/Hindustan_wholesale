'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, ShoppingBag, Building2, Shield } from 'lucide-react';
import styles from './LoginPage.module.css';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { ROUTES } from '@/lib/constants/routes';

// ─────────────────────────────────────────────────────────────────────────────
// Login Page — credential form + one-click demo access for all three roles
// ─────────────────────────────────────────────────────────────────────────────

const LoginPage: React.FC = () => {
  const [email, setEmail]       = useState('ramesh@rameshtraders.in');
  const [password, setPassword] = useState('••••••••');
  const [showPw, setShowPw]     = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login, loginAsBuyer, loginAsSeller, loginAsAdmin } = useAuthStore();
  const { addNotification } = useUIStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      addNotification({ type: 'success', title: 'Welcome back!', message: `Signed in as ${email}` });
      window.location.href = ROUTES.BUYER.DASHBOARD;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = (role: 'buyer' | 'seller' | 'admin') => {
    if (role === 'buyer')  loginAsBuyer();
    if (role === 'seller') loginAsSeller();
    if (role === 'admin')  loginAsAdmin();
    addNotification({ type: 'success', title: `${role.charAt(0).toUpperCase() + role.slice(1)} demo activated` });
    const dest = role === 'buyer' ? ROUTES.BUYER.DASHBOARD : role === 'seller' ? ROUTES.SELLER.DASHBOARD : ROUTES.ADMIN.DASHBOARD;
    window.location.href = dest;
  };

  return (
    <div className={styles.page}>
      {/* Left — Brand Panel */}
      <div className={styles.brand} aria-hidden="true">
        <div className={styles.brandInner}>
          <Link href="/" className={styles.brandLogo}>
            <div className={styles.brandLogoIcon}>
              <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
                <circle cx="16" cy="16" r="14" fill="white" fillOpacity="0.25"/>
                <circle cx="16" cy="16" r="8" fill="white" fillOpacity="0.4"/>
                <circle cx="16" cy="16" r="3" fill="white"/>
                <path d="M16 2L16 6M16 26L16 30M2 16L6 16M26 16L30 16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className={styles.brandName}>Hindustan Wheels</span>
          </Link>
          <div className={styles.brandContent}>
            <h1 className={styles.brandHeading}>
              India&apos;s Largest<br />B2B Auto Parts<br />Marketplace
            </h1>
            <p className={styles.brandSubtitle}>
              5,000+ verified sellers · 2M+ SKUs · Pan-India delivery
            </p>
            <div className={styles.brandStats}>
              {[
                { label: 'GMV Processed', value: '₹1,200Cr+' },
                { label: 'Active Buyers',  value: '10,000+'   },
                { label: 'Cities Covered', value: '500+'      },
              ].map((s) => (
                <div key={s.label} className={styles.brandStat}>
                  <span className={styles.brandStatValue}>{s.value}</span>
                  <span className={styles.brandStatLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.brandFloat1} />
          <div className={styles.brandFloat2} />
        </div>
      </div>

      {/* Right — Login Form */}
      <div className={styles.formPanel}>
        <div className={styles.formInner}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Sign in to your account</h2>
            <p className={styles.formSubtitle}>
              New to Hindustan Wheels?{' '}
              <Link href={ROUTES.AUTH.REGISTER} className={styles.formLink}>Create account</Link>
            </p>
          </div>

          {/* Demo Buttons */}
          <div className={styles.demoSection}>
            <p className={styles.demoLabel}>⚡ Quick Demo Access</p>
            <div className={styles.demoGrid}>
              <button className={`${styles.demoBtn} ${styles['demoBtn--buyer']}`} onClick={() => handleDemo('buyer')} type="button">
                <ShoppingBag size={16} aria-hidden="true" />
                <div>
                  <span className={styles.demoBtnTitle}>Buyer Portal</span>
                  <span className={styles.demoBtnSub}>Browse & order parts</span>
                </div>
                <ArrowRight size={14} className={styles.demoBtnArrow} />
              </button>
              <button className={`${styles.demoBtn} ${styles['demoBtn--seller']}`} onClick={() => handleDemo('seller')} type="button">
                <Building2 size={16} aria-hidden="true" />
                <div>
                  <span className={styles.demoBtnTitle}>Seller Portal</span>
                  <span className={styles.demoBtnSub}>Manage & sell products</span>
                </div>
                <ArrowRight size={14} className={styles.demoBtnArrow} />
              </button>
              <button className={`${styles.demoBtn} ${styles['demoBtn--admin']}`} onClick={() => handleDemo('admin')} type="button">
                <Shield size={16} aria-hidden="true" />
                <div>
                  <span className={styles.demoBtnTitle}>Admin Console</span>
                  <span className={styles.demoBtnSub}>Platform management</span>
                </div>
                <ArrowRight size={14} className={styles.demoBtnArrow} />
              </button>
            </div>
          </div>

          <div className={styles.divider}><span>or sign in with credentials</span></div>

          {/* Form */}
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.field}>
              <label htmlFor="login-email" className={styles.label}>Email address</label>
              <input
                id="login-email"
                type="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                aria-required="true"
              />
            </div>

            <div className={styles.field}>
              <div className={styles.labelRow}>
                <label htmlFor="login-password" className={styles.label}>Password</label>
                <Link href={ROUTES.AUTH.FORGOT_PASSWORD} className={styles.forgotLink}>Forgot password?</Link>
              </div>
              <div className={styles.inputWrap}>
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  aria-required="true"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPw((p) => !p)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <label className={styles.rememberRow}>
              <input type="checkbox" defaultChecked className={styles.checkbox} />
              <span>Keep me signed in for 30 days</span>
            </label>

            <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading} rightIcon={<ArrowRight size={18} />}>
              Sign In
            </Button>
          </form>

          <p className={styles.terms}>
            By signing in you agree to our{' '}
            <Link href="#" className={styles.formLink}>Terms of Service</Link> and{' '}
            <Link href="#" className={styles.formLink}>Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
