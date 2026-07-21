import React from 'react';
import CategoryDetails from '@/modules/categories/CategoryDetails';

export const metadata = {
  title: 'Category Details | Hindustan Wholesale',
  description: 'View wholesale products in this category on Hindustan Wholesale.',
};

export default async function Page({ params }: { params: Promise<{ categoryId: string }> }) {
  const resolvedParams = await params;
  return <CategoryDetails categoryId={resolvedParams.categoryId} />;
}
