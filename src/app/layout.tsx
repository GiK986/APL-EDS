import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AppHeader } from '@/components/header';
import { HeaderVisibility } from '@/components/header-visibility';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'OEM Parts Catalog',
  description: 'Original equipment manufacturer parts catalog powered by YQ Service',
  icons: {
    icon: '/images/Logo.svg',
    shortcut: '/images/Logo.svg',
    apple: '/images/Logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <HeaderVisibility>
          <AppHeader />
        </HeaderVisibility>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
