import { Metadata } from 'next';
import { ContactPage } from '@/modules/contact/ContactPage';

export const metadata: Metadata = {
  title: 'Contact Us | Hindustan Wholesale - B2B Marketplace Support',
  description: 'Reach out to Hindustan Wholesale for bulk pricing, seller onboarding, logistics support, or general business inquiries.',
};

export default function Page() {
  return <ContactPage />;
}
