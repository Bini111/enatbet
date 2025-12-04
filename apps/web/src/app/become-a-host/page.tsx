'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function BecomeAHostPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    propertyCity: '',
    propertyType: '',
    message: '',
    agreedToTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const trimmedData = {
      fullName: formData.fullName.trim(),
      email: user?.email || formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      propertyCity: formData.propertyCity.trim(),
      propertyType: formData.propertyType,
      message: formData.message.trim(),
    };

    if (!validatePhone(trimmedData.phone)) {
      setError('Please enter a valid phone number (10-15 digits)');
      setIsSubmitting(false);
      return;
    }

    if (!formData.agreedToTerms) {
      setError('Please agree to the Terms of Service and Host Agreement');
      setIsSubmitting(false);
      return;
    }

    try {
      await addDoc(collection(db, 'hostApplications'), {
        ...trimmedData,
        userId: user?.uid || null,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      setSubmitted(true);
    } catch (err: unknown) {
      console.error('[HOST APPLICATION] Submission error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to submit application. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="text-6xl mb-4" role="img" aria-label="Success">🎉</div>
          <h1 className="text-2xl font-bold mb-4">Application Received!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your interest in becoming a host. Our team will review your application and contact you within 2-3 business days.
          </p>
          <Link
            href="/"
            className="inline-block bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-2xl">🇪🇹</span> Become an Enatbet Host <span className="text-2xl">🇪🇷</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Share your home with the Ethiopian and Eritrean diaspora community. Earn extra income while helping fellow community members find a home away from home.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-3" role="img" aria-label="Money">💰</div>
            <h3 className="font-bold text-lg mb-2">Earn Extra Income</h3>
            <p className="text-gray-600 text-sm">Set your own prices and earn money from your spare room or property.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-3" role="img" aria-label="Handshake">🤝</div>
            <h3 className="font-bold text-lg mb-2">Build Community</h3>
            <p className="text-gray-600 text-sm">Connect with guests from our diaspora community worldwide.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-3" role="img" aria-label="Shield">🛡️</div>
            <h3 className="font-bold text-lg mb-2">Host Protection</h3>
            <p className="text-gray-600 text-sm">We verify all guests and provide support throughout every booking.</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Host Application</h2>
          
          {!user && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                Already have an account?{' '}
                <Link href="/login" className="text-pink-600 hover:underline font-medium">Sign in</Link>
                {' '}to auto-fill your details, or continue as a guest below.
              </p>
            </div>
          )}

          {error && (
            <div role="alert" aria-live="polite" className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={user?.email || formData.email}
                  onChange={handleChange}
                  disabled={!!user?.email}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent disabled:bg-gray-100"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label htmlFor="propertyCity" className="block text-sm font-medium text-gray-700 mb-2">
                  Property Location (City) *
                </label>
                <input
                  id="propertyCity"
                  name="propertyCity"
                  type="text"
                  value={formData.propertyCity}
                  onChange={handleChange}
                  placeholder="e.g., Washington DC, Toronto, London"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-2">
                Property Type *
              </label>
              <select
                id="propertyType"
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                required
              >
                <option value="">Select property type</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="room">Private Room</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Tell us about your property
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                placeholder="Describe your property, amenities, and why you want to host..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
              />
            </div>

            <div className="flex items-start">
              <input
                id="agreedToTerms"
                name="agreedToTerms"
                type="checkbox"
                checked={formData.agreedToTerms}
                onChange={handleChange}
                className="mt-1 h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                required
              />
              <label htmlFor="agreedToTerms" className="ml-2 text-sm text-gray-600">
                I agree to the{' '}
                <Link href="/terms-of-service" className="text-pink-600 hover:underline" target="_blank">
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link href="/terms-of-service#host-agreement" className="text-pink-600 hover:underline" target="_blank">
                  Host Agreement
                </Link>
                {' '}*
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold mb-2">How much can I earn as a host?</h3>
              <p className="text-gray-600">Earnings vary based on location, property size, and availability. Hosts typically earn competitive rates similar to other vacation rental platforms in their area.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold mb-2">What are the requirements to become a host?</h3>
              <p className="text-gray-600">You need a clean, safe space to share, valid ID, and the legal right to rent your property. We verify all hosts before approval.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold mb-2">How do I get paid?</h3>
              <p className="text-gray-600">Payments are processed securely through Stripe. You will receive your earnings within 24 hours after guest check-in.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
