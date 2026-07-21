import React from 'react';
import BrandDetails from '@/modules/brands/BrandDetails';

export const metadata = {
  title: 'Brand Details | Hindustan Wholesale',
  description: 'View brand details, location, and products.',
};

export default async function Page({ params }: { params: Promise<{ brandId: string }> }) {
  const resolvedParams = await params;
  return <BrandDetails brandId={resolvedParams.brandId} />;
}
