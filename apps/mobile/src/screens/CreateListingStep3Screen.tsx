import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { Button, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList, ListingPhoto } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreateListingStep3'>;
  route: RouteProp<RootStackParamList, 'CreateListingStep3'>;
};

type PhotoType = ListingPhoto['type'];

const PHOTO_TYPES: { key: PhotoType; label: string; icon: string; description: string }[] = [
  { key: 'exterior', label: 'Exterior', icon: '🏠', description: 'Outside view of property' },
  { key: 'living', label: 'Living Room', icon: '🛋️', description: 'Main living area' },
  { key: 'bedroom', label: 'Bedroom', icon: '🛏️', description: 'Sleeping areas' },
  { key: 'bathroom', label: 'Bathroom', icon: '🚿', description: 'Bathrooms & toilets' },
  { key: 'kitchen', label: 'Kitchen', icon: '🍳', description: 'Kitchen & dining' },
  { key: 'other', label: 'Other', icon: '📷', description: 'Amenities, views, etc.' },
];

const MIN_PHOTOS = 5;
const MAX_PHOTOS = 20;

export default function CreateListingStep3Screen({ navigation, route }: Props) {
  const { listingData } = route.params;

  const [photos, setPhotos] = useState<ListingPhoto[]>(listingData?.photos || []);
  const [showPhotoTypeModal, setShowPhotoTypeModal] = useState(false);
  const [selectedPhotoForEdit, setSelectedPhotoForEdit] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Request permissions
  const requestPermissions = async (): Promise<boolean> => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Please grant camera and photo library permissions to add property photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  // Pick image from camera or gallery
  const pickImage = async (photoType: PhotoType, useCamera: boolean) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      };

      const result = useCamera
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets[0]) {
        const newPhoto: ListingPhoto = {
          id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          uri: result.assets[0].uri,
          url: result.assets[0].uri, // Will be replaced with Firebase URL after upload
          type: photoType,
          order: photos.length,
        };
        setPhotos(prev => [...prev, newPhoto]);
        setError(null);
      }
    } catch (err) {
      console.error('Image picker error:', err);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }

    setShowPhotoTypeModal(false);
  };

  // Show photo source options (camera or gallery)
  const showPhotoSourceOptions = (photoType: PhotoType) => {
    const typeInfo = PHOTO_TYPES.find(t => t.key === photoType);
    Alert.alert(
      `Add ${typeInfo?.label} Photo`,
      'Choose how to add your photo',
      [
        { text: 'Take Photo', onPress: () => pickImage(photoType, true) },
        { text: 'Choose from Gallery', onPress: () => pickImage(photoType, false) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // Remove a photo
  const removePhoto = (index: number) => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setPhotos(prev => {
              const updated = prev.filter((_, i) => i !== index);
              // Update order for remaining photos
              return updated.map((photo, i) => ({ ...photo, order: i }));
            });
          },
        },
      ]
    );
  };

  // Set photo as cover (move to first position)
  const setAsCover = (index: number) => {
    if (index === 0) return;
    setPhotos(prev => {
      const photo = prev[index];
      const others = prev.filter((_, i) => i !== index);
      const updated = [photo, ...others];
      return updated.map((p, i) => ({ ...p, order: i }));
    });
  };

  // Change photo type
  const changePhotoType = (index: number, newType: PhotoType) => {
    setPhotos(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], type: newType };
      return updated;
    });
    setSelectedPhotoForEdit(null);
  };

  // Get count by type
  const getPhotoCountByType = (type: PhotoType): number => {
    return photos.filter(p => p.type === type).length;
  };

  // Validate and proceed
  const validate = (): boolean => {
    if (photos.length < MIN_PHOTOS) {
      setError(`Please add at least ${MIN_PHOTOS} photos. You have ${photos.length}.`);
      return false;
    }

    // Check for required types
    const hasExterior = photos.some(p => p.type === 'exterior');
    const hasBedroom = photos.some(p => p.type === 'bedroom');
    const hasBathroom = photos.some(p => p.type === 'bathroom');

    if (!hasExterior) {
      setError('Please add at least one exterior photo of your property');
      return false;
    }
    if (!hasBedroom) {
      setError('Please add at least one bedroom photo');
      return false;
    }
    if (!hasBathroom) {
      setError('Please add at least one bathroom photo');
      return false;
    }

    setError(null);
    return true;
  };

  const handleNext = () => {
    if (validate()) {
      navigation.navigate('CreateListingStep4', {
        listingData: {
          ...listingData,
          photos: photos,
        },
      });
    }
  };

  const handleBack = () => {
    navigation.navigate('CreateListingStep2', {
      listingData: {
        ...listingData,
        photos: photos,
      },
    });
  };

  // Photo Type Selection Modal
  const PhotoTypeModal = () => (
    <Modal
      visible={showPhotoTypeModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowPhotoTypeModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>What type of photo?</Text>
            <TouchableOpacity
              onPress={() => setShowPhotoTypeModal(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={PHOTO_TYPES}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.photoTypeItem}
                onPress={() => showPhotoSourceOptions(item.key)}
              >
                <Text style={styles.photoTypeIcon}>{item.icon}</Text>
                <View style={styles.photoTypeInfo}>
                  <Text style={styles.photoTypeLabel}>{item.label}</Text>
                  <Text style={styles.photoTypeDescription}>{item.description}</Text>
                </View>
                <View style={styles.photoTypeCount}>
                  <Text style={styles.photoTypeCountText}>
                    {getPhotoCountByType(item.key)}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            style={styles.modalList}
          />
        </View>
      </View>
    </Modal>
  );

  // Edit Photo Type Modal
  const EditPhotoTypeModal = () => (
    <Modal
      visible={selectedPhotoForEdit !== null}
      transparent
      animationType="slide"
      onRequestClose={() => setSelectedPhotoForEdit(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Change Photo Type</Text>
            <TouchableOpacity
              onPress={() => setSelectedPhotoForEdit(null)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={PHOTO_TYPES}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.photoTypeItem,
                  selectedPhotoForEdit !== null &&
                    photos[selectedPhotoForEdit]?.type === item.key &&
                    styles.photoTypeItemSelected,
                ]}
                onPress={() => {
                  if (selectedPhotoForEdit !== null) {
                    changePhotoType(selectedPhotoForEdit, item.key);
                  }
                }}
              >
                <Text style={styles.photoTypeIcon}>{item.icon}</Text>
                <View style={styles.photoTypeInfo}>
                  <Text style={styles.photoTypeLabel}>{item.label}</Text>
                </View>
                {selectedPhotoForEdit !== null &&
                  photos[selectedPhotoForEdit]?.type === item.key && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
              </TouchableOpacity>
            )}
            style={styles.modalList}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Progress Header */}
      <View style={styles.progressHeader}>
        <Text style={styles.stepText}>Step 3 of 5</Text>
        <Text style={styles.stepTitle}>Photos</Text>
        <ProgressBar progress={0.6} color="#6366F1" style={styles.progressBar} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>📸</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Photo Requirements</Text>
            <Text style={styles.infoText}>
              • Minimum {MIN_PHOTOS} photos, maximum {MAX_PHOTOS}{'\n'}
              • Include exterior, bedroom, and bathroom photos{'\n'}
              • First photo will be your cover image{'\n'}
              • Use landscape orientation for best results
            </Text>
          </View>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Photo Count Summary */}
        <View style={styles.photoSummary}>
          <Text style={styles.photoSummaryText}>
            {photos.length} of {MIN_PHOTOS} minimum photos
          </Text>
          <View style={styles.photoSummaryBar}>
            <View
              style={[
                styles.photoSummaryProgress,
                {
                  width: `${Math.min(100, (photos.length / MIN_PHOTOS) * 100)}%`,
                  backgroundColor: photos.length >= MIN_PHOTOS ? '#10B981' : '#6366F1',
                },
              ]}
            />
          </View>
        </View>

        {/* Photo Type Breakdown */}
        <View style={styles.typeBreakdown}>
          {PHOTO_TYPES.slice(0, 5).map((type) => {
            const count = getPhotoCountByType(type.key);
            const isRequired = ['exterior', 'bedroom', 'bathroom'].includes(type.key);
            const isMissing = isRequired && count === 0;
            return (
              <View
                key={type.key}
                style={[styles.typeTag, isMissing && styles.typeTagMissing]}
              >
                <Text style={styles.typeTagIcon}>{type.icon}</Text>
                <Text
                  style={[styles.typeTagText, isMissing && styles.typeTagTextMissing]}
                >
                  {count}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Photos Grid */}
        <View style={styles.photosGrid}>
          {photos.map((photo, index) => {
            const typeInfo = PHOTO_TYPES.find(t => t.key === photo.type);
            return (
              <View key={photo.id} style={styles.photoContainer}>
                <Image
                  source={{ uri: photo.url || photo.uri }}
                  style={styles.photoThumbnail}
                />

                {/* Cover Badge */}
                {index === 0 && (
                  <View style={styles.coverBadge}>
                    <Text style={styles.coverBadgeText}>Cover</Text>
                  </View>
                )}

                {/* Type Badge */}
                <TouchableOpacity
                  style={styles.typeBadge}
                  onPress={() => setSelectedPhotoForEdit(index)}
                >
                  <Text style={styles.typeBadgeIcon}>{typeInfo?.icon}</Text>
                </TouchableOpacity>

                {/* Actions */}
                <View style={styles.photoActions}>
                  {index !== 0 && (
                    <TouchableOpacity
                      style={styles.photoAction}
                      onPress={() => setAsCover(index)}
                    >
                      <Text style={styles.photoActionText}>⭐</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.photoAction, styles.photoActionDelete]}
                    onPress={() => removePhoto(index)}
                  >
                    <Text style={styles.photoActionText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {/* Add Photo Button */}
          {photos.length < MAX_PHOTOS && (
            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={() => setShowPhotoTypeModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.addPhotoIcon}>+</Text>
              <Text style={styles.addPhotoText}>Add Photo</Text>
              <Text style={styles.addPhotoCount}>
                {photos.length}/{MAX_PHOTOS}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>📷 Photo Tips</Text>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>
              Take photos during the day with natural light
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>
              Clean and tidy spaces before photographing
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>
              Show the full room from corner angles
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>
              Highlight unique features and amenities
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <Button
          mode="outlined"
          onPress={handleBack}
          style={styles.backButton}
          textColor="#6B7280"
        >
          Back
        </Button>
        <Button
          mode="contained"
          onPress={handleNext}
          style={styles.nextButton}
          buttonColor="#6366F1"
        >
          Next: Pricing
        </Button>
      </View>

      {/* Modals */}
      <PhotoTypeModal />
      <EditPhotoTypeModal />
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
  // Info Box
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4338CA',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#4338CA',
    lineHeight: 20,
  },
  // Error Box
  errorBox: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
  },
  // Photo Summary
  photoSummary: {
    marginBottom: 16,
  },
  photoSummaryText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '500',
  },
  photoSummaryBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  photoSummaryProgress: {
    height: '100%',
    borderRadius: 4,
  },
  // Type Breakdown
  typeBreakdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
  },
  typeTagMissing: {
    backgroundColor: '#FEE2E2',
  },
  typeTagIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  typeTagText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  typeTagTextMissing: {
    color: '#DC2626',
  },
  // Photos Grid
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  photoContainer: {
    width: '47%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  photoThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#6366F1',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  coverBadgeText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  typeBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  typeBadgeIcon: {
    fontSize: 14,
  },
  photoActions: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    gap: 6,
  },
  photoAction: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoActionDelete: {
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
  },
  photoActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Add Photo Button
  addPhotoButton: {
    width: '47%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6366F1',
    borderStyle: 'dashed',
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoIcon: {
    fontSize: 32,
    color: '#6366F1',
    marginBottom: 4,
  },
  addPhotoText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  addPhotoCount: {
    fontSize: 12,
    color: '#818CF8',
    marginTop: 2,
  },
  // Tips Section
  tipsSection: {
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 14,
    color: '#B45309',
    marginRight: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalClose: {
    fontSize: 20,
    color: '#6B7280',
    padding: 4,
  },
  modalList: {
    paddingBottom: 40,
  },
  photoTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  photoTypeItemSelected: {
    backgroundColor: '#EEF2FF',
  },
  photoTypeIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  photoTypeInfo: {
    flex: 1,
  },
  photoTypeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  photoTypeDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  photoTypeCount: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  photoTypeCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  checkmark: {
    fontSize: 20,
    color: '#6366F1',
    fontWeight: 'bold',
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
  nextButton: {
    flex: 2,
  },
});
