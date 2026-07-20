import type { Metadata } from 'next';
import BuyerDashboard from '@/modules/buyer/BuyerDashboard';

export const metadata: Metadata = { title: 'Dashboard — Buyer Portal' };

export default function BuyerDashboardPage() {
  return <BuyerDashboard />;
}
