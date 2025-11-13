import { notFound } from 'next/navigation';
import { adminDb } from '@/lib/firebase-admin';
import BookingForm from '@/components/BookingForm';
import Image from 'next/image';
import type { Listing } from '@enatbet/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getListing(id: string): Promise<Listing | null> {
  try {
    const doc = await adminDb.collection('listings').doc(id).get();
    if (!doc.exists) return null;
    
    const data = doc.data()!;
    
    if (!data.title || data.nightlyPrice == null || !data.hostId) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Listing ${id} missing required fields`);
      }
      return null;
    }
    
    return {
      id: doc.id,
      title: data.title,
      description: data.description || '',
      nightlyPrice: Math.max(0, Number(data.nightlyPrice) || 0),
      photos: Array.isArray(data.photos) ? data.photos.filter(Boolean) : [],
      hostId: data.hostId,
      address: data.address || '',
      city: data.city || '',
      country: data.country || '',
      amenities: Array.isArray(data.amenities) ? data.amenities.filter(Boolean) : [],
      maxGuests: Math.max(1, Number(data.maxGuests) || 2),
      bedrooms: Math.max(0, Number(data.bedrooms) || 1),
      bathrooms: Math.max(0, Number(data.bathrooms) || 1),
      propertyType: data.propertyType || 'Apartment',
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Error fetching listing:', error);
    }
    return null;
  }
}

export default async function ListingDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const listing = await getListing(params.id);
  if (!listing) notFound();

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          {listing.photos.length > 0 ? (
            <div className="grid gap-2 md:grid-cols-4 md:grid-rows-2 rounded-xl overflow-hidden h-[400px]">
              {listing.photos[0] && (
                <div className="md:col-span-2 md:row-span-2 relative">
                  <Image
                    src={listing.photos[0]}
                    alt={listing.title}
                    fill
                    className="object-cover hover:opacity-95 transition"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}
              {listing.photos.slice(1, 5).map((photo, index) => (
                <div key={index} className="relative hidden md:block">
                  <Image
                    src={photo}
                    alt={`${listing.title} ${index + 2}`}
                    fill
                    className="object-cover hover:opacity-95 transition"
                    sizes="(max-width: 768px) 0vw, 25vw"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[400px] bg-gray-200 rounded-xl flex items-center justify-center">
              <span className="text-gray-500">No photos available</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="border-b pb-6">
              <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
              {listing.city && (
                <p className="text-gray-600">
                  {listing.propertyType} in {listing.city}{listing.country ? `, ${listing.country}` : ''}
                </p>
              )}
              <div className="flex gap-4 mt-4 text-sm">
                <span>{listing.maxGuests} {listing.maxGuests === 1 ? 'guest' : 'guests'}</span>
                <span>•</span>
                <span>{listing.bedrooms} {listing.bedrooms === 1 ? 'bedroom' : 'bedrooms'}</span>
                <span>•</span>
                <span>{listing.bathrooms} {listing.bathrooms === 1 ? 'bathroom' : 'bathrooms'}</span>
              </div>
            </div>

            {listing.description && (
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold mb-4">About this place</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
              </div>
            )}

            {listing.amenities.length > 0 && (
              <div className="border-b pb-6">
                <h2 className="text-xl font-semibold mb-4">What this place offers</h2>
                <div className="grid grid-cols-2 gap-3">
                  {listing.amenities.map((amenity) => (
                    <div key={amenity} className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {listing.address && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Where you'll be</h2>
                <p className="text-gray-700">{listing.address}</p>
                {listing.city && (
                  <p className="text-gray-600 mt-1">{listing.city}{listing.country ? `, ${listing.country}` : ''}</p>
                )}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <BookingForm
                listingId={listing.id}
                nightlyPrice={listing.nightlyPrice}
                title={listing.title}
                maxGuests={listing.maxGuests}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
