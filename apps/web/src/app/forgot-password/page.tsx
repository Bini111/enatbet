'use client';

import { useState } from 'react';
import Link from 'next/link';
import { sendPasswordResetEmail } from '@/lib/firebase';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();

    try {
      await sendPasswordResetEmail(normalizedEmail);
      setSubmittedEmail(normalizedEmail);
      setSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setSuccess(false);
    setEmail('');
    setSubmittedEmail('');
    setError(null);
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="text-6xl mb-4" role="img" aria-label="Email sent">✉️</div>
          <h1 className="text-2xl font-bold mb-4">Check Your Email</h1>
          <p className="text-gray-600 mb-6">
            If an account exists for <strong>{submittedEmail}</strong>, you will receive a password reset link shortly.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Did not receive it? Check your spam folder or try again in a few minutes.
          </p>
          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
            >
              Back to Sign In
            </Link>
            <button
              onClick={handleTryAgain}
              className="block w-full text-pink-600 hover:underline font-medium"
            >
              Try a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-2 text-center">Forgot Password?</h1>
        <p className="text-gray-600 text-center mb-6">
          No worries! Enter your email and we will send you a reset link.
        </p>

        {error && (
          <div role="alert" aria-live="polite" className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
              placeholder="your@email.com"
              required
              autoFocus
              autoComplete="email"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Remember your password?{' '}
          <Link href="/login" className="text-pink-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
