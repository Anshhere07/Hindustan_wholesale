import { Metadata } from 'next';
import { PressPage } from '@/modules/press/PressPage';

export const metadata: Metadata = {
  title: 'Press Release | Hindustan Wholesale - B2B Marketplace Launch',
  description: 'Hindustan Wholesale Launches to Simplify Wholesale Buying for Retailers Across India. Factory Se Seedhe Aapki Dukaan Tak.',
};

export default function Page() {
  return <PressPage />;
}
