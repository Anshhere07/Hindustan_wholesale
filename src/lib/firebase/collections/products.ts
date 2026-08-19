// ─────────────────────────────────────────────────────────────────────────────
// Firestore — Products Collection Service
// ─────────────────────────────────────────────────────────────────────────────

import {
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  collection,
  serverTimestamp,
  type QueryDocumentSnapshot,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from '../config';
import type { Product, ProductListItem, ProductFilter } from '@/types/product.types';

const COLLECTION = 'products';

// ── Get single product ────────────────────────────────────────────────────────

export async function getProductById(id: string): Promise<Product | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Product;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const q = query(collection(db, COLLECTION), where('slug', '==', slug), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Product;
}

// ── List products with filters ────────────────────────────────────────────────

export async function getProducts(
  filters: ProductFilter = {},
  pageSize = 20,
  lastDoc?: QueryDocumentSnapshot
): Promise<{ products: ProductListItem[]; lastVisible: QueryDocumentSnapshot | null }> {
  try {
    // Only return products that are BOTH active status AND admin-approved
    const constraints: QueryConstraint[] = [
      where('status', '==', 'active'),
      where('approvalStatus', '==', 'approved'),
    ];

    if (filters.sellerId) {
      constraints.push(where('sellerId', '==', filters.sellerId));
    }

    constraints.push(limit(pageSize));
    if (lastDoc) constraints.push(startAfter(lastDoc));

    const q = query(collection(db, COLLECTION), ...constraints);
    const snap = await getDocs(q);

    let products: ProductListItem[] = snap.docs.map((d) => {
      const data = d.data() as Product;
      const primaryImg = (data.images || []).find((img) => img.isPrimary) ??
        (data.images || [])[0] ??
        { id: 'img-1', url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&q=80', altText: data.name, isPrimary: true, order: 1 };
      return {
        id: d.id,
        sku: data.sku,
        name: data.name,
        slug: data.slug,
        basePrice: data.basePrice,
        currency: data.currency,
        moq: data.moq,
        unit: data.unit,
        stock: data.stock,
        rating: data.rating ?? 0,
        reviewCount: data.reviewCount ?? 0,
        sellerName: data.sellerName,
        sellerRating: data.sellerRating,
        leadTimeDays: data.leadTimeDays,
        isFeatured: data.isFeatured,
        status: data.status,
        approvalStatus: data.approvalStatus,
        brand: data.brand,
        vehicleType: data.vehicleType || '4-wheeler',
        primaryImage: primaryImg,
        categoryId: data.categoryId,
        categoryName: data.categoryName,
      } satisfies ProductListItem;
    });

    // Apply remaining client-side filters (category, vehicleType, brand, price, rating)
    if (filters.categoryId) {
      products = products.filter(
        (p) => p.categoryId === filters.categoryId ||
          p.categoryName?.toLowerCase().includes(filters.categoryId!.toLowerCase())
      );
    }
    if (filters.vehicleType && filters.vehicleType !== 'all') {
      const vFilter = filters.vehicleType.toLowerCase();
      products = products.filter(
        (p) => p.vehicleType?.toLowerCase() === vFilter ||
          (p as any).tags?.some((t: string) => t.toLowerCase().includes(vFilter))
      );
    }
    if (filters.brand?.length) {
      products = products.filter((p) => p.brand && filters.brand!.includes(p.brand));
    }
    if (filters.inStock) {
      products = products.filter((p) => p.stock > 0);
    }

    // Client-side sort
    switch (filters.sortBy) {
      case 'price_asc': products.sort((a, b) => a.basePrice - b.basePrice); break;
      case 'price_desc': products.sort((a, b) => b.basePrice - a.basePrice); break;
      case 'rating': products.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break;
      case 'moq_asc': products.sort((a, b) => a.moq - b.moq); break;
    }

    const lastVisible = snap.docs[snap.docs.length - 1] ?? null;
    return { products, lastVisible };
  } catch (err) {
    console.warn('getProducts error (falling back to empty):', err);
    return { products: [], lastVisible: null };
  }
}

// ── Seller product management ─────────────────────────────────────────────────

export async function getSellerProducts(sellerId: string): Promise<ProductListItem[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('sellerId', '==', sellerId)
    );
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => {
      const data = d.data() as Product;
      const primaryImg = (data.images || []).find((img) => img.isPrimary) ??
        (data.images || [])[0] ??
        { id: 'img-1', url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&q=80', altText: data.name, isPrimary: true, order: 1 };
      return {
        id: d.id,
        sku: data.sku,
        name: data.name,
        slug: data.slug,
        basePrice: data.basePrice,
        currency: data.currency,
        moq: data.moq,
        unit: data.unit,
        stock: data.stock,
        rating: data.rating ?? 0,
        reviewCount: data.reviewCount ?? 0,
        sellerName: data.sellerName,
        sellerRating: data.sellerRating,
        leadTimeDays: data.leadTimeDays,
        isFeatured: data.isFeatured,
        status: data.status,
        approvalStatus: data.approvalStatus,
        brand: data.brand,
        vehicleType: data.vehicleType || '4-wheeler',
        primaryImage: primaryImg,
        categoryId: data.categoryId,
        categoryName: data.categoryName,
      } satisfies ProductListItem;
    });
    return items;
  } catch (err) {
    console.warn('getSellerProducts error:', err);
    return [];
  }
}

export async function createProduct(
  data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const sellerPrice = data.sellerPrice || data.basePrice;
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    sellerPrice,
    basePrice: data.basePrice,
    approvalStatus: data.approvalStatus || 'pending',
    rating: 0,
    reviewCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

// ── Admin Product Approval Helpers ────────────────────────────────────────────

export async function getAllProductsAdmin(): Promise<Product[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product);
    return list.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt as string).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt as string).getTime() : 0;
      return dateB - dateA;
    });
  } catch (err) {
    console.warn('getAllProductsAdmin error:', err);
    return [];
  }
}

export async function approveProductAdmin(id: string, product?: Product): Promise<number> {
  let prod = product;
  if (!prod) {
    prod = (await getProductById(id)) || undefined;
  }

  // Preserve seller price and add 10% margin for buyer price
  const rawSellerPrice = prod?.sellerPrice || prod?.basePrice || 0;
  // Increase price by 10% (e.g. 10 -> 11, 100 -> 110, 1250 -> 1375)
  const approvedBuyerPrice = Math.round(rawSellerPrice * 1.10 * 100) / 100;

  let updatedTiers = prod?.priceTiers;
  if (prod?.priceTiers && prod.priceTiers.length > 0) {
    updatedTiers = prod.priceTiers.map((t) => ({
      ...t,
      price: Math.round((t.price || rawSellerPrice) * 1.10 * 100) / 100,
    }));
  }

  await updateDoc(doc(db, COLLECTION, id), {
    approvalStatus: 'approved',
    status: 'active',
    sellerPrice: rawSellerPrice,
    basePrice: approvedBuyerPrice,
    ...(updatedTiers ? { priceTiers: updatedTiers } : {}),
    updatedAt: serverTimestamp(),
  });

  return approvedBuyerPrice;
}

export async function rejectProductAdmin(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    approvalStatus: 'rejected',
    status: 'draft',
    updatedAt: serverTimestamp(),
  });
}

// ── Featured products (for buyer dashboard) ───────────────────────────────────

export async function getFeaturedProducts(count = 8): Promise<ProductListItem[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('status', '==', 'active'),
      limit(count)
    );
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => {
      const data = d.data() as Product;
      const primaryImg = (data.images || []).find((img) => img.isPrimary) ??
        (data.images || [])[0] ??
        { id: 'img-1', url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&q=80', altText: data.name, isPrimary: true, order: 1 };
      return {
        id: d.id,
        sku: data.sku,
        name: data.name,
        slug: data.slug,
        basePrice: data.basePrice,
        currency: data.currency,
        moq: data.moq,
        unit: data.unit,
        stock: data.stock,
        rating: data.rating ?? 4.8,
        reviewCount: data.reviewCount ?? 1,
        sellerName: data.sellerName,
        sellerRating: data.sellerRating ?? 4.8,
        leadTimeDays: data.leadTimeDays ?? 3,
        isFeatured: data.isFeatured ?? true,
        status: data.status,
        approvalStatus: data.approvalStatus,
        brand: data.brand,
        vehicleType: data.vehicleType || '4-wheeler',
        primaryImage: primaryImg,
        categoryName: data.categoryName,
        categoryId: data.categoryId,
      } satisfies ProductListItem;
    });

    if (list.length > 0) {
      return list;
    }

    // If Firestore has no products yet, fallback to active items
    const { MOCK_PRODUCTS } = await import('@/lib/api/mock-data');
    return MOCK_PRODUCTS.filter(p => p.status === 'active' || p.approvalStatus === 'approved').slice(0, count);
  } catch (err) {
    console.warn('getFeaturedProducts fallback:', err);
    const { MOCK_PRODUCTS } = await import('@/lib/api/mock-data');
    return MOCK_PRODUCTS.filter(p => p.status === 'active' || p.approvalStatus === 'approved').slice(0, count);
  }
}
