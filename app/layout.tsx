import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/providers/AuthProvider';
import { ToastProvider } from '@/providers/ToastProvider';

// --- Sentry (added) ---
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN_WEB || process.env.NEXT_PUBLIC_SENTRY_DSN_WEB,
  tracesSampleRate: 0.15,
  replaysSessionSampleRate: 0.0,
  replaysOnErrorSampleRate: 0.25,
});
// --- end Sentry ---

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Community Stays - Book Your Perfect Space',
  description: 'Enterprise-grade community booking platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
