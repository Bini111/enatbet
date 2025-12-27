import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextInput, Button, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, PropertyType, ListingFormData, AMENITIES_LIST } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreateListingStep1'>;
  route: RouteProp<RootStackParamList, 'CreateListingStep1'>;
};

const PROPERTY_TYPES: { type: PropertyType; icon: string; description: string }[] = [
  { type: 'Apartment', icon: '🏢', description: 'A unit in a building' },
  { type: 'House', icon: '🏠', description: 'A standalone home' },
  { type: 'Condo', icon: '🏙️', description: 'A privately owned unit' },
  { type: 'Townhouse', icon: '🏘️', description: 'Multi-floor attached home' },
  { type: 'Villa', icon: '🏡', description: 'Luxury standalone property' },
  { type: 'Cabin', icon: '🛖', description: 'Rustic getaway' },
  { type: 'Private Room', icon: '🚪', description: 'Room in a shared space' },
  { type: 'Shared Room', icon: '🛏️', description: 'Shared sleeping space' },
];

export default function CreateListingStep1Screen({ navigation, route }: Props) {
  const existingData = route.params?.listingData;
  
  const [formData, setFormData] = useState({
    title: existingData?.title || '',
    description: existingData?.description || '',
    propertyType: existingData?.propertyType || ('' as PropertyType),
    maxGuests: existingData?.maxGuests || 1,
    bedrooms: existingData?.bedrooms || 1,
    beds: existingData?.beds || 1,
    bathrooms: existingData?.bathrooms || 1,
    amenities: existingData?.amenities || [] as string[],
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  const updateField = <K extends keyof typeof formData>(
    field: K,
    value: typeof formData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const incrementValue = (field: 'maxGuests' | 'bedrooms' | 'beds' | 'bathrooms') => {
    const maxValues = { maxGuests: 16, bedrooms: 10, beds: 20, bathrooms: 10 };
    if (formData[field] < maxValues[field]) {
      updateField(field, formData[field] + 1);
    }
  };

  const decrementValue = (field: 'maxGuests' | 'bedrooms' | 'beds' | 'bathrooms') => {
    const minValues = { maxGuests: 1, bedrooms: 0, beds: 1, bathrooms: 1 };
    if (formData[field] > minValues[field]) {
      updateField(field, formData[field] - 1);
    }
  };

  const toggleAmenity = (amenityId: string) => {
    const current = formData.amenities;
    if (current.includes(amenityId)) {
      updateField('amenities', current.filter(id => id !== amenityId));
    } else {
      updateField('amenities', [...current, amenityId]);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Please enter a title for your listing';
    } else if (formData.title.trim().length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please enter a description';
    } else if (formData.description.trim().length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    } else if (formData.description.trim().length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
    }

    if (!formData.propertyType) {
      newErrors.propertyType = 'Please select a property type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      navigation.navigate('CreateListingStep2', {
        listingData: {
          ...existingData,
          title: formData.title.trim(),
          description: formData.description.trim(),
          propertyType: formData.propertyType,
          maxGuests: formData.maxGuests,
          bedrooms: formData.bedrooms,
          beds: formData.beds,
          bathrooms: formData.bathrooms,
          amenities: formData.amenities,
        },
      });
    }
  };

  const displayedAmenities = showAllAmenities 
    ? AMENITIES_LIST 
    : AMENITIES_LIST.slice(0, 12);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        {/* Progress Header */}
        <View style={styles.progressHeader}>
          <Text style={styles.stepText}>Step 1 of 5</Text>
          <Text style={styles.stepTitle}>Basic Information</Text>
          <ProgressBar progress={0.2} color="#6366F1" style={styles.progressBar} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Listing Title *</Text>
            <Text style={styles.sectionHint}>
              Create a catchy title that highlights what makes your place special
            </Text>
            <TextInput
              value={formData.title}
              onChangeText={(text) => updateField('title', text)}
              mode="outlined"
              placeholder="e.g., Cozy Apartment near Bole Airport"
              style={styles.input}
              error={!!errors.title}
              maxLength={100}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
            <Text style={styles.charCount}>{formData.title.length}/100</Text>
          </View>

          {/* Property Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Property Type *</Text>
            <Text style={styles.sectionHint}>
              Select the type that best describes your property
            </Text>
            {errors.propertyType && (
              <Text style={styles.errorText}>{errors.propertyType}</Text>
            )}
            <View style={styles.propertyTypeGrid}>
              {PROPERTY_TYPES.map((item) => (
                <TouchableOpacity
                  key={item.type}
                  style={[
                    styles.propertyTypeCard,
                    formData.propertyType === item.type && styles.propertyTypeCardSelected,
                  ]}
                  onPress={() => updateField('propertyType', item.type)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.propertyTypeIcon}>{item.icon}</Text>
                  <Text
                    style={[
                      styles.propertyTypeLabel,
                      formData.propertyType === item.type && styles.propertyTypeLabelSelected,
                    ]}
                  >
                    {item.type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Capacity */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Capacity & Rooms</Text>
            <Text style={styles.sectionHint}>
              How many guests can your place accommodate?
            </Text>

            {/* Max Guests */}
            <View style={styles.counterRow}>
              <View style={styles.counterLabel}>
                <Text style={styles.counterTitle}>Guests</Text>
                <Text style={styles.counterHint}>Maximum number of guests</Text>
              </View>
              <View style={styles.counterControls}>
                <TouchableOpacity
                  style={[
                    styles.counterButton,
                    formData.maxGuests <= 1 && styles.counterButtonDisabled,
                  ]}
                  onPress={() => decrementValue('maxGuests')}
                  disabled={formData.maxGuests <= 1}
                >
                  <Text style={styles.counterButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{formData.maxGuests}</Text>
                <TouchableOpacity
                  style={[
                    styles.counterButton,
                    formData.maxGuests >= 16 && styles.counterButtonDisabled,
                  ]}
                  onPress={() => incrementValue('maxGuests')}
                  disabled={formData.maxGuests >= 16}
                >
                  <Text style={styles.counterButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bedrooms */}
            <View style={styles.counterRow}>
              <View style={styles.counterLabel}>
                <Text style={styles.counterTitle}>Bedrooms</Text>
                <Text style={styles.counterHint}>Private sleeping areas</Text>
              </View>
              <View style={styles.counterControls}>
                <TouchableOpacity
                  style={[
                    styles.counterButton,
                    formData.bedrooms <= 0 && styles.counterButtonDisabled,
                  ]}
                  onPress={() => decrementValue('bedrooms')}
                  disabled={formData.bedrooms <= 0}
                >
                  <Text style={styles.counterButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>
                  {formData.bedrooms === 0 ? 'Studio' : formData.bedrooms}
                </Text>
                <TouchableOpacity
                  style={[
                    styles.counterButton,
                    formData.bedrooms >= 10 && styles.counterButtonDisabled,
                  ]}
                  onPress={() => incrementValue('bedrooms')}
                  disabled={formData.bedrooms >= 10}
                >
                  <Text style={styles.counterButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Beds */}
            <View style={styles.counterRow}>
              <View style={styles.counterLabel}>
                <Text style={styles.counterTitle}>Beds</Text>
                <Text style={styles.counterHint}>Total sleeping spots</Text>
              </View>
              <View style={styles.counterControls}>
                <TouchableOpacity
                  style={[
                    styles.counterButton,
                    formData.beds <= 1 && styles.counterButtonDisabled,
                  ]}
                  onPress={() => decrementValue('beds')}
                  disabled={formData.beds <= 1}
                >
                  <Text style={styles.counterButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{formData.beds}</Text>
                <TouchableOpacity
                  style={[
                    styles.counterButton,
                    formData.beds >= 20 && styles.counterButtonDisabled,
                  ]}
                  onPress={() => incrementValue('beds')}
                  disabled={formData.beds >= 20}
                >
                  <Text style={styles.counterButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bathrooms */}
            <View style={styles.counterRow}>
              <View style={styles.counterLabel}>
                <Text style={styles.counterTitle}>Bathrooms</Text>
                <Text style={styles.counterHint}>Full or half baths</Text>
              </View>
              <View style={styles.counterControls}>
                <TouchableOpacity
                  style={[
                    styles.counterButton,
                    formData.bathrooms <= 1 && styles.counterButtonDisabled,
                  ]}
                  onPress={() => decrementValue('bathrooms')}
                  disabled={formData.bathrooms <= 1}
                >
                  <Text style={styles.counterButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{formData.bathrooms}</Text>
                <TouchableOpacity
                  style={[
                    styles.counterButton,
                    formData.bathrooms >= 10 && styles.counterButtonDisabled,
                  ]}
                  onPress={() => incrementValue('bathrooms')}
                  disabled={formData.bathrooms >= 10}
                >
                  <Text style={styles.counterButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description *</Text>
            <Text style={styles.sectionHint}>
              Tell guests what makes your place special. Mention the neighborhood,
              nearby attractions, and what guests can expect.
            </Text>
            <TextInput
              value={formData.description}
              onChangeText={(text) => updateField('description', text)}
              mode="outlined"
              placeholder="Describe your property..."
              style={styles.textArea}
              multiline
              numberOfLines={6}
              error={!!errors.description}
              maxLength={2000}
            />
            {errors.description && (
              <Text style={styles.errorText}>{errors.description}</Text>
            )}
            <Text style={styles.charCount}>{formData.description.length}/2000</Text>
          </View>

          {/* Amenities */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <Text style={styles.sectionHint}>
              Select all amenities available at your property
            </Text>
            <View style={styles.amenitiesGrid}>
              {displayedAmenities.map((amenity) => (
                <TouchableOpacity
                  key={amenity.id}
                  style={[
                    styles.amenityChip,
                    formData.amenities.includes(amenity.id) && styles.amenityChipSelected,
                  ]}
                  onPress={() => toggleAmenity(amenity.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.amenityIcon}>{amenity.icon}</Text>
                  <Text
                    style={[
                      styles.amenityLabel,
                      formData.amenities.includes(amenity.id) && styles.amenityLabelSelected,
                    ]}
                  >
                    {amenity.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {AMENITIES_LIST.length > 12 && (
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={() => setShowAllAmenities(!showAllAmenities)}
              >
                <Text style={styles.showMoreText}>
                  {showAllAmenities ? 'Show Less' : `Show All (${AMENITIES_LIST.length})`}
                </Text>
              </TouchableOpacity>
            )}
            <Text style={styles.selectedCount}>
              {formData.amenities.length} amenities selected
            </Text>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            textColor="#6B7280"
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleNext}
            style={styles.nextButton}
            buttonColor="#6366F1"
          >
            Next: Location
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
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
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sectionHint: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    marginTop: 4,
  },
  // Property Type Grid
  propertyTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  propertyTypeCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  propertyTypeCardSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  propertyTypeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  propertyTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  propertyTypeLabelSelected: {
    color: '#6366F1',
  },
  // Counter Rows
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  counterLabel: {
    flex: 1,
  },
  counterTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  counterHint: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  counterButtonDisabled: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  counterButtonText: {
    fontSize: 20,
    color: '#374151',
    fontWeight: '500',
  },
  counterValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    minWidth: 50,
    textAlign: 'center',
  },
  // Amenities
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  amenityChipSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  amenityIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  amenityLabel: {
    fontSize: 14,
    color: '#374151',
  },
  amenityLabelSelected: {
    color: '#6366F1',
    fontWeight: '500',
  },
  showMoreButton: {
    marginTop: 12,
    alignSelf: 'center',
  },
  showMoreText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  selectedCount: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 12,
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
  nextButton: {
    flex: 2,
  },
});
