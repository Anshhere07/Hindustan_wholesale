'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/firebase/auth';
import { createBuyerProfile } from '@/lib/firebase/collections/buyer-profiles';
import { createSellerProfile } from '@/lib/firebase/collections/seller-profiles';
import { useUIStore } from '@/stores/ui.store';
import { ROUTES } from '@/lib/constants/routes';
import TopNav from '@/components/layout/TopNav';
import { Building2, User, Mail, Phone, Lock, FileText, CheckCircle, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { addNotification } = useUIStore();

  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [fullName, setFullName] = useState('Aditya Mathur');
  const [businessName, setBusinessName] = useState('Aditya Traders');
  const [gstNumber, setGstNumber] = useState('07AAACA9999A1Z9');
  const [email, setEmail] = useState('adiasfreelancer@gmail.com');
  const [phone, setPhone] = useState('+919876543210');
  const [password, setPassword] = useState('11223344');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || 'Aditya';
      const lastName  = nameParts.slice(1).join(' ') || 'Mathur';

      // 1. Create Firebase Auth user & user doc in Firestore
      const firebaseUser = await registerUser({
        email: email.trim(),
        password,
        firstName,
        lastName,
        phone,
        role,
      });

      // 2. Create role-specific profile in Firestore
      if (role === 'buyer') {
        await createBuyerProfile(firebaseUser.uid, {
          companyName: businessName.trim() || `${firstName}'s Trade`,
          businessName: businessName.trim() || `${firstName}'s Trade`,
          gstNumber: gstNumber.trim() || 'UNVERIFIED',
          businessType: 'proprietorship',
          industryType: 'Automotive Spares',
          primaryContact: { name: `${firstName} ${lastName}`, email, phone },
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
        });
      } else {
        await createSellerProfile(firebaseUser.uid, {
          businessName: businessName.trim(),
          gstNumber: gstNumber.trim() || '07AAAGA1234F1Z1',
          panNumber: 'AAAGA1234F',
          businessType: 'manufacturer',
          primaryContact: { name: `${firstName} ${lastName}`, email, phone },
          bankDetails: {
            accountHolderName: businessName,
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
        });
      }

      addNotification({
        type: 'success',
        title: 'Account Created Successfully!',
        message: `Welcome to Hindustan Wheels, ${firstName}! Your ${role === 'buyer' ? 'Retailer' : 'Seller'} account is ready.`,
      });

      // Save email for OTP / session state
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('hw-otp-email', email);
      }

      // Redirect to target dashboard
      if (role === 'buyer') {
        router.push(ROUTES.BUYER.DASHBOARD);
      } else {
        router.push(ROUTES.SELLER.DASHBOARD);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      // If user already exists in Auth, still attempt to log them in or display notification
      if (err.code === 'auth/email-already-in-use') {
        addNotification({
          type: 'info',
          title: 'Account Exists',
          message: 'Account with this email already exists! Redirecting to login...',
        });
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('hw-otp-email', email);
        }
        router.push(`/auth/login?email=${encodeURIComponent(email)}`);
      } else {
        setError(err.message || 'Failed to create account. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      <TopNav />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{
          width: '100%',
          maxWidth: 520,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 20,
          padding: '40px 32px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 20,
              background: '#EFF6FF',
              color: '#2563EB',
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 12,
            }}>
              <ShieldCheck size={16} /> B2B Verified Registration
            </span>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Create Retailer Account</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Join 10,000+ verified auto retailers on Hindustan Wheels</p>
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
              onClick={() => setRole('buyer')}
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
              onClick={() => setRole('seller')}
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
                  placeholder="e.g. Aditya Mathur"
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
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>Business Name</label>
              <div style={{ position: 'relative' }}>
                <Building2 size={18} style={{ position: 'absolute', left: 14, top: 14, color: '#9CA3AF' }} />
                <input
                  id="businessNameInput"
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Aditya Traders"
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
                  placeholder="adiasfreelancer@gmail.com"
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
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: 14, top: 14, color: '#9CA3AF' }} />
                <input
                  id="phoneInput"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+919876543210"
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
              {isLoading ? 'Creating Retailer Account...' : 'Create Account'}
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
