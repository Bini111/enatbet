'use client';

import { useState, useEffect } from 'react';
import { Star, Flag, Trash2, CheckCircle } from 'lucide-react';

interface Review {
  id: string;
  listingTitle: string;
  reviewerName: string;
  hostName: string;
  rating: number;
  comment: string;
  flaggedCount: number;
  status: 'active' | 'flagged' | 'removed';
  createdAt: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<'all' | 'flagged' | 'removed'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews?status=${filter}`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    try {
      await fetch(`/api/admin/reviews/${reviewId}/approve`, { method: 'POST' });
      fetchReviews();
    } catch (error) {
      console.error('Failed to approve review:', error);
    }
  };

  const handleRemove = async (reviewId: string) => {
    if (!confirm('Remove this review?')) return;
    try {
      await fetch(`/api/admin/reviews/${reviewId}`, { method: 'DELETE' });
      fetchReviews();
    } catch (error) {
      console.error('Failed to remove review:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
        <p className="text-gray-600 mt-1">Moderate user reviews and ratings</p>
      </div>

      <div className="flex gap-2">
        {[
          { key: 'all', label: 'All Reviews' },
          { key: 'flagged', label: 'Flagged' },
          { key: 'removed', label: 'Removed' },
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

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">
            No reviews found
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{review.reviewerName}</h3>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{review.listingTitle}</p>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  {review.flaggedCount > 0 && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1">
                      <Flag className="w-3 h-3" />
                      {review.flaggedCount} flag{review.flaggedCount !== 1 ? 's' : ''}
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    review.status === 'active' ? 'bg-green-100 text-green-700' :
                    review.status === 'flagged' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {review.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500">Host: {review.hostName}</p>
                <div className="flex gap-2">
                  {review.status === 'flagged' && (
                    <button
                      onClick={() => handleApprove(review.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => handleRemove(review.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
