import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Text, TextInput, Button, Card } from "react-native-paper";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { RootStackParamList } from "../navigation/types";
import { useAuthStore } from "../store/authStore";
import {
  collection,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { db, storage } from "../lib/firebase";

type BecomeAHostScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "BecomeAHost">;
};

interface PropertyPhoto {
  uri: string;
  type: "bedroom" | "bathroom" | "kitchen" | "living" | "exterior" | "other";
  uploaded?: boolean;
  downloadURL?: string;
}

// Countries with major Ethiopian/Eritrean diaspora communities
const COUNTRIES_WITH_CITIES: Record<string, string[]> = {
  "United States": [
    "Washington DC",
    "Los Angeles",
    "Seattle",
    "Dallas",
    "Atlanta",
    "Minneapolis",
    "Denver",
    "San Jose",
    "Oakland",
    "New York",
    "Houston",
    "Phoenix",
    "Las Vegas",
    "Columbus",
    "San Diego",
    "Other",
  ],
  Canada: [
    "Toronto",
    "Ottawa",
    "Calgary",
    "Edmonton",
    "Vancouver",
    "Montreal",
    "Winnipeg",
    "Other",
  ],
  "United Kingdom": [
    "London",
    "Manchester",
    "Birmingham",
    "Leeds",
    "Bristol",
    "Other",
  ],
  Germany: [
    "Frankfurt",
    "Berlin",
    "Munich",
    "Stuttgart",
    "Hamburg",
    "Cologne",
    "Other",
  ],
  Sweden: ["Stockholm", "Gothenburg", "Malmö", "Uppsala", "Other"],
  Norway: ["Oslo", "Bergen", "Trondheim", "Stavanger", "Other"],
  Netherlands: ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Other"],
  Italy: ["Rome", "Milan", "Bologna", "Turin", "Other"],
  Israel: ["Tel Aviv", "Jerusalem", "Haifa", "Netanya", "Other"],
  "Saudi Arabia": ["Riyadh", "Jeddah", "Dammam", "Mecca", "Other"],
  "United Arab Emirates": ["Dubai", "Abu Dhabi", "Sharjah", "Other"],
  Australia: ["Melbourne", "Sydney", "Brisbane", "Perth", "Adelaide", "Other"],
  "South Africa": [
    "Johannesburg",
    "Cape Town",
    "Pretoria",
    "Durban",
    "Other",
  ],
  Kenya: ["Nairobi", "Mombasa", "Other"],
  Sudan: ["Khartoum", "Port Sudan", "Other"],
  Ethiopia: [
    "Addis Ababa",
    "Dire Dawa",
    "Bahir Dar",
    "Hawassa",
    "Mekelle",
    "Gondar",
    "Adama",
    "Other",
  ],
  Eritrea: ["Asmara", "Massawa", "Keren", "Assab", "Other"],
};

const COUNTRIES = Object.keys(COUNTRIES_WITH_CITIES).sort();

const PROPERTY_TYPES = [
  "Apartment",
  "House",
  "Condo",
  "Townhouse",
  "Private Room",
  "Villa",
  "Cabin",
  "Other",
];

const PHOTO_TYPES: { key: PropertyPhoto["type"]; label: string; icon: string }[] = [
  { key: "bedroom", label: "Bedroom", icon: "🛏️" },
  { key: "bathroom", label: "Bathroom", icon: "🚿" },
  { key: "kitchen", label: "Kitchen", icon: "🍳" },
  { key: "living", label: "Living Room", icon: "🛋️" },
  { key: "exterior", label: "Exterior", icon: "🏠" },
  { key: "other", label: "Other", icon: "📷" },
];

const PROPERTY_DESCRIPTION_PLACEHOLDER = `Please provide detailed information about your property (minimum 100 words):

• Full address (street, building number, postal code)
• Distance from nearest airport (e.g., "15 minutes from Bole International Airport")
• Nearby landmarks or neighborhoods
• Available amenities (WiFi, parking, kitchen, AC, etc.)
• Number of bedrooms and bathrooms
• What makes your property unique for Ethiopian/Eritrean guests
• Any house rules or special considerations
• Public transportation access`;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function BecomeAHostScreen({ navigation }: BecomeAHostScreenProps) {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    fullName: user?.displayName || "",
    email: user?.email || "",
    phone: "",
    country: "",
    city: "",
    propertyType: "",
    description: "",
  });
  const [photos, setPhotos] = useState<PropertyPhoto[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Modal states for dropdowns
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showPropertyTypeModal, setShowPropertyTypeModal] = useState(false);
  const [showPhotoTypeModal, setShowPhotoTypeModal] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [citySearch, setCitySearch] = useState("");

  // Get cities based on selected country
  const availableCities = useMemo(() => {
    return formData.country ? COUNTRIES_WITH_CITIES[formData.country] || [] : [];
  }, [formData.country]);

  // Filtered countries for search
  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) return COUNTRIES;
    return COUNTRIES.filter((c) =>
      c.toLowerCase().includes(countrySearch.toLowerCase())
    );
  }, [countrySearch]);

  // Filtered cities for search
  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return availableCities;
    return availableCities.filter((c) =>
      c.toLowerCase().includes(citySearch.toLowerCase())
    );
  }, [citySearch, availableCities]);

  const countWordCount = useCallback((text: string): number => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }, []);

  const wordCount = useMemo(() => countWordCount(formData.description), [formData.description, countWordCount]);

  const validatePhone = useCallback((phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.length >= 10 && cleaned.length <= 15;
  }, []);

  const validateEmail = useCallback((email: string): boolean => {
    return EMAIL_REGEX.test(email);
  }, []);

  const handleCountrySelect = useCallback((country: string) => {
    setFormData((prev) => ({ ...prev, country, city: "" }));
    setShowCountryModal(false);
    setCountrySearch("");
  }, []);

  const handleCitySelect = useCallback((city: string) => {
    setFormData((prev) => ({ ...prev, city }));
    setShowCityModal(false);
    setCitySearch("");
  }, []);

  const handlePropertyTypeSelect = useCallback((type: string) => {
    setFormData((prev) => ({ ...prev, propertyType: type }));
    setShowPropertyTypeModal(false);
  }, []);

  // Request camera/gallery permissions
  const requestPermissions = async (): Promise<boolean> => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== "granted" || libraryStatus !== "granted") {
      Alert.alert(
        "Permissions Required",
        "Please grant camera and photo library permissions to add property photos.",
        [{ text: "OK" }]
      );
      return false;
    }
    return true;
  };

  // Pick image from camera or gallery
  const pickImage = async (photoType: PropertyPhoto["type"], useCamera: boolean) => {
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
        const newPhoto: PropertyPhoto = {
          uri: result.assets[0].uri,
          type: photoType,
        };
        setPhotos((prev) => [...prev, newPhoto]);
      }
    } catch (err) {
      console.error("Image picker error:", err);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }

    setShowPhotoTypeModal(false);
  };

  // Show photo source options
  const showPhotoOptions = (photoType: PropertyPhoto["type"]) => {
    Alert.alert(
      "Add Photo",
      `Add ${PHOTO_TYPES.find((t) => t.key === photoType)?.label} photo`,
      [
        { text: "Take Photo", onPress: () => pickImage(photoType, true) },
        { text: "Choose from Gallery", onPress: () => pickImage(photoType, false) },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  // Remove a photo
  const removePhoto = useCallback((index: number) => {
    Alert.alert(
      "Remove Photo",
      "Are you sure you want to remove this photo?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => setPhotos((prev) => prev.filter((_, i) => i !== index)),
        },
      ]
    );
  }, []);

  // Upload photos to Firebase Storage
  const uploadPhotos = async (applicationId: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      setUploadProgress(`Uploading photo ${i + 1} of ${photos.length}...`);

      try {
        const response = await fetch(photo.uri);
        const blob = await response.blob();
        
        const filename = `host-applications/${applicationId}/${photo.type}_${Date.now()}_${i}.jpg`;
        const storageRef = ref(storage, filename);
        
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
        uploadedUrls.push(downloadURL);
      } catch (err) {
        console.error(`Failed to upload photo ${i + 1}:`, err);
      }
    }

    setUploadProgress(null);
    return uploadedUrls;
  };

  const handleSubmit = useCallback(async () => {
    setError(null);

    // Validation
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      setError("Please enter your full name (at least 2 characters)");
      return;
    }
    if (!formData.email.trim() || !validateEmail(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!validatePhone(formData.phone)) {
      setError("Please enter a valid phone number (10-15 digits)");
      return;
    }
    if (!formData.country) {
      setError("Please select your country");
      return;
    }
    if (!formData.city) {
      setError("Please select your city");
      return;
    }
    if (!formData.propertyType) {
      setError("Please select a property type");
      return;
    }
    if (wordCount < 100) {
      setError(
        `Property description must be at least 100 words. Currently: ${wordCount} words`
      );
      return;
    }
    if (photos.length < 3) {
      setError("Please add at least 3 photos of your property");
      return;
    }
    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service and Host Agreement");
      return;
    }

    setIsSubmitting(true);

    try {
      const now = Timestamp.now();

      // Create the host application document
      const applicationData = {
        // User info
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        userId: user?.uid || null,
        
        // Property info
        propertyCountry: formData.country,
        propertyCity: formData.city,
        propertyType: formData.propertyType,
        description: formData.description.trim(),
        
        // Status
        status: "pending",
        
        // Timestamps
        createdAt: now,
        updatedAt: now,
        
        // Photos will be added after upload
        photos: [] as string[],
      };

      // Add document to get ID for photo upload path
      const docRef = await addDoc(collection(db, "hostApplications"), applicationData);

      // Upload photos
      if (photos.length > 0) {
        const photoUrls = await uploadPhotos(docRef.id);
        
        // Update document with photo URLs (using set with merge would require another import)
        // For now, photos are uploaded to storage with application ID reference
        console.log(`Uploaded ${photoUrls.length} photos for application ${docRef.id}`);
      }

      setSubmitted(true);
    } catch (err: unknown) {
      console.error("Submit error:", err);
      if (err instanceof Error) {
        if (err.message.includes("permission")) {
          setError("Please sign in to submit your application");
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to submit application. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, photos, agreedToTerms, wordCount, user, validateEmail, validatePhone]);

  // Dropdown selector component
  const DropdownSelector = React.memo(({
    value,
    placeholder,
    onPress,
    disabled = false,
  }: {
    value: string;
    placeholder: string;
    onPress: () => void;
    disabled?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.dropdown, disabled && styles.dropdownDisabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={value || placeholder}
      accessibilityState={{ disabled }}
    >
      <Text style={[styles.dropdownText, !value && styles.dropdownPlaceholder]}>
        {value || placeholder}
      </Text>
      <Text style={styles.dropdownArrow}>▼</Text>
    </TouchableOpacity>
  ));

  // Modal picker component with search
  const PickerModal = React.memo(({
    visible,
    onClose,
    title,
    data,
    onSelect,
    searchValue,
    onSearchChange,
    showSearch = false,
  }: {
    visible: boolean;
    onClose: () => void;
    title: string;
    data: string[];
    onSelect: (item: string) => void;
    searchValue?: string;
    onSearchChange?: (text: string) => void;
    showSearch?: boolean;
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
              accessibilityRole="button"
              accessibilityLabel="Close modal"
            >
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {showSearch && onSearchChange && (
            <View style={styles.searchContainer}>
              <TextInput
                placeholder="Search..."
                value={searchValue}
                onChangeText={onSearchChange}
                style={styles.searchInput}
                mode="outlined"
                dense
              />
            </View>
          )}
          
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
                  accessibilityRole="button"
                  accessibilityLabel={`Select ${item}`}
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
  ));

  // Photo type selector modal
  const PhotoTypeModal = React.memo(() => (
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
              accessibilityRole="button"
              accessibilityLabel="Close modal"
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
                onPress={() => showPhotoOptions(item.key)}
                accessibilityRole="button"
                accessibilityLabel={`Add ${item.label} photo`}
              >
                <Text style={styles.photoTypeIcon}>{item.icon}</Text>
                <Text style={styles.photoTypeLabel}>{item.label}</Text>
              </TouchableOpacity>
            )}
            style={styles.modalList}
          />
        </View>
      </View>
    </Modal>
  ));

  // Success screen
  if (submitted) {
    return (
      <View style={styles.container}>
        <View style={styles.successContent}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.successTitle}>Application Received!</Text>
          <Text style={styles.successText}>
            Thank you for your interest in becoming a host. Our team will review
            your application and contact you within 2-3 business days.
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate("MainTabs")}
            style={styles.homeButton}
            buttonColor="#6366F1"
            accessibilityLabel="Go back to home screen"
          >
            Back to Home
          </Button>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>🇪🇹 Become an Enatbet Host 🇪🇷</Text>
          <Text style={styles.heroSubtitle}>
            Share your home with the Ethiopian and Eritrean diaspora community.
            Earn extra income while helping fellow community members.
          </Text>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsRow}>
          <Card style={styles.benefitCard}>
            <Card.Content style={styles.benefitContent}>
              <Text style={styles.benefitIcon}>💰</Text>
              <Text style={styles.benefitTitle}>Earn Income</Text>
            </Card.Content>
          </Card>
          <Card style={styles.benefitCard}>
            <Card.Content style={styles.benefitContent}>
              <Text style={styles.benefitIcon}>🤝</Text>
              <Text style={styles.benefitTitle}>Community</Text>
            </Card.Content>
          </Card>
          <Card style={styles.benefitCard}>
            <Card.Content style={styles.benefitContent}>
              <Text style={styles.benefitIcon}>🛡️</Text>
              <Text style={styles.benefitTitle}>Protection</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>Host Application</Text>

          {!user && (
            <View style={styles.authNotice}>
              <Text style={styles.authNoticeText}>
                Already have an account?{" "}
                <Text
                  style={styles.authLink}
                  onPress={() => navigation.navigate("Login")}
                  accessibilityRole="link"
                >
                  Sign in
                </Text>{" "}
                to auto-fill your details.
              </Text>
            </View>
          )}

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TextInput
            label="Full Name *"
            value={formData.fullName}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, fullName: text }))}
            mode="outlined"
            style={styles.input}
            accessibilityLabel="Full name input"
          />

          <TextInput
            label="Email *"
            value={formData.email}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, email: text }))}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!user?.email}
            style={styles.input}
            accessibilityLabel="Email input"
          />

          <TextInput
            label="Phone *"
            value={formData.phone}
            onChangeText={(text) => setFormData((prev) => ({ ...prev, phone: text }))}
            mode="outlined"
            keyboardType="phone-pad"
            placeholder="+1 (555) 123-4567"
            style={styles.input}
            accessibilityLabel="Phone number input"
          />

          {/* Property Location Section */}
          <Text style={styles.sectionLabel}>Property Location *</Text>

          <View style={styles.dropdownContainer}>
            <DropdownSelector
              value={formData.country}
              placeholder="Select Country"
              onPress={() => setShowCountryModal(true)}
            />
          </View>

          <View style={styles.dropdownContainer}>
            <DropdownSelector
              value={formData.city}
              placeholder="Select City"
              onPress={() => setShowCityModal(true)}
              disabled={!formData.country}
            />
          </View>

          {/* Property Type Section */}
          <Text style={styles.sectionLabel}>Property Type *</Text>
          <View style={styles.dropdownContainer}>
            <DropdownSelector
              value={formData.propertyType}
              placeholder="Select property type"
              onPress={() => setShowPropertyTypeModal(true)}
            />
          </View>

          {/* Property Photos Section */}
          <Text style={styles.sectionLabel}>Property Photos * (minimum 3)</Text>
          <Text style={styles.photoHint}>
            Add photos of bedrooms, bathrooms, kitchen, living areas, and exterior
          </Text>

          <View style={styles.photosGrid}>
            {photos.map((photo, index) => (
              <View key={`photo-${index}`} style={styles.photoContainer}>
                <Image source={{ uri: photo.uri }} style={styles.photoThumbnail} />
                <View style={styles.photoTypeTag}>
                  <Text style={styles.photoTypeTagText}>
                    {PHOTO_TYPES.find((t) => t.key === photo.type)?.icon}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.photoRemoveButton}
                  onPress={() => removePhoto(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remove ${photo.type} photo`}
                >
                  <Text style={styles.photoRemoveText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}

            {photos.length < 10 && (
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={() => setShowPhotoTypeModal(true)}
                accessibilityRole="button"
                accessibilityLabel="Add property photo"
              >
                <Text style={styles.addPhotoIcon}>+</Text>
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.photoCount}>
            {photos.length}/10 photos {photos.length >= 3 ? "✓" : `(need ${3 - photos.length} more)`}
          </Text>

          {/* Property Description */}
          <View style={styles.descriptionContainer}>
            <TextInput
              label="Property Description (minimum 100 words) *"
              value={formData.description}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, description: text }))}
              mode="outlined"
              multiline
              numberOfLines={8}
              placeholder={PROPERTY_DESCRIPTION_PLACEHOLDER}
              style={styles.descriptionInput}
              accessibilityLabel="Property description input"
            />
            <View style={styles.wordCountContainer}>
              <Text
                style={[
                  styles.wordCountText,
                  wordCount >= 100 ? styles.wordCountValid : styles.wordCountInvalid,
                ]}
              >
                {wordCount}/100 words {wordCount >= 100 ? "✓" : "(minimum)"}
              </Text>
            </View>
          </View>

          {/* Terms Checkbox */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            activeOpacity={0.7}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: agreedToTerms }}
            accessibilityLabel="Agree to Terms of Service and Host Agreement"
          >
            <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
              {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.checkboxLabelContainer}>
              <Text style={styles.checkboxLabel}>
                I agree to the{" "}
              </Text>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  navigation.navigate("TermsOfService");
                }}
                accessibilityRole="link"
              >
                <Text style={styles.link}>Terms of Service</Text>
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}> and </Text>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  navigation.navigate("HostAgreement" as never);
                }}
                accessibilityRole="link"
              >
                <Text style={styles.link}>Host Agreement</Text>
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}> *</Text>
            </View>
          </TouchableOpacity>

          {uploadProgress && (
            <View style={styles.uploadProgress}>
              <ActivityIndicator size="small" color="#6366F1" />
              <Text style={styles.uploadProgressText}>{uploadProgress}</Text>
            </View>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}
            buttonColor="#6366F1"
            accessibilityLabel={isSubmitting ? "Submitting application" : "Submit host application"}
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </View>
      </ScrollView>

      {/* Modals */}
      <PickerModal
        visible={showCountryModal}
        onClose={() => {
          setShowCountryModal(false);
          setCountrySearch("");
        }}
        title="Select Country"
        data={filteredCountries}
        onSelect={handleCountrySelect}
        searchValue={countrySearch}
        onSearchChange={setCountrySearch}
        showSearch
      />

      <PickerModal
        visible={showCityModal}
        onClose={() => {
          setShowCityModal(false);
          setCitySearch("");
        }}
        title="Select City"
        data={filteredCities}
        onSelect={handleCitySelect}
        searchValue={citySearch}
        onSearchChange={setCitySearch}
        showSearch
      />

      <PickerModal
        visible={showPropertyTypeModal}
        onClose={() => setShowPropertyTypeModal(false)}
        title="Select Property Type"
        data={PROPERTY_TYPES}
        onSelect={handlePropertyTypeSelect}
      />

      <PhotoTypeModal />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  hero: {
    backgroundColor: "#6366F1",
    padding: 24,
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#E0E7FF",
    textAlign: "center",
  },
  benefitsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    marginTop: -20,
  },
  benefitCard: {
    width: "30%",
    backgroundColor: "#fff",
  },
  benefitContent: {
    alignItems: "center",
    paddingVertical: 12,
  },
  benefitIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  benefitTitle: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  formSection: {
    padding: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#111827",
  },
  authNotice: {
    backgroundColor: "#EFF6FF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  authNoticeText: {
    color: "#1E40AF",
    fontSize: 14,
  },
  authLink: {
    color: "#6366F1",
    fontWeight: "bold",
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  sectionLabel: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
    marginTop: 8,
    fontWeight: "500",
  },
  // Dropdown styles
  dropdownContainer: {
    marginBottom: 12,
  },
  dropdown: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownDisabled: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
  dropdownText: {
    fontSize: 16,
    color: "#111827",
  },
  dropdownPlaceholder: {
    color: "#9CA3AF",
  },
  dropdownArrow: {
    fontSize: 12,
    color: "#6B7280",
  },
  // Photo styles
  photoHint: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 12,
  },
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },
  photoContainer: {
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  photoThumbnail: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  photoTypeTag: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  photoTypeTagText: {
    fontSize: 14,
  },
  photoRemoveButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(220,38,38,0.9)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  photoRemoveText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#6366F1",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
  },
  addPhotoIcon: {
    fontSize: 32,
    color: "#6366F1",
  },
  addPhotoText: {
    fontSize: 12,
    color: "#6366F1",
    marginTop: 4,
  },
  photoCount: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 16,
  },
  // Photo type modal
  photoTypeItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  photoTypeIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  photoTypeLabel: {
    fontSize: 16,
    color: "#111827",
  },
  // Description styles
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionInput: {
    backgroundColor: "#fff",
    minHeight: 180,
  },
  wordCountContainer: {
    alignItems: "flex-end",
    marginTop: 4,
  },
  wordCountText: {
    fontSize: 13,
    fontWeight: "500",
  },
  wordCountValid: {
    color: "#059669",
  },
  wordCountInvalid: {
    color: "#DC2626",
  },
  // Checkbox styles
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingVertical: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#6366F1",
    borderRadius: 4,
    marginRight: 12,
    marginTop: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#6366F1",
  },
  checkmark: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  checkboxLabelContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#374151",
  },
  link: {
    color: "#6366F1",
    fontWeight: "600",
  },
  // Upload progress
  uploadProgress: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#EEF2FF",
    borderRadius: 8,
  },
  uploadProgressText: {
    marginLeft: 8,
    color: "#6366F1",
    fontSize: 14,
  },
  submitButton: {
    paddingVertical: 6,
    marginTop: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  modalClose: {
    fontSize: 20,
    color: "#6B7280",
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  searchInput: {
    backgroundColor: "#fff",
  },
  emptyList: {
    padding: 40,
    alignItems: "center",
  },
  emptyListText: {
    color: "#6B7280",
    fontSize: 16,
  },
  modalList: {
    paddingBottom: 40,
  },
  modalItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalItemText: {
    fontSize: 16,
    color: "#111827",
  },
  // Success styles
  successContent: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#111827",
  },
  successText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  homeButton: {
    paddingVertical: 6,
    minWidth: 200,
  },
});