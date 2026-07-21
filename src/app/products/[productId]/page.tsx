import React from 'react';
import ProductDetails from '@/modules/products/ProductDetails';

export const metadata = {
  title: 'Product Details | Hindustan Wholesale',
  description: 'View details, bulk pricing, and specifications for this product.',
};

export default async function Page({ params }: { params: Promise<{ productId: string }> }) {
  const resolvedParams = await params;
  return <ProductDetails productId={resolvedParams.productId} />;
}
