import type { Metadata } from 'next';
import VerifyBusinessPage from '@/modules/auth/VerifyBusinessPage';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'KYC & Business Verification | Hindustan Wholesale',
  description: 'Submit your corporate verification documents and tax credentials.',
};

export default function VerifyBusinessRoute() {
  return <VerifyBusinessPage />;
}
