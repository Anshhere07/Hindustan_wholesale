'use client';

import React, { useState, useEffect } from 'react';
import {
  Store, CheckCircle, XCircle, Eye, Edit3, Save, X, Search, ShieldCheck, Clock
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useUIStore } from '@/stores/ui.store';
import { getUsersByRole, updateUser } from '@/lib/firebase/collections/users';
import { getSellerProfile, updateSellerProfile } from '@/lib/firebase/collections/seller-profiles';
import type { UserProfile, SellerProfile } from '@/types/user.types';

export default function AdminSellersPage() {
  const { addNotification } = useUIStore();
  const [sellers, setSellers] = useState<UserProfile[]>([]);
  const [profiles, setProfiles] = useState<Record<string, SellerProfile>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [viewSeller, setViewSeller] = useState<UserProfile | null>(null);
  const [editSeller, setEditSeller] = useState<{ user: UserProfile; profile?: SellerProfile } | null>(null);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', phone: '', businessName: '', gstNumber: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const sellerUsers = await getUsersByRole('seller');
      setSellers(sellerUsers);
      
      const profMap: Record<string, SellerProfile> = {};
      for (const u of sellerUsers) {
        const p = await getSellerProfile(u.id);
        if (p) profMap[u.id] = p;
      }
      setProfiles(profMap);
    } catch (err) {
      console.error('Error loading seller data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (user: UserProfile) => {
    try {
      await updateUser(user.id, { status: 'active' });
      if (profiles[user.id]) {
        await updateSellerProfile(user.id, { approvalStatus: 'approved' });
      }
      setSellers((prev) => prev.map((s) => (s.id === user.id ? { ...s, status: 'active' } : s)));
      addNotification({
        type: 'success',
        title: 'Seller Account Approved!',
        message: `Notification sent to seller (${user.email}). Account is now active.`,
      });
    } catch (err: any) {
      addNotification({ type: 'error', title: 'Approval Failed', message: err.message });
    }
  };

  const handleReject = async (user: UserProfile) => {
    try {
      await updateUser(user.id, { status: 'suspended' });
      if (profiles[user.id]) {
        await updateSellerProfile(user.id, { approvalStatus: 'rejected' });
      }
      setSellers((prev) => prev.map((s) => (s.id === user.id ? { ...s, status: 'suspended' } : s)));
      addNotification({
        type: 'warning',
        title: 'Seller Account Rejected',
        message: `Seller account (${user.email}) has been rejected/suspended.`,
      });
    } catch (err: any) {
      addNotification({ type: 'error', title: 'Action Failed', message: err.message });
    }
  };

  const handleSaveEdit = async () => {
    if (!editSeller) return;
    try {
      const uid = editSeller.user.id;
      await updateUser(uid, {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone,
      });
      if (profiles[uid]) {
        await updateSellerProfile(uid, {
          businessName: editForm.businessName,
          gstNumber: editForm.gstNumber,
        });
      }
      addNotification({
        type: 'success',
        title: 'Seller Details Updated',
        message: `Seller details for ${editForm.firstName} updated successfully.`,
      });
      setEditSeller(null);
      loadData();
    } catch (err: any) {
      addNotification({ type: 'error', title: 'Update Failed', message: err.message });
    }
  };

  const filteredSellers = sellers.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    (profiles[s.id]?.businessName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#8B0000', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            <Store size={14} /> Seller Management
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Seller Requests & Accounts
          </h1>
        </div>

        <div style={{ position: 'relative', width: 280 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#9CA3AF' }} />
          <input
            type="text"
            placeholder="Search seller name, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              height: 40,
              paddingLeft: 36,
              paddingRight: 12,
              borderRadius: 10,
              border: '1px solid var(--border-default)',
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading seller accounts...</div>
      ) : filteredSellers.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', background: '#fff', borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14 }}>No seller registrations found matching your query.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Seller / Company</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Email & Contact</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>GSTIN</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSellers.map((seller) => {
                const prof = profiles[seller.id];
                const isPending = seller.status === 'pending';
                return (
                  <tr key={seller.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{prof?.businessName || `${seller.firstName} ${seller.lastName}`}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Owner: {seller.firstName} {seller.lastName}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div>{seller.email}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{seller.phone || 'No phone'}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontFamily: 'monospace', background: '#f3f4f6', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>
                        {prof?.gstNumber || 'UNVERIFIED'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <Badge variant={seller.status === 'active' ? 'success' : isPending ? 'warning' : 'danger'} size="sm">
                        {seller.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <Button
                          variant="ghost"
                          size="xs"
                          leftIcon={<Eye size={12} />}
                          onClick={() => setViewSeller(seller)}
                        >
                          View
                        </Button>
                        <Button
                          variant="secondary"
                          size="xs"
                          leftIcon={<Edit3 size={12} />}
                          onClick={() => {
                            setEditSeller({ user: seller, profile: prof });
                            setEditForm({
                              firstName: seller.firstName,
                              lastName: seller.lastName,
                              phone: seller.phone || '',
                              businessName: prof?.businessName || '',
                              gstNumber: prof?.gstNumber || '',
                            });
                          }}
                        >
                          Edit
                        </Button>
                        {isPending && (
                          <Button
                            variant="primary"
                            size="xs"
                            leftIcon={<CheckCircle size={12} />}
                            onClick={() => handleApprove(seller)}
                          >
                            Approve
                          </Button>
                        )}
                        {seller.status !== 'suspended' && (
                          <Button
                            variant="danger"
                            size="xs"
                            leftIcon={<XCircle size={12} />}
                            onClick={() => handleReject(seller)}
                          >
                            Reject
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* View Modal */}
      {viewSeller && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Seller Account Details</h3>
              <button onClick={() => setViewSeller(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
              <div><strong>Name:</strong> {viewSeller.firstName} {viewSeller.lastName}</div>
              <div><strong>Email:</strong> {viewSeller.email}</div>
              <div><strong>Phone:</strong> {viewSeller.phone || 'N/A'}</div>
              <div><strong>Business Name:</strong> {profiles[viewSeller.id]?.businessName || 'N/A'}</div>
              <div><strong>GSTIN:</strong> {profiles[viewSeller.id]?.gstNumber || 'N/A'}</div>
              <div><strong>Account Status:</strong> <Badge variant={viewSeller.status === 'active' ? 'success' : 'warning'}>{viewSeller.status}</Badge></div>
              <div><strong>Created At:</strong> {viewSeller.createdAt ? new Date(viewSeller.createdAt).toLocaleDateString() : 'N/A'}</div>
            </div>
            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <Button variant="secondary" onClick={() => setViewSeller(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editSeller && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Edit Seller Details</h3>
              <button onClick={() => setEditSeller(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>First Name</label>
                <input type="text" value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-default)' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Last Name</label>
                <input type="text" value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-default)' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Phone</label>
                <input type="text" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-default)' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Business Name</label>
                <input type="text" value={editForm.businessName} onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-default)' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>GSTIN</label>
                <input type="text" value={editForm.gstNumber} onChange={(e) => setEditForm({ ...editForm, gstNumber: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-default)' }} />
              </div>
            </div>
            <div style={{ marginTop: 20, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setEditSeller(null)}>Cancel</Button>
              <Button variant="primary" leftIcon={<Save size={14} />} onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
