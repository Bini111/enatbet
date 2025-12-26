'use client';

import { useState, useEffect } from 'react';
import { Search, Mail, Shield } from 'lucide-react';

interface User {
  id: string;
  email: string;
  displayName: string;
  phoneNumber: string;
  role: 'guest' | 'host' | 'admin';
  status: 'active' | 'suspended' | 'banned';
  createdAt: string;
  totalBookings: number;
  totalListings: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'guest' | 'host' | 'admin'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?filter=${filter}`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, status: string) => {
    try {
      await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchUsers();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'guest', 'host', 'admin'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2.5 rounded-lg font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-700 font-semibold">
                            {user.displayName?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.displayName || 'Unnamed'}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'host' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role === 'admin' && <Shield className="w-3 h-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.status === 'active' ? 'bg-green-100 text-green-700' :
                        user.status === 'suspended' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.totalBookings} bookings
                      {user.totalListings > 0 && `, ${user.totalListings} listings`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                          <Mail className="w-4 h-4" />
                        </button>
                        <select
                          onChange={(e) => handleStatusChange(user.id, e.target.value)}
                          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                          defaultValue={user.status}
                        >
                          <option value="active">Active</option>
                          <option value="suspended">Suspend</option>
                          <option value="banned">Ban</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
