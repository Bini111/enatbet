'use client';

import { formatTimeAgo } from '@enatebet/shared';
import type { Review } from '@enatebet/shared';

interface ReviewsListProps {
  reviews: Review[];
  showAll?: boolean;
}

export function ReviewsList({ reviews, showAll = false }: ReviewsListProps) {
  const displayReviews = showAll ? reviews : reviews.slice(0, 6);

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No reviews yet. Be the first to review this property!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {displayReviews.map((review) => (
        <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold text-gray-600">
                  {review.reviewerId.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  Guest {review.reviewerId.slice(0, 8)}
                </p>
                <p className="text-sm text-gray-500">{formatTimeAgo(review.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${
                    i < review.ratings.overall ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
          </div>

          {/* Rating breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3 text-sm">
            <div>
              <span className="text-gray-600">Cleanliness:</span>{' '}
              <span className="font-medium">{review.ratings.cleanliness}/5</span>
            </div>
            <div>
              <span className="text-gray-600">Accuracy:</span>{' '}
              <span className="font-medium">{review.ratings.accuracy}/5</span>
            </div>
            <div>
              <span className="text-gray-600">Communication:</span>{' '}
              <span className="font-medium">{review.ratings.communication}/5</span>
            </div>
            <div>
              <span className="text-gray-600">Location:</span>{' '}
              <span className="font-medium">{review.ratings.location}/5</span>
            </div>
            <div>
              <span className="text-gray-600">Value:</span>{' '}
              <span className="font-medium">{review.ratings.value}/5</span>
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed">{review.comment}</p>

          {review.response && (
            <div className="mt-4 pl-4 border-l-4 border-gray-200 bg-gray-50 p-4 rounded">
              <p className="text-sm font-semibold text-gray-900 mb-1">Response from host:</p>
              <p className="text-sm text-gray-700">{review.response.text}</p>
              <p className="text-xs text-gray-500 mt-2">
                {formatTimeAgo(review.response.createdAt)}
              </p>
            </div>
          )}
        </div>
      ))}

      {!showAll && reviews.length > 6 && (
        <button className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
          Show all {reviews.length} reviews
        </button>
      )}
    </div>
  );
}
