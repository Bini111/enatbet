'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Shield, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const { user } = useAuthStore();
  const router = useRouter();

  const isAdmin = user?.role === 'admin' || user?.isAdmin === true;

  useEffect(() => {
    // Wait for auth to initialize
    const timer = setTimeout(() => setChecking(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!checking && user && !isAdmin) {
      setError('Access denied. Admin privileges required.');
    }
  }, [checking, user, isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/admin');
      } else {
        setError(data.error || 'Invalid code');
        setCode('');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Admin Access</h1>
          <p className="text-gray-500 mb-6">Please sign in to continue.</p>
          
            href="/login"
            className="inline-block bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Logged in but not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-500 mb-6">You don't have admin privileges.</p>
          
            href="/"
            className="inline-block bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
          >
            Return Home
          </a>
        </div>
      </div>
    );
  }

  // Admin - show code entry
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
          <Shield className="w-12 h-12 text-pink-600 mx-auto mb-2" />
          <h1 className="text-2xl font-bold">Admin Verification</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your access code</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-3 border rounded-lg mb-4 text-center text-lg tracking-widest focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            autoFocus
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !code}
            className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Enter Admin'
            )}
          </button>
        </form>
        
        <a href="/" className="block text-center text-gray-500 text-sm mt-4 hover:text-gray-700">
          ← Back to Home
        </a>
      </div>
    </div>
  );
}
