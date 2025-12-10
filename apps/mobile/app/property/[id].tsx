import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

interface PropertyLocation {
  city: string;
  country: string;
  address?: string;
}

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  location: PropertyLocation;
  amenities: string[];
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  hostId: string;
  hostName?: string;
  hostPhoto?: string;
}

function validatePropertyData(id: string, data: Record<string, unknown>): Property | null {
  if (typeof data.title !== 'string' || !data.title) return null;
  if (typeof data.price !== 'number' || data.price < 0) return null;
  if (!data.location || typeof data.location !== 'object') return null;
  if (typeof data.hostId !== 'string' || !data.hostId) return null;

  const location = data.location as Record<string, unknown>;
  if (typeof location.city !== 'string' || typeof location.country !== 'string') return null;

  return {
    id,
    title: data.title,
    description: typeof data.description === 'string' ? data.description : '',
    price: data.price,
    currency: typeof data.currency === 'string' ? data.currency : 'USD',
    images: Array.isArray(data.images) ? data.images.filter((img): img is string => typeof img === 'string') : [],
    location: {
      city: location.city as string,
      country: location.country as string,
      address: typeof location.address === 'string' ? location.address : undefined,
    },
    amenities: Array.isArray(data.amenities) ? data.amenities.filter((a): a is string => typeof a === 'string') : [],
    bedrooms: typeof data.bedrooms === 'number' ? data.bedrooms : 1,
    bathrooms: typeof data.bathrooms === 'number' ? data.bathrooms : 1,
    maxGuests: typeof data.maxGuests === 'number' ? data.maxGuests : 2,
    hostId: data.hostId,
    hostName: typeof data.hostName === 'string' ? data.hostName : undefined,
    hostPhoto: typeof data.hostPhoto === 'string' ? data.hostPhoto : undefined,
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

function PropertyImage({ uri, style }: { uri: string; style: object }): JSX.Element {
  const [hasError, setHasError] = useState(false);
  const fallbackUri = 'https://via.placeholder.com/400x300/e5e7eb/9ca3af?text=Image+Unavailable';

  return (
    <Image
      source={{ uri: hasError ? fallbackUri : uri }}
      style={style}
      resizeMode="cover"
      onError={() => setHasError(true)}
      accessibilityLabel="Property image"
    />
  );
}

export default function PropertyDetailScreen(): JSX.Element {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isAuthenticated } = useAuth();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

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
      const validated = validatePropertyData(docSnap.id, data);

      if (!validated) {
        setError('Property data is incomplete');
        setIsLoading(false);
        return;
      }

      setProperty(validated);
    } catch (err) {
      console.error('[PropertyDetail] Error fetching property:', err);
      setError('Failed to load property. Please try again.');
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

    const load = async () => {
      if (isMounted) {
        await fetchProperty(id);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [id, fetchProperty]);

  const handleRetry = () => {
    if (id) {
      fetchProperty(id);
    }
  };

  const handleBookPress = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirectTo=/booking/${id}`);
      return;
    }
    router.push(`/booking/${id}`);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading property...</Text>
      </View>
    );
  }

  if (error || !property) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.error} />
        <Text style={styles.errorTitle}>Oops!</Text>
        <Text style={styles.errorText}>{error || 'Property not found'}</Text>
        <View style={styles.errorButtons}>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
            accessibilityLabel="Retry loading property"
            accessibilityRole="button"
          >
            <Ionicons name="refresh" size={18} color={COLORS.background} style={styles.buttonIcon} />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const placeholderImage = 'https://via.placeholder.com/400x300/e5e7eb/9ca3af?text=No+Image';
  const displayImages = property.images.length > 0 ? property.images : [placeholderImage];
  const formattedPrice = formatPrice(property.price, property.currency);

  return (
    <>
      <Stack.Screen options={{ title: property.title }} />
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        >
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              if (index !== activeImageIndex && index >= 0 && index < displayImages.length) {
                setActiveImageIndex(index);
              }
            }}
            scrollEventThrottle={16}
          >
            {displayImages.map((image, index) => (
              <PropertyImage key={index} uri={image} style={styles.image} />
            ))}
          </ScrollView>

          {displayImages.length > 1 && (
            <View style={styles.indicators} accessibilityLabel={`Image ${activeImageIndex + 1} of ${displayImages.length}`}>
              {displayImages.map((_, index) => (
                <View
                  key={index}
                  style={[styles.indicator, activeImageIndex === index && styles.indicatorActive]}
                />
              ))}
            </View>
          )}

          <View style={styles.content}>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color={COLORS.textMuted} />
              <Text style={styles.location}>{property.location.city}, {property.location.country}</Text>
            </View>

            <Text style={styles.title} accessibilityRole="header">{property.title}</Text>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Ionicons name="bed-outline" size={20} color={COLORS.textMuted} />
                <Text style={styles.statText}>{property.bedrooms} beds</Text>
              </View>
              <View style={[styles.stat, styles.statSpacing]}>
                <Ionicons name="water-outline" size={20} color={COLORS.textMuted} />
                <Text style={styles.statText}>{property.bathrooms} baths</Text>
              </View>
              <View style={[styles.stat, styles.statSpacing]}>
                <Ionicons name="people-outline" size={20} color={COLORS.textMuted} />
                <Text style={styles.statText}>{property.maxGuests} guests</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {property.hostName && (
              <>
                <View style={styles.hostSection}>
                  <View style={styles.hostAvatar}>
                    {property.hostPhoto ? (
                      <Image source={{ uri: property.hostPhoto }} style={styles.hostImage} accessibilityLabel={`Host ${property.hostName}`} />
                    ) : (
                      <Ionicons name="person" size={24} color={COLORS.textMuted} />
                    )}
                  </View>
                  <View>
                    <Text style={styles.hostedBy}>Hosted by</Text>
                    <Text style={styles.hostName}>{property.hostName}</Text>
                  </View>
                </View>
                <View style={styles.divider} />
              </>
            )}

            <Text style={styles.sectionTitle}>About this place</Text>
            <Text style={styles.description}>{property.description || 'No description available.'}</Text>

            {property.amenities.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Amenities</Text>
                <View style={styles.amenitiesGrid}>
                  {property.amenities.map((amenity, index) => (
                    <View key={index} style={styles.amenityItem}>
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                      <Text style={styles.amenityText}>{amenity}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        </ScrollView>

        <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>
              {formattedPrice}
              <Text style={styles.priceUnit}> / night</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={handleBookPress}
            activeOpacity={0.8}
            accessibilityLabel={`Book this property for ${formattedPrice} per night`}
            accessibilityRole="button"
          >
            <Text style={styles.bookButtonText}>Book Now</Text>
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
  errorButtons: { flexDirection: 'row', marginTop: 24 },
  retryButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 24, backgroundColor: COLORS.primary, borderRadius: 25, marginRight: 12 },
  retryButtonText: { color: COLORS.background, fontSize: 16, fontWeight: '600' },
  backButton: { paddingVertical: 12, paddingHorizontal: 24, backgroundColor: 'transparent', borderRadius: 25, borderWidth: 2, borderColor: COLORS.primary },
  backButtonText: { color: COLORS.primary, fontSize: 16, fontWeight: '600' },
  buttonIcon: { marginRight: 6 },
  image: { width: SCREEN_WIDTH, height: 300 },
  indicators: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 12 },
  indicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border, marginHorizontal: 4 },
  indicatorActive: { backgroundColor: COLORS.primary, width: 24 },
  content: { padding: 20 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  location: { fontSize: 14, color: COLORS.textMuted, marginLeft: 4 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'flex-start' },
  stat: { flexDirection: 'row', alignItems: 'center' },
  statSpacing: { marginLeft: 24 },
  statText: { fontSize: 14, color: COLORS.textMuted, marginLeft: 6 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 20 },
  hostSection: { flexDirection: 'row', alignItems: 'center' },
  hostAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.backgroundMuted, justifyContent: 'center', alignItems: 'center', marginRight: 12, overflow: 'hidden' },
  hostImage: { width: 48, height: 48 },
  hostedBy: { fontSize: 12, color: COLORS.textMuted },
  hostName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  description: { fontSize: 15, color: COLORS.textLight, lineHeight: 24, marginBottom: 24 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  amenityItem: { flexDirection: 'row', alignItems: 'center', width: '50%', marginBottom: 12 },
  amenityText: { fontSize: 14, color: COLORS.textLight, marginLeft: 8 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, backgroundColor: COLORS.background, borderTopWidth: 1, borderTopColor: COLORS.border },
  priceContainer: { flex: 1 },
  price: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  priceUnit: { fontSize: 14, fontWeight: '400', color: COLORS.textMuted },
  bookButton: { backgroundColor: COLORS.primary, paddingVertical: 14, paddingHorizontal: 32, borderRadius: 25 },
  bookButtonText: { color: COLORS.background, fontSize: 16, fontWeight: '600' },
});
