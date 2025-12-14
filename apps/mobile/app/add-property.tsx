import React, { useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Text, TextInput, Button, Chip } from "react-native-paper";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";

// ============ CONSTANTS ============
const MAX_IMAGES = 10;
const IMAGE_MAX_WIDTH = 1920;
const IMAGE_COMPRESSION = 0.7;
const MIN_PRICE = 10;
const MAX_PRICE = 10000;
const MAX_GUESTS = 20;
const MAX_BEDROOMS = 10;
const MAX_BATHROOMS = 10;

const PROPERTY_TYPES = ["Apartment", "House", "Condo", "Townhouse", "Private Room", "Other"] as const;

const AMENITIES = [
  { id: "wifi", label: "WiFi", icon: "📶" },
  { id: "kitchen", label: "Kitchen", icon: "🍳" },
  { id: "parking", label: "Parking", icon: "🚗" },
  { id: "ac", label: "Air Conditioning", icon: "❄️" },
  { id: "heating", label: "Heating", icon: "🔥" },
  { id: "washer", label: "Washer", icon: "🧺" },
  { id: "dryer", label: "Dryer", icon: "👕" },
  { id: "tv", label: "TV", icon: "📺" },
  { id: "pool", label: "Pool", icon: "🏊" },
  { id: "gym", label: "Gym", icon: "💪" },
  { id: "workspace", label: "Workspace", icon: "💻" },
  { id: "pets", label: "Pets Allowed", icon: "🐕" },
  { id: "coffee", label: "Coffee Ceremony Set", icon: "☕" },
  { id: "injera", label: "Injera Mitad", icon: "🫓" },
] as const;

const ERROR_MESSAGES = {
  noImages: "Please add at least one property image",
  noTitle: "Please enter a property title",
  noDescription: "Please enter a description",
  noPropertyType: "Please select a property type",
  invalidPrice: `Price must be between $${MIN_PRICE} and $${MAX_PRICE}`,
  noAddress: "Please enter the property address",
  noCity: "Please enter the city",
  noCountry: "Please enter the country",
  submitFailed: "Failed to submit property. Please try again.",
  networkError: "Network error. Please check your connection.",
  uploadFailed: "Failed to upload images. Please try again.",
  permissionDenied: "Camera/photo permissions required. Please enable in Settings.",
};

// ============ TYPES ============
type ImageStatus = "pending" | "uploading" | "success" | "error";

interface PropertyImage {
  uri: string;
  status: ImageStatus;
  downloadURL?: string;
  errorMessage?: string;
}

interface FormData {
  title: string;
  description: string;
  propertyType: string;
  pricePerNight: string;
  bedrooms: string;
  bathrooms: string;
  maxGuests: string;
  address: string;
  city: string;
  country: string;
}

// ============ HELPERS ============
const sanitizeText = (text: string): string => {
  return text
    .replace(/<[^>]*>/g, "") // Strip HTML tags
    .replace(/[<>]/g, "") // Remove angle brackets
    .trim();
};

const parsePositiveInt = (value: string, defaultValue: number, max: number): number => {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < 1) return defaultValue;
  return Math.min(parsed, max);
};

const parsePrice = (value: string): number | null => {
  const parsed = parseFloat(value);
  if (isNaN(parsed) || parsed < MIN_PRICE || parsed > MAX_PRICE) return null;
  return Math.round(parsed * 100) / 100; // Round to 2 decimals
};

// ============ COMPONENT ============
export default function AddPropertyScreen() {
  const auth = getAuth();
  const isSubmittingRef = useRef(false); // Prevent double submit
  
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    propertyType: "",
    pricePerNight: "",
    bedrooms: "1",
    bathrooms: "1",
    maxGuests: "2",
    address: "",
    city: "",
    country: "",
  });
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============ PERMISSIONS ============
  const requestCameraPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera access is needed to take photos. Please enable it in Settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => ImagePicker.requestCameraPermissionsAsync() },
        ]
      );
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Photo library access is needed to select images. Please enable it in Settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => ImagePicker.requestMediaLibraryPermissionsAsync() },
        ]
      );
      return false;
    }
    return true;
  };

  // ============ IMAGE COMPRESSION ============
  const compressImage = async (uri: string): Promise<string> => {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: IMAGE_MAX_WIDTH } }],
        { compress: IMAGE_COMPRESSION, format: ImageManipulator.SaveFormat.JPEG }
      );
      return result.uri;
    } catch {
      // If compression fails, return original
      return uri;
    }
  };

  // ============ IMAGE PICKING ============
  const takePhoto = useCallback(async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert("Maximum Images", `You can upload up to ${MAX_IMAGES} images per property.`);
      return;
    }

    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, // OK for single image
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const compressedUri = await compressImage(result.assets[0].uri);
        setImages(prev => [...prev, { uri: compressedUri, status: "pending" }]);
      }
    } catch (err) {
      console.error("Camera error:", err);
      setError("Failed to take photo. Please try again.");
    }
  }, [images.length]);

  const pickImages = useCallback(async () => {
    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      Alert.alert("Maximum Images", `You can upload up to ${MAX_IMAGES} images per property.`);
      return;
    }

    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
        quality: 0.8,
        // Note: allowsEditing is NOT compatible with allowsMultipleSelection
      });

      if (!result.canceled && result.assets) {
        const compressedImages = await Promise.all(
          result.assets.map(async (asset) => {
            const compressedUri = await compressImage(asset.uri);
            return { uri: compressedUri, status: "pending" as ImageStatus };
          })
        );
        setImages(prev => [...prev, ...compressedImages]);
      }
    } catch (err) {
      console.error("Image picker error:", err);
      setError("Failed to select images. Please try again.");
    }
  }, [images.length]);

  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const showImageOptions = useCallback(() => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert("Maximum Images", `You can upload up to ${MAX_IMAGES} images per property.`);
      return;
    }

    Alert.alert(
      "Add Property Photos",
      "Choose how to add photos",
      [
        { text: "Take Photo", onPress: takePhoto },
        { text: "Choose from Library", onPress: pickImages },
        { text: "Cancel", style: "cancel" },
      ]
    );
  }, [images.length, takePhoto, pickImages]);

  // ============ AMENITIES ============
  const toggleAmenity = useCallback((id: string) => {
    setSelectedAmenities(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  }, []);

  // ============ IMAGE UPLOAD ============
  const uploadSingleImage = async (
    uri: string, 
    index: number,
    userId: string
  ): Promise<string> => {
    const response = await fetch(uri);
    if (!response.ok) throw new Error("Failed to fetch image");
    
    const blob = await response.blob();
    const storage = getStorage();
    const filename = `properties/${userId}/${Date.now()}_${index}.jpg`;
    const storageRef = ref(storage, filename);
    
    await uploadBytes(storageRef, blob, {
      contentType: "image/jpeg",
    });
    
    return await getDownloadURL(storageRef);
  };

  const uploadAllImages = async (userId: string): Promise<string[]> => {
    // Update all images to uploading status
    setImages(prev => prev.map(img => ({ ...img, status: "uploading" as ImageStatus })));

    // Parallel upload with individual status tracking
    const results = await Promise.allSettled(
      images.map(async (image, index) => {
        try {
          const url = await uploadSingleImage(image.uri, index, userId);
          setImages(prev => prev.map((img, i) => 
            i === index ? { ...img, status: "success" as ImageStatus, downloadURL: url } : img
          ));
          return url;
        } catch (err) {
          setImages(prev => prev.map((img, i) => 
            i === index ? { ...img, status: "error" as ImageStatus } : img
          ));
          throw err;
        }
      })
    );

    // Check for failures
    const successfulUrls: string[] = [];
    const failures: number[] = [];
    
    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        successfulUrls.push(result.value);
      } else {
        failures.push(index + 1);
      }
    });

    if (failures.length > 0) {
      throw new Error(`Failed to upload image(s): ${failures.join(", ")}`);
    }

    return successfulUrls;
  };

  // ============ VALIDATION ============
  const validateForm = (): string | null => {
    if (images.length === 0) return ERROR_MESSAGES.noImages;
    if (!sanitizeText(formData.title)) return ERROR_MESSAGES.noTitle;
    if (!sanitizeText(formData.description)) return ERROR_MESSAGES.noDescription;
    if (!formData.propertyType) return ERROR_MESSAGES.noPropertyType;
    
    const price = parsePrice(formData.pricePerNight);
    if (price === null) return ERROR_MESSAGES.invalidPrice;
    
    if (!sanitizeText(formData.address)) return ERROR_MESSAGES.noAddress;
    if (!sanitizeText(formData.city)) return ERROR_MESSAGES.noCity;
    if (!sanitizeText(formData.country)) return ERROR_MESSAGES.noCountry;
    
    return null;
  };

  // ============ SUBMIT ============
  const handleSubmit = useCallback(async () => {
    // Prevent double submission
    if (isSubmittingRef.current || isSubmitting) return;
    
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to list a property.", [
        { text: "Cancel", style: "cancel" },
        { text: "Sign In", onPress: () => router.push("/login") },
      ]);
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setError(null);

    try {
      // Upload images (parallel)
      const uploadedURLs = await uploadAllImages(user.uid);

      // Parse validated values
      const price = parsePrice(formData.pricePerNight)!;
      const bedrooms = parsePositiveInt(formData.bedrooms, 1, MAX_BEDROOMS);
      const bathrooms = parsePositiveInt(formData.bathrooms, 1, MAX_BATHROOMS);
      const maxGuests = parsePositiveInt(formData.maxGuests, 1, MAX_GUESTS);

      // Save to Firestore - only include fields the client SHOULD set
      // Server-controlled fields (status, isActive, rating, reviewCount) are set by Cloud Functions/Admin
      const db = getFirestore();
      await addDoc(collection(db, "properties"), {
        hostId: user.uid,
        title: sanitizeText(formData.title),
        description: sanitizeText(formData.description),
        propertyType: formData.propertyType,
        pricePerNight: price,
        bedrooms,
        bathrooms,
        maxGuests,
        address: sanitizeText(formData.address),
        city: sanitizeText(formData.city),
        country: sanitizeText(formData.country),
        amenities: selectedAmenities,
        images: uploadedURLs,
        thumbnail: uploadedURLs[0],
        source: "mobile",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // NOTE: status, isActive, rating, reviewCount should be set by Firestore rules/Cloud Functions
        // with default values, NOT by the client
      });

      Alert.alert(
        "Property Submitted! 🎉",
        "Your property has been submitted for review. We'll notify you once it's approved.",
        [{ text: "OK", onPress: () => router.replace("/(tabs)") }]
      );
      
      // Reset form after successful submission
      setImages([]);
      setFormData({
        title: "",
        description: "",
        propertyType: "",
        pricePerNight: "",
        bedrooms: "1",
        bathrooms: "1",
        maxGuests: "2",
        address: "",
        city: "",
        country: "",
      });
      setSelectedAmenities([]);
      
    } catch (err: unknown) {
      console.error("Error submitting property:", err);
      
      // Specific error messages
      const errorMessage = err instanceof Error ? err.message : "";
      if (errorMessage.includes("network") || errorMessage.includes("Network")) {
        setError(ERROR_MESSAGES.networkError);
      } else if (errorMessage.includes("upload") || errorMessage.includes("Failed to upload")) {
        setError(errorMessage);
      } else {
        setError(ERROR_MESSAGES.submitFailed);
      }
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  }, [auth, formData, images, selectedAmenities, isSubmitting]);

  // ============ RENDER ============
  const uploadingCount = images.filter(img => img.status === "uploading").length;
  const isUploading = uploadingCount > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        keyboardShouldPersistTaps="handled"
      >
        {/* Image Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Photos *</Text>
          <Text style={styles.sectionSubtitle}>
            Add up to {MAX_IMAGES} photos. First photo will be the cover.
          </Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.imageScroll}
            accessibilityRole="list"
            accessibilityLabel="Property photos"
          >
            {/* Add Photo Button */}
            <TouchableOpacity 
              style={styles.addImageButton} 
              onPress={showImageOptions}
              accessibilityRole="button"
              accessibilityLabel="Add property photos"
              accessibilityHint="Opens camera or photo library to add images"
              disabled={isSubmitting}
            >
              <Text style={styles.addImageIcon}>📷</Text>
              <Text style={styles.addImageText}>Add Photos</Text>
              <Text style={styles.imageCount}>{images.length}/{MAX_IMAGES}</Text>
            </TouchableOpacity>

            {/* Image Previews */}
            {images.map((image, index) => (
              <View 
                key={`${image.uri}-${index}`} 
                style={styles.imagePreviewContainer}
                accessibilityRole="image"
                accessibilityLabel={`Property photo ${index + 1}${index === 0 ? ", cover image" : ""}`}
              >
                <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                
                {/* Cover Badge */}
                {index === 0 && (
                  <View style={styles.coverBadge}>
                    <Text style={styles.coverBadgeText}>Cover</Text>
                  </View>
                )}
                
                {/* Upload Status Overlay */}
                {image.status === "uploading" && (
                  <View style={styles.uploadOverlay}>
                    <ActivityIndicator color="#fff" />
                  </View>
                )}
                {image.status === "success" && (
                  <View style={[styles.statusBadge, styles.successBadge]}>
                    <Text style={styles.statusText}>✓</Text>
                  </View>
                )}
                {image.status === "error" && (
                  <View style={[styles.statusBadge, styles.errorBadge]}>
                    <Text style={styles.statusText}>!</Text>
                  </View>
                )}
                
                {/* Remove Button */}
                {!isSubmitting && (
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove photo ${index + 1}`}
                  >
                    <Text style={styles.removeImageText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </ScrollView>
          
          {isUploading && (
            <Text style={styles.uploadProgress}>
              Uploading images... ({images.filter(i => i.status === "success").length}/{images.length})
            </Text>
          )}
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorBox} accessibilityRole="alert">
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <TextInput
            label="Property Title *"
            value={formData.title}
            onChangeText={(t) => { setFormData(prev => ({ ...prev, title: t })); setError(null); }}
            mode="outlined"
            placeholder="e.g., Cozy Apartment in Bole"
            style={styles.input}
            maxLength={100}
            disabled={isSubmitting}
            accessibilityLabel="Property title"
          />
          
          <TextInput
            label="Description *"
            value={formData.description}
            onChangeText={(t) => { setFormData(prev => ({ ...prev, description: t })); setError(null); }}
            mode="outlined"
            multiline
            numberOfLines={4}
            placeholder="Describe your property, neighborhood, and what makes it special..."
            style={styles.input}
            maxLength={2000}
            disabled={isSubmitting}
            accessibilityLabel="Property description"
          />

          <Text style={styles.selectLabel}>Property Type *</Text>
          <View style={styles.chipRow} accessibilityRole="radiogroup">
            {PROPERTY_TYPES.map((type) => (
              <Chip
                key={type}
                selected={formData.propertyType === type}
                onPress={() => { setFormData(prev => ({ ...prev, propertyType: type })); setError(null); }}
                style={styles.chip}
                selectedColor="#6366F1"
                disabled={isSubmitting}
                accessibilityRole="radio"
                accessibilityState={{ checked: formData.propertyType === type }}
              >
                {type}
              </Chip>
            ))}
          </View>
        </View>

        {/* Pricing & Capacity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing & Capacity</Text>
          
          <TextInput
            label={`Price per Night (USD) * ($${MIN_PRICE}-$${MAX_PRICE})`}
            value={formData.pricePerNight}
            onChangeText={(t) => { 
              setFormData(prev => ({ ...prev, pricePerNight: t.replace(/[^0-9.]/g, '') })); 
              setError(null); 
            }}
            mode="outlined"
            keyboardType="decimal-pad"
            left={<TextInput.Affix text="$" />}
            style={styles.input}
            disabled={isSubmitting}
            accessibilityLabel="Price per night in US dollars"
          />

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <TextInput
                label="Bedrooms"
                value={formData.bedrooms}
                onChangeText={(t) => setFormData(prev => ({ ...prev, bedrooms: t.replace(/[^0-9]/g, '').slice(0, 2) }))}
                mode="outlined"
                keyboardType="number-pad"
                style={styles.input}
                disabled={isSubmitting}
                accessibilityLabel="Number of bedrooms"
              />
            </View>
            <View style={styles.rowItem}>
              <TextInput
                label="Bathrooms"
                value={formData.bathrooms}
                onChangeText={(t) => setFormData(prev => ({ ...prev, bathrooms: t.replace(/[^0-9]/g, '').slice(0, 2) }))}
                mode="outlined"
                keyboardType="number-pad"
                style={styles.input}
                disabled={isSubmitting}
                accessibilityLabel="Number of bathrooms"
              />
            </View>
            <View style={styles.rowItem}>
              <TextInput
                label="Max Guests"
                value={formData.maxGuests}
                onChangeText={(t) => setFormData(prev => ({ ...prev, maxGuests: t.replace(/[^0-9]/g, '').slice(0, 2) }))}
                mode="outlined"
                keyboardType="number-pad"
                style={styles.input}
                disabled={isSubmitting}
                accessibilityLabel="Maximum number of guests"
              />
            </View>
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          
          <TextInput
            label="Street Address *"
            value={formData.address}
            onChangeText={(t) => { setFormData(prev => ({ ...prev, address: t })); setError(null); }}
            mode="outlined"
            placeholder="123 Main Street, Apt 4B"
            style={styles.input}
            maxLength={200}
            disabled={isSubmitting}
            accessibilityLabel="Street address"
          />
          
          <View style={styles.row}>
            <View style={[styles.rowItem, { flex: 1 }]}>
              <TextInput
                label="City *"
                value={formData.city}
                onChangeText={(t) => { setFormData(prev => ({ ...prev, city: t })); setError(null); }}
                mode="outlined"
                style={styles.input}
                maxLength={100}
                disabled={isSubmitting}
                accessibilityLabel="City"
              />
            </View>
            <View style={[styles.rowItem, { flex: 1 }]}>
              <TextInput
                label="Country *"
                value={formData.country}
                onChangeText={(t) => { setFormData(prev => ({ ...prev, country: t })); setError(null); }}
                mode="outlined"
                style={styles.input}
                maxLength={100}
                disabled={isSubmitting}
                accessibilityLabel="Country"
              />
            </View>
          </View>
        </View>

        {/* Amenities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <Text style={styles.sectionSubtitle}>Select all amenities your property offers</Text>
          
          <View style={styles.amenitiesGrid} accessibilityRole="group" accessibilityLabel="Property amenities">
            {AMENITIES.map((amenity) => {
              const isSelected = selectedAmenities.includes(amenity.id);
              return (
                <TouchableOpacity
                  key={amenity.id}
                  style={[
                    styles.amenityItem,
                    isSelected && styles.amenityItemSelected,
                  ]}
                  onPress={() => toggleAmenity(amenity.id)}
                  disabled={isSubmitting}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={`${amenity.label}${isSelected ? ", selected" : ""}`}
                >
                  <Text style={styles.amenityIcon}>{amenity.icon}</Text>
                  <Text style={[styles.amenityLabel, isSelected && styles.amenityLabelSelected]}>
                    {amenity.label}
                  </Text>
                  {isSelected && <Text style={styles.amenityCheck}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}
            buttonColor="#6366F1"
            accessibilityRole="button"
            accessibilityLabel="Submit property for review"
            accessibilityHint="Uploads images and submits your property listing"
          >
            {isSubmitting ? "Submitting..." : "Submit Property for Review"}
          </Button>
          <Text style={styles.submitNote}>
            Your property will be reviewed within 24-48 hours before going live.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  scrollContent: { paddingBottom: 40 },
  section: { backgroundColor: "#fff", padding: 16, marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  sectionSubtitle: { fontSize: 14, color: "#666", marginBottom: 16 },
  input: { marginBottom: 12, backgroundColor: "#fff" },
  selectLabel: { fontSize: 14, color: "#666", marginBottom: 8 },
  
  // Image styles
  imageScroll: { flexDirection: "row" },
  addImageButton: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#6366F1",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#F5F3FF",
  },
  addImageIcon: { fontSize: 32, marginBottom: 4 },
  addImageText: { fontSize: 14, color: "#6366F1", fontWeight: "600" },
  imageCount: { fontSize: 12, color: "#666", marginTop: 4 },
  imagePreviewContainer: { position: "relative", marginRight: 12 },
  imagePreview: { width: 120, height: 120, borderRadius: 12 },
  coverBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "#6366F1",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coverBadgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#EF4444",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  removeImageText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  uploadOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  successBadge: { backgroundColor: "#22C55E" },
  errorBadge: { backgroundColor: "#EF4444" },
  statusText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  uploadProgress: { marginTop: 8, fontSize: 12, color: "#6366F1", fontWeight: "500" },

  // Error
  errorBox: { backgroundColor: "#FEE2E2", padding: 12, margin: 16, marginTop: 0, borderRadius: 8 },
  errorText: { color: "#DC2626", fontSize: 14 },

  // Chips
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { marginBottom: 4 },

  // Row layout
  row: { flexDirection: "row", gap: 12 },
  rowItem: { flex: 1 },

  // Amenities
  amenitiesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
  },
  amenityItemSelected: {
    borderColor: "#6366F1",
    backgroundColor: "#F5F3FF",
  },
  amenityIcon: { fontSize: 16, marginRight: 6 },
  amenityLabel: { fontSize: 13, color: "#666" },
  amenityLabelSelected: { color: "#6366F1", fontWeight: "500" },
  amenityCheck: { marginLeft: 4, color: "#6366F1", fontWeight: "bold" },

  // Submit
  submitSection: { padding: 16 },
  submitButton: { paddingVertical: 6 },
  submitNote: { textAlign: "center", color: "#666", fontSize: 12, marginTop: 12 },
});
