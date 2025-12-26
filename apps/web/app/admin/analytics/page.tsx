'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, Home, Calendar, DollarSign, MapPin } from 'lucide-react';

interface AnalyticsData {
  userGrowth: { month: string; users: number }[];
  bookingTrends: { month: string; bookings: number }[];
  revenueData: { month: string; revenue: number }[];
  topLocations: { city: string; bookings: number }[];
  propertyTypes: { type: string; count: number }[];
  occupancyRate: number;
  avgBookingValue: number;
  repeatGuestRate: number;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`);
      const analyticsData = await res.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Platform performance metrics</p>
        </div>
        <div className="flex gap-2">
          {['week', 'month', 'year'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p as any)}
              className={`px-4 py-2.5 rounded-lg font-medium capitalize transition-colors ${
                period === p
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Occupancy Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {data?.occupancyRate || 0}%
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Home className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-4 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            +5.2% from last {period}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Booking Value</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${data?.avgBookingValue || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-blue-600 mt-4 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            +12% from last {period}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Repeat Guest Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {data?.repeatGuestRate || 0}%
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-purple-600 mt-4 flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            +3% from last {period}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {data?.userGrowth?.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-primary-500 rounded-t"
                  style={{ height: `${(item.users / Math.max(...data.userGrowth.map(d => d.users))) * 100}%` }}
                />
                <span className="text-xs text-gray-600">{item.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Trends</h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {data?.bookingTrends?.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${(item.bookings / Math.max(...data.bookingTrends.map(d => d.bookings))) * 100}%` }}
                />
                <span className="text-xs text-gray-600">{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Top Locations
          </h2>
          <div className="space-y-3">
            {data?.topLocations?.map((location, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-400">#{i + 1}</span>
                  <span className="font-medium text-gray-900">{location.city}</span>
                </div>
                <span className="text-sm text-gray-600">{location.bookings} bookings</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Home className="w-5 h-5" />
            Property Types
          </h2>
          <div className="space-y-3">
            {data?.propertyTypes?.map((type, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="font-medium text-gray-900 capitalize">{type.type}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500"
                      style={{ width: `${(type.count / Math.max(...data.propertyTypes.map(t => t.count))) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">{type.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
