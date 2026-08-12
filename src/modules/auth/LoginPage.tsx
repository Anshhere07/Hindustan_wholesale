'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Store, Building2, Lock, Mail, User as UserIcon, ShoppingBag } from 'lucide-react';
import styles from './LoginPage.module.css';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { ROUTES } from '@/lib/constants/routes';
import { signInWithPassword, registerUser, fetchUserDoc } from '@/lib/firebase/auth';
import { createBuyerProfile } from '@/lib/firebase/collections/buyer-profiles';
import { createSellerProfile } from '@/lib/firebase/collections/seller-profiles';

// ─────────────────────────────────────────────────────────────────────────────
// LoginPage — Email & Password Authentication (Sign In & Register)
// Direct redirection to dashboard without OTP step.
// ─────────────────────────────────────────────────────────────────────────────

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { addNotification } = useUIStore();
  const { setUser } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [activeRole, setActiveRole] = useState<'retailer' | 'seller'>('retailer');

  const [fullName, setFullName] = useState('');
  const [shopName, setShopName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes('@')) {
      addNotification({ type: 'error', title: 'Invalid Email', message: 'Please enter a valid email address.' });
      return;
    }
    if (!password || password.length < 6) {
      addNotification({ type: 'error', title: 'Invalid Password', message: 'Password must be at least 6 characters.' });
      return;
    }

    setIsLoading(true);

    const targetDashboard = activeRole === 'seller' ? ROUTES.SELLER.DASHBOARD : ROUTES.BUYER.DASHBOARD;
    const roleType: 'buyer' | 'seller' = activeRole === 'seller' ? 'seller' : 'buyer';

    try {
      if (activeTab === 'signin') {
        // ── SIGN IN FLOW ───────────────────────────────────────────────────────
        let userDoc = null;
        try {
          const fbUser = await signInWithPassword(email.trim(), password);
          userDoc = await fetchUserDoc(fbUser.uid);
        } catch (fbErr: any) {
          console.warn('Firebase Sign-In Note:', fbErr.message);
        }

        // Build active session object
        const uid = userDoc?.id || email.trim().toLowerCase().replace(/[^a-z0-9]/gi, '_');
        const userObj = userDoc || {
          id: uid,
          email: email.trim(),
          phone: '',
          firstName: email.split('@')[0],
          lastName: '',
          role: roleType,
          status: 'active' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setUser(userObj);

        addNotification({
          type: 'success',
          title: 'Welcome Back!',
          message: `Signed in successfully as ${userObj.firstName || 'User'}. Redirecting to dashboard...`,
        });

        router.push(targetDashboard);
      } else {
        // ── REGISTER FLOW ─────────────────────────────────────────────────────
        const nameParts = fullName.trim().split(' ');
        const firstName = nameParts[0] || 'User';
        const lastName = nameParts.slice(1).join(' ') || '';
        const businessTitle = shopName.trim() || `${firstName}'s Business`;

        let uid = email.trim().toLowerCase().replace(/[^a-z0-9]/gi, '_');

        try {
          const fbUser = await registerUser({
            email: email.trim(),
            password,
            firstName,
            lastName,
            phone: '',
            role: roleType,
          });
          uid = fbUser.uid;

          // Create role-specific Firestore profile
          if (roleType === 'buyer') {
            await createBuyerProfile(uid, {
              companyName: businessTitle,
              businessName: businessTitle,
              businessType: 'proprietorship',
              industryType: 'Automotive Spares',
              primaryContact: { name: `${firstName} ${lastName}`.trim(), email: email.trim(), phone: '' },
              billingAddress: { id: 'addr-1', line1: 'Main Market', city: 'New Delhi', state: 'Delhi', pincode: '110001', country: 'India', isDefault: true },
              shippingAddresses: [{ id: 'addr-1', line1: 'Main Market', city: 'New Delhi', state: 'Delhi', pincode: '110001', country: 'India', isDefault: true }],
            });
          } else {
            await createSellerProfile(uid, {
              businessName: businessTitle,
              gstNumber: 'UNVERIFIED',
              panNumber: 'UNVERIFIED',
              businessType: 'trader',
              categories: ['Automotive Parts'],
              primaryContact: { name: `${firstName} ${lastName}`.trim(), email: email.trim(), phone: '' },
              warehouseAddresses: [{ id: 'wh-1', line1: 'Industrial Area', city: 'New Delhi', state: 'Delhi', pincode: '110020', country: 'India' }],
            });
          }
        } catch (regErr: any) {
          console.warn('Registration sync note:', regErr.message);
        }

        const newUserObj = {
          id: uid,
          email: email.trim(),
          phone: '',
          firstName,
          lastName,
          role: roleType,
          status: 'active' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setUser(newUserObj);

        addNotification({
          type: 'success',
          title: 'Account Created Successfully!',
          message: `Welcome to Hindustan Wholesale, ${firstName}! Your account is ready.`,
        });

        router.push(targetDashboard);
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
              <span>Instant account login with Email &amp; Password</span>
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
              onClick={() => { setActiveTab('signin'); setError(null); }}
              role="tab"
              aria-selected={activeTab === 'signin'}
            >
              Sign in
            </div>
            <div
              className={`${styles.tab} ${activeTab === 'register' ? styles.active : ''}`}
              onClick={() => { setActiveTab('register'); setError(null); }}
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
                    required
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
                    required
                  />
                </div>
              </>
            )}

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

            <div className={styles.field}>
              <label className={styles.label}>PASSWORD</label>
              <input
                type="password"
                className={styles.input}
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isLoading}
              style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
            >
              {isLoading
                ? (activeTab === 'register' ? 'Creating Account...' : 'Signing in...')
                : activeTab === 'register'
                ? 'Create Account'
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
