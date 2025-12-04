'use client';

import { useEffect } from 'react';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/store/authStore';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <html lang="en">
      <body className="antialiased flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
