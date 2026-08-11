'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useUIStore } from '@/stores/ui.store';
import { User, Mail, Phone, Shield, Edit2, Save, X, CheckCircle } from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Shared Profile Page — reads & writes live to Firebase Firestore
// Used in both /buyer/profile and /seller/profile
// ─────────────────────────────────────────────────────────────────────────────

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  businessName?: string;
  gstNumber?: string;
  pincode?: string;
  city?: string;
  state?: string;
}

interface UserProfileFormProps {
  portalType: 'buyer' | 'seller';
}

export default function UserProfileForm({ portalType }: UserProfileFormProps) {
  const { user, setUser } = useAuthStore();
  const { addNotification } = useUIStore();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileData>({
    firstName: '', lastName: '', email: '', phone: '',
    role: portalType, status: 'active',
    businessName: '', gstNumber: '', pincode: '', city: '', state: '',
  });

  // Load from Firestore on mount
  useEffect(() => {
    async function load() {
      if (!user?.id) return;
      try {
        const snap = await getDoc(doc(db, 'users', user.id));
        if (snap.exists()) {
          const data = snap.data();
          setForm((prev) => ({
            ...prev,
            firstName: data.firstName || user.firstName || '',
            lastName: data.lastName || user.lastName || '',
            email: data.email || user.email || '',
            phone: data.phone || user.phone || '',
            role: data.role || portalType,
            status: data.status || 'active',
            businessName: data.businessName || '',
            gstNumber: data.gstNumber || '',
            pincode: data.pincode || '',
            city: data.city || '',
            state: data.state || '',
          }));
        } else {
          // Fallback to local store values
          setForm((prev) => ({
            ...prev,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
          }));
        }
      } catch (err) {
        console.error('Failed to load profile from Firestore:', err);
        setForm((prev) => ({
          ...prev,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
        }));
      }
    }
    load();
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.id), {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        businessName: form.businessName?.trim() || '',
        gstNumber: form.gstNumber?.trim() || '',
        pincode: form.pincode?.trim() || '',
        city: form.city?.trim() || '',
        state: form.state?.trim() || '',
        updatedAt: serverTimestamp(),
      });
      // Update local auth store so TopNav immediately reflects new name
      setUser({
        ...user,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
      });
      addNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile details have been saved successfully.',
      });
      setEditing(false);
    } catch (err: any) {
      console.error('Profile save error:', err);
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Could not save profile. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 44, border: '1.5px solid var(--border-default)',
    borderRadius: 10, padding: '0 14px', fontSize: 14, boxSizing: 'border-box',
    outline: 'none', background: editing ? 'var(--bg-base)' : 'var(--bg-surface)',
    color: 'var(--text-primary)',
  };

  const readonlyInputStyle: React.CSSProperties = {
    ...inputStyle,
    background: '#f5f5f5',
    color: 'var(--text-secondary)',
    cursor: 'not-allowed',
  };

  const avatarInitials = `${form.firstName?.[0] || ''}${form.lastName?.[0] || ''}`.toUpperCase() || form.email?.[0]?.toUpperCase() || 'U';

  return (
    <div style={{ padding: '32px 24px', maxWidth: 760, margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <User size={22} style={{ color: '#8B0000' }} />
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            {portalType === 'seller' ? 'Business Profile' : 'My Profile'}
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          View and manage your account information. All data is securely stored in Firebase.
        </p>
      </div>

      {/* Profile Card */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 20,
        padding: '32px 28px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
      }}>
        {/* Avatar & Name Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, #8B0000, #D4AF37)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 26, fontWeight: 800, flexShrink: 0,
          }}>
            {avatarInitials}
          </div>
          <div>
            <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
              {form.firstName} {form.lastName}
            </p>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
              {form.email}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#10B981', fontWeight: 600 }}>
              <CheckCircle size={13} /> Verified {form.role === 'seller' ? 'Seller' : 'Buyer'} Account
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                  background: 'linear-gradient(135deg, #8B0000, #60020B)',
                  color: '#fff', border: 'none', cursor: 'pointer',
                  boxShadow: '0 3px 10px rgba(139,0,0,0.25)',
                }}
              >
                <Edit2 size={14} /> Edit Profile
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setEditing(false)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                    background: 'var(--bg-base)', color: 'var(--text-secondary)',
                    border: '1.5px solid var(--border-default)', cursor: 'pointer',
                  }}
                >
                  <X size={14} /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                    background: '#10B981', color: '#fff',
                    border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1,
                    boxShadow: '0 3px 10px rgba(16,185,129,0.25)',
                  }}
                >
                  <Save size={14} /> {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Form Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Personal Information */}
          <div>
            <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 16 }}>
              Personal Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>First Name</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                  readOnly={!editing}
                  style={editing ? inputStyle : readonlyInputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Last Name</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                  readOnly={!editing}
                  style={editing ? inputStyle : readonlyInputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    value={form.email}
                    readOnly
                    style={{ ...readonlyInputStyle, paddingRight: 44 }}
                  />
                  <Mail size={15} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3 }}>Email cannot be changed here</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Mobile Number</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    readOnly={!editing}
                    placeholder="+91 98765 43210"
                    style={{ ...(editing ? inputStyle : readonlyInputStyle), paddingRight: 44 }}
                  />
                  <Phone size={15} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Business Information (Seller-specific) */}
          {portalType === 'seller' && (
            <div>
              <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 16 }}>
                Business Information
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Business / Company Name</label>
                  <input
                    type="text"
                    value={form.businessName}
                    onChange={(e) => setForm((p) => ({ ...p, businessName: e.target.value }))}
                    readOnly={!editing}
                    placeholder="AutoParts Direct Pvt Ltd"
                    style={editing ? inputStyle : readonlyInputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>GST Number</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={form.gstNumber}
                      onChange={(e) => setForm((p) => ({ ...p, gstNumber: e.target.value }))}
                      readOnly={!editing}
                      placeholder="27AAACR5055K1ZS"
                      style={{ ...(editing ? inputStyle : readonlyInputStyle), paddingRight: 44 }}
                    />
                    <Shield size={15} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                    readOnly={!editing}
                    placeholder="Mumbai"
                    style={editing ? inputStyle : readonlyInputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>State</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                    readOnly={!editing}
                    placeholder="Maharashtra"
                    style={editing ? inputStyle : readonlyInputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Pincode</label>
                  <input
                    type="text"
                    value={form.pincode}
                    onChange={(e) => setForm((p) => ({ ...p, pincode: e.target.value }))}
                    readOnly={!editing}
                    placeholder="400001"
                    style={editing ? inputStyle : readonlyInputStyle}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Delivery Address (Buyer-specific) */}
          {portalType === 'buyer' && (
            <div>
              <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 16 }}>
                Delivery Address
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div style={{ gridColumn: 'span 3' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Business / Shop Name</label>
                  <input
                    type="text"
                    value={form.businessName}
                    onChange={(e) => setForm((p) => ({ ...p, businessName: e.target.value }))}
                    readOnly={!editing}
                    placeholder="Sri Ram Auto Works"
                    style={editing ? inputStyle : readonlyInputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                    readOnly={!editing}
                    placeholder="Chennai"
                    style={editing ? inputStyle : readonlyInputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>State</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                    readOnly={!editing}
                    placeholder="Tamil Nadu"
                    style={editing ? inputStyle : readonlyInputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Pincode</label>
                  <input
                    type="text"
                    value={form.pincode}
                    onChange={(e) => setForm((p) => ({ ...p, pincode: e.target.value }))}
                    readOnly={!editing}
                    placeholder="600001"
                    style={editing ? inputStyle : readonlyInputStyle}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Account Status */}
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
            border: '1px solid #86efac',
            borderRadius: 14,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}>
            <CheckCircle size={22} style={{ color: '#16a34a', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#166534', marginBottom: 2 }}>Account Active & Verified</p>
              <p style={{ fontSize: 12, color: '#16a34a' }}>
                Logged in as <strong>{form.email}</strong> · Role: <strong>{form.role}</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
