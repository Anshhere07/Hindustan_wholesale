// ─────────────────────────────────────────────────────────────────────────────
// Firestore — Categories Collection Service
// ─────────────────────────────────────────────────────────────────────────────

import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  collection,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from '../config';
import type { Category } from '@/types/product.types';

const COLLECTION = 'categories';

export async function getAllCategories(): Promise<Category[]> {
  try {
    const snap = await getDocs(collection(db, COLLECTION));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Category);
    if (list.length > 0) {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    const { MOCK_CATEGORIES } = await import('@/lib/api/mock-data');
    return MOCK_CATEGORIES;
  } catch (err) {
    console.warn('getAllCategories error (falling back to mock):', err);
    const { MOCK_CATEGORIES } = await import('@/lib/api/mock-data');
    return MOCK_CATEGORIES;
  }
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Category;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const q = query(collection(db, COLLECTION), where('slug', '==', slug));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Category;
}

export async function createCategory(
  id: string,
  data: Omit<Category, 'id' | 'productCount'>
): Promise<void> {
  await setDoc(doc(db, COLLECTION, id), {
    ...data,
    productCount: 0,
    isActive: true,
    createdAt: serverTimestamp(),
  });
}

export async function incrementProductCount(categoryId: string, delta: number): Promise<void> {
  await updateDoc(doc(db, COLLECTION, categoryId), {
    productCount: increment(delta),
  });
}
