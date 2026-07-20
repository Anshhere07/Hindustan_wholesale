import type { Metadata } from 'next';
import VerifyOtpPage from '@/modules/auth/VerifyOtpPage';

export const metadata: Metadata = {
  title: 'Verify OTP | Hindustan Wheels',
  description: 'Enter the 6-digit verification code sent to your registered device.',
};

export default function VerifyOtpRoute() {
  return <VerifyOtpPage />;
}
