// ─────────────────────────────────────────────────────────────────────────────
// Common Domain Types — shared across all modules
// ─────────────────────────────────────────────────────────────────────────────

export type ID = string;

export type Timestamp = string; // ISO 8601

export type Currency = 'INR' | 'USD' | 'EUR';

export type Status = 'active' | 'inactive' | 'pending' | 'pending_approval' | 'draft' | 'rejected' | 'suspended';

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  meta?: PaginationMeta;
}

export interface SelectOption {
  label: string;
  value: string;
}

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

export interface FilterConfig {
  [key: string]: string | number | boolean | string[] | undefined;
}

export interface Address {
  id: ID;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault?: boolean;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  designation?: string;
}
