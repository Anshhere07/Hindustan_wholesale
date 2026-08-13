import type { Metadata } from 'next';
import VerifyOtpPage from '@/modules/auth/VerifyOtpPage';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Verify OTP | Hindustan Wholesale',
  description: 'Enter the 6-digit verification code sent to your registered email.',
};

export default function VerifyOtpRoute() {
  return <VerifyOtpPage />;
}
