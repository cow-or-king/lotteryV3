import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { TRPCProvider } from '@/lib/trpc/Provider';
import { RoleImpersonationProvider } from '@/lib/rbac/RoleImpersonationProvider';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ReviewLottery v3.0',
  description: 'Professional SaaS for Review Management with Gamification',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <TRPCProvider>
          <RoleImpersonationProvider>{children}</RoleImpersonationProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
