export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import CatalogPage from '@/modules/buyer/CatalogPage';

export const metadata: Metadata = { title: 'Browse Catalog' };

export default function CatalogRoute() {
  return <CatalogPage />;
}
