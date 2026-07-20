import type { Metadata } from 'next';
import PageShell from '@/components/layout/PageShell';

export const metadata: Metadata = { title: 'Buyer Portal' };

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return <PageShell>{children}</PageShell>;
}
