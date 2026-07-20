import type { Metadata } from 'next';
import CartPage from '@/modules/buyer/CartPage';
export const metadata: Metadata = { title: 'My Cart' };
export default function CartRoute() { return <CartPage />; }
