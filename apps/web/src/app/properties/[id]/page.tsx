'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { PhotoCarousel } from '@/components/PhotoCarousel';
import { BookingWidget } from '@/components/BookingWidget';
import { ReviewsList } from '@/components/ReviewsList';
import { formatAddress, formatAmenity } from '@enatebet/shared';
import type { Listing, Review } from '@enatebet/shared';

export default function PropertyDetailPage() {
  const params = useParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch listing
        const listingRes = await fetch(`/api/listings/${params.id}`);
        const listingData = await listingRes.json();

        if (!listingData.success) {
          throw new Error(listingData.error || 'Failed to fetch listing');
        }

        setListing(listingData.data);

        // Fetch reviews
        const reviewsRes = await fetch(`/api/reviews?listingId=${params.id}`);
        const reviewsData = await reviewsRes.json();

        if (reviewsData.success) {
          setReviews(reviewsData.data);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Property not found'}</p>
          <a href="/properties" className="text-pink-600 hover:text-pink-700 font-medium">
            ← Back to properties
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-1">
              {listing.stats.rating > 0 && (
                <>
                  <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                  <span className="font-medium">{listing.stats.rating.toFixed(1)}</span>
                  <span>({listing.stats.reviewCount} reviews)</span>
                </>
              )}
            </div>
            <span>•</span>
            <span>{formatAddress(listing.location)}</span>
          </div>
        </div>

        {/* Photo Gallery */}
        <PhotoCarousel images={listing.images} alt={listing.title} />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Property Info */}
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-2xl font-bold mb-4">About this place</h2>
              <p className="text-gray-700 leading-relaxed mb-4">{listing.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Property type:</span>
                  <p className="font-medium capitalize">{listing.propertyType}</p>
                </div>
                <div>
                  <span className="text-gray-600">Room type:</span>
                  <p className="font-medium capitalize">{listing.roomType.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-gray-600">Max guests:</span>
                  <p className="font-medium">{listing.rules.maxGuests}</p>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-2xl font-bold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {listing.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{formatAmenity(amenity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* House Rules */}
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-2xl font-bold mb-4">House Rules</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in:</span>
                  <span className="font-medium">{listing.rules.checkInTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out:</span>
                  <span className="font-medium">{listing.rules.checkOutTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Minimum nights:</span>
                  <span className="font-medium">{listing.availability.minNights}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Maximum nights:</span>
                  <span className="font-medium">{listing.availability.maxNights}</span>
                </div>
                <div className="border-t pt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    {listing.rules.petsAllowed ? '✓' : '✗'}
                    <span className={listing.rules.petsAllowed ? 'text-green-600' : 'text-red-600'}>
                      Pets {listing.rules.petsAllowed ? 'allowed' : 'not allowed'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {listing.rules.smokingAllowed ? '✓' : '✗'}
                    <span className={listing.rules.smokingAllowed ? 'text-green-600' : 'text-red-600'}>
                      Smoking {listing.rules.smokingAllowed ? 'allowed' : 'not allowed'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {listing.rules.partiesAllowed ? '✓' : '✗'}
                    <span className={listing.rules.partiesAllowed ? 'text-green-600' : 'text-red-600'}>
                      Parties {listing.rules.partiesAllowed ? 'allowed' : 'not allowed'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow">
                <h2 className="text-2xl font-bold mb-6">
                  {listing.stats.reviewCount} Reviews
                  {listing.stats.rating > 0 && (
                    <span className="ml-2 text-lg font-normal text-gray-600">
                      ({listing.stats.rating.toFixed(1)} average)
                    </span>
                  )}
                </h2>
                <ReviewsList reviews={reviews} />
              </div>
            )}
          </div>

          {/* Right Column - Booking Widget */}
          <div className="lg:col-span-1">
            <BookingWidget listing={listing} />
          </div>
        </div>
      </div>
    </div>
  );
}
