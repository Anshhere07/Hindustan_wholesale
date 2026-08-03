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
  const constraints: QueryConstraint[] = [where('status', '==', 'active')];

  if (filters.categoryId) {
    constraints.push(where('categoryId', '==', filters.categoryId));
  }
  if (filters.sellerId) {
    constraints.push(where('sellerId', '==', filters.sellerId));
  }
  if (filters.brand?.length === 1) {
    // Firestore supports single equality for arrays; for multi-brand use client-side filter
    constraints.push(where('brand', '==', filters.brand[0]));
  }
  if (filters.inStock) {
    constraints.push(where('stock', '>', 0));
  }

  // Sorting
  switch (filters.sortBy) {
    case 'price_asc':
      constraints.push(orderBy('basePrice', 'asc'));
      break;
    case 'price_desc':
      constraints.push(orderBy('basePrice', 'desc'));
      break;
    case 'rating':
      constraints.push(orderBy('rating', 'desc'));
      break;
    case 'moq_asc':
      constraints.push(orderBy('moq', 'asc'));
      break;
    default:
      constraints.push(orderBy('isFeatured', 'desc'), orderBy('createdAt', 'desc'));
  }

  constraints.push(limit(pageSize));
  if (lastDoc) constraints.push(startAfter(lastDoc));

  const q = query(collection(db, COLLECTION), ...constraints);
  const snap = await getDocs(q);

  const products: ProductListItem[] = snap.docs.map((d) => {
    const data = d.data() as Product;
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
      rating: data.rating,
      reviewCount: data.reviewCount,
      sellerName: data.sellerName,
      sellerRating: data.sellerRating,
      leadTimeDays: data.leadTimeDays,
      isFeatured: data.isFeatured,
      status: data.status,
      brand: data.brand,
      primaryImage: data.images.find((img) => img.isPrimary) ?? data.images[0],
      categoryId: data.categoryId,
      categoryName: data.categoryName,
    } satisfies ProductListItem;
  });

  const lastVisible = snap.docs[snap.docs.length - 1] ?? null;
  return { products, lastVisible };
}

// ── Seller product management ─────────────────────────────────────────────────

export async function getSellerProducts(sellerId: string): Promise<ProductListItem[]> {
  const q = query(
    collection(db, COLLECTION),
    where('sellerId', '==', sellerId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as Product;
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
      rating: data.rating,
      reviewCount: data.reviewCount,
      sellerName: data.sellerName,
      sellerRating: data.sellerRating,
      leadTimeDays: data.leadTimeDays,
      isFeatured: data.isFeatured,
      status: data.status,
      brand: data.brand,
      primaryImage: data.images.find((img) => img.isPrimary) ?? data.images[0],
      categoryId: data.categoryId,
      categoryName: data.categoryName,
    } satisfies ProductListItem;
  });
}

export async function createProduct(
  data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
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

// ── Featured products (for buyer dashboard) ───────────────────────────────────

export async function getFeaturedProducts(count = 8): Promise<ProductListItem[]> {
  const q = query(
    collection(db, COLLECTION),
    where('status', '==', 'active'),
    where('isFeatured', '==', true),
    orderBy('rating', 'desc'),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data() as Product;
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
      rating: data.rating,
      reviewCount: data.reviewCount,
      sellerName: data.sellerName,
      sellerRating: data.sellerRating,
      leadTimeDays: data.leadTimeDays,
      isFeatured: data.isFeatured,
      status: data.status,
      brand: data.brand,
      primaryImage: data.images.find((img) => img.isPrimary) ?? data.images[0],
      categoryName: data.categoryName,
    } satisfies ProductListItem;
  });
}
