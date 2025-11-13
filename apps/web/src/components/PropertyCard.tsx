'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { Listing } from '@enatebet/shared';
import { formatCurrency, formatShortAddress } from '@enatebet/shared';

interface PropertyCardProps {
  listing: Listing;
  onFavoriteToggle?: (listingId: string) => void;
  isFavorited?: boolean;
}

export function PropertyCard({ listing, onFavoriteToggle, isFavorited = false }: PropertyCardProps) {
  const primaryImage = listing.images[0] || '/placeholder-property.jpg';
  const pricePerNight = listing.pricing.basePrice;
  const rating = listing.stats.rating || 0;
  const reviewCount = listing.stats.reviewCount || 0;

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
      <Link href={`/properties/${listing.id}`}>
        <div className="relative h-64 w-full">
          <Image
            src={primaryImage}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {listing.roomType === 'free_stay' && (
            <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Free Stay
            </div>
          )}
        </div>
      </Link>

      {onFavoriteToggle && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onFavoriteToggle(listing.id);
          }}
          className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-md hover:scale-110 transition-transform"
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg
            className={`w-6 h-6 ${isFavorited ? 'fill-pink-600 text-pink-600' : 'text-gray-600'}`}
            fill={isFavorited ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      )}

      <Link href={`/properties/${listing.id}`}>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{listing.title}</h3>
            {rating > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
                <span className="font-medium">{rating.toFixed(1)}</span>
                <span className="text-gray-500">({reviewCount})</span>
              </div>
            )}
          </div>

          <p className="text-gray-600 text-sm mb-2">
            {formatShortAddress(listing.location)}
          </p>

          <p className="text-gray-500 text-sm mb-3 line-clamp-2">{listing.description}</p>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <span>{listing.rules.maxGuests} guests</span>
            <span>•</span>
            <span>{listing.propertyType}</span>
          </div>

          <div className="flex justify-between items-end">
            <div>
              <span className="text-2xl font-bold text-gray-900">
                {listing.roomType === 'free_stay'
                  ? 'Free'
                  : formatCurrency(pricePerNight, listing.pricing.currency)}
              </span>
              {listing.roomType !== 'free_stay' && (
                <span className="text-gray-600 text-sm ml-1">/ night</span>
              )}
            </div>
            <button className="text-pink-600 hover:text-pink-700 font-medium text-sm">
              View details →
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}
