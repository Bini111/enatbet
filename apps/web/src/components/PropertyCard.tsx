'use client';

import Link from 'next/link';
import { Listing } from '@enatbet/shared';
import { formatMoney } from '@enatbet/shared';

interface PropertyCardProps {
  listing: Listing;
}

export function PropertyCard({ listing }: PropertyCardProps) {
  const mainImage = listing.images?.[0]?.url || '/placeholder-property.jpg';
  const priceFormatted = formatMoney(listing.pricePerNight);

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="block group cursor-pointer"
    >
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
        <img
          src={mainImage}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        {listing.averageRating && listing.averageRating > 0 && (
          <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-lg shadow-md flex items-center gap-1">
            <span className="text-yellow-500">★</span>
            <span className="text-sm font-semibold">{listing.averageRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 truncate">{listing.location.city}, {listing.location.country}</h3>
        </div>

        <p className="text-gray-500 text-sm truncate">{listing.title}</p>

        <div className="flex items-baseline gap-1">
          <span className="font-semibold text-gray-900">{priceFormatted}</span>
          <span className="text-gray-500 text-sm">per night</span>
        </div>

        <div className="text-xs text-gray-500">
          {listing.maxGuests} guests · {listing.bedrooms} bedrooms · {listing.beds} beds · {listing.bathrooms} baths
        </div>
      </div>
    </Link>
  );
}
