import type { Metadata } from 'next';
import PageShell from '@/components/layout/PageShell';
export const metadata: Metadata = { title: 'Admin Portal' };
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <PageShell>{children}</PageShell>;
}
