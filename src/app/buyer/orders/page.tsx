import type { Metadata } from 'next';
import OrdersPage from '@/modules/buyer/OrdersPage';
export const metadata: Metadata = { title: 'My Orders' };
export default function OrdersRoute() { return <OrdersPage />; }
