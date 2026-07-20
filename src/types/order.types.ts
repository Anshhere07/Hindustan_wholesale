// ─────────────────────────────────────────────────────────────────────────────
// Order Domain Types
// ─────────────────────────────────────────────────────────────────────────────

import type { ID, Timestamp, Currency, Address } from './common.types';

export type OrderStatus =
  | 'draft'
  | 'pending_confirmation'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'return_requested'
  | 'returned'
  | 'refunded';

export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overdue' | 'refunded';

export type PaymentMethod =
  | 'credit_line'
  | 'bank_transfer'
  | 'upi'
  | 'cheque'
  | 'cash_on_delivery';

export interface OrderLineItem {
  id: ID;
  productId: ID;
  productName: string;
  productSku: string;
  productImageUrl: string;
  sellerId: ID;
  sellerName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: Currency;
  unit: string;
  gstRate: number;
  gstAmount: number;
  discount: number;
  netPrice: number;
}

export interface ShipmentTracking {
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: Timestamp;
  events: {
    timestamp: Timestamp;
    location: string;
    status: string;
    description: string;
  }[];
}

export interface Order {
  id: ID;
  orderNumber: string;
  buyerId: ID;
  buyerName: string;
  buyerGst?: string;
  items: OrderLineItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  shippingAddress: Address;
  billingAddress: Address;
  subtotal: number;
  totalDiscount: number;
  totalGst: number;
  shippingCharge: number;
  grandTotal: number;
  currency: Currency;
  notes?: string;
  purchaseOrderNumber?: string;
  tracking?: ShipmentTracking;
  invoiceUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  confirmedAt?: Timestamp;
  shippedAt?: Timestamp;
  deliveredAt?: Timestamp;
}

export interface CartItem {
  productId: ID;
  productName: string;
  productSku: string;
  productImageUrl: string;
  sellerId: ID;
  sellerName: string;
  quantity: number;
  unitPrice: number;
  currency: Currency;
  unit: string;
  moq: number;
  stock: number;
  gstRate: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  totalGst: number;
  totalDiscount: number;
  grandTotal: number;
  currency: Currency;
  itemCount: number;
}

export interface RFQ {
  id: ID;
  buyerId: ID;
  items: {
    productId?: ID;
    productName: string;
    description: string;
    quantity: number;
    targetPrice?: number;
    unit: string;
  }[];
  status: 'open' | 'quoted' | 'accepted' | 'rejected' | 'expired';
  deadline?: Timestamp;
  notes?: string;
  quotes: RFQQuote[];
  createdAt: Timestamp;
}

export interface RFQQuote {
  id: ID;
  rfqId: ID;
  sellerId: ID;
  sellerName: string;
  items: {
    productId: ID;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    leadTimeDays: number;
    notes?: string;
  }[];
  totalAmount: number;
  validUntil: Timestamp;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Timestamp;
}
