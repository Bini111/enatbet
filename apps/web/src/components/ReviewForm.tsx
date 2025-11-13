'use client';

import { useState } from 'react';
import { CreateReviewInput } from '@enatbet/shared';

interface ReviewFormProps {
  listingId: string;
  bookingId: string;
  onSubmit: (review: CreateReviewInput) => Promise<void>;
  onCancel?: () => void;
}

export function ReviewForm({ listingId, bookingId, onSubmit, onCancel }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [cleanliness, setCleanliness] = useState(5);
  const [accuracy, setAccuracy] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [location, setLocation] = useState(5);
  const [value, setValue] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({
        listingId,
        bookingId,
        rating,
        cleanliness,
        accuracy,
        communication,
        location,
        value,
        comment,
      });
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({
    value,
    onChange,
    label,
  }: {
    value: number;
    onChange: (value: number) => void;
    label: string;
  }) => (
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <span
              className={`text-2xl ${
                star <= value ? 'text-yellow-400' : 'text-gray-300'
              }`}
            >
              ★
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
        <div className="space-y-4">
          <StarRating value={rating} onChange={setRating} label="Overall Rating" />
          <StarRating value={cleanliness} onChange={setCleanliness} label="Cleanliness" />
          <StarRating value={accuracy} onChange={setAccuracy} label="Accuracy" />
          <StarRating
            value={communication}
            onChange={setCommunication}
            label="Communication"
          />
          <StarRating value={location} onChange={setLocation} label="Location" />
          <StarRating value={value} onChange={setValue} label="Value" />
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          Your Review
        </label>
        <textarea
          id="comment"
          rows={5}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-600 focus:border-transparent"
          placeholder="Share your experience with other travelers..."
        />
      </div>

      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
}
