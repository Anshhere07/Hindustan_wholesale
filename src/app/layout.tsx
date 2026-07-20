import type { Metadata, Viewport } from 'next';
import './globals.css';
import StoreHydration from '@/components/StoreHydration';

// ─────────────────────────────────────────────────────────────────────────────
// Root Layout — applies font, theme attribute, and global styles
// ─────────────────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: {
    default: 'Hindustan Wholesale — India\'s B2B Wholesale Marketplace',
    template: '%s | Hindustan Wholesale',
  },
  description:
    'Buy wholesale online in India. Verified manufacturers & brands, MOQ pricing, GST invoices, pan-India logistics. Factory se seedhe aapki dukaan tak.',
  keywords: ['B2B marketplace', 'wholesale India', 'bulk purchase', 'FMCG wholesale', 'kirana sourcing', 'apparel wholesale'],
  authors: [{ name: 'Hindustan Wholesale' }],
  creator: 'Hindustan Wholesale',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://hindustanwholesale.in',
    siteName: 'Hindustan Wholesale',
    title: 'Hindustan Wholesale — India\'s B2B Wholesale Marketplace',
    description: 'Factory se seedhe aapki dukaan tak. India\'s premier B2B wholesale platform.',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f4c81',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>
        <StoreHydration />
        {children}
      </body>
    </html>
  );
}

