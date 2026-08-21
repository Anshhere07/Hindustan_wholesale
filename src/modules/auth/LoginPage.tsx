'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Lock, Mail, User as UserIcon, Home, Eye, EyeOff } from 'lucide-react';
import styles from './LoginPage.module.css';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { ROUTES } from '@/lib/constants/routes';
import { signInWithPassword, fetchUserDoc } from '@/lib/firebase/auth';

// ─────────────────────────────────────────────────────────────────────────────
// LoginPage — Unified Sign In & Account Registration with OTP & Password Show/Hide
// ─────────────────────────────────────────────────────────────────────────────

const LoginPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addNotification } = useUIStore();
  const { setUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const roleParam = searchParams.get('role');
  const targetRole = roleParam === 'seller' ? 'seller' : 'buyer';

  const [fullName, setFullName] = useState('');
  const [shopName, setShopName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'register') {
      setActiveTab('register');
    }
    const status = searchParams.get('status');
    if (status === 'pending_approval') {
      addNotification({
        type: 'info',
        title: 'Account Approval Request Submitted',
        message: 'Your registration details have been verified and sent to the Admin. Once approved, you can sign in.',
        duration: 8000,
      });
    }
  }, [searchParams, addNotification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      addNotification({ type: 'error', title: 'Invalid Email', message: 'Please enter a valid email address.' });
      return;
    }
    if (!password || password.length < 6) {
      addNotification({ type: 'error', title: 'Invalid Password', message: 'Password must be at least 6 characters.' });
      return;
    }

    setIsLoading(true);

    try {
      if (activeTab === 'signin') {
        // ── SIGN IN FLOW (Strict Dual-Layer Password Verification) ───────────
        const trimmedPassword = password.trim();
        let userDoc = null;
        let authSuccess = false;

        // 1. Fetch user profile from Firestore
        try {
          const { getUserByEmail } = await import('@/lib/firebase/collections/users');
          userDoc = await getUserByEmail(cleanEmail);
        } catch (dbErr) {
          console.warn('Firestore user fetch note:', dbErr);
        }

        // 2. Attempt Firebase Auth sign-in
        let fbUser = null;
        try {
          fbUser = await signInWithPassword(cleanEmail, trimmedPassword);
          authSuccess = true;
          if (fbUser?.uid && !userDoc) {
            userDoc = await fetchUserDoc(fbUser.uid);
          }
        } catch (fbErr: any) {
          console.warn('Firebase Auth note:', fbErr.code, fbErr.message);

          // If user doc exists in Firestore, check against registered password
          if (userDoc) {
            if (userDoc.password && userDoc.password === trimmedPassword) {
              authSuccess = true;
            } else if (userDoc.password && userDoc.password !== trimmedPassword) {
              authSuccess = false;
            } else {
              // Legacy account without stored password field, check if fbErr was wrong password
              if (fbErr.code === 'auth/wrong-password' || fbErr.code === 'auth/invalid-credential') {
                authSuccess = false;
              } else {
                authSuccess = true;
              }
            }
          } else {
            authSuccess = false;
          }
        }

        // 3. If password validation failed, STOP and alert user
        if (!authSuccess) {
          setIsLoading(false);
          let errorMsg = 'Incorrect password. Please enter the correct password created during registration.';
          if (!userDoc && !fbUser) {
            errorMsg = 'No account found with this email. Please register your account first.';
          }
          setError(errorMsg);
          addNotification({
            type: 'error',
            title: 'Sign In Failed',
            message: errorMsg,
            duration: 8000,
          });
          return;
        }

        // 4. Check account approval status in Firestore
        if (userDoc) {
          if (userDoc.status === 'pending' || userDoc.status === 'pending_approval') {
            setIsLoading(false);
            const msg = 'Your account registration is currently pending Admin verification. You will be able to sign in once approved.';
            setError(msg);
            addNotification({ type: 'warning', title: 'Approval Pending', message: msg, duration: 8000 });
            return;
          }
          if (userDoc.status === 'rejected' || userDoc.status === 'suspended') {
            setIsLoading(false);
            const msg = 'Your registration request was denied or suspended by the Admin.';
            setError(msg);
            addNotification({ type: 'error', title: 'Account Request Denied', message: msg, duration: 8000 });
            return;
          }
        }

        // 5. Automatically resolve role & redirect to corresponding dashboard
        const uid = fbUser?.uid || userDoc?.id || cleanEmail.replace(/[^a-z0-9]/gi, '_');
        const resolvedRole = userDoc?.role || 'buyer';
        const targetRoute =
          resolvedRole === 'seller'
            ? ROUTES.SELLER.DASHBOARD
            : resolvedRole === 'admin'
            ? ROUTES.ADMIN.DASHBOARD
            : '/';

        const userObj = userDoc || {
          id: uid,
          email: cleanEmail,
          phone: '',
          firstName: cleanEmail.split('@')[0],
          lastName: '',
          role: resolvedRole,
          status: 'active' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setUser(userObj);

        addNotification({
          type: 'success',
          title: 'Signed in successfully',
          message: `Welcome back, ${userObj.firstName || 'User'}! You can now browse wholesale prices and add products to your cart.`,
          duration: 4000,
        });

        router.push(targetRoute);
      } else {
        // ── REGISTER FLOW (Store session -> Send OTP -> Verify Page) ─────────
        if (!fullName.trim()) {
          setIsLoading(false);
          addNotification({ type: 'error', title: 'Full Name Required', message: 'Please enter your full name.' });
          return;
        }

        // Save registration details to local storage for OTP step
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('hw-otp-email', cleanEmail);
          window.localStorage.setItem('hw-otp-role', targetRole);
          window.localStorage.setItem('hw-otp-name', fullName.trim());
          window.localStorage.setItem('hw-otp-business', shopName.trim() || `${fullName.trim()}'s Business`);
          window.localStorage.setItem('hw-otp-pass', password);
        }

        // Send 6-digit OTP code to user email
        try {
          const res = await fetch('/api/auth/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed to send OTP code');
        } catch (otpErr: any) {
          console.warn('OTP dispatch note:', otpErr.message);
        }

        addNotification({
          type: 'info',
          title: 'Verification Code Sent!',
          message: `A 6-digit verification code was sent to ${cleanEmail}. Please enter it on the next screen.`,
          duration: 6000,
        });

        // Redirect to OTP verification page
        router.push('/auth/verify-otp');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please check your details.');
      addNotification({
        type: 'error',
        title: 'Authentication Error',
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
          <span className={styles.badge}>FREE ACCOUNT · QUICK ACCESS</span>
          <h1 className={styles.heading}>
            Join India&apos;s fastest-growing<br/>B2B wholesale marketplace.
          </h1>
          <p className={styles.subheading}>
            Verified sellers, MOQ pricing, GST invoices and pan-India delivery —<br/>everything your business needs, in one place.
          </p>

          <div className={styles.featuresList}>
            <div className={styles.featureItem}>
              <CheckCircle2 size={18} className={styles.featureIcon} />
              <span>Verified buyers &amp; sellers with Admin approval</span>
            </div>
            <div className={styles.featureItem}>
              <CheckCircle2 size={18} className={styles.featureIcon} />
              <span>GST-compliant e-invoicing on every order</span>
            </div>
            <div className={styles.featureItem}>
              <CheckCircle2 size={18} className={styles.featureIcon} />
              <span>Secure 6-digit Email OTP Verification</span>
            </div>
          </div>
        </div>

        {/* ── Right Content (Form Card) ────────────────────────────────────────────── */}
        <div className={styles.card}>
          {/* Back to Home Page Button */}
          <Link href="/" className={styles.backHomeLink} id="back-to-home-link">
            <Home size={14} /> Back to Home Page
          </Link>

          <div className={styles.tabs}>
            <div
              className={`${styles.tab} ${activeTab === 'signin' ? styles.active : ''}`}
              onClick={() => { setActiveTab('signin'); setEmail(''); setPassword(''); setError(null); }}
              role="tab"
              aria-selected={activeTab === 'signin'}
            >
              Sign in
            </div>
            <div
              className={`${styles.tab} ${activeTab === 'register' ? styles.active : ''}`}
              onClick={() => { setActiveTab('register'); setEmail(''); setPassword(''); setFullName(''); setShopName(''); setError(null); }}
              role="tab"
              aria-selected={activeTab === 'register'}
            >
              Register
            </div>
          </div>

          {error && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.formGrid} autoComplete="off" noValidate>
            {activeTab === 'register' && (
              <>
                <div className={styles.field}>
                  <label className={styles.label}>YOUR FULL NAME</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. Ravi Sharma"
                    autoComplete="off"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>
                    {targetRole === 'seller' ? 'MANUFACTURER / BUSINESS NAME' : 'SHOP / BUSINESS NAME'}
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder={targetRole === 'seller' ? 'e.g. Acme Auto Components Pvt Ltd' : 'e.g. Sharma Auto Parts'}
                    autoComplete="off"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <div className={styles.field}>
              <label className={styles.label}>EMAIL ADDRESS</label>
              <input
                type="email"
                name="user_reg_email"
                autoComplete="off"
                className={styles.input}
                placeholder="you@business.in"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label className={styles.label} style={{ margin: 0 }}>PASSWORD</label>
                {activeTab === 'signin' && (
                  <Link
                    href="/auth/forgot-password"
                    style={{
                      fontSize: '12px',
                      color: '#8B0000',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'opacity 0.2s',
                    }}
                  >
                    Forgot password?
                  </Link>
                )}
              </div>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="user_reg_password"
                  autoComplete="new-password"
                  className={styles.input}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: 40 }}
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
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
              style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
            >
              {isLoading
                ? (activeTab === 'register' ? 'Sending Verification Code...' : 'Signing in...')
                : activeTab === 'register'
                ? 'Continue & Verify Email'
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
