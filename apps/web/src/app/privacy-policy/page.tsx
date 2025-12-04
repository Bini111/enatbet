'use client';

import { privacyPolicy, formatContent } from '@enatbet/legal';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12">
        <div className="border-b pb-6 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {privacyPolicy.title}
          </h1>
          <p className="text-sm text-gray-600">
            Last Updated: {privacyPolicy.lastUpdated}
          </p>
          <p className="text-sm text-gray-600">
            Effective Date: {privacyPolicy.effectiveDate}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Table of Contents
          </h2>
          <nav className="space-y-2">
            {privacyPolicy.sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="block text-blue-600 hover:text-blue-800 hover:underline"
              >
                {section.title}
              </a>
            ))}
          </nav>
        </div>

        <div className="prose prose-lg max-w-none">
          {privacyPolicy.sections.map((section) => (
            <section key={section.id} id={section.id} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {section.title}
              </h2>
              {formatContent(section.content).map((paragraph, idx) => (
                <p key={idx} className="text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>

        <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-gray-800 font-medium">
            {privacyPolicy.effectiveStatement}
          </p>
        </div>

        <div className="mt-12 pt-8 border-t flex justify-between items-center">
          <Link
            href="/terms-of-service"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Terms of Service
          </Link>
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Back to Home →
          </Link>
        </div>
      </div>
    </div>
  );
}