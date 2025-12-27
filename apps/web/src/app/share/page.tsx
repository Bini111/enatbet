'use client';

import { useState } from 'react';

export default function SharePage() {
  const [copied, setCopied] = useState(false);
  const shareUrl = 'https://enatbet.app';
  const shareText = 'Check out Enatbet - Book homes from Ethiopian and Eritrean hosts worldwide!';

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="text-6xl mb-4">🔗</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Share Enatbet</h1>
        <p className="text-gray-600 mb-8">
          Invite your family and friends to discover homes from our community.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          
            href={`mailto:?subject=Check out Enatbet&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`}
            className="bg-gray-600 text-white py-4 px-4 rounded-xl hover:opacity-90 transition-opacity flex flex-col items-center gap-2"
          >
            <span className="text-2xl">📧</span>
            <span className="font-medium">Email</span>
          </a>

          
            href={`sms:?body=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
            className="bg-green-500 text-white py-4 px-4 rounded-xl hover:opacity-90 transition-opacity flex flex-col items-center gap-2"
          >
            <span className="text-2xl">💬</span>
            <span className="font-medium">SMS</span>
          </a>

          
            href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 text-white py-4 px-4 rounded-xl hover:opacity-90 transition-opacity flex flex-col items-center gap-2"
          >
            <span className="text-2xl">📱</span>
            <span className="font-medium">WhatsApp</span>
          </a>

          
            href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 text-white py-4 px-4 rounded-xl hover:opacity-90 transition-opacity flex flex-col items-center gap-2"
          >
            <span className="text-2xl">✈️</span>
            <span className="font-medium">Telegram</span>
          </a>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <p className="text-gray-500 text-sm mb-3">Or copy link</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-4 py-3 bg-gray-100 rounded-lg text-gray-700 text-sm"
            />
            <button
              onClick={copyLink}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                copied ? 'bg-green-500 text-white' : 'bg-pink-600 text-white hover:bg-pink-700'
              }`}
            >
              {copied ? '✓' : '📋'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
