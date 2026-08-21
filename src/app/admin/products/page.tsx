'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Package, CheckCircle, XCircle, Eye, Search, ShieldCheck, Tag, DollarSign, Layers, Trash2
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useUIStore } from '@/stores/ui.store';
import {
  getAllProductsAdmin,
  approveProductAdmin,
  rejectProductAdmin,
  deleteProduct,
} from '@/lib/firebase/collections/products';
import type { Product } from '@/types/product.types';
import { formatCurrency } from '@/lib/utils/format';
import { MOCK_PRODUCTS } from '@/lib/api/mock-data';

// ─────────────────────────────────────────────────────────────────────────────
// Admin Products Page — Review, Verify, Approve, or Reject Seller Product Listings
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const { addNotification } = useUIStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const list = await getAllProductsAdmin();
      setProducts(list);
    } catch (err) {
      console.error('Error loading products for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleApprove = async (prod: Product) => {
    try {
      const rawSellerPrice = prod.sellerPrice || prod.basePrice;
      const gstRate = prod.gstRate || 18;
      const approvedBuyerPrice = Math.round(rawSellerPrice * 1.10 * (1 + gstRate / 100) * 100) / 100;

      await approveProductAdmin(prod.id, prod);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === prod.id
            ? {
                ...p,
                approvalStatus: 'approved',
                status: 'active',
                sellerPrice: rawSellerPrice,
                basePrice: approvedBuyerPrice,
              }
            : p
        )
      );
      // Sync local in-memory item
      const mockItem = MOCK_PRODUCTS.find(m => m.id === prod.id || m.sku === prod.sku);
      if (mockItem) {
        mockItem.approvalStatus = 'approved';
        mockItem.status = 'active';
        mockItem.basePrice = approvedBuyerPrice;
      }
      addNotification({
        type: 'success',
        title: 'Product Approved (10% Margin + GST Included)!',
        message: `"${prod.name}" approved. Buyer price is set to ₹${approvedBuyerPrice.toLocaleString('en-IN')} (Seller price: ₹${rawSellerPrice.toLocaleString('en-IN')} + 10% margin + ${gstRate}% GST).`,
        duration: 7000,
      });
    } catch (err: any) {
      addNotification({ type: 'error', title: 'Verification Failed', message: err.message });
    }
  };

  const handleReject = async (prod: Product) => {
    try {
      await rejectProductAdmin(prod.id);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === prod.id ? { ...p, approvalStatus: 'rejected', status: 'draft' } : p
        )
      );
      // Sync local in-memory item
      const mockItem = MOCK_PRODUCTS.find(m => m.id === prod.id || m.sku === prod.sku);
      if (mockItem) {
        mockItem.approvalStatus = 'rejected';
        mockItem.status = 'draft';
      }
      addNotification({
        type: 'warning',
        title: 'Product Request Rejected',
        message: `Product "${prod.name}" rejected. Access to catalog is blocked.`,
        duration: 6000,
      });
    } catch (err: any) {
      addNotification({ type: 'error', title: 'Action Failed', message: err.message });
    }
  };

  const handleDelete = async (prod: Product) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${prod.name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteProduct(prod.id);
      setProducts((prev) => prev.filter((p) => p.id !== prod.id));
      
      // Also remove from in-memory mock if present
      const mockIndex = MOCK_PRODUCTS.findIndex((m) => m.id === prod.id || m.sku === prod.sku);
      if (mockIndex !== -1) {
        MOCK_PRODUCTS.splice(mockIndex, 1);
      }

      addNotification({
        type: 'success',
        title: 'Product Deleted',
        message: `"${prod.name}" was permanently removed from the marketplace.`,
        duration: 5000,
      });
    } catch (err: any) {
      addNotification({ type: 'error', title: 'Delete Failed', message: err.message });
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.sellerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.categoryName || '').toLowerCase().includes(search.toLowerCase());

    const isPending = !p.approvalStatus || p.approvalStatus === 'pending';
    const isApproved = p.approvalStatus === 'approved' || p.status === 'active';
    const isRejected = p.approvalStatus === 'rejected';

    if (statusTab === 'all') return matchesSearch;
    if (statusTab === 'pending') return matchesSearch && isPending && !isApproved;
    if (statusTab === 'approved') return matchesSearch && isApproved;
    if (statusTab === 'rejected') return matchesSearch && isRejected;
    return matchesSearch;
  });

  const pendingCount = products.filter(
    (p) => (!p.approvalStatus || p.approvalStatus === 'pending') && p.status !== 'active'
  ).length;

  return (
    <div style={{ padding: '20px 24px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#8B0000', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
            <Package size={14} /> Product Verification
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Product Listings &amp; Approvals
          </h1>
        </div>

        <div style={{ position: 'relative', width: '100%', maxWidth: 300 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#9CA3AF' }} />
          <input
            type="text"
            placeholder="Search product name, SKU, seller..."
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => {
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
              {tab === 'pending' ? 'PENDING VERIFICATION' : tab.toUpperCase()}
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
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading product submissions...</div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', background: '#fff', borderRadius: 16, border: '1px solid var(--border-subtle)' }}>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14 }}>No products found under &quot;{statusTab}&quot; tab.</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border-subtle)', overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 800, borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Product Name &amp; SKU</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Seller</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Wholesale Price &amp; MOQ</th>
                <th style={{ padding: '14px 18px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '14px 18px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => {
                const isApproved = p.approvalStatus === 'approved' || p.status === 'active';
                const isPending = !isApproved && p.approvalStatus !== 'rejected';
                const mainImg = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80';

                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 8, background: '#f3f4f6', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                          <Image src={mainImg} alt={p.name} fill style={{ objectFit: 'cover' }} unoptimized />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.name}</div>
                          <div style={{ fontSize: 11, fontFamily: 'monospace', color: 'var(--text-tertiary)' }}>SKU: {p.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 500 }}>{p.categoryName || 'Auto Spares'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{p.brand || 'Generic'}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 600 }}>{p.sellerName || 'Verified Seller'}</div>
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      {isApproved ? (
                        <div>
                          <div style={{ fontWeight: 700, color: '#8B0000', fontSize: 13.5 }}>
                            {formatCurrency(p.basePrice)} <span style={{ fontSize: 10.5, color: '#059669', background: '#ECFDF5', padding: '1px 5px', borderRadius: 4, fontWeight: 700 }}>+10% Live</span>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                            Seller: {formatCurrency(p.sellerPrice || Math.round((p.basePrice / 1.1) * 100) / 100)} · MOQ: {p.moq} {p.unit}s
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            Seller: {formatCurrency(p.sellerPrice || p.basePrice)}
                          </div>
                          <div style={{ fontSize: 11, color: '#059669', fontWeight: 600 }}>
                            Buyer (Approved +10%): {formatCurrency(Math.round((p.sellerPrice || p.basePrice) * 1.10 * 100) / 100)}
                          </div>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px 18px' }}>
                      <Badge variant={isApproved ? 'success' : isPending ? 'warning' : 'danger'} size="sm">
                        {isApproved ? 'VERIFIED & LIVE' : isPending ? 'PENDING' : 'REJECTED'}
                      </Badge>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                        <Button
                          variant="ghost"
                          size="xs"
                          leftIcon={<Eye size={12} />}
                          onClick={() => setViewProduct(p)}
                        >
                          View
                        </Button>
                        {isPending && (
                          <Button
                            variant="primary"
                            size="xs"
                            leftIcon={<CheckCircle size={12} />}
                            onClick={() => handleApprove(p)}
                          >
                            Verify &amp; Publish (+10%)
                          </Button>
                        )}
                        {!isApproved && p.approvalStatus !== 'rejected' && (
                          <Button
                            variant="danger"
                            size="xs"
                            leftIcon={<XCircle size={12} />}
                            onClick={() => handleReject(p)}
                          >
                            Reject
                          </Button>
                        )}
                        <Button
                          variant="danger"
                          size="xs"
                          leftIcon={<Trash2 size={12} />}
                          onClick={() => handleDelete(p)}
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

      {/* View Details Modal */}
      {viewProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, padding: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Product Listing Submission</h3>
              <button onClick={() => setViewProduct(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 14 }}>
              <div style={{ width: '100%', height: 160, borderRadius: 12, background: '#f3f4f6', overflow: 'hidden', position: 'relative' }}>
                <Image src={viewProduct.images?.[0]?.url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80'} alt={viewProduct.name} fill style={{ objectFit: 'cover' }} unoptimized />
              </div>
              <div><strong>Product Name:</strong> {viewProduct.name}</div>
              <div><strong>Part Number / SKU:</strong> <span style={{ fontFamily: 'monospace' }}>{viewProduct.sku}</span></div>
              <div><strong>Brand:</strong> {viewProduct.brand || 'N/A'}</div>
              <div><strong>Category:</strong> {viewProduct.categoryName}</div>
              <div style={{ background: '#f9fafb', padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <div style={{ marginBottom: 4 }}>
                  <strong>Seller Base Price:</strong> {formatCurrency(viewProduct.sellerPrice || viewProduct.basePrice)}
                </div>
                <div style={{ marginBottom: 4, color: '#059669', fontWeight: 600 }}>
                  <strong>Platform Margin (+10%):</strong> +{formatCurrency(Math.round((viewProduct.sellerPrice || viewProduct.basePrice) * 0.10 * 100) / 100)}
                </div>
                <div style={{ color: '#8B0000', fontWeight: 700, fontSize: 15 }}>
                  <strong>Published Buyer Price:</strong> {formatCurrency(
                    viewProduct.approvalStatus === 'approved'
                      ? viewProduct.basePrice
                      : Math.round((viewProduct.sellerPrice || viewProduct.basePrice) * 1.10 * 100) / 100
                  )}
                </div>
              </div>
              <div><strong>MOQ (Minimum Order Qty):</strong> {viewProduct.moq} {viewProduct.unit}s</div>
              <div><strong>Stock Available:</strong> {viewProduct.stock} units</div>
              <div><strong>Seller Name:</strong> {viewProduct.sellerName}</div>
              <div><strong>Description:</strong> {viewProduct.description}</div>
              <div><strong>Verification Status:</strong> <Badge variant={viewProduct.approvalStatus === 'approved' ? 'success' : 'warning'}>{(viewProduct.approvalStatus || 'pending').toUpperCase()}</Badge></div>
            </div>
            <div style={{ marginTop: 20, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setViewProduct(null)}>Close</Button>
              {viewProduct.approvalStatus !== 'approved' && (
                <Button variant="primary" leftIcon={<CheckCircle size={14} />} onClick={() => { handleApprove(viewProduct); setViewProduct(null); }}>
                  Verify &amp; Publish (+10%)
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
