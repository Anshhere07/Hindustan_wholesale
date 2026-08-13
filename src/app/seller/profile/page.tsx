export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import UserProfileForm from '@/modules/shared/UserProfileForm';

export const metadata: Metadata = { title: 'Business Profile | Hindustan Wholesale' };

export default function SellerProfilePage() {
  return <UserProfileForm portalType="seller" />;
}
