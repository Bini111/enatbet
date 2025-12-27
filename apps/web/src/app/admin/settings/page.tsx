'use client';

import { useState, useEffect } from 'react';
import { Save, Shield, DollarSign, Globe, Bell } from 'lucide-react';

interface PlatformSettings {
  commissionRate: number;
  currency: string;
  defaultLanguage: string;
  bookingCancellationHours: number;
  autoApproveListings: boolean;
  requireHostVerification: boolean;
  enableGuestReviews: boolean;
  enableHostReviews: boolean;
  minBookingDays: number;
  maxBookingDays: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({
    commissionRate: 15,
    currency: 'USD',
    defaultLanguage: 'en',
    bookingCancellationHours: 48,
    autoApproveListings: false,
    requireHostVerification: true,
    enableGuestReviews: true,
    enableHostReviews: true,
    minBookingDays: 1,
    maxBookingDays: 90,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.settings) setSettings(data.settings);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure platform-wide settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary-50 rounded-lg">
            <DollarSign className="w-5 h-5 text-primary-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Commission & Currency</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform Commission (%)
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={settings.commissionRate}
              onChange={(e) => setSettings({ ...settings, commissionRate: Number(e.target.value) })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-sm text-gray-500 mt-1">Commission charged on each booking</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Currency
            </label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="ETB">ETB - Ethiopian Birr</option>
              <option value="GBP">GBP - British Pound</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Booking Policies</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cancellation Period (hours)
            </label>
            <input
              type="number"
              min="0"
              value={settings.bookingCancellationHours}
              onChange={(e) => setSettings({ ...settings, bookingCancellationHours: Number(e.target.value) })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Booking Days
            </label>
            <input
              type="number"
              min="1"
              value={settings.minBookingDays}
              onChange={(e) => setSettings({ ...settings, minBookingDays: Number(e.target.value) })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Booking Days
            </label>
            <input
              type="number"
              min="1"
              value={settings.maxBookingDays}
              onChange={(e) => setSettings({ ...settings, maxBookingDays: Number(e.target.value) })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-50 rounded-lg">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Host & Listing Controls</h2>
        </div>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoApproveListings}
              onChange={(e) => setSettings({ ...settings, autoApproveListings: e.target.checked })}
              className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
            />
            <div>
              <p className="font-medium text-gray-900">Auto-approve Listings</p>
              <p className="text-sm text-gray-500">New listings go live immediately without review</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.requireHostVerification}
              onChange={(e) => setSettings({ ...settings, requireHostVerification: e.target.checked })}
              className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
            />
            <div>
              <p className="font-medium text-gray-900">Require Host Verification</p>
              <p className="text-sm text-gray-500">Hosts must verify identity before listing</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableGuestReviews}
              onChange={(e) => setSettings({ ...settings, enableGuestReviews: e.target.checked })}
              className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
            />
            <div>
              <p className="font-medium text-gray-900">Enable Guest Reviews</p>
              <p className="text-sm text-gray-500">Allow guests to review their stay</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableHostReviews}
              onChange={(e) => setSettings({ ...settings, enableHostReviews: e.target.checked })}
              className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
            />
            <div>
              <p className="font-medium text-gray-900">Enable Host Reviews</p>
              <p className="text-sm text-gray-500">Allow hosts to review guests</p>
            </div>
          </label>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Globe className="w-5 h-5 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Localization</h2>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Language
          </label>
          <select
            value={settings.defaultLanguage}
            onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
            className="w-full md:w-1/2 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="en">English</option>
            <option value="am">Amharic (አማርኛ)</option>
            <option value="ti">Tigrinya (ትግርኛ)</option>
            <option value="om">Afaan Oromo</option>
            <option value="fr">French</option>
            <option value="ar">Arabic (العربية)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
