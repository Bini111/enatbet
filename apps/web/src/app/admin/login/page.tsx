'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function AdminLoginPage() {
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(true);
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      setChecking(false);
      return;
    }
    
    if (user) {
      // Check if user is admin
      if (user.role === 'admin' || user.isAdmin === true) {
        // Set admin session cookie
        document.cookie = `adminSession=${user.uid}; path=/; max-age=86400; secure; samesite=strict`;
        router.push('/admin');
      } else {
        setError('Access denied. Admin privileges required.');
        setChecking(false);
      }
    }
  }, [user, router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-6">Admin Access</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {!user ? (
          <div>
            <p className="text-gray-600 mb-4">Please sign in to access the admin panel.</p>
            
              href="/login"
              className="inline-block bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700"
            >
              Sign In
            </a>
          </div>
        ) : (
          <div>
            <p className="text-gray-600 mb-4">
              Signed in as {user.email}
            </p>
            
              href="/"
              className="inline-block bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Return Home
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
