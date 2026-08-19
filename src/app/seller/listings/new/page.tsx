'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { createProduct } from '@/lib/firebase/collections/products';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/lib/api/mock-data';
import { ROUTES } from '@/lib/constants/routes';
import {
  ArrowLeft, Package, CheckCircle2, Upload, Tag, DollarSign,
  ImageIcon, Trash2, RefreshCw, AlertCircle, FileImage, Sparkles
} from 'lucide-react';
import type { UnitOfMeasure, ProductListItem } from '@/types/product.types';

// ── Default Fallback Image for Auto Parts ──────────────────────────────────
const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80';

// ── Max File Size Limit (10MB) ────────────────────────────────────────────
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export default function AddProductPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addNotification } = useUIStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('');
  const [vehicleType, setVehicleType] = useState<'2-wheeler' | '3-wheeler' | '4-wheeler' | 'agriculture'>('4-wheeler');
  const [categoryName, setCategoryName] = useState('Engine Parts');
  const [basePrice, setBasePrice] = useState<number | ''>(1250);
  const [moq, setMoq] = useState<number | ''>(5);
  const [unit, setUnit] = useState<UnitOfMeasure>('piece');
  const [stock, setStock] = useState<number | ''>(100);
  const [leadTimeDays, setLeadTimeDays] = useState<number | ''>(3);
  const [compatibleVehicles, setCompatibleVehicles] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  // ── Image Upload States ─────────────────────────────────────────────────
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageFileName, setImageFileName] = useState<string>('');
  const [imageFileSize, setImageFileSize] = useState<string>('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Client-side Image Optimization (Canvas resizing & JPEG compression) ──
  const processAndCompressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          const MAX_DIM = 1200;

          if (width > height) {
            if (width > MAX_DIM) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
            resolve(dataUrl);
          } else {
            resolve(readerEvent.target?.result as string);
          }
        };
        img.onerror = (err) => reject(err);
        img.src = readerEvent.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    setError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    // Validate file size limit (10MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(`Image size exceeds 10MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a smaller image.`);
      return;
    }

    setIsProcessingImage(true);
    try {
      const compressedDataUrl = await processAndCompressImage(file);
      setImageUrl(compressedDataUrl);
      setImageFileName(file.name);
      const sizeKb = Math.round(file.size / 1024);
      setImageFileSize(sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`);
      addNotification({
        type: 'success',
        title: 'Image Ready',
        message: `"${file.name}" uploaded successfully.`,
      });
    } catch (err: any) {
      console.error('Image compression error:', err);
      setError('Failed to process image. Please try another image file.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setImageFileName('');
    setImageFileSize('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ── Form Submit ──────────────────────────────────────────────────────────
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

      // Use uploaded image or fallback default
      const finalImg = imageUrl || DEFAULT_PRODUCT_IMAGE;

      // 1. Guaranteed Firestore Product Persistence
      const createdDocId = await createProduct({
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
        sellerPrice: Number(basePrice),
        basePrice: Number(basePrice),
        currency: 'INR',
        unit,
        moq: Number(moq),
        stock: Number(stock),
        leadTimeDays: Number(leadTimeDays) || 3,
        tags: [brand.trim(), categoryName, vehicleType, 'Automotive Spares'],
        brand: brand.trim(),
        vehicleType,
        partNumber: sku.trim().toUpperCase(),
        compatibleVehicles: compatibleVehicles.split(',').map(v => v.trim()).filter(Boolean),
        isGstExempt: false,
        gstRate: 18,
        status: status === 'active' ? 'active' : 'draft',
        approvalStatus: 'pending',
        isFeatured: false,
        rating: 4.8,
        reviewCount: 1,
      });

      // 2. Prepend to local mock/in-memory array for instant seller UI feedback
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
        status: status === 'active' ? 'active' : 'draft',
        approvalStatus: 'pending',
        brand: brand.trim(),
        vehicleType,
        categoryName,
        primaryImage: { id: 'img-1', url: finalImg, altText: name.trim(), isPrimary: true, order: 1 },
      };

      MOCK_PRODUCTS.unshift(newListItem);

      // 3. Trigger Toast Notification to Seller
      addNotification({
        type: 'success',
        title: 'Product Added Successfully!',
        message: `"${name.trim()}" with custom image saved to database and submitted to Admin for verification.`,
        duration: 8000,
      });

      // 4. Redirect back to Seller Listings
      router.push(ROUTES.SELLER.LISTINGS);
    } catch (err: any) {
      console.error('Failed to create product in Firestore:', err);
      setError(err.message || 'Failed to add product. Please check your database connection.');
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
      <main style={{ maxWidth: 860, margin: '36px auto 0', padding: '0 20px' }}>
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
              Fill in the product specifications and upload product photos. Once saved, it will be stored in the database for buyer procurement.
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
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

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

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                    Automobile Segment / Vehicle Type *
                  </label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value as any)}
                    style={{
                      width: '100%', height: 46, border: '1.5px solid var(--border-default)',
                      borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#fff',
                    }}
                  >
                    <option value="2-wheeler">🏍️ 2-Wheeler (Bikes, Scooters)</option>
                    <option value="3-wheeler">🛺 3-Wheeler (Auto Rickshaw, Cargo)</option>
                    <option value="4-wheeler">🚗 4-Wheeler (Cars, SUVs, Commercial 4W, Trucks)</option>
                    <option value="agriculture">🚜 Agriculture Wheeler (Tractors, Farm Equipment)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                    Part Category *
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

            {/* 3. Product Image Upload */}
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Upload size={16} style={{ color: '#8B0000' }} /> 3. Product Image Upload
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14 }}>
                Upload photos from your local device or gallery. Images are automatically optimized and saved to database.
              </p>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleInputChange}
                accept="image/png, image/jpeg, image/jpg, image/webp"
                style={{ display: 'none' }}
              />

              {imageUrl ? (
                /* Uploaded Image Preview Box */
                <div style={{
                  border: '1.5px solid var(--border-default)',
                  borderRadius: 16,
                  padding: 16,
                  background: '#fafafa',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  flexWrap: 'wrap',
                }}>
                  <div style={{
                    width: 110,
                    height: 110,
                    borderRadius: 12,
                    overflow: 'hidden',
                    background: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    position: 'relative',
                    flexShrink: 0,
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt="Product preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <CheckCircle2 size={18} style={{ color: '#16a34a' }} />
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Image Uploaded & Ready</span>
                    </div>
                    {imageFileName && (
                      <p style={{ margin: '2px 0', fontSize: 12.5, color: 'var(--text-secondary)', wordBreak: 'break-all' }}>
                        {imageFileName} {imageFileSize ? `(${imageFileSize})` : ''}
                      </p>
                    )}
                    <span style={{ display: 'inline-block', fontSize: 11, background: '#f0fdf4', color: '#166534', padding: '2px 8px', borderRadius: 6, fontWeight: 600, marginTop: 4 }}>
                      Optimized for Database Storage
                    </span>

                    <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          background: '#ffffff',
                          border: '1px solid var(--border-default)',
                          padding: '6px 14px',
                          borderRadius: 8,
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                        }}
                      >
                        <RefreshCw size={13} /> Change Image
                      </button>

                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          background: '#fff1f2',
                          border: '1px solid #fecdd3',
                          padding: '6px 14px',
                          borderRadius: 8,
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: '#e11d48',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty Upload Dropzone Button */
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${isDragging ? '#8B0000' : 'rgba(139, 0, 0, 0.25)'}`,
                    borderRadius: 16,
                    padding: '36px 20px',
                    textAlign: 'center',
                    background: isDragging ? 'rgba(139, 0, 0, 0.04)' : '#fafafa',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: 26,
                    background: '#fff1f2',
                    color: '#8B0000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                  }}>
                    <Upload size={24} />
                  </div>

                  <div style={{ marginBottom: 8 }}>
                    <button
                      type="button"
                      disabled={isProcessingImage}
                      style={{
                        background: 'linear-gradient(135deg, #8B0000 0%, #60020B 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 10,
                        padding: '10px 22px',
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        boxShadow: '0 3px 10px rgba(139,0,0,0.2)',
                      }}
                    >
                      <FileImage size={16} />
                      {isProcessingImage ? 'Processing Image...' : 'Upload Image'}
                    </button>
                  </div>

                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '6px 0 2px' }}>
                    Click to pick from your local gallery or drag and drop image here
                  </p>
                  <p style={{ fontSize: 11.5, color: 'var(--text-tertiary)', margin: 0 }}>
                    PNG, JPG, JPEG, WEBP up to 10MB
                  </p>
                </div>
              )}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-subtle)' }} />

            {/* 4. Specifications & Description */}
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} style={{ color: '#8B0000' }} /> 4. Specifications & Fitment
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                disabled={isLoading || isProcessingImage}
                style={{
                  width: '100%',
                  height: 52,
                  background: 'linear-gradient(135deg, #8B0000 0%, #60020B 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: (isLoading || isProcessingImage) ? 'not-allowed' : 'pointer',
                  opacity: (isLoading || isProcessingImage) ? 0.7 : 1,
                  boxShadow: '0 4px 16px rgba(139,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  transition: 'transform 0.15s',
                }}
              >
                <CheckCircle2 size={20} />
                {isLoading ? 'Saving Product to Database...' : 'Confirm and Add Product'}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
