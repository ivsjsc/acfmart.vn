import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: {
    default: 'ACFMart - Mua sắm chính hãng, chống hàng giả',
    template: '%s | ACFMart',
  },
  description:
    'ACFMart - Nền tảng thương mại điện tử chống hàng giả của Quỹ Chống Hàng Giả Việt Nam. Mua sắm an tâm với 100% sản phẩm chính hãng.',
  keywords: ['thương mại điện tử', 'chống hàng giả', 'hàng chính hãng', 'ACFMart'],
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://acfmart.vn',
    siteName: 'ACFMart',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-gray-50 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
