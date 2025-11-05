import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AnalyticsProvider } from '@/components/core/analytics-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { Suspense } from 'react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'KrishiX',
  description: 'Connect with farmers on KrishiX',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* 
        ===========================================================
        === THE FIX IS HERE: We've added the <head> section     ===
        === with the critical 'viewport-fit=cover' instruction. ===
        ===========================================================
      */}
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Suspense>
        <Toaster />
        <AnalyticsProvider />
      </body>
    </html>
  );
}
