'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Store, Building2 } from 'lucide-react';
import styles from './LoginPage.module.css';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { ROUTES } from '@/lib/constants/routes';

const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('register');
  const [activeRole, setActiveRole] = useState<'retailer' | 'seller'>('retailer');
  
  const [fullName, setFullName] = useState('');
  const [shopName, setShopName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');

  const { loginAsBuyer, loginAsSeller } = useAuthStore();
  const { addNotification } = useUIStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeRole === 'retailer') {
      loginAsBuyer();
      addNotification({ type: 'success', title: 'Welcome Retailer!' });
      window.location.href = ROUTES.BUYER.DASHBOARD;
    } else {
      loginAsSeller();
      addNotification({ type: 'success', title: 'Welcome Seller!' });
      window.location.href = ROUTES.SELLER.DASHBOARD;
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
              <span>Seller onboarding & KYC in under 5 minutes</span>
            </div>
          </div>
        </div>

        {/* ── Right Content (Form Card) ────────────────────────────────────────────── */}
        <div className={styles.card}>
          <div className={styles.tabs}>
            <div 
              className={`${styles.tab} ${activeTab === 'signin' ? styles.active : ''}`}
              onClick={() => setActiveTab('signin')}
            >
              Sign in
            </div>
            <div 
              className={`${styles.tab} ${activeTab === 'register' ? styles.active : ''}`}
              onClick={() => setActiveTab('register')}
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

          <form onSubmit={handleSubmit} className={styles.formGrid}>
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
                  <label className={styles.label}>SHOP NAME</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    placeholder="e.g. Sharma Kirana" 
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

            <button type="submit" className={styles.submitBtn}>
              {activeTab === 'register' ? 'Send registration code' : 'Sign in to account'}
            </button>
          </form>

          <div className={styles.disclaimer}>
            By continuing you agree to our <Link href="#">Terms</Link> & <Link href="#">Privacy Policy</Link>.
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
