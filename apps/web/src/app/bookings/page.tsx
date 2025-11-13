'use client';

import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, orderBy, query, where, limit, startAfter, Timestamp, DocumentSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';
import type { Booking } from '@enatbet/types';
import { v4 as uuidv4 } from 'uuid';

const BOOKINGS_PER_PAGE = 10;

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all');
  const router = useRouter();

  const fetchBookings = useCallback(async (userId: string, isLoadMore = false) => {
    try {
      const bookingsRef = collection(db, 'bookings');
      let q = query(
        bookingsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(BOOKINGS_PER_PAGE)
      );

      if (isLoadMore && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const snapshot = await getDocs(q);
      const fetchedBookings: Booking[] = [];
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        
        let createdAtDate;
        if (data.createdAt instanceof Timestamp) {
          createdAtDate = data.createdAt.toDate().toISOString();
        } else {
          createdAtDate = new Date().toISOString();
        }
        
        fetchedBookings.push({
          id: doc.id,
          listingId: data.listingId,
          title: data.title || 'Property Booking',
          checkIn: data.checkIn,
          checkOut: data.checkOut,
          guests: Math.max(1, Number(data.guests) || 1),
          amount: Math.max(0, Number(data.amount) || 0),
          status: data.status || 'confirmed',
          paymentIntentId: data.paymentIntentId,
          createdAt: createdAtDate,
          propertyImage: data.propertyImage,
          hostName: data.hostName,
          userId: data.userId,
        });
      }

      if (snapshot.docs.length > 0) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      }
      
      setHasMore(snapshot.docs.length === BOOKINGS_PER_PAGE);
      
      if (isLoadMore) {
        setBookings(prev => [...prev, ...fetchedBookings]);
      } else {
        setBookings(fetchedBookings);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching bookings:', error);
      }
      toast.error('Failed to load bookings');
    }
  }, [lastDoc]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth/signin?redirect=/bookings');
        return;
      }

      await fetchBookings(user.uid);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, fetchBookings]);

  const loadMore = async () => {
    if (!auth.currentUser || !hasMore || loadingMore) return;
    
    setLoadingMore(true);
    await fetchBookings(auth.currentUser.uid, true);
    setLoadingMore(false);
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    const idempotencyKey = uuidv4();
    
    try {
      const response = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({ bookingId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel');
      }

      setBookings(prev => 
        prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' as const } : b)
      );
      toast.success('Booking cancelled successfully');
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Cancel error:', error);
      }
      toast.error(error.message || 'Failed to cancel booking');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const checkInDate = parseISO(booking.checkIn);
    const now = new Date();
    
    switch (filter) {
      case 'upcoming':
        return booking.status === 'confirmed' && checkInDate > now;
      case 'past':
        return booking.status === 'confirmed' && checkInDate <= now;
      case 'cancelled':
        return booking.status === 'cancelled';
      default:
        return true;
    }
  });

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Your trips</h1>
          <p className="text-gray-600 mt-2">View and manage your bookings</p>
        </div>

        <div className="flex gap-2 mb-6 border-b">
          {(['all', 'upcoming', 'past', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 capitalize ${
                filter === tab 
                  ? 'border-b-2 border-black font-semibold' 
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <h3 className="text-lg font-medium mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-4">Start exploring properties to make your first booking</p>
            <Link href="/" className="inline-block bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800">
              Explore properties
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const checkInDate = parseISO(booking.checkIn);
                const checkOutDate = parseISO(booking.checkOut);
                const isPast = checkInDate < new Date();
                const canCancel = booking.status === 'confirmed' && !isPast;

                return (
                  <div key={booking.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
                    <div className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold">{booking.title}</h3>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                              {booking.status}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Check-in</p>
                              <p className="font-medium">{format(checkInDate, 'MMM dd, yyyy')}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Check-out</p>
                              <p className="font-medium">{format(checkOutDate, 'MMM dd, yyyy')}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Guests</p>
                              <p className="font-medium">{booking.guests} {booking.guests === 1 ? 'guest' : 'guests'}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Total paid</p>
                              <p className="font-medium">${(booking.amount / 100).toFixed(2)}</p>
                            </div>
                          </div>

                          <div className="flex gap-3 mt-4">
                            <Link 
                              href={`/listings/${booking.listingId}`}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              View property
                            </Link>
                            
                            {booking.status === 'confirmed' && (
                              <Link 
                                href={`/bookings/${booking.id}/receipt`}
                                className="text-sm text-blue-600 hover:underline"
                              >
                                View receipt
                              </Link>
                            )}
                            
                            {canCancel && (
                              <button
                                onClick={() => handleCancelBooking(booking.id)}
                                className="text-sm text-red-600 hover:underline"
                              >
                                Cancel booking
                              </button>
                            )}
                          </div>
                        </div>

                        {booking.propertyImage && (
                          <div className="ml-6 hidden md:block relative w-32 h-24">
                            <Image 
                              src={booking.propertyImage} 
                              alt={booking.title}
                              fill
                              className="object-cover rounded-lg"
                              sizes="128px"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                >
                  {loadingMore ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
