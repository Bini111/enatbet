'use client';

import { useState } from 'react';
import { Mail, Phone, Send, MessageCircle, Link as LinkIcon, Check, Share2 } from 'lucide-react';

export default function SharePage() {
  const [copied, setCopied] = useState(false);
  const shareUrl = 'https://enatbet.app';
  const shareText = 'Check out Enatbet - Book homes from Ethiopian & Eritrean hosts worldwide!';

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    {
      name: 'Email',
      icon: Mail,
      color: 'bg-gray-600',
      href: `mailto:?subject=Check out Enatbet&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`,
    },
    {
      name: 'SMS',
      icon: Phone,
      color: 'bg-green-500',
      href: `sms:?body=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-600',
      href: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
    },
    {
      name: 'Telegram',
      icon: Send,
      color: 'bg-blue-500',
      href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Share2 className="w-8 h-8 text-pink-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Share Enatbet</h1>
        <p className="text-gray-600 mb-8">
          Invite your family and friends to discover homes from our community.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {shareOptions.map((option) => (
            
              key={option.name}
              href={option.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${option.color} text-white py-4 px-4 rounded-xl hover:opacity-90 transition-opacity flex flex-col items-center gap-2`}
            >
              <option.icon className="w-6 h-6" />
              <span className="font-medium">{option.name}</span>
            </a>
          ))}
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
                copied 
                  ? 'bg-green-500 text-white' 
                  : 'bg-pink-600 text-white hover:bg-pink-700'
              }`}
            >
              {copied ? <Check className="w-5 h-5" /> : <LinkIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
