import type { Metadata } from 'next';
import LandingPage from '@/modules/landing/LandingPage';

export const metadata: Metadata = {
  title: 'Hindustan Wholesale — India\'s B2B Wholesale Marketplace',
  description:
    'Buy wholesale online in India. Verified manufacturers & brands, MOQ pricing, GST invoices, pan-India logistics.',
};

export default function HomePage() {
  return <LandingPage />;
}
