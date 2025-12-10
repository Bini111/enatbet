import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';

const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  text: '#111827',
  textMuted: '#6b7280',
  textLight: '#4b5563',
  border: '#e5e7eb',
  background: '#ffffff',
  backgroundMuted: '#f3f4f6',
  error: '#ef4444',
  success: '#10b981',
};

interface Property {
  id: string;
  title: string;
  price: number;
  currency: string;
  maxGuests: number;
  hostId: string;
  hostName?: string;
  location: {
    city: string;
    country: string;
  };
}

function formatPrice(price: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `$${price}`;
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function daysBetween(start: Date, end: Date): number {
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export default function BookingScreen(): JSX.Element {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, userData, isAuthenticated } = useAuth();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Booking details
  const [checkIn, setCheckIn] = useState<Date>(addDays(new Date(), 1));
  const [checkOut, setCheckOut] = useState<Date>(addDays(new Date(), 3));
  const [guests, setGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?redirectTo=/booking/${id}`);
    }
  }, [isAuthenticated, id, router]);

  const fetchProperty = useCallback(async (propertyId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const docRef = doc(db, 'listings', propertyId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setError('Property not found');
        setIsLoading(false);
        return;
      }

      const data = docSnap.data();
      setProperty({
        id: docSnap.id,
        title: data.title || 'Untitled Property',
        price: typeof data.price === 'number' ? data.price : 0,
        currency: typeof data.currency === 'string' ? data.currency : 'USD',
        maxGuests: typeof data.maxGuests === 'number' ? data.maxGuests : 2,
        hostId: data.hostId || '',
        hostName: data.hostName,
        location: {
          city: data.location?.city || '',
          country: data.location?.country || '',
        },
      });
    } catch (err) {
      console.error('[Booking] Error fetching property:', err);
      setError('Failed to load property');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (!id) {
      setError('Property not found');
      setIsLoading(false);
      return;
    }

    if (isMounted) {
      fetchProperty(id);
    }

    return () => {
      isMounted = false;
    };
  }, [id, fetchProperty]);

  const nights = daysBetween(checkIn, checkOut);
  const subtotal = property ? property.price * nights : 0;
  const serviceFee = Math.round(subtotal * 0.12); // 12% service fee
  const total = subtotal + serviceFee;

  const handleGuestChange = (delta: number) => {
    const newGuests = guests + delta;
    if (property && newGuests >= 1 && newGuests <= property.maxGuests) {
      setGuests(newGuests);
    }
  };

  const handleDateChange = (type: 'checkIn' | 'checkOut', days: number) => {
    if (type === 'checkIn') {
      const newCheckIn = addDays(checkIn, days);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (newCheckIn >= today && newCheckIn < checkOut) {
        setCheckIn(newCheckIn);
      }
    } else {
      const newCheckOut = addDays(checkOut, days);
      if (newCheckOut > checkIn) {
        setCheckOut(newCheckOut);
      }
    }
  };

  const handleBooking = async () => {
    if (!user || !property) return;

    setIsSubmitting(true);

    try {
      // Create booking document in Firestore
      const bookingData = {
        propertyId: property.id,
        propertyTitle: property.title,
        hostId: property.hostId,
        hostName: property.hostName || null,
        guestId: user.uid,
        guestName: userData?.displayName || user.displayName || 'Guest',
        guestEmail: user.email,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        nights,
        guests,
        pricePerNight: property.price,
        currency: property.currency,
        subtotal,
        serviceFee,
        total,
        specialRequests: specialRequests.trim() || null,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'bookings'), bookingData);

      Alert.alert(
        'Booking Requested! 🎉',
        `Your booking request for ${property.title} has been submitted. The host will review and confirm shortly.`,
        [
          {
            text: 'View My Bookings',
            onPress: () => router.replace('/(tabs)/bookings'),
          },
          {
            text: 'Back to Home',
            onPress: () => router.replace('/'),
          },
        ]
      );
    } catch (err) {
      console.error('[Booking] Error creating booking:', err);
      Alert.alert(
        'Booking Failed',
        'There was an error processing your booking. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmBooking = () => {
    if (!property) return;

    Alert.alert(
      'Confirm Booking',
      `Book ${property.title} for ${nights} night${nights > 1 ? 's' : ''}?\n\nTotal: ${formatPrice(total, property.currency)}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: handleBooking },
      ]
    );
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Redirecting to login...</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading booking details...</Text>
      </View>
    );
  }

  if (error || !property) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>{error || 'Property not found'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Book Property' }} />
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
        >
          {/* Property Summary */}
          <View style={styles.section}>
            <Text style={styles.propertyTitle}>{property.title}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color={COLORS.textMuted} />
              <Text style={styles.locationText}>
                {property.location.city}, {property.location.country}
              </Text>
            </View>
            <Text style={styles.pricePerNight}>
              {formatPrice(property.price, property.currency)} / night
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Date Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Trip</Text>
            
            <View style={styles.dateRow}>
              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>Check-in</Text>
                <View style={styles.dateSelector}>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => handleDateChange('checkIn', -1)}
                  >
                    <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                  <Text style={styles.dateText}>{formatDate(checkIn)}</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => handleDateChange('checkIn', 1)}
                  >
                    <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.dateItem}>
                <Text style={styles.dateLabel}>Check-out</Text>
                <View style={styles.dateSelector}>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => handleDateChange('checkOut', -1)}
                  >
                    <Ionicons name="chevron-back" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                  <Text style={styles.dateText}>{formatDate(checkOut)}</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => handleDateChange('checkOut', 1)}
                  >
                    <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.nightsInfo}>
              <Ionicons name="moon-outline" size={16} color={COLORS.textMuted} />
              <Text style={styles.nightsText}>
                {nights} night{nights > 1 ? 's' : ''}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Guest Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Guests</Text>
            <View style={styles.guestSelector}>
              <TouchableOpacity
                style={[styles.guestButton, guests <= 1 && styles.guestButtonDisabled]}
                onPress={() => handleGuestChange(-1)}
                disabled={guests <= 1}
              >
                <Ionicons
                  name="remove"
                  size={24}
                  color={guests <= 1 ? COLORS.border : COLORS.primary}
                />
              </TouchableOpacity>
              <View style={styles.guestCount}>
                <Text style={styles.guestCountText}>{guests}</Text>
                <Text style={styles.guestCountLabel}>
                  guest{guests > 1 ? 's' : ''}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.guestButton,
                  guests >= property.maxGuests && styles.guestButtonDisabled,
                ]}
                onPress={() => handleGuestChange(1)}
                disabled={guests >= property.maxGuests}
              >
                <Ionicons
                  name="add"
                  size={24}
                  color={guests >= property.maxGuests ? COLORS.border : COLORS.primary}
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.maxGuestsText}>
              Maximum {property.maxGuests} guest{property.maxGuests > 1 ? 's' : ''}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Special Requests */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Requests (Optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Any special requests for the host?"
              placeholderTextColor={COLORS.textMuted}
              value={specialRequests}
              onChangeText={setSpecialRequests}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.divider} />

          {/* Price Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Details</Text>
            
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                {formatPrice(property.price, property.currency)} × {nights} night{nights > 1 ? 's' : ''}
              </Text>
              <Text style={styles.priceValue}>
                {formatPrice(subtotal, property.currency)}
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service fee</Text>
              <Text style={styles.priceValue}>
                {formatPrice(serviceFee, property.currency)}
              </Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {formatPrice(total, property.currency)}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Sticky Bottom Bar */}
        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.bottomPriceContainer}>
            <Text style={styles.bottomTotal}>{formatPrice(total, property.currency)}</Text>
            <Text style={styles.bottomNights}>for {nights} night{nights > 1 ? 's' : ''}</Text>
          </View>
          <TouchableOpacity
            style={[styles.bookButton, isSubmitting && styles.bookButtonDisabled]}
            onPress={confirmBooking}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={COLORS.background} />
            ) : (
              <Text style={styles.bookButtonText}>Request to Book</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: COLORS.background },
  loadingText: { marginTop: 12, fontSize: 16, color: COLORS.textMuted },
  errorTitle: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginTop: 16 },
  errorText: { fontSize: 16, color: COLORS.textMuted, marginTop: 8, textAlign: 'center' },
  backButton: { marginTop: 24, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: COLORS.primary, borderRadius: 25 },
  backButtonText: { color: COLORS.background, fontSize: 16, fontWeight: '600' },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  divider: { height: 8, backgroundColor: COLORS.backgroundMuted },
  propertyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  locationText: { fontSize: 14, color: COLORS.textMuted, marginLeft: 4 },
  pricePerNight: { fontSize: 16, fontWeight: '600', color: COLORS.primary },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dateItem: { flex: 1, marginHorizontal: 4 },
  dateLabel: { fontSize: 12, color: COLORS.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  dateSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.backgroundMuted, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 8 },
  dateButton: { padding: 4 },
  dateText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  nightsInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  nightsText: { fontSize: 14, color: COLORS.textMuted, marginLeft: 6 },
  guestSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  guestButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  guestButtonDisabled: { borderColor: COLORS.border },
  guestCount: { alignItems: 'center', marginHorizontal: 32 },
  guestCountText: { fontSize: 32, fontWeight: '700', color: COLORS.text },
  guestCountLabel: { fontSize: 14, color: COLORS.textMuted },
  maxGuestsText: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', marginTop: 12 },
  textInput: { backgroundColor: COLORS.backgroundMuted, borderRadius: 12, padding: 16, fontSize: 16, color: COLORS.text, minHeight: 100 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  priceLabel: { fontSize: 16, color: COLORS.textLight },
  priceValue: { fontSize: 16, color: COLORS.text },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.border },
  totalLabel: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  totalValue: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, backgroundColor: COLORS.background, borderTopWidth: 1, borderTopColor: COLORS.border },
  bottomPriceContainer: { flex: 1 },
  bottomTotal: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  bottomNights: { fontSize: 12, color: COLORS.textMuted },
  bookButton: { backgroundColor: COLORS.primary, paddingVertical: 16, paddingHorizontal: 28, borderRadius: 25, minWidth: 160, alignItems: 'center' },
  bookButtonDisabled: { opacity: 0.7 },
  bookButtonText: { color: COLORS.background, fontSize: 16, fontWeight: '600' },
});
