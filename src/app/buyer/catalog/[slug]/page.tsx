export const dynamic = 'force-dynamic';

import React from 'react';
import ProductDetails from '@/modules/products/ProductDetails';

export const metadata = {
  title: 'Product Details | Hindustan Wholesale',
  description: 'View wholesale details, bulk pricing tiers, and specifications for this product.',
};

export default async function BuyerProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  return <ProductDetails productId={resolvedParams.slug} />;
}
