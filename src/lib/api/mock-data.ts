// ─────────────────────────────────────────────────────────────────────────────
// Mock Data — realistic B2B marketplace data for all modules
// ─────────────────────────────────────────────────────────────────────────────

import type { ProductListItem, Category, Product } from '@/types/product.types';
import type { Order } from '@/types/order.types';
import type { User } from '@/types/user.types';

// ── Categories ────────────────────────────────────────────────────────────────

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Engine Parts', slug: 'engine-parts', productCount: 1240, imageUrl: '/categories/engine.jpg' },
  { id: 'cat-2', name: 'Brakes & Suspension', slug: 'brakes-suspension', productCount: 860, imageUrl: '/categories/brakes.jpg' },
  { id: 'cat-3', name: 'Electrical & Lighting', slug: 'electrical-lighting', productCount: 1540, imageUrl: '/categories/electrical.jpg' },
  { id: 'cat-4', name: 'Body & Exterior', slug: 'body-exterior', productCount: 720, imageUrl: '/categories/body.jpg' },
  { id: 'cat-5', name: 'Tyres & Wheels', slug: 'tyres-wheels', productCount: 430, imageUrl: '/categories/tyres.jpg' },
  { id: 'cat-6', name: 'Filters & Fluids', slug: 'filters-fluids', productCount: 980, imageUrl: '/categories/filters.jpg' },
  { id: 'cat-7', name: 'Transmission', slug: 'transmission', productCount: 340, imageUrl: '/categories/transmission.jpg' },
  { id: 'cat-8', name: 'AC & Cooling', slug: 'ac-cooling', productCount: 560, imageUrl: '/categories/ac.jpg' },
];

// ── Products ──────────────────────────────────────────────────────────────────

export const MOCK_PRODUCTS: ProductListItem[] = [
  {
    id: 'prod-1', sku: 'EP-001', name: 'Bosch Fuel Injector Set — Maruti Suzuki',
    slug: 'bosch-fuel-injector-set-maruti', basePrice: 4800, currency: 'INR',
    moq: 4, unit: 'set', stock: 240, rating: 4.6, reviewCount: 128,
    sellerName: 'AutoParts Direct', sellerRating: 4.7, leadTimeDays: 3,
    isFeatured: true, status: 'active', brand: 'Bosch', categoryName: 'Engine Parts',
    primaryImage: { id: 'img-1', url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop', altText: 'Fuel Injector', isPrimary: true, order: 1 },
  },
  {
    id: 'prod-2', sku: 'BS-102', name: 'Brembo Brake Disc Pair — Tata Nexon',
    slug: 'brembo-brake-disc-tata-nexon', basePrice: 3200, currency: 'INR',
    moq: 2, unit: 'pair', stock: 180, rating: 4.8, reviewCount: 96,
    sellerName: 'BrakeMaster Co.', sellerRating: 4.9, leadTimeDays: 2,
    isFeatured: true, status: 'active', brand: 'Brembo', categoryName: 'Brakes & Suspension',
    primaryImage: { id: 'img-2', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop', altText: 'Brake Disc', isPrimary: true, order: 1 },
  },
  {
    id: 'prod-3', sku: 'EL-203', name: 'Philips LED Headlight Bulb H4 (Pack of 10)',
    slug: 'philips-led-headlight-h4-pack10', basePrice: 1450, currency: 'INR',
    moq: 10, unit: 'piece', stock: 500, rating: 4.5, reviewCount: 312,
    sellerName: 'LightZone India', sellerRating: 4.6, leadTimeDays: 1,
    isFeatured: false, status: 'active', brand: 'Philips', categoryName: 'Electrical & Lighting',
    primaryImage: { id: 'img-3', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop', altText: 'LED Headlight', isPrimary: true, order: 1 },
  },
  {
    id: 'prod-4', sku: 'TW-304', name: 'MRF Nylogrip Zapper Tyre 175/70 R14',
    slug: 'mrf-nylogrip-zapper-175-70-r14', basePrice: 5600, currency: 'INR',
    moq: 4, unit: 'piece', stock: 120, rating: 4.7, reviewCount: 74,
    sellerName: 'TyreWorld Hub', sellerRating: 4.5, leadTimeDays: 4,
    isFeatured: true, status: 'active', brand: 'MRF', categoryName: 'Tyres & Wheels',
    primaryImage: { id: 'img-4', url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=400&h=300&fit=crop', altText: 'MRF Tyre', isPrimary: true, order: 1 },
  },
  {
    id: 'prod-5', sku: 'FF-405', name: 'Mann Filter Oil Filter — Universal OE Spec',
    slug: 'mann-filter-oil-universal', basePrice: 320, currency: 'INR',
    moq: 24, unit: 'piece', stock: 800, rating: 4.4, reviewCount: 240,
    sellerName: 'FilterKing Supplies', sellerRating: 4.3, leadTimeDays: 2,
    isFeatured: false, status: 'active', brand: 'Mann Filter', categoryName: 'Filters & Fluids',
    primaryImage: { id: 'img-5', url: 'https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=400&h=300&fit=crop', altText: 'Oil Filter', isPrimary: true, order: 1 },
  },
  {
    id: 'prod-6', sku: 'AC-506', name: 'Denso AC Compressor — Hyundai i20',
    slug: 'denso-ac-compressor-hyundai-i20', basePrice: 12500, currency: 'INR',
    moq: 1, unit: 'piece', stock: 45, rating: 4.9, reviewCount: 38,
    sellerName: 'CoolAir Parts', sellerRating: 4.8, leadTimeDays: 5,
    isFeatured: true, status: 'active', brand: 'Denso', categoryName: 'AC & Cooling',
    primaryImage: { id: 'img-6', url: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=400&h=300&fit=crop', altText: 'AC Compressor', isPrimary: true, order: 1 },
  },
  {
    id: 'prod-7', sku: 'TR-607', name: 'ZF Sachs Clutch Kit — Mahindra Scorpio',
    slug: 'zf-sachs-clutch-kit-mahindra-scorpio', basePrice: 8900, currency: 'INR',
    moq: 1, unit: 'set', stock: 60, rating: 4.6, reviewCount: 55,
    sellerName: 'TransMax India', sellerRating: 4.7, leadTimeDays: 3,
    isFeatured: false, status: 'active', brand: 'ZF Sachs', categoryName: 'Transmission',
    primaryImage: { id: 'img-7', url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=300&fit=crop', altText: 'Clutch Kit', isPrimary: true, order: 1 },
  },
  {
    id: 'prod-8', sku: 'BE-708', name: 'Mahindra OE Front Bumper Assembly — XUV700',
    slug: 'mahindra-oe-front-bumper-xuv700', basePrice: 18500, currency: 'INR',
    moq: 1, unit: 'piece', stock: 28, rating: 4.8, reviewCount: 22,
    sellerName: 'BodyParts Direct', sellerRating: 4.6, leadTimeDays: 7,
    isFeatured: false, status: 'active', brand: 'Mahindra OE', categoryName: 'Body & Exterior',
    primaryImage: { id: 'img-8', url: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=400&h=300&fit=crop', altText: 'Front Bumper', isPrimary: true, order: 1 },
  },
];

// ── Orders ────────────────────────────────────────────────────────────────────

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-1', orderNumber: 'HW-2026-00001', buyerId: 'usr-1', buyerName: 'Ramesh Traders',
    buyerGst: '27AABCR1234A1Z5',
    items: [
      {
        id: 'li-1', productId: 'prod-1', productName: 'Bosch Fuel Injector Set', productSku: 'EP-001',
        productImageUrl: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=80&h=80&fit=crop',
        sellerId: 'sel-1', sellerName: 'AutoParts Direct', quantity: 8, unitPrice: 4800,
        totalPrice: 38400, currency: 'INR', unit: 'set', gstRate: 18, gstAmount: 6912,
        discount: 0, netPrice: 45312,
      },
    ],
    status: 'delivered', paymentStatus: 'paid', paymentMethod: 'bank_transfer',
    shippingAddress: { id: 'addr-1', line1: '14 Industrial Estate', city: 'Pune', state: 'Maharashtra', pincode: '411001', country: 'India' },
    billingAddress: { id: 'addr-2', line1: '14 Industrial Estate', city: 'Pune', state: 'Maharashtra', pincode: '411001', country: 'India' },
    subtotal: 38400, totalDiscount: 0, totalGst: 6912, shippingCharge: 0, grandTotal: 45312,
    currency: 'INR', createdAt: '2026-06-15T10:00:00Z', updatedAt: '2026-06-20T18:00:00Z',
    deliveredAt: '2026-06-20T18:00:00Z',
  },
  {
    id: 'ord-2', orderNumber: 'HW-2026-00002', buyerId: 'usr-1', buyerName: 'Ramesh Traders',
    items: [
      {
        id: 'li-2', productId: 'prod-3', productName: 'Philips LED Headlight H4', productSku: 'EL-203',
        productImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=80&h=80&fit=crop',
        sellerId: 'sel-3', sellerName: 'LightZone India', quantity: 50, unitPrice: 1450,
        totalPrice: 72500, currency: 'INR', unit: 'piece', gstRate: 18, gstAmount: 13050,
        discount: 3625, netPrice: 81925,
      },
    ],
    status: 'shipped', paymentStatus: 'partial', paymentMethod: 'credit_line',
    shippingAddress: { id: 'addr-1', line1: '14 Industrial Estate', city: 'Pune', state: 'Maharashtra', pincode: '411001', country: 'India' },
    billingAddress: { id: 'addr-1', line1: '14 Industrial Estate', city: 'Pune', state: 'Maharashtra', pincode: '411001', country: 'India' },
    subtotal: 72500, totalDiscount: 3625, totalGst: 13050, shippingCharge: 0, grandTotal: 81925,
    currency: 'INR', createdAt: '2026-07-01T09:30:00Z', updatedAt: '2026-07-05T14:00:00Z',
    shippedAt: '2026-07-05T14:00:00Z',
    tracking: {
      trackingNumber: 'BD2026070512345',
      carrier: 'Blue Dart',
      estimatedDelivery: '2026-07-08T18:00:00Z',
      events: [
        { timestamp: '2026-07-05T14:00:00Z', location: 'Mumbai Hub', status: 'Picked Up', description: 'Shipment picked up from seller' },
        { timestamp: '2026-07-06T08:00:00Z', location: 'Pune Facility', status: 'In Transit', description: 'Arrived at Pune sorting facility' },
      ],
    },
  },
  {
    id: 'ord-3', orderNumber: 'HW-2026-00003', buyerId: 'usr-1', buyerName: 'Ramesh Traders',
    items: [
      {
        id: 'li-3', productId: 'prod-5', productName: 'Mann Filter Oil Filter', productSku: 'FF-405',
        productImageUrl: 'https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=80&h=80&fit=crop',
        sellerId: 'sel-5', sellerName: 'FilterKing Supplies', quantity: 120, unitPrice: 320,
        totalPrice: 38400, currency: 'INR', unit: 'piece', gstRate: 18, gstAmount: 6912,
        discount: 1920, netPrice: 43392,
      },
    ],
    status: 'confirmed', paymentStatus: 'pending', paymentMethod: 'bank_transfer',
    shippingAddress: { id: 'addr-1', line1: '14 Industrial Estate', city: 'Pune', state: 'Maharashtra', pincode: '411001', country: 'India' },
    billingAddress: { id: 'addr-1', line1: '14 Industrial Estate', city: 'Pune', state: 'Maharashtra', pincode: '411001', country: 'India' },
    subtotal: 38400, totalDiscount: 1920, totalGst: 6912, shippingCharge: 0, grandTotal: 43392,
    currency: 'INR', createdAt: '2026-07-10T11:00:00Z', updatedAt: '2026-07-10T11:00:00Z',
  },
];

// ── Users ─────────────────────────────────────────────────────────────────────

export const MOCK_BUYER: User = {
  id: 'usr-1', email: 'ramesh@rameshtraders.in', phone: '+91-9876543210',
  firstName: 'Ramesh', lastName: 'Kumar', role: 'buyer', status: 'active',
  avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Ramesh',
  createdAt: '2026-01-15T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z',
};

export const MOCK_SELLER: User = {
  id: 'usr-2', email: 'admin@autopartsdirect.in', phone: '+91-9123456789',
  firstName: 'Priya', lastName: 'Sharma', role: 'seller', status: 'active',
  avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Priya',
  createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-07-01T00:00:00Z',
};

// ── Dashboard Analytics ───────────────────────────────────────────────────────

export const MOCK_SELLER_REVENUE = [
  { month: 'Jan', revenue: 485000, orders: 42 },
  { month: 'Feb', revenue: 620000, orders: 58 },
  { month: 'Mar', revenue: 780000, orders: 71 },
  { month: 'Apr', revenue: 540000, orders: 48 },
  { month: 'May', revenue: 890000, orders: 84 },
  { month: 'Jun', revenue: 1050000, orders: 96 },
  { month: 'Jul', revenue: 720000, orders: 63 },
];

export const MOCK_BUYER_SPEND = [
  { month: 'Jan', spend: 145000, orders: 8 },
  { month: 'Feb', spend: 220000, orders: 12 },
  { month: 'Mar', spend: 380000, orders: 18 },
  { month: 'Apr', spend: 290000, orders: 15 },
  { month: 'May', spend: 450000, orders: 22 },
  { month: 'Jun', spend: 520000, orders: 27 },
  { month: 'Jul', spend: 170629, orders: 11 },
];

export const MOCK_CATEGORY_BREAKDOWN = [
  { name: 'Engine Parts', value: 35 },
  { name: 'Electrical', value: 22 },
  { name: 'Brakes', value: 18 },
  { name: 'Tyres', value: 14 },
  { name: 'Others', value: 11 },
];
