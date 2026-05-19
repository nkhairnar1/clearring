import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "ClearRing — Know who's calling before you answer",
  description: "Community-powered caller intelligence. Identify spam, verify businesses, and protect yourself from phone fraud. Real-time spam detection for India.",
  keywords: ['spam call detection', 'caller ID', 'phone lookup', 'scam protection', 'India'],
  authors: [{ name: 'ClearRing' }],
  openGraph: {
    title: "ClearRing — Know who's calling before you answer",
    description: "Real-time spam detection & caller intelligence. Community-powered. Free forever.",
    type: 'website',
    siteName: 'ClearRing',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: "ClearRing — Caller Intelligence for India",
    description: "Identify spam calls, verify businesses, and protect yourself from phone fraud.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://clearring.app' },
  themeColor: '#3b82f6',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
