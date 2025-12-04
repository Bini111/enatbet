'use client';

import { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const trimmedData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      subject: formData.subject,
      message: formData.message.trim(),
    };

    try {
      await addDoc(collection(db, 'contactMessages'), {
        ...trimmedData,
        status: 'unread',
        createdAt: serverTimestamp(),
      });
      
      setSubmitted(true);
    } catch (err: unknown) {
      console.error('[CONTACT] Submission error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to send message. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="text-6xl mb-4" role="img" aria-label="Success">📬</div>
          <h1 className="text-2xl font-bold mb-4">Message Sent!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for reaching out. Our team will respond to your message within 24-48 hours.
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
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions or need help? We are here for you. Reach out and our team will get back to you as soon as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Send a Message</h2>

            {error && (
              <div role="alert" aria-live="polite" className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
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
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                  required
                >
                  <option value="">Select a topic</option>
                  <option value="general">General Inquiry</option>
                  <option value="booking">Booking Help</option>
                  <option value="hosting">Hosting Questions</option>
                  <option value="payment">Payment Issues</option>
                  <option value="technical">Technical Support</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-4" role="img" aria-label="Email">📧</span>
                <div>
                  <h3 className="font-bold text-lg">Email Us</h3>
                  <a href="mailto:support@enatbet.com" className="text-pink-600 hover:underline">
                    support@enatbet.com
                  </a>
                </div>
              </div>
              <p className="text-gray-600 text-sm">For general inquiries and support</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-4" role="img" aria-label="Clock">⏰</span>
                <div>
                  <h3 className="font-bold text-lg">Response Time</h3>
                  <p className="text-gray-700">24-48 hours</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">We aim to respond to all inquiries within 2 business days</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-4" role="img" aria-label="Globe">🌍</span>
                <div>
                  <h3 className="font-bold text-lg">Global Community</h3>
                  <p className="text-gray-700">Serving diaspora worldwide</p>
                </div>
              </div>
              <p className="text-gray-600 text-sm">Supporting Ethiopian and Eritrean communities across the globe</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/terms-of-service" className="text-pink-600 hover:underline">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="text-pink-600 hover:underline">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/become-a-host" className="text-pink-600 hover:underline">
                    Become a Host
                  </Link>
                </li>
                <li>
                  <Link href="/resources" className="text-pink-600 hover:underline">
                    Resources & Help
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
