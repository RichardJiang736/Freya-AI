import './globals.css';
import type { Metadata } from 'next';
import { Work_Sans } from 'next/font/google';
import { AuthProvider } from './context/auth';

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['200', '300', '400', '500'],
});

export const metadata: Metadata = {
  title: 'freya — emotion-driven music curation',
  description:
    'Discover music that resonates with your emotional state. AI-powered curation built on psychological models of emotion.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={workSans.variable} data-scroll-behavior="smooth">
      <body className="font-sans bg-alabaster text-charcoal antialiased min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
