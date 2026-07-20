// ─────────────────────────────────────────────────────────────────────────────
// Product & Catalog Domain Types
// ─────────────────────────────────────────────────────────────────────────────

import type { ID, Status, Timestamp, Currency } from './common.types';

export type UnitOfMeasure =
  | 'piece'
  | 'set'
  | 'kg'
  | 'litre'
  | 'box'
  | 'carton'
  | 'pair'
  | 'dozen'
  | 'roll'
  | 'meter';

export interface ProductImage {
  id: ID;
  url: string;
  altText: string;
  isPrimary: boolean;
  order: number;
}

export interface ProductSpecification {
  name: string;
  value: string;
  unit?: string;
}

export interface PriceTier {
  minQty: number;
  maxQty?: number;
  price: number;
  currency: Currency;
}

export interface Category {
  id: ID;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: ID;
  children?: Category[];
  productCount: number;
}

export interface Product {
  id: ID;
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  category: Category;
  sellerId: ID;
  sellerName: string;
  sellerRating: number;
  images: ProductImage[];
  specifications: ProductSpecification[];
  priceTiers: PriceTier[];
  basePrice: number;
  currency: Currency;
  unit: UnitOfMeasure;
  moq: number; // Minimum Order Quantity
  stock: number;
  leadTimeDays: number;
  tags: string[];
  brand?: string;
  partNumber?: string;
  compatibleVehicles?: string[];
  isGstExempt: boolean;
  gstRate?: number; // percentage
  status: Status;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ProductListItem
  extends Pick<
    Product,
    | 'id'
    | 'sku'
    | 'name'
    | 'slug'
    | 'basePrice'
    | 'currency'
    | 'moq'
    | 'unit'
    | 'stock'
    | 'rating'
    | 'reviewCount'
    | 'sellerName'
    | 'sellerRating'
    | 'leadTimeDays'
    | 'isFeatured'
    | 'status'
    | 'brand'
  > {
  primaryImage: ProductImage;
  categoryName: string;
}

export interface ProductFilter {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minMoq?: number;
  maxMoq?: number;
  brand?: string[];
  sellerId?: string;
  inStock?: boolean;
  rating?: number;
  leadTimeDays?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'moq_asc';
  page?: number;
  pageSize?: number;
}
