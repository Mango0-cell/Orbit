import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './global.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Orbit — Command the Void',
  description:
    'Harness the power of an intelligent, decentralized network designed to withstand the extremes of deep space communication and stellar discovery.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body>{children}</body>
    </html>
  );
}
