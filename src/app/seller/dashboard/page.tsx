export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import SellerDashboard from '@/modules/seller/SellerDashboard';
export const metadata: Metadata = { title: 'Seller Dashboard' };
export default function SellerDashboardPage() { return <SellerDashboard />; }
