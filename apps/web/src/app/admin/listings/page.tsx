'use client';

import { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface Listing {
  id: string;
  title: string;
  propertyType: string;
  location: string;
  price: number;
  hostName: string;
  hostEmail: string;
  status: 'pending_approval' | 'active' | 'rejected' | 'inactive';
  createdAt: string;
  images: string[];
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending_approval' | 'active' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, [filter]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/listings?status=${filter}`);
      const data = await res.json();
      setListings(data.listings || []);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (listingId: string) => {
    try {
      await fetch(`/api/admin/listings/${listingId}/approve`, { method: 'POST' });
      fetchListings();
    } catch (error) {
      console.error('Failed to approve listing:', error);
    }
  };

  const handleReject = async (listingId: string) => {
    try {
      await fetch(`/api/admin/listings/${listingId}/reject`, { method: 'POST' });
      fetchListings();
    } catch (error) {
      console.error('Failed to reject listing:', error);
    }
  };

  const filteredListings = listings.filter(listing =>
    listing.title.toLowerCase().includes(search.toLowerCase()) ||
    listing.location.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = listings.filter(l => l.status === 'pending_approval').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Listings</h1>
          <p className="text-gray-600 mt-1">Review and manage property listings</p>
        </div>
        {pendingCount > 0 && (
          <div className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-medium">
            {pendingCount} pending approval{pendingCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending_approval', label: 'Pending' },
            { key: 'active', label: 'Active' },
            { key: 'rejected', label: 'Rejected' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as any)}
              className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                filter === f.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No listings found
          </div>
        ) : (
          filteredListings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-gray-200">
                {listing.images[0] && (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    listing.status === 'pending_approval' ? 'bg-yellow-500 text-white' :
                    listing.status === 'active' ? 'bg-green-500 text-white' :
                    listing.status === 'rejected' ? 'bg-red-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    {listing.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{listing.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{listing.location}</p>
                <p className="text-lg font-bold text-primary-600 mb-3">
                  ${listing.price}/night
                </p>
                <div className="text-sm text-gray-500 mb-4">
                  <p>Host: {listing.hostName}</p>
                  <p className="truncate">{listing.hostEmail}</p>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/admin/listings/${listing.id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </Link>
                  {listing.status === 'pending_approval' && (
                    <>
                      <button
                        onClick={() => handleApprove(listing.id)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(listing.id)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
