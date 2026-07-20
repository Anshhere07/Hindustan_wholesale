import type { Metadata } from 'next';
import LoginPage from '@/modules/auth/LoginPage';
export const metadata: Metadata = { title: 'Sign In' };
export default function LoginRoute() { return <LoginPage />; }
