import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { TextInput, Button, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, COUNTRIES_WITH_CITIES } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreateListingStep2'>;
  route: RouteProp<RootStackParamList, 'CreateListingStep2'>;
};

const COUNTRIES = Object.keys(COUNTRIES_WITH_CITIES).sort();

export default function CreateListingStep2Screen({ navigation, route }: Props) {
  const { listingData } = route.params;

  const [formData, setFormData] = useState({
    country: listingData?.country || '',
    city: listingData?.city || '',
    address: listingData?.address || '',
    airportDistance: listingData?.airportDistance || '',
    neighborhood: listingData?.neighborhood || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [citySearch, setCitySearch] = useState('');

  // Get available cities based on selected country
  const availableCities = useMemo(() => {
    return formData.country ? COUNTRIES_WITH_CITIES[formData.country] || [] : [];
  }, [formData.country]);

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return COUNTRIES;
    return COUNTRIES.filter(c =>
      c.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [countrySearch]);

  // Filter cities based on search
  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return availableCities;
    return availableCities.filter(c =>
      c.toLowerCase().includes(citySearch.toLowerCase())
    );
  }, [citySearch, availableCities]);

  const updateField = <K extends keyof typeof formData>(
    field: K,
    value: typeof formData[K]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCountrySelect = (country: string) => {
    updateField('country', country);
    updateField('city', ''); // Reset city when country changes
    setShowCountryModal(false);
    setCountrySearch('');
  };

  const handleCitySelect = (city: string) => {
    updateField('city', city);
    setShowCityModal(false);
    setCitySearch('');
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.country) {
      newErrors.country = 'Please select a country';
    }

    if (!formData.city) {
      newErrors.city = 'Please select a city';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Please enter the property address';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Address must be at least 10 characters';
    } else if (formData.address.trim().length > 200) {
      newErrors.address = 'Address must be less than 200 characters';
    }

    if (!formData.airportDistance.trim()) {
      newErrors.airportDistance = 'Please enter distance from airport';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      navigation.navigate('CreateListingStep3', {
        listingData: {
          ...listingData,
          country: formData.country,
          city: formData.city,
          address: formData.address.trim(),
          airportDistance: formData.airportDistance.trim(),
          neighborhood: formData.neighborhood.trim(),
        },
      });
    }
  };

  const handleBack = () => {
    navigation.navigate('CreateListingStep1', {
      listingData: {
        ...listingData,
        country: formData.country,
        city: formData.city,
        address: formData.address,
        airportDistance: formData.airportDistance,
        neighborhood: formData.neighborhood,
      },
    });
  };

  // Dropdown Selector Component
  const DropdownSelector = ({
    label,
    value,
    placeholder,
    onPress,
    disabled = false,
    error,
  }: {
    label: string;
    value: string;
    placeholder: string;
    onPress: () => void;
    disabled?: boolean;
    error?: string;
  }) => (
    <View style={styles.dropdownWrapper}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.dropdown,
          disabled && styles.dropdownDisabled,
          error && styles.dropdownError,
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.dropdownText,
            !value && styles.dropdownPlaceholder,
          ]}
        >
          {value || placeholder}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  // Modal Picker Component
  const PickerModal = ({
    visible,
    onClose,
    title,
    data,
    onSelect,
    searchValue,
    onSearchChange,
  }: {
    visible: boolean;
    onClose: () => void;
    title: string;
    data: string[];
    onSelect: (item: string) => void;
    searchValue: string;
    onSearchChange: (text: string) => void;
  }) => (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              placeholder="Search..."
              value={searchValue}
              onChangeText={onSearchChange}
              style={styles.searchInput}
              mode="outlined"
              dense
              left={<TextInput.Icon icon="magnify" />}
            />
          </View>

          {data.length === 0 ? (
            <View style={styles.emptyList}>
              <Text style={styles.emptyListText}>No results found</Text>
            </View>
          ) : (
            <FlatList
              data={data}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => onSelect(item)}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
              style={styles.modalList}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        {/* Progress Header */}
        <View style={styles.progressHeader}>
          <Text style={styles.stepText}>Step 2 of 5</Text>
          <Text style={styles.stepTitle}>Location</Text>
          <ProgressBar progress={0.4} color="#6366F1" style={styles.progressBar} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Location Info */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>📍</Text>
            <Text style={styles.infoText}>
              Your exact address is only shared with guests after they book.
              We'll show the general area to help guests find listings in their desired location.
            </Text>
          </View>

          {/* Country */}
          <View style={styles.section}>
            <DropdownSelector
              label="Country *"
              value={formData.country}
              placeholder="Select country"
              onPress={() => setShowCountryModal(true)}
              error={errors.country}
            />
          </View>

          {/* City */}
          <View style={styles.section}>
            <DropdownSelector
              label="City *"
              value={formData.city}
              placeholder={formData.country ? 'Select city' : 'Select country first'}
              onPress={() => setShowCityModal(true)}
              disabled={!formData.country}
              error={errors.city}
            />
          </View>

          {/* Full Address */}
          <View style={styles.section}>
            <Text style={styles.inputLabel}>Full Address *</Text>
            <Text style={styles.inputHint}>
              Include street name, building number, and postal code
            </Text>
            <TextInput
              value={formData.address}
              onChangeText={(text) => updateField('address', text)}
              mode="outlined"
              placeholder="e.g., 123 Bole Road, Building A, Floor 3"
              style={styles.input}
              error={!!errors.address}
              maxLength={200}
              multiline
              numberOfLines={2}
            />
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
          </View>

          {/* Airport Distance */}
          <View style={styles.section}>
            <Text style={styles.inputLabel}>Distance from Airport *</Text>
            <Text style={styles.inputHint}>
              Help guests know how far your property is from the nearest airport
            </Text>
            <TextInput
              value={formData.airportDistance}
              onChangeText={(text) => updateField('airportDistance', text)}
              mode="outlined"
              placeholder="e.g., 15 minutes from Bole International Airport"
              style={styles.input}
              error={!!errors.airportDistance}
              maxLength={100}
            />
            {errors.airportDistance && (
              <Text style={styles.errorText}>{errors.airportDistance}</Text>
            )}

            {/* Quick Distance Options */}
            <View style={styles.quickOptions}>
              {[
                '5 minutes from airport',
                '10 minutes from airport',
                '15 minutes from airport',
                '20 minutes from airport',
                '30+ minutes from airport',
              ].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.quickOption,
                    formData.airportDistance === option && styles.quickOptionSelected,
                  ]}
                  onPress={() => updateField('airportDistance', option)}
                >
                  <Text
                    style={[
                      styles.quickOptionText,
                      formData.airportDistance === option && styles.quickOptionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Neighborhood */}
          <View style={styles.section}>
            <Text style={styles.inputLabel}>Neighborhood (Optional)</Text>
            <Text style={styles.inputHint}>
              Describe the area around your property - nearby landmarks, restaurants, attractions
            </Text>
            <TextInput
              value={formData.neighborhood}
              onChangeText={(text) => updateField('neighborhood', text)}
              mode="outlined"
              placeholder="e.g., Located in the heart of Bole, walking distance to restaurants and shops..."
              style={styles.textArea}
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={styles.charCount}>{formData.neighborhood.length}/500</Text>
          </View>

          {/* Tips */}
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>💡 Location Tips</Text>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>
                Mention nearby public transportation options
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>
                Include popular landmarks guests might recognize
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>
                Highlight what makes your neighborhood special
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
            Next: Photos
          </Button>
        </View>
      </KeyboardAvoidingView>

      {/* Country Picker Modal */}
      <PickerModal
        visible={showCountryModal}
        onClose={() => {
          setShowCountryModal(false);
          setCountrySearch('');
        }}
        title="Select Country"
        data={filteredCountries}
        onSelect={handleCountrySelect}
        searchValue={countrySearch}
        onSearchChange={setCountrySearch}
      />

      {/* City Picker Modal */}
      <PickerModal
        visible={showCityModal}
        onClose={() => {
          setShowCityModal(false);
          setCitySearch('');
        }}
        title="Select City"
        data={filteredCities}
        onSelect={handleCitySelect}
        searchValue={citySearch}
        onSearchChange={setCitySearch}
      />
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#4338CA',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  inputHint: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    minHeight: 100,
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
  // Dropdown Styles
  dropdownWrapper: {
    marginBottom: 0,
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  dropdownError: {
    borderColor: '#DC2626',
  },
  dropdownText: {
    fontSize: 16,
    color: '#111827',
  },
  dropdownPlaceholder: {
    color: '#9CA3AF',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#6B7280',
  },
  // Quick Options
  quickOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  quickOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  quickOptionSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#EEF2FF',
  },
  quickOptionText: {
    fontSize: 13,
    color: '#374151',
  },
  quickOptionTextSelected: {
    color: '#6366F1',
    fontWeight: '500',
  },
  // Tips Section
  tipsSection: {
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
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
    maxHeight: '70%',
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
  },
  emptyList: {
    padding: 40,
    alignItems: 'center',
  },
  emptyListText: {
    color: '#6B7280',
    fontSize: 16,
  },
  modalList: {
    paddingBottom: 40,
  },
  modalItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItemText: {
    fontSize: 16,
    color: '#111827',
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
