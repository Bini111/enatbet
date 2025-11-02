'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { user, signOutUser, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleSignOut = async () => {
    await signOutUser();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 bg-pink-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {user.displayName?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{user.displayName}</h1>
            <p className="text-gray-600">{user.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {user.role}
            </span>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Account Details</h2>
          <div className="space-y-3">
            <div>
              <span className="text-gray-600">Member since:</span>
              <span className="ml-2 font-medium">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <span className="ml-2 font-medium">
                {user.isVerified ? 'Verified ✅' : 'Not verified'}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="mt-8 w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
