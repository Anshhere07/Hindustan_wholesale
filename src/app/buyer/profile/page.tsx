import type { Metadata } from 'next';
import UserProfileForm from '@/modules/shared/UserProfileForm';

export const metadata: Metadata = { title: 'My Profile | Hindustan Wholesale' };

export default function BuyerProfilePage() {
  return <UserProfileForm portalType="buyer" />;
}
