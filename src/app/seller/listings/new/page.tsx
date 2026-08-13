'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { createProduct } from '@/lib/firebase/collections/products';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/lib/api/mock-data';
import { ROUTES } from '@/lib/constants/routes';
import { ArrowLeft, Package, Sparkles, CheckCircle2, Upload, Tag, DollarSign, Layers, ShieldCheck } from 'lucide-react';
import type { UnitOfMeasure, ProductListItem } from '@/types/product.types';

// ── Default Fallback Image for Auto Parts ──────────────────────────────────
const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80';

export default function AddProductPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addNotification } = useUIStore();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryName, setCategoryName] = useState('Engine Parts');
  const [basePrice, setBasePrice] = useState<number | ''>(1250);
  const [moq, setMoq] = useState<number | ''>(5);
  const [unit, setUnit] = useState<UnitOfMeasure>('piece');
  const [stock, setStock] = useState<number | ''>(100);
  const [leadTimeDays, setLeadTimeDays] = useState<number | ''>(3);
  const [imageUrl, setImageUrl] = useState(DEFAULT_PRODUCT_IMAGE);
  const [compatibleVehicles, setCompatibleVehicles] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter a product name.');
      return;
    }
    if (!sku.trim()) {
      setError('Please enter a unique SKU/Part number.');
      return;
    }
    if (!brand.trim()) {
      setError('Please enter the brand or manufacturer name.');
      return;
    }
    if (!basePrice || Number(basePrice) <= 0) {
      setError('Please enter a valid base price.');
      return;
    }
    if (!moq || Number(moq) <= 0) {
      setError('Please enter a valid minimum order quantity (MOQ).');
      return;
    }
    if (stock === '' || Number(stock) < 0) {
      setError('Please enter stock quantity.');
      return;
    }

    setIsLoading(true);

    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);
      const categoryId = MOCK_CATEGORIES.find(c => c.name.toLowerCase() === categoryName.toLowerCase())?.id || 'cat-1';
      const sellerName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'AutoParts Direct';
      const sellerId = user?.id || 'seller-1';

      const finalImg = imageUrl.trim() || DEFAULT_PRODUCT_IMAGE;

      const createdDocId = 'prod-' + Date.now();

      // 1. Asynchronous non-blocking Firestore product creation
      createProduct({
        sku: sku.trim().toUpperCase(),
        name: name.trim(),
        slug,
        description: description.trim() || `${name.trim()} - High quality automotive spare part supplied with manufacturer warranty.`,
        shortDescription: `${brand.trim()} ${name.trim()}`,
        categoryId,
        categoryName,
        sellerId,
        sellerName,
        sellerRating: 4.8,
        images: [{ id: 'img-1', url: finalImg, altText: name.trim(), isPrimary: true, order: 1 }],
        specifications: [
          { name: 'Brand', value: brand.trim() },
          { name: 'Part Number', value: sku.trim().toUpperCase() },
          { name: 'Compatibility', value: compatibleVehicles.trim() || 'Universal / Multi-model' },
        ],
        priceTiers: [
          { minQty: Number(moq), price: Number(basePrice), currency: 'INR' }
        ],
        basePrice: Number(basePrice),
        currency: 'INR',
        unit,
        moq: Number(moq),
        stock: Number(stock),
        leadTimeDays: Number(leadTimeDays) || 3,
        tags: [brand.trim(), categoryName, 'Automotive Spares'],
        brand: brand.trim(),
        partNumber: sku.trim().toUpperCase(),
        compatibleVehicles: compatibleVehicles.split(',').map(v => v.trim()).filter(Boolean),
        isGstExempt: false,
        gstRate: 18,
        status: 'draft',
        approvalStatus: 'pending',
        isFeatured: false,
        rating: 4.8,
        reviewCount: 1,
      }).catch((dbErr) => console.warn('Firestore add product notice:', dbErr.message));

      // 2. Add to local memory array with pending approval status
      const newListItem: ProductListItem = {
        id: createdDocId,
        sku: sku.trim().toUpperCase(),
        name: name.trim(),
        slug,
        basePrice: Number(basePrice),
        currency: 'INR',
        moq: Number(moq),
        unit,
        stock: Number(stock),
        rating: 4.8,
        reviewCount: 1,
        sellerName,
        sellerRating: 4.8,
        leadTimeDays: Number(leadTimeDays) || 3,
        isFeatured: false,
        status: 'draft',
        approvalStatus: 'pending',
        brand: brand.trim(),
        categoryName,
        primaryImage: { id: 'img-1', url: finalImg, altText: name.trim(), isPrimary: true, order: 1 },
      };

      MOCK_PRODUCTS.unshift(newListItem);

      // 3. Trigger Toast Notification to Seller
      addNotification({
        type: 'info',
        title: 'Product Request Submitted!',
        message: `Product "${name.trim()}" has been submitted to Admin for verification and approval.`,
        duration: 8000,
      });

      // 4. Redirect back to Seller Listings
      router.push(ROUTES.SELLER.LISTINGS);
    } catch (err: any) {
      console.error('Failed to create product:', err);
      setError(err.message || 'Failed to add product. Please check your inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', paddingBottom: 60 }}>
      {/* Top Header */}
      <header style={{
        height: 64,
        background: 'linear-gradient(135deg, #8B0000 0%, #60020B 100%)',
        borderBottom: '1px solid rgba(212, 175, 55, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}>
        <Link href={ROUTES.SELLER.LISTINGS} style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#ffffff', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
          <ArrowLeft size={18} /> Back to My Listings
        </Link>
        <div style={{ color: '#d4af37', fontWeight: 700, fontSize: 14, letterSpacing: '0.04em' }}>
          SELLER PORTAL · ADD PRODUCT
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: 840, margin: '36px auto 0', padding: '0 20px' }}>
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 20,
          padding: '36px 32px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.06)',
        }}>
          {/* Form Header */}
          <div style={{ marginBottom: 28, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#8B0000', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              <Package size={18} /> New Product Listing
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
              Add Product to Wholesale Catalog
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Fill in the product details below. Once confirmed, your item will be listed live for retailers across India.
            </p>
          </div>

          {error && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#991B1B',
              padding: '12px 16px',
              borderRadius: 10,
              fontSize: 14,
              marginBottom: 24,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* 1. Basic Product Information */}
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag size={16} style={{ color: '#8B0000' }} /> 1. Basic Information
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                    Product Title / Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bosch Fuel Injector Set — Maruti Suzuki Swift/Dzire"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{
                      width: '100%', height: 46, border: '1.5px solid var(--border-default)',
                      borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                    SKU / Part Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EP-BOSCH-9021"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    style={{
                      width: '100%', height: 46, border: '1.5px solid var(--border-default)',
                      borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                    Brand / Manufacturer *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bosch, Brembo, TVS, Minda"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    style={{
                      width: '100%', height: 46, border: '1.5px solid var(--border-default)',
                      borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                    Category *
                  </label>
                  <select
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    style={{
                      width: '100%', height: 46, border: '1.5px solid var(--border-default)',
                      borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#fff',
                    }}
                  >
                    <option value="Engine Parts">Engine Parts</option>
                    <option value="Brakes & Suspension">Brakes & Suspension</option>
                    <option value="Electrical & Lighting">Electrical & Lighting</option>
                    <option value="Body & Exterior">Body & Exterior</option>
                    <option value="Tyres & Wheels">Tyres & Wheels</option>
                    <option value="Filters & Fluids">Filters & Fluids</option>
                    <option value="Transmission">Transmission</option>
                    <option value="AC & Cooling">AC & Cooling</option>
                  </select>
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

            {/* 2. Wholesale Pricing & Stock */}
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <DollarSign size={16} style={{ color: '#8B0000' }} /> 2. Wholesale Pricing & Inventory
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                    Base Price (₹ / unit) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="1450"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value ? Number(e.target.value) : '')}
                    style={{
                      width: '100%', height: 46, border: '1.5px solid var(--border-default)',
                      borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                    Min. Order Qty (MOQ) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="5"
                    value={moq}
                    onChange={(e) => setMoq(e.target.value ? Number(e.target.value) : '')}
                    style={{
                      width: '100%', height: 46, border: '1.5px solid var(--border-default)',
                      borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                    Unit of Measure *
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as UnitOfMeasure)}
                    style={{
                      width: '100%', height: 46, border: '1.5px solid var(--border-default)',
                      borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#fff',
                    }}
                  >
                    <option value="piece">Piece</option>
                    <option value="set">Set</option>
                    <option value="box">Box</option>
                    <option value="pair">Pair</option>
                    <option value="carton">Carton</option>
                    <option value="kg">Kg</option>
                    <option value="litre">Litre</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                    Available Stock *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="250"
                    value={stock}
                    onChange={(e) => setStock(e.target.value ? Number(e.target.value) : '')}
                    style={{
                      width: '100%', height: 46, border: '1.5px solid var(--border-default)',
                      borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                    Dispatch Lead Time (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="3"
                    value={leadTimeDays}
                    onChange={(e) => setLeadTimeDays(e.target.value ? Number(e.target.value) : '')}
                    style={{
                      width: '100%', height: 46, border: '1.5px solid var(--border-default)',
                      borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
                    style={{
                      width: '100%', height: 46, border: '1.5px solid var(--border-default)',
                      borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#fff',
                    }}
                  >
                    <option value="active">Active (Visible to Buyers)</option>
                    <option value="inactive">Draft / Hidden</option>
                  </select>
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

            {/* 3. Image & Compatibility */}
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Upload size={16} style={{ color: '#8B0000' }} /> 3. Product Media & Specifications
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                    Product Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/photo-..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    style={{
                      width: '100%', height: 46, border: '1.5px solid var(--border-default)',
                      borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                    Default auto parts demonstration image is pre-filled. You can also paste your own custom product image URL.
                  </p>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                    Compatible Vehicles / Fitment
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Maruti Suzuki Swift 2018+, Baleno, Hyundai i20"
                    value={compatibleVehicles}
                    onChange={(e) => setCompatibleVehicles(e.target.value)}
                    style={{
                      width: '100%', height: 46, border: '1.5px solid var(--border-default)',
                      borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                    Detailed Product Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe warranty terms, material specs, installation guidelines, packaging details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{
                      width: '100%', border: '1.5px solid var(--border-default)',
                      borderRadius: 10, padding: '12px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                      fontFamily: 'inherit', resize: 'vertical',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: 12 }}>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  height: 52,
                  background: 'linear-gradient(135deg, #8B0000 0%, #60020B 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.7 : 1,
                  boxShadow: '0 4px 16px rgba(139,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  transition: 'transform 0.15s',
                }}
              >
                <CheckCircle2 size={20} />
                {isLoading ? 'Publishing Product...' : 'Confirm and Add Product'}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
