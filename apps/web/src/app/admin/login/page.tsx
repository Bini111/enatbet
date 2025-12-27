'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ADMIN_SECRET = 'Enatbet@11';

export default function AdminLoginPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code === ADMIN_SECRET) {
      document.cookie = 'adminToken=enatbet_admin_2025_secret; path=/; max-age=604800; secure; samesite=strict';
      router.push('/admin');
    } else {
      setError('Invalid access code');
      setCode('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
          <span className="text-4xl">🔐</span>
          <h1 className="text-2xl font-bold mt-2">Admin Access</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your access code</p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Access Code"
            className="w-full px-4 py-3 border rounded-lg mb-4 text-center text-lg tracking-widest"
            autoFocus
          />
          <button
            type="submit"
            className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 font-medium"
          >
            Enter
          </button>
        </form>
        
        <a href="/" className="block text-center text-gray-500 text-sm mt-4 hover:text-gray-700">
          ← Back to Home
        </a>
      </div>
    </div>
  );
}
