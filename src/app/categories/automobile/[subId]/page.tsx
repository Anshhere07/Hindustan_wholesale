import React from 'react';
import CategoryDetails from '@/modules/categories/CategoryDetails';

export const metadata = {
  title: 'Automobile Vehicle Category | Hindustan Wholesale',
  description: 'Browse wholesale auto parts by vehicle segment — 2-wheeler, 3-wheeler, 4-wheeler on Hindustan Wholesale.',
};

export default async function AutomobileSubcategoryPage({
  params,
}: {
  params: Promise<{ subId: string }>;
}) {
  const resolvedParams = await params;
  return <CategoryDetails categoryId="automobile" subCategoryId={resolvedParams.subId} />;
}
