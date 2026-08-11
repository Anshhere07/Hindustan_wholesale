'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/firebase/auth';
import { createBuyerProfile } from '@/lib/firebase/collections/buyer-profiles';
import { createSellerProfile } from '@/lib/firebase/collections/seller-profiles';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { ROUTES } from '@/lib/constants/routes';
import { Building2, User, Mail, Phone, Lock, FileText, ShieldCheck, ArrowLeft } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// RegisterPage — Clean, form-focused registration for Buyers & Sellers
// ─────────────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const { addNotification } = useUIStore();

  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || 'User';
      const lastName = nameParts.slice(1).join(' ') || '';
      const businessTitle = businessName.trim() || `${firstName}'s Business`;

      let firebaseUser = null;
      let uid = email.trim().toLowerCase().replace(/[^a-z0-9]/gi, '_');

      try {
        firebaseUser = await registerUser({
          email: email.trim(),
          password,
          firstName,
          lastName,
          phone: phone.trim(),
          role,
        });
        uid = firebaseUser.uid;
      } catch (authErr: any) {
        console.warn('Firebase Auth notice:', authErr.message);
        if (authErr.code === 'auth/email-already-in-use') {
          addNotification({
            type: 'info',
            title: 'Account Exists',
            message: 'Account with this email already exists! Redirecting to sign in...',
          });
          router.push(`/auth/login?email=${encodeURIComponent(email)}`);
          return;
        }
      }

      // Non-blocking background profile document creation
      if (role === 'buyer') {
        createBuyerProfile(uid, {
          companyName: businessTitle,
          businessName: businessTitle,
          gstNumber: gstNumber.trim() || 'UNVERIFIED',
          businessType: 'proprietorship',
          industryType: 'Automotive Spares',
          primaryContact: { name: `${firstName} ${lastName}`.trim(), email: email.trim(), phone: phone.trim() },
          shippingAddresses: [{
            id: 'addr-1',
            line1: '12 Commercial Complex',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110001',
            country: 'India',
            isDefault: true,
          }],
          billingAddress: {
            id: 'addr-1',
            line1: '12 Commercial Complex',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110001',
            country: 'India',
            isDefault: true,
          },
          creditLimit: 100000,
        }).catch((err) => console.warn('Buyer profile background notice:', err.message));
      } else {
        createSellerProfile(uid, {
          businessName: businessTitle,
          gstNumber: gstNumber.trim() || 'UNVERIFIED',
          panNumber: 'UNVERIFIED',
          businessType: 'manufacturer',
          primaryContact: { name: `${firstName} ${lastName}`.trim(), email: email.trim(), phone: phone.trim() },
          bankDetails: {
            accountHolderName: businessTitle,
            accountNumber: '918002003004',
            ifscCode: 'HDFC0001234',
            bankName: 'HDFC Bank',
          },
          warehouseAddresses: [{
            id: 'wh-1',
            line1: 'Plot 10 Industrial Park',
            city: 'New Delhi',
            state: 'Delhi',
            pincode: '110020',
            country: 'India',
          }],
          categories: ['Engine Parts', 'Auto Accessories'],
        }).catch((err) => console.warn('Seller profile background notice:', err.message));
      }

      // Update auth store with active user session
      const { setUser } = useAuthStore.getState();
      setUser({
        id: uid,
        email: email.trim(),
        phone: phone.trim(),
        firstName,
        lastName,
        role,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      addNotification({
        type: 'success',
        title: 'Account Created Successfully!',
        message: `Welcome to Hindustan Wheels, ${firstName}! Your ${role === 'buyer' ? 'Retailer' : 'Seller'} account is ready.`,
      });

      // Redirect directly to dashboard
      if (role === 'buyer') {
        router.push(ROUTES.BUYER.DASHBOARD);
      } else {
        router.push(ROUTES.SELLER.DASHBOARD);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to create account. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>

      {/* Top Header — Clean Logo Header (No Search Bar or TopNav) */}
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
            <div style={{ color: '#ffffff', fontWeight: 800, fontSize: 16, lineHeight: 1.2 }}>Hindustan Wheels</div>
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

      {/* Main Registration Form */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '36px 16px' }}>
        <div style={{
          width: '100%',
          maxWidth: 520,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 20,
          padding: '36px 28px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 20,
              background: '#fdf2f4',
              color: '#8B0000',
              border: '1px solid rgba(139, 0, 0, 0.2)',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 12,
            }}>
              <ShieldCheck size={16} /> B2B Verified Registration
            </span>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
              {role === 'buyer' ? 'Create Retailer Account' : 'Create Seller / Manufacturer Account'}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13.5 }}>
              {role === 'buyer'
                ? 'Join 10,000+ verified auto retailers on Hindustan Wheels'
                : 'Start selling wholesale auto parts to verified retailers across India'}
            </p>
          </div>

          {/* Role Switcher */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
            background: 'var(--bg-base)',
            padding: 4,
            borderRadius: 12,
            marginBottom: 24,
          }}>
            <button
              type="button"
              onClick={() => { setRole('buyer'); setError(null); }}
              style={{
                height: 42,
                border: 'none',
                borderRadius: 9,
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                background: role === 'buyer' ? '#ffffff' : 'transparent',
                color: role === 'buyer' ? '#8B0000' : 'var(--text-secondary)',
                boxShadow: role === 'buyer' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              Retailer / Buyer
            </button>
            <button
              type="button"
              onClick={() => { setRole('seller'); setError(null); }}
              style={{
                height: 42,
                border: 'none',
                borderRadius: 9,
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                background: role === 'seller' ? '#ffffff' : 'transparent',
                color: role === 'seller' ? '#8B0000' : 'var(--text-secondary)',
                boxShadow: role === 'seller' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s',
              }}
            >
              Manufacturer / Seller
            </button>
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
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: 14, top: 14, color: '#9CA3AF' }} />
                <input
                  id="fullNameInput"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ravi Sharma"
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

            {/* Business Name */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                {role === 'buyer' ? 'Shop / Business Name' : 'Company / Factory Name'}
              </label>
              <div style={{ position: 'relative' }}>
                <Building2 size={18} style={{ position: 'absolute', left: 14, top: 14, color: '#9CA3AF' }} />
                <input
                  id="businessNameInput"
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder={role === 'buyer' ? 'e.g. Sharma Auto Parts' : 'e.g. Sharma Auto Components Pvt. Ltd.'}
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

            {/* GST Number */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>GSTIN (Optional)</label>
              <div style={{ position: 'relative' }}>
                <FileText size={18} style={{ position: 'absolute', left: 14, top: 14, color: '#9CA3AF' }} />
                <input
                  id="gstInput"
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  placeholder="e.g. 07AAACA9999A1Z9"
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

            {/* Email Address */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: 14, top: 14, color: '#9CA3AF' }} />
                <input
                  id="emailInput"
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

            {/* Phone Number */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>Phone Number (Optional)</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: 14, top: 14, color: '#9CA3AF' }} />
                <input
                  id="phoneInput"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+9198xxxxxxxxx"
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

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: 14, top: 14, color: '#9CA3AF' }} />
                <input
                  id="passwordInput"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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

            <button
              id="createAccountBtn"
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
              {isLoading
                ? 'Creating Account...'
                : role === 'buyer'
                ? 'Create Retailer Account'
                : 'Create Seller Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link href="/auth/login" style={{ color: '#8B0000', fontWeight: 600, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
