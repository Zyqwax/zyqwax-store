import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'ZyqWax Store',
    template: '%s | ZyqWax Store',
  },
  description: 'Kaliteli ürünler, güvenilir alışveriş. ZyqWax Store ile her şey bir tık uzakta.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
