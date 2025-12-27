import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Button, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import { useAuthStore } from '../store/authStore';
import {
  RootStackParamList,
  ListingFormData,
  AMENITIES_LIST,
  HOUSE_RULES_OPTIONS,
} from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreateListingStep5'>;
  route: RouteProp<RootStackParamList, 'CreateListingStep5'>;
};

export default function CreateListingStep5Screen({ navigation, route }: Props) {
  const { listingData } = route.params;
  const { user } = useAuthStore();

  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [newListingId, setNewListingId] = useState<string | null>(null);

  const currencySymbol = listingData.currency === 'USD' ? '$' : 'ETB ';

  // Get amenity labels
  const getAmenityLabel = (id: string): string => {
    const amenity = AMENITIES_LIST.find(a => a.id === id);
    return amenity ? `${amenity.icon} ${amenity.label}` : id;
  };

  // Get house rule label
  const getHouseRuleLabel = (id: string): string => {
    const rule = HOUSE_RULES_OPTIONS.find(r => r.id === id);
    return rule ? `${rule.icon} ${rule.label}` : id;
  };

  // Get cancellation policy label
  const getCancellationLabel = (policy: string): string => {
    const labels: Record<string, string> = {
      flexible: 'Flexible - Full refund 24hrs before',
      moderate: 'Moderate - Full refund 5 days before',
      strict: 'Strict - 50% refund 7 days before',
      super_strict: 'Super Strict - 50% refund 30 days before',
    };
    return labels[policy] || policy;
  };

  // Upload photos to Firebase Storage
  const uploadPhotos = async (listingId: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (let i = 0; i < listingData.photos.length; i++) {
      const photo = listingData.photos[i];
      setUploadProgress(`Uploading photo ${i + 1} of ${listingData.photos.length}...`);

      try {
        // Fetch the local image
        const response = await fetch(photo.url || photo.uri);
        const blob = await response.blob();

        // Create storage reference
        const filename = `listings/${listingId}/${photo.type}_${Date.now()}_${i}.jpg`;
        const storageRef = ref(storage, filename);

        // Upload
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
        uploadedUrls.push(downloadURL);
      } catch (err) {
        console.error(`Failed to upload photo ${i + 1}:`, err);
        // Continue with other photos even if one fails
      }
    }

    return uploadedUrls;
  };

  // Publish listing
  const handlePublish = async () => {
    if (!user?.uid) {
      Alert.alert('Error', 'Please sign in to publish your listing');
      return;
    }

    Alert.alert(
      'Publish Listing',
      'Your listing will go live immediately and be visible to all guests. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Publish',
          onPress: async () => {
            setIsPublishing(true);
            setUploadProgress('Preparing listing...');

            try {
              const now = Timestamp.now();

              // Create the listing document first to get ID
              const listingDocData = {
                // Host info
                hostId: user.uid,
                hostName: user.displayName || 'Host',
                hostPhoto: user.photoURL || null,

                // Basic info
                title: listingData.title,
                description: listingData.description,
                propertyType: listingData.propertyType,

                // Location
                country: listingData.country,
                city: listingData.city,
                address: listingData.address,
                airportDistance: listingData.airportDistance,
                neighborhood: listingData.neighborhood || '',

                // Capacity
                maxGuests: listingData.maxGuests,
                bedrooms: listingData.bedrooms,
                beds: listingData.beds,
                bathrooms: listingData.bathrooms,

                // Amenities
                amenities: listingData.amenities,
                houseRules: listingData.houseRules,

                // Pricing
                currency: listingData.currency,
                pricePerNight: listingData.pricePerNight,
                cleaningFee: listingData.cleaningFee || 0,
                weeklyDiscount: listingData.weeklyDiscount || 0,
                monthlyDiscount: listingData.monthlyDiscount || 0,

                // Availability settings
                isActive: true, // Auto-activate
                instantBook: listingData.instantBook,
                minimumStay: listingData.minimumStay,
                maximumStay: listingData.maximumStay,
                checkInTime: listingData.checkInTime,
                checkOutTime: listingData.checkOutTime,

                // Cancellation
                cancellationPolicy: listingData.cancellationPolicy,

                // Status - AUTO APPROVED
                status: 'active',

                // Stats (initial)
                averageRating: 0,
                reviewCount: 0,
                bookingCount: 0,

                // Photos placeholder (will update after upload)
                photos: [],
                coverPhoto: null,

                // Timestamps
                createdAt: now,
                updatedAt: now,
                publishedAt: now,
              };

              // Add document to Firestore
              setUploadProgress('Creating listing...');
              const docRef = await addDoc(collection(db, 'listings'), listingDocData);
              const listingId = docRef.id;

              // Upload photos
              const photoUrls = await uploadPhotos(listingId);

              // Update listing with photo URLs
              if (photoUrls.length > 0) {
                setUploadProgress('Finalizing...');
                const { updateDoc, doc } = await import('firebase/firestore');
                
                // Create photo objects with URLs
                const photosWithUrls = listingData.photos.map((photo, index) => ({
                  id: photo.id,
                  url: photoUrls[index] || photo.url,
                  type: photo.type,
                  order: index,
                }));

                await updateDoc(doc(db, 'listings', listingId), {
                  photos: photosWithUrls,
                  coverPhoto: photoUrls[0] || null,
                  updatedAt: Timestamp.now(),
                });
              }

              setNewListingId(listingId);
              setPublished(true);
              setUploadProgress(null);

            } catch (err: any) {
              console.error('Publish error:', err);
              Alert.alert(
                'Error',
                err.message || 'Failed to publish listing. Please try again.'
              );
            } finally {
              setIsPublishing(false);
              setUploadProgress(null);
            }
          },
        },
      ]
    );
  };

  const handleBack = () => {
    navigation.navigate('CreateListingStep4', {
      listingData: listingData,
    });
  };

  // Success Screen
  if (published) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.successTitle}>Congratulations!</Text>
          <Text style={styles.successSubtitle}>
            Your listing is now live and visible to guests!
          </Text>

          <View style={styles.successCard}>
            {listingData.photos[0] && (
              <Image
                source={{ uri: listingData.photos[0].url || listingData.photos[0].uri }}
                style={styles.successImage}
              />
            )}
            <View style={styles.successCardContent}>
              <Text style={styles.successListingTitle} numberOfLines={2}>
                {listingData.title}
              </Text>
              <Text style={styles.successLocation}>
                {listingData.city}, {listingData.country}
              </Text>
              <Text style={styles.successPrice}>
                {currencySymbol}{listingData.pricePerNight}/night
              </Text>
            </View>
          </View>

          <View style={styles.nextStepsBox}>
            <Text style={styles.nextStepsTitle}>📋 Next Steps</Text>
            <Text style={styles.nextStepsItem}>• Set up your calendar availability</Text>
            <Text style={styles.nextStepsItem}>• Add custom pricing for special dates</Text>
            <Text style={styles.nextStepsItem}>• Respond quickly to booking requests</Text>
            <Text style={styles.nextStepsItem}>• Keep your listing photos updated</Text>
          </View>

          <View style={styles.successActions}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('ManageListings')}
              style={styles.manageButton}
              buttonColor="#6366F1"
            >
              Manage Listings
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('HostCalendar', { listingId: newListingId || undefined })}
              style={styles.calendarButton}
              textColor="#6366F1"
            >
              Set Calendar
            </Button>
            <Button
              mode="text"
              onPress={() => navigation.navigate('MainTabs')}
              textColor="#6B7280"
            >
              Back to Home
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Progress Header */}
      <View style={styles.progressHeader}>
        <Text style={styles.stepText}>Step 5 of 5</Text>
        <Text style={styles.stepTitle}>Review & Publish</Text>
        <ProgressBar progress={1} color="#6366F1" style={styles.progressBar} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Preview Card */}
        <View style={styles.previewCard}>
          {listingData.photos[0] && (
            <Image
              source={{ uri: listingData.photos[0].url || listingData.photos[0].uri }}
              style={styles.previewImage}
            />
          )}
          <View style={styles.previewContent}>
            <Text style={styles.previewTitle}>{listingData.title}</Text>
            <Text style={styles.previewLocation}>
              📍 {listingData.city}, {listingData.country}
            </Text>
            <View style={styles.previewStats}>
              <Text style={styles.previewStat}>👥 {listingData.maxGuests} guests</Text>
              <Text style={styles.previewStat}>🛏️ {listingData.bedrooms} bed</Text>
              <Text style={styles.previewStat}>🚿 {listingData.bathrooms} bath</Text>
            </View>
            <Text style={styles.previewPrice}>
              {currencySymbol}{listingData.pricePerNight}
              <Text style={styles.previewPriceUnit}> /night</Text>
            </Text>
          </View>
        </View>

        {/* Photo Gallery Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📸 Photos ({listingData.photos.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.photoGallery}>
              {listingData.photos.map((photo, index) => (
                <Image
                  key={photo.id}
                  source={{ uri: photo.url || photo.uri }}
                  style={styles.galleryPhoto}
                />
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Description</Text>
          <Text style={styles.descriptionText}>{listingData.description}</Text>
        </View>

        {/* Location Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Location</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Address</Text>
            <Text style={styles.detailValue}>{listingData.address}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Airport Distance</Text>
            <Text style={styles.detailValue}>{listingData.airportDistance}</Text>
          </View>
          {listingData.neighborhood && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Neighborhood</Text>
              <Text style={styles.detailValue}>{listingData.neighborhood}</Text>
            </View>
          )}
        </View>

        {/* Property Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏠 Property Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type</Text>
            <Text style={styles.detailValue}>{listingData.propertyType}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Max Guests</Text>
            <Text style={styles.detailValue}>{listingData.maxGuests}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Bedrooms</Text>
            <Text style={styles.detailValue}>
              {listingData.bedrooms === 0 ? 'Studio' : listingData.bedrooms}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Beds</Text>
            <Text style={styles.detailValue}>{listingData.beds}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Bathrooms</Text>
            <Text style={styles.detailValue}>{listingData.bathrooms}</Text>
          </View>
        </View>

        {/* Amenities */}
        {listingData.amenities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✨ Amenities</Text>
            <View style={styles.tagsContainer}>
              {listingData.amenities.map((amenityId) => (
                <View key={amenityId} style={styles.tag}>
                  <Text style={styles.tagText}>{getAmenityLabel(amenityId)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Pricing</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Currency</Text>
            <Text style={styles.detailValue}>
              {listingData.currency === 'USD' ? '🇺🇸 USD' : '🇪🇹 ETB'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Nightly Rate</Text>
            <Text style={styles.detailValue}>
              {currencySymbol}{listingData.pricePerNight}
            </Text>
          </View>
          {listingData.cleaningFee > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Cleaning Fee</Text>
              <Text style={styles.detailValue}>
                {currencySymbol}{listingData.cleaningFee}
              </Text>
            </View>
          )}
          {listingData.weeklyDiscount > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Weekly Discount</Text>
              <Text style={styles.detailValue}>{listingData.weeklyDiscount}%</Text>
            </View>
          )}
          {listingData.monthlyDiscount > 0 && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Monthly Discount</Text>
              <Text style={styles.detailValue}>{listingData.monthlyDiscount}%</Text>
            </View>
          )}
        </View>

        {/* Booking Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Booking Settings</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Instant Book</Text>
            <Text style={styles.detailValue}>
              {listingData.instantBook ? '✅ Enabled' : '❌ Disabled'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Minimum Stay</Text>
            <Text style={styles.detailValue}>{listingData.minimumStay} nights</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Maximum Stay</Text>
            <Text style={styles.detailValue}>{listingData.maximumStay} nights</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Check-in</Text>
            <Text style={styles.detailValue}>After {listingData.checkInTime}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Check-out</Text>
            <Text style={styles.detailValue}>Before {listingData.checkOutTime}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Cancellation</Text>
            <Text style={styles.detailValue}>
              {getCancellationLabel(listingData.cancellationPolicy)}
            </Text>
          </View>
        </View>

        {/* House Rules */}
        {listingData.houseRules.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 House Rules</Text>
            <View style={styles.tagsContainer}>
              {listingData.houseRules.map((ruleId) => (
                <View key={ruleId} style={styles.tag}>
                  <Text style={styles.tagText}>{getHouseRuleLabel(ruleId)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Auto-Approval Notice */}
        <View style={styles.approvalNotice}>
          <Text style={styles.approvalIcon}>⚡</Text>
          <View style={styles.approvalContent}>
            <Text style={styles.approvalTitle}>Instant Publishing</Text>
            <Text style={styles.approvalText}>
              Your listing will go live immediately after publishing. No approval wait time!
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Publishing Progress Overlay */}
      {isPublishing && (
        <View style={styles.publishingOverlay}>
          <View style={styles.publishingModal}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.publishingText}>{uploadProgress || 'Publishing...'}</Text>
          </View>
        </View>
      )}

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <Button
          mode="outlined"
          onPress={handleBack}
          style={styles.backButton}
          textColor="#6B7280"
          disabled={isPublishing}
        >
          Back
        </Button>
        <Button
          mode="contained"
          onPress={handlePublish}
          style={styles.publishButton}
          buttonColor="#10B981"
          disabled={isPublishing}
        >
          🚀 Publish Listing
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  progressHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  stepText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  // Preview Card
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 24,
  },
  previewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  previewContent: {
    padding: 16,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  previewLocation: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 12,
  },
  previewStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  previewStat: {
    fontSize: 14,
    color: '#374151',
  },
  previewPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6366F1',
  },
  previewPriceUnit: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
  },
  // Photo Gallery
  photoGallery: {
    flexDirection: 'row',
    gap: 10,
    paddingRight: 20,
  },
  galleryPhoto: {
    width: 120,
    height: 80,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  // Detail Rows
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 15,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  // Tags
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
    color: '#4338CA',
  },
  // Approval Notice
  approvalNotice: {
    flexDirection: 'row',
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    alignItems: 'flex-start',
  },
  approvalIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  approvalContent: {
    flex: 1,
  },
  approvalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 4,
  },
  approvalText: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
  },
  // Publishing Overlay
  publishingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  publishingModal: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 200,
  },
  publishingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
  },
  // Bottom Actions
  bottomActions: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 16 : 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  backButton: {
    flex: 1,
    borderColor: '#D1D5DB',
  },
  publishButton: {
    flex: 2,
  },
  // Success Screen
  successContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  successCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  successImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  successCardContent: {
    padding: 16,
  },
  successListingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  successLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  successPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6366F1',
  },
  nextStepsBox: {
    width: '100%',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 12,
  },
  nextStepsItem: {
    fontSize: 14,
    color: '#92400E',
    marginBottom: 6,
    lineHeight: 20,
  },
  successActions: {
    width: '100%',
    gap: 12,
  },
  manageButton: {
    width: '100%',
  },
  calendarButton: {
    width: '100%',
    borderColor: '#6366F1',
  },
});
