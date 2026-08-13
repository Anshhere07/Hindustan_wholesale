export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import SellerListings from '@/modules/seller/SellerListings';
export const metadata: Metadata = { title: 'My Listings' };
export default function SellerListingsPage() { return <SellerListings />; }
