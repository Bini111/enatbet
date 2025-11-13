'use client';

import { Review } from '@enatbet/shared';

interface ReviewsListProps {
  reviews: Review[];
}

export function ReviewsList({ reviews }: ReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-900">Guest</span>
                <span className="text-yellow-400">{'★'.repeat(review.rating)}</span>
                <span className="text-gray-400">{'★'.repeat(5 - review.rating)}</span>
              </div>
              <p className="text-sm text-gray-500">
                {new Date(review.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <p className="text-gray-700 mb-3">{review.comment}</p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
            <div>
              <p className="text-gray-500">Cleanliness</p>
              <p className="font-medium">{review.cleanliness}/5</p>
            </div>
            <div>
              <p className="text-gray-500">Accuracy</p>
              <p className="font-medium">{review.accuracy}/5</p>
            </div>
            <div>
              <p className="text-gray-500">Communication</p>
              <p className="font-medium">{review.communication}/5</p>
            </div>
            <div>
              <p className="text-gray-500">Location</p>
              <p className="font-medium">{review.location}/5</p>
            </div>
            <div>
              <p className="text-gray-500">Value</p>
              <p className="font-medium">{review.value}/5</p>
            </div>
          </div>

          {review.response && (
            <div className="mt-4 ml-6 p-4 bg-gray-50 rounded-lg">
              <p className="font-semibold text-sm text-gray-900 mb-1">Response from host</p>
              <p className="text-gray-700 text-sm">{review.response.text}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(review.response.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
