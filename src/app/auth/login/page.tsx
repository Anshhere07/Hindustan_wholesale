import type { Metadata } from 'next';
import LoginPage from '@/modules/auth/LoginPage';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Sign In | Hindustan Wholesale' };

export default function LoginRoute() {
  return <LoginPage />;
}
