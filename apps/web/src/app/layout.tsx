'use client';

import { useEffect } from 'react';
import './globals.css';
import Navbar from '@/components/Navbar';
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
      <body className="antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
