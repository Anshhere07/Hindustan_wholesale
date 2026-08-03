// ─────────────────────────────────────────────────────────────────────────────
// Firestore Typed Helpers — collection references + converter factory
// ─────────────────────────────────────────────────────────────────────────────

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
  type CollectionReference,
  type DocumentReference,
} from 'firebase/firestore';
import { db } from './config';

export {
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  Timestamp,
  type QueryConstraint,
};

// ── Generic type-safe converter ───────────────────────────────────────────────

export function createConverter<T extends DocumentData>(): FirestoreDataConverter<T> {
  return {
    toFirestore(data: WithFieldValue<T>): DocumentData {
      return data as DocumentData;
    },
    fromFirestore(snapshot: QueryDocumentSnapshot, options: SnapshotOptions): T {
      return { id: snapshot.id, ...snapshot.data(options) } as unknown as T;
    },
  };
}

// ── Collection reference factories ────────────────────────────────────────────

export function colRef<T extends DocumentData>(
  path: string
): CollectionReference<T> {
  return collection(db, path).withConverter(createConverter<T>());
}

export function docRef<T extends DocumentData>(
  path: string,
  id: string
): DocumentReference<T> {
  return doc(db, path, id).withConverter(createConverter<T>());
}

// ── Utility: convert Firestore Timestamps to ISO strings ──────────────────────

export function tsToISO(ts: Timestamp | null | undefined): string {
  return ts ? ts.toDate().toISOString() : new Date().toISOString();
}

// ── Pagination helper ─────────────────────────────────────────────────────────

export interface PaginationResult<T> {
  data: T[];
  lastVisible: QueryDocumentSnapshot | null;
  hasMore: boolean;
}
