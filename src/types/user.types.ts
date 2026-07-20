// ─────────────────────────────────────────────────────────────────────────────
// User Domain Types
// ─────────────────────────────────────────────────────────────────────────────

import type { ID, Status, Timestamp, Address, ContactInfo } from './common.types';

export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  id: ID;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
  status: Status;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
}

export interface BuyerProfile {
  userId: ID;
  companyName: string;
  gstNumber?: string;
  panNumber?: string;
  businessType: 'proprietorship' | 'partnership' | 'pvt_ltd' | 'llp' | 'other';
  industryType: string;
  annualTurnover?: number;
  employeeCount?: number;
  primaryContact: ContactInfo;
  billingAddress: Address;
  shippingAddresses: Address[];
  creditLimit?: number;
  paymentTerms?: string;
  kycVerified: boolean;
}

export interface SellerProfile {
  userId: ID;
  businessName: string;
  brandName?: string;
  gstNumber: string;
  panNumber: string;
  businessType: 'manufacturer' | 'distributor' | 'dealer' | 'trader';
  categories: string[];
  primaryContact: ContactInfo;
  warehouseAddresses: Address[];
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    accountHolderName: string;
  };
  rating: number;
  totalOrders: number;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedAt?: Timestamp;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Timestamp;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
