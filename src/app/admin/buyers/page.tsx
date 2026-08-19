'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import {
  Users, CheckCircle, XCircle, Eye, Edit3, Save, X, Search, AlertCircle, Trash2
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useUIStore } from '@/stores/ui.store';
import { getUsersByRole, updateUser, deleteUser } from '@/lib/firebase/collections/users';
import { getBuyerProfile, updateBuyerProfile } from '@/lib/firebase/collections/buyer-profiles';
import type { UserProfile, BuyerProfile } from '@/types/user.types';

// ─────────────────────────────────────────────────────────────────────────────
// Admin Buyers Page — view, edit, approve, & reject buyer account requests
// Responsive UI, live Firestore state sync & instant status transition
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminBuyersPage() {
  const { addNotification } = useUIStore();
  const [buyers, setBuyers] = useState<UserProfile[]>([]);
  const [profiles, setProfiles] = useState<Record<string, BuyerProfile>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState<'all' | 'pending' | 'active' | 'rejected'>('all');

  // Modal states
  const [viewBuyer, setViewBuyer] = useState<UserProfile | null>(null);
  const [editBuyer, setEditBuyer] = useState<{ user: UserProfile; profile?: BuyerProfile } | null>(null);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', phone: '', companyName: '', gstNumber: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const buyerUsers = await getUsersByRole('buyer');
      setBuyers(buyerUsers);

      const profMap: Record<string, BuyerProfile> = {};
      for (const u of buyerUsers) {
        const p = await getBuyerProfile(u.id, u.email);
        if (p) profMap[u.id] = p;
      }
      setProfiles(profMap);
    } catch (err) {
      console.error('Error loading buyer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (user: UserProfile) => {
    if (!window.confirm(`Are you sure you want to permanently delete buyer account "${user.email}"?`)) {
      return;
    }
    try {
      const emailUid = user.email.replace(/[^a-z0-9]/gi, '_');
      await deleteUser(user.id);
      await deleteUser(emailUid).catch(() => {});

      setBuyers((prev) => prev.filter((b) => b.id !== user.id && b.email !== user.email));
      setProfiles((prev) => {
        const next = { ...prev };
        delete next[user.id];
        delete next[emailUid];
        return next;
      });

      addNotification({
        type: 'success',
        title: 'Buyer Account Deleted',
        message: `Buyer account (${user.email}) has been permanently deleted.`,
        duration: 5000,
      });
    } catch (err: any) {
      addNotification({ type: 'error', title: 'Delete Failed', message: err.message });
    }
  };

  const handleApprove = async (user: UserProfile) => {
    try {
      const emailUid = user.email.replace(/[^a-z0-9]/gi, '_');
      await updateUser(user.id, { status: 'active' });
      await updateUser(emailUid, { status: 'active' }).catch(() => {});

      if (profiles[user.id]) {
        await updateBuyerProfile(user.id, { kycVerified: true }).catch(() => {});
      }

      setBuyers((prev) => prev.map((b) => (b.id === user.id || b.email === user.email ? { ...b, status: 'active' } : b)));

      addNotification({
        type: 'success',
        title: 'Buyer Account Approved!',
        message: `Buyer account (${user.email}) approved. Status updated to APPROVED. User can now sign in.`,
        duration: 6000,
      });
    } catch (err: any) {
      addNotification({ type: 'error', title: 'Approval Failed', message: err.message });
    }
  };

  const handleReject = async (user: UserProfile) => {
    try {
      const emailUid = user.email.replace(/[^a-z0-9]/gi, '_');
      await updateUser(user.id, { status: 'rejected' });
      await updateUser(emailUid, { status: 'rejected' }).catch(() => {});

      setBuyers((prev) => prev.map((b) => (b.id === user.id || b.email === user.email ? { ...b, status: 'rejected' } : b)));

      addNotification({
        type: 'warning',
        title: 'Buyer Request Denied',
        message: `Buyer request (${user.email}) denied. Status updated to REJECTED.`,
        duration: 6000,
      });
    } catch (err: any) {
      addNotification({ type: 'error', title: 'Action Failed', message: err.message });
    }
  };

  const handleSaveEdit = async () => {
    if (!editBuyer) return;
    try {
      const uid = editBuyer.user.id;
      await updateUser(uid, {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone,
      });
      if (profiles[uid]) {
        await updateBuyerProfile(uid, {
          companyName: editForm.companyName,
          gstNumber: editForm.gstNumber,
        });
      }
      addNotification({
        type: 'success',
        title: 'Buyer Details Updated',
        message: `Buyer profile for ${editForm.firstName} updated successfully.`,
      });
      setEditBuyer(null);
      loadData();
    } catch (err: any) {
      addNotification({ type: 'error', title: 'Update Failed', message: err.message });
    }
  };

  const filteredBuyers = buyers.filter((b) => {
    const prof = profiles[b.id];
    const matchesSearch =
      b.email.toLowerCase().includes(search.toLowerCase()) ||
      `${b.firstName} ${b.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      (prof?.companyName || '').toLowerCase().includes(search.toLowerCase());

    const isPending = b.status === 'pending' || b.status === 'pending_approval';
    const isApproved = b.status === 'active';
    const isRejected = b.status === 'rejected' || b.status === 'suspended';

    if (statusTab === 'all') return matchesSearch;
    if (statusTab === 'pending') return matchesSearch && isPending;
    if (statusTab === 'active') return matchesSearch && isApproved;
    if (statusTab === 'rejected') return matchesSearch && isRejected;
    return matchesSearch;
  });

  const pendingCount = buyers.filter((b) => b.status === 'pending' || b.status === 'pending_approval').length;

  return (
    <div style={{ padding: '20px 24px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#8B0000', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            <Users size={14} /> Buyer Management
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Buyer Requests &amp; Accounts
          </h1>
        </div>

        <div style={{ position: 'relative', width: '100%', maxWidth: 300 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#9CA3AF' }} />
          <input
            type="text"
            placeholder="Search buyer name, email..."
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

      {/* Responsive Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {(['all', 'pending', 'active', 'rejected'] as const).map((tab) => {
          const isActive = statusTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setStatusTab(tab)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: isActive ? '#8B0000' : '#f3f4f6',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {tab === 'active' ? 'APPROVED' : tab.toUpperCase()}
              {tab === 'pending' && pendingCount > 0 && (
                <span style={{ background: '#ef4444', color: '#fff', fontSize: 11, padding: '1px 6px', borderRadius: 999 }}>
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading buyer accounts...</div>
      ) : filteredBuyers.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', background: '#fff', borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14 }}>No buyer accounts found under &quot;{statusTab}&quot; tab.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border-subtle)', overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Buyer / Shop</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Email &amp; Contact</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>GSTIN</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBuyers.map((buyer) => {
                const prof = profiles[buyer.id];
                const isPending = buyer.status === 'pending' || buyer.status === 'pending_approval';
                const isApproved = buyer.status === 'active';

                return (
                  <tr key={buyer.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{prof?.companyName || `${buyer.firstName} ${buyer.lastName}`}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Owner: {buyer.firstName} {buyer.lastName}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div>{buyer.email}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{buyer.phone || 'No phone'}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontFamily: 'monospace', background: '#f3f4f6', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>
                        {prof?.gstNumber || 'UNVERIFIED'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <Badge variant={isApproved ? 'success' : isPending ? 'warning' : 'danger'} size="sm">
                        {isApproved ? 'APPROVED' : buyer.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <Button
                          variant="ghost"
                          size="xs"
                          leftIcon={<Eye size={12} />}
                          onClick={() => setViewBuyer(buyer)}
                        >
                          View
                        </Button>
                        <Button
                          variant="secondary"
                          size="xs"
                          leftIcon={<Edit3 size={12} />}
                          onClick={() => {
                            setEditBuyer({ user: buyer, profile: prof });
                            setEditForm({
                              firstName: buyer.firstName,
                              lastName: buyer.lastName,
                              phone: buyer.phone || '',
                              companyName: prof?.companyName || '',
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
                            onClick={() => handleApprove(buyer)}
                          >
                            Approve
                          </Button>
                        )}
                        {!isApproved && buyer.status !== 'rejected' && (
                          <Button
                            variant="danger"
                            size="xs"
                            leftIcon={<XCircle size={12} />}
                            onClick={() => handleReject(buyer)}
                          >
                            Reject
                          </Button>
                        )}
                        <Button
                          variant="danger"
                          size="xs"
                          leftIcon={<Trash2 size={12} />}
                          onClick={() => handleDelete(buyer)}
                        >
                          Delete
                        </Button>
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
      {viewBuyer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Buyer Account Profile</h3>
              <button onClick={() => setViewBuyer(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
              <div><strong>Name:</strong> {viewBuyer.firstName} {viewBuyer.lastName}</div>
              <div><strong>Email:</strong> {viewBuyer.email}</div>
              <div><strong>Phone:</strong> {viewBuyer.phone || 'N/A'}</div>
              <div><strong>Shop Name:</strong> {profiles[viewBuyer.id]?.companyName || 'N/A'}</div>
              <div><strong>GSTIN:</strong> {profiles[viewBuyer.id]?.gstNumber || 'N/A'}</div>
              <div><strong>Account Status:</strong> <Badge variant={viewBuyer.status === 'active' ? 'success' : 'warning'}>{viewBuyer.status === 'active' ? 'APPROVED' : viewBuyer.status.toUpperCase()}</Badge></div>
              <div><strong>Created At:</strong> {viewBuyer.createdAt ? new Date(viewBuyer.createdAt).toLocaleDateString() : 'N/A'}</div>
            </div>
            <div style={{ marginTop: 20, textAlign: 'right' }}>
              <Button variant="secondary" onClick={() => setViewBuyer(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editBuyer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480, padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Edit Buyer Profile</h3>
              <button onClick={() => setEditBuyer(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
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
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Shop Name</label>
                <input type="text" value={editForm.companyName} onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-default)' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>GSTIN</label>
                <input type="text" value={editForm.gstNumber} onChange={(e) => setEditForm({ ...editForm, gstNumber: e.target.value })} style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid var(--border-default)' }} />
              </div>
            </div>
            <div style={{ marginTop: 20, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setEditBuyer(null)}>Cancel</Button>
              <Button variant="primary" leftIcon={<Save size={14} />} onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
