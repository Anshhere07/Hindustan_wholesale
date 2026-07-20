import type { Metadata } from 'next';
import PageShell from '@/components/layout/PageShell';
export const metadata: Metadata = { title: 'Seller Portal' };
export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return <PageShell>{children}</PageShell>;
}
