'use client';

import { useEffect, useState } from 'react';
import { Users, Home, Calendar, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalHosts: number;
  totalListings: number;
  activeBookings: number;
  pendingApprovals: number;
  monthlyRevenue: number;
  userGrowth: number;
  bookingGrowth: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
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

  const statCards = [
    {
      name: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      change: `+${stats?.userGrowth || 0}%`,
      changeType: 'positive',
    },
    {
      name: 'Total Hosts',
      value: stats?.totalHosts || 0,
      icon: Home,
      change: 'Active',
      changeType: 'neutral',
    },
    {
      name: 'Active Bookings',
      value: stats?.activeBookings || 0,
      icon: Calendar,
      change: `+${stats?.bookingGrowth || 0}%`,
      changeType: 'positive',
    },
    {
      name: 'Monthly Revenue',
      value: `$${stats?.monthlyRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      change: '+12.5%',
      changeType: 'positive',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of platform metrics</p>
      </div>

      {stats && stats.pendingApprovals > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-900">Pending Approvals</h3>
            <p className="text-sm text-yellow-700 mt-1">
              {stats.pendingApprovals} listing{stats.pendingApprovals !== 1 ? 's' : ''} awaiting review
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className="p-3 bg-primary-50 rounded-lg">
                <stat.icon className="w-6 h-6 text-primary-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className={`w-4 h-4 ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-gray-400'
              }`} />
              <span className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-gray-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500">from last month</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
