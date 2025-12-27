import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Text, TextInput, Button, Searchbar, ProgressBar } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { router } from "expo-router";
import { 
  getFirestore, 
  collection, 
  doc,
  addDoc, 
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";

// ============ CONSTANTS ============
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s\-\+\(\)]{10,20}$/;
const MIN_DESCRIPTION_CHARS = 50;
const MIN_PHOTOS = 5;
const MAX_PHOTOS = 10;
const IMAGE_MAX_WIDTH = 1920;
const IMAGE_COMPRESSION = 0.7;
const TOTAL_STEPS = 7;

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Complete list of countries
const ALL_COUNTRIES: string[] = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon",
  "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador",
  "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
  "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait",
  "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
  "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico",
  "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru",
  "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Saudi Arabia",
  "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa",
  "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan",
  "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela",
  "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const PROPERTY_TYPES = ["Apartment", "House", "Condo", "Townhouse", "Private Room", "Villa", "Studio", "Other"];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

const AMENITIES = [
  { id: "wifi", label: "Wi-Fi", icon: "📶" },
  { id: "kitchen", label: "Kitchen", icon: "🍳" },
  { id: "shower", label: "Shower", icon: "🚿" },
  { id: "bedroom", label: "Bedroom", icon: "🛏️" },
  { id: "livingroom", label: "Living Room", icon: "🛋️" },
  { id: "parking", label: "Parking", icon: "🚗" },
  { id: "ac", label: "Air Conditioning", icon: "❄️" },
  { id: "heating", label: "Heating", icon: "🔥" },
  { id: "washer", label: "Washer", icon: "🧺" },
  { id: "tv", label: "TV", icon: "📺" },
  { id: "workspace", label: "Workspace", icon: "💻" },
  { id: "pool", label: "Pool", icon: "🏊" },
  { id: "coffee", label: "Coffee Ceremony Set", icon: "☕" },
  { id: "injera", label: "Injera Mitad", icon: "🫓" },
];

type PickerType = "country" | "propertyType" | "gender" | null;
type ImageStatus = "pending" | "uploading" | "success" | "error";

interface PropertyImage {
  uri: string;
  status: ImageStatus;
  downloadURL?: string;
}

const STEP_TITLES = [
  "Personal Info",
  "Contact Details", 
  "Date of Birth",
  "Property Location",
  "Property Details",
  "Photos & Amenities",
  "Review & Submit"
];

export default function BecomeAHostScreen() {
  const auth = getAuth();
  const user = auth.currentUser;
  
  // Current wizard step
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form state
  const [formData, setFormData] = useState({ 
    fullName: user?.displayName || "", 
    email: user?.email || "", 
    phone: "", 
    gender: "",
    country: "",
    city: "",
    propertyType: "", 
    description: "",
    address: "",
    pricePerNight: "",
    bedrooms: "1",
    bathrooms: "1",
    maxGuests: "2",
  });
  
  // Date of Birth
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Images
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  // Amenities
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  
  // Terms
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Picker modal state
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerType, setPickerType] = useState<PickerType>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // ============ PROGRESS CALCULATION ============
  const calculateProgress = useCallback((): number => {
    let completed = 0;
    const total = 12;
    
    if (formData.fullName.trim()) completed++;
    if (formData.email.trim() && EMAIL_REGEX.test(formData.email)) completed++;
    if (formData.phone.trim() && PHONE_REGEX.test(formData.phone.replace(/\s/g, ""))) completed++;
    if (formData.gender) completed++;
    if (dateOfBirth) completed++;
    if (formData.country) completed++;
    if (formData.city.trim()) completed++;
    if (formData.propertyType) completed++;
    if (formData.description.trim().length >= MIN_DESCRIPTION_CHARS) completed++;
    if (images.filter(img => img.status === "success" || img.status === "pending").length >= MIN_PHOTOS) completed++;
    if (selectedAmenities.length > 0) completed++;
    if (agreedToTerms) completed++;
    
    return completed / total;
  }, [formData, dateOfBirth, images, selectedAmenities, agreedToTerms]);

  const progress = calculateProgress();
  const progressPercent = Math.round(progress * 100);

  // ============ DATE PICKER - AUTO DISMISS ============
  const onDateChange = (event: any, selectedDate?: Date) => {
    // Always close the picker immediately after selection
    setShowDatePicker(false);
    
    if (event.type === "set" && selectedDate) {
      setDateOfBirth(selectedDate);
      setError(null);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric", 
      year: "numeric"
    });
  };

  const getAge = (birthDate: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // ============ IMAGE HANDLING ============
  const compressImage = async (uri: string): Promise<string> => {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: IMAGE_MAX_WIDTH } }],
        { compress: IMAGE_COMPRESSION, format: ImageManipulator.SaveFormat.JPEG }
      );
      return result.uri;
    } catch {
      return uri;
    }
  };

  const pickImages = async () => {
    const remainingSlots = MAX_PHOTOS - images.length;
    if (remainingSlots <= 0) {
      Alert.alert("Maximum Images", `You can upload up to ${MAX_PHOTOS} images.`);
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Photo library access is needed.");
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const newImages = await Promise.all(
          result.assets.map(async (asset) => {
            const compressedUri = await compressImage(asset.uri);
            return { uri: compressedUri, status: "pending" as ImageStatus };
          })
        );
        setImages(prev => [...prev, ...newImages]);
      }
    } catch (err) {
      console.error("Image picker error:", err);
      setError("Failed to select images.");
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (!user) throw new Error("Not authenticated");
    
    const storage = getStorage();
    const uploadedUrls: string[] = [];
    
    setUploadingImages(true);
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      if (image.status === "success" && image.downloadURL) {
        uploadedUrls.push(image.downloadURL);
        continue;
      }
      
      try {
        setImages(prev => prev.map((img, idx) => 
          idx === i ? { ...img, status: "uploading" } : img
        ));
        
        const response = await fetch(image.uri);
        const blob = await response.blob();
        const filename = `hostApplications/${user.uid}/${Date.now()}_${i}.jpg`;
        const storageRef = ref(storage, filename);
        
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
        
        uploadedUrls.push(downloadURL);
        
        setImages(prev => prev.map((img, idx) => 
          idx === i ? { ...img, status: "success", downloadURL } : img
        ));
      } catch (err) {
        console.error(`Failed to upload image ${i}:`, err);
        setImages(prev => prev.map((img, idx) => 
          idx === i ? { ...img, status: "error" } : img
        ));
      }
    }
    
    setUploadingImages(false);
    return uploadedUrls;
  };

  // ============ PICKER HANDLING ============
  const getPickerData = (): string[] => {
    switch (pickerType) {
      case "country": return ALL_COUNTRIES;
      case "propertyType": return PROPERTY_TYPES;
      case "gender": return GENDERS;
      default: return [];
    }
  };

  const getPickerTitle = (): string => {
    switch (pickerType) {
      case "country": return "Select Country";
      case "propertyType": return "Select Property Type";
      case "gender": return "Select Gender";
      default: return "";
    }
  };

  const handlePickerSelect = (value: string) => {
    switch (pickerType) {
      case "country":
        setFormData(prev => ({ ...prev, country: value, city: "" }));
        break;
      case "propertyType":
        setFormData(prev => ({ ...prev, propertyType: value }));
        break;
      case "gender":
        setFormData(prev => ({ ...prev, gender: value }));
        break;
    }
    setPickerVisible(false);
    setSearchQuery("");
    setError(null);
  };

  const openPicker = (type: PickerType) => {
    setPickerType(type);
    setPickerVisible(true);
    setSearchQuery("");
  };

  const filteredData = getPickerData().filter(item => 
    item.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenityId) 
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  // ============ STEP VALIDATION ============
  const validateStep = (step: number): string | null => {
    switch (step) {
      case 1:
        if (!formData.fullName.trim()) return "Please enter your full name";
        if (!formData.email.trim()) return "Please enter your email";
        if (!EMAIL_REGEX.test(formData.email.trim().toLowerCase())) return "Please enter a valid email";
        return null;
      case 2:
        if (!formData.phone.trim()) return "Please enter your phone number";
        if (!PHONE_REGEX.test(formData.phone.replace(/\s/g, ""))) return "Please enter a valid phone number";
        if (!formData.gender) return "Please select your gender";
        return null;
      case 3:
        if (!dateOfBirth) return "Please select your date of birth";
        if (getAge(dateOfBirth) < 18) return "You must be 18 or older to become a host";
        return null;
      case 4:
        if (!formData.country) return "Please select a country";
        if (!formData.city.trim()) return "Please enter a city";
        return null;
      case 5:
        if (!formData.propertyType) return "Please select a property type";
        if (formData.description.trim().length < MIN_DESCRIPTION_CHARS) {
          return `Description must be at least ${MIN_DESCRIPTION_CHARS} characters`;
        }
        return null;
      case 6:
        if (images.length < MIN_PHOTOS) return `Please upload at least ${MIN_PHOTOS} photos`;
        return null;
      case 7:
        if (!agreedToTerms) return "Please agree to the Terms of Service";
        return null;
      default:
        return null;
    }
  };

  const handleNext = () => {
    const validationError = validateStep(currentStep);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // ============ SUBMISSION ============
  const handleSubmit = async () => {
    if (user && !user.emailVerified) {
      Alert.alert(
        "Email Not Verified",
        "Please verify your email before submitting a host application.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Resend Verification", onPress: () => user.sendEmailVerification() }
        ]
      );
      return;
    }

    const validationError = validateStep(7);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const imageUrls = await uploadImages();
      
      if (imageUrls.length < MIN_PHOTOS) {
        throw new Error(`Failed to upload minimum ${MIN_PHOTOS} photos`);
      }

      const db = getFirestore();
      
      const applicationData = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        gender: formData.gender,
        dateOfBirth: dateOfBirth?.toISOString(),
        propertyLocation: {
          country: formData.country,
          city: formData.city.trim(),
          address: formData.address.trim(),
        },
        propertyType: formData.propertyType,
        description: formData.description.trim(),
        pricePerNight: parseFloat(formData.pricePerNight) || 0,
        bedrooms: parseInt(formData.bedrooms) || 1,
        bathrooms: parseInt(formData.bathrooms) || 1,
        maxGuests: parseInt(formData.maxGuests) || 2,
        amenities: selectedAmenities,
        photos: imageUrls,
        photoCount: imageUrls.length,
        completionPercent: 100,
        status: "approved",
        userId: user?.uid || null,
        userEmailVerified: user?.emailVerified || false,
        source: "mobile",
        agreedToTerms: true,
        agreedToTermsAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        approvedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "hostApplications"), applicationData);

      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          role: "host",
          hostApplicationId: docRef.id,
          becameHostAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      setSubmitted(true);
    } catch (err: any) {
      console.error("Host application error:", err);
      setError(err.message || "Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============ SUCCESS SCREEN ============
  if (submitted) {
    return (
      <View style={styles.container}>
        <View style={styles.successContent}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text style={styles.successTitle}>You're Now a Host!</Text>
          <Text style={styles.successText}>
            Your host application has been automatically approved. You can now start listing your property!
          </Text>
          <Button 
            mode="contained" 
            onPress={() => router.push("/(tabs)")} 
            style={styles.homeButton} 
            buttonColor="#6366F1"
          >
            Go to Dashboard
          </Button>
        </View>
      </View>
    );
  }

  // ============ RENDER STEP CONTENT ============
  const renderStepContent = () => {
    switch (currentStep) {
      // Step 1: Full Name & Email
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>👤 Personal Information</Text>
            <Text style={styles.stepSubtitle}>Let's start with your basic info</Text>
            
            <TextInput 
              label="Full Name *" 
              value={formData.fullName} 
              onChangeText={(t) => { setFormData({ ...formData, fullName: t }); setError(null); }} 
              mode="outlined" 
              style={styles.input}
              autoFocus
            />
            
            <TextInput 
              label="Email *" 
              value={formData.email} 
              onChangeText={(t) => { setFormData({ ...formData, email: t }); setError(null); }} 
              mode="outlined" 
              keyboardType="email-address" 
              autoCapitalize="none" 
              style={styles.input} 
              disabled={!!user?.email}
            />
          </View>
        );

      // Step 2: Phone & Gender
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>📱 Contact Details</Text>
            <Text style={styles.stepSubtitle}>How can guests reach you?</Text>
            
            <TextInput 
              label="Phone Number *" 
              value={formData.phone} 
              onChangeText={(t) => { setFormData({ ...formData, phone: t }); setError(null); }} 
              mode="outlined" 
              keyboardType="phone-pad" 
              placeholder="+1 (555) 123-4567" 
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>Gender *</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={() => openPicker("gender")}>
              <Text style={formData.gender ? styles.pickerButtonTextSelected : styles.pickerButtonText}>
                {formData.gender || "Select Gender"}
              </Text>
              <Text style={styles.pickerArrow}>▼</Text>
            </TouchableOpacity>
          </View>
        );

      // Step 3: Date of Birth
      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>🎂 Date of Birth</Text>
            <Text style={styles.stepSubtitle}>You must be 18+ to become a host</Text>
            
            <TouchableOpacity 
              style={styles.datePickerButton} 
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.datePickerEmoji}>📅</Text>
              <Text style={dateOfBirth ? styles.datePickerTextSelected : styles.datePickerText}>
                {dateOfBirth ? formatDate(dateOfBirth) : "Tap to select your birthday"}
              </Text>
            </TouchableOpacity>
            
            {dateOfBirth && (
              <View style={styles.ageBox}>
                <Text style={styles.ageText}>🎈 You are {getAge(dateOfBirth)} years old</Text>
              </View>
            )}

            {showDatePicker && (
              <DateTimePicker
                value={dateOfBirth || new Date(1990, 0, 1)}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onDateChange}
                maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
                minimumDate={new Date(1920, 0, 1)}
              />
            )}
          </View>
        );

      // Step 4: Property Location
      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>📍 Property Location</Text>
            <Text style={styles.stepSubtitle}>Where is your property located?</Text>
            
            <Text style={styles.fieldLabel}>Country *</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={() => openPicker("country")}>
              <Text style={formData.country ? styles.pickerButtonTextSelected : styles.pickerButtonText}>
                {formData.country || "Select Country"}
              </Text>
              <Text style={styles.pickerArrow}>▼</Text>
            </TouchableOpacity>

            <TextInput 
              label="City *" 
              value={formData.city} 
              onChangeText={(t) => { setFormData({ ...formData, city: t }); setError(null); }} 
              mode="outlined" 
              placeholder="Enter your city"
              style={styles.input}
              disabled={!formData.country}
            />

            <TextInput 
              label="Street Address (Optional)" 
              value={formData.address} 
              onChangeText={(t) => setFormData({ ...formData, address: t })} 
              mode="outlined" 
              placeholder="123 Main Street, Apt 4B"
              style={styles.input}
            />
          </View>
        );

      // Step 5: Property Details
      case 5:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>🏠 Property Details</Text>
            <Text style={styles.stepSubtitle}>Tell us about your property</Text>
            
            <Text style={styles.fieldLabel}>Property Type *</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={() => openPicker("propertyType")}>
              <Text style={formData.propertyType ? styles.pickerButtonTextSelected : styles.pickerButtonText}>
                {formData.propertyType || "Select Property Type"}
              </Text>
              <Text style={styles.pickerArrow}>▼</Text>
            </TouchableOpacity>

            <View style={styles.row}>
              <View style={styles.rowItem}>
                <TextInput 
                  label="Bedrooms" 
                  value={formData.bedrooms} 
                  onChangeText={(t) => setFormData({ ...formData, bedrooms: t.replace(/[^0-9]/g, '').slice(0, 2) })} 
                  mode="outlined" 
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>
              <View style={styles.rowItem}>
                <TextInput 
                  label="Bathrooms" 
                  value={formData.bathrooms} 
                  onChangeText={(t) => setFormData({ ...formData, bathrooms: t.replace(/[^0-9]/g, '').slice(0, 2) })} 
                  mode="outlined" 
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>
            </View>

            <TextInput 
              label="Price Per Night ($)" 
              value={formData.pricePerNight} 
              onChangeText={(t) => setFormData({ ...formData, pricePerNight: t.replace(/[^0-9.]/g, '') })} 
              mode="outlined" 
              keyboardType="decimal-pad"
              placeholder="50"
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>Description * (min {MIN_DESCRIPTION_CHARS} chars)</Text>
            <TextInput 
              value={formData.description} 
              onChangeText={(t) => { setFormData({ ...formData, description: t }); setError(null); }} 
              mode="outlined" 
              multiline 
              numberOfLines={4} 
              placeholder="Describe your property, amenities, nearby attractions..."
              style={[styles.input, styles.descriptionInput]} 
              maxLength={500}
            />
            <Text style={[
              styles.charCount, 
              formData.description.trim().length >= MIN_DESCRIPTION_CHARS ? styles.charCountValid : styles.charCountInvalid
            ]}>
              {formData.description.trim().length} / {MIN_DESCRIPTION_CHARS} characters
            </Text>
          </View>
        );

      // Step 6: Photos & Amenities
      case 6:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>📸 Photos & Amenities</Text>
            <Text style={styles.stepSubtitle}>Upload at least {MIN_PHOTOS} photos</Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              <TouchableOpacity style={styles.addImageButton} onPress={pickImages}>
                <Text style={styles.addImageIcon}>➕</Text>
                <Text style={styles.addImageText}>Add Photos</Text>
                <Text style={styles.imageCount}>{images.length}/{MAX_PHOTOS}</Text>
              </TouchableOpacity>

              {images.map((image, index) => (
                <View key={index} style={styles.imagePreviewContainer}>
                  <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                  {index === 0 && (
                    <View style={styles.coverBadge}>
                      <Text style={styles.coverBadgeText}>COVER</Text>
                    </View>
                  )}
                  {image.status === "uploading" && (
                    <View style={styles.uploadOverlay}>
                      <ActivityIndicator color="#fff" />
                    </View>
                  )}
                  <TouchableOpacity style={styles.removeImageButton} onPress={() => removeImage(index)}>
                    <Text style={styles.removeImageText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            
            {images.length < MIN_PHOTOS && (
              <Text style={styles.photoWarning}>⚠️ {MIN_PHOTOS - images.length} more photo(s) required</Text>
            )}

            <Text style={[styles.fieldLabel, { marginTop: 20 }]}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {AMENITIES.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity.id);
                return (
                  <TouchableOpacity
                    key={amenity.id}
                    style={[styles.amenityItem, isSelected && styles.amenityItemSelected]}
                    onPress={() => toggleAmenity(amenity.id)}
                  >
                    <Text style={styles.amenityIcon}>{amenity.icon}</Text>
                    <Text style={[styles.amenityLabel, isSelected && styles.amenityLabelSelected]}>
                      {amenity.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      // Step 7: Review & Submit
      case 7:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>✅ Review & Submit</Text>
            <Text style={styles.stepSubtitle}>Almost there! Review your application</Text>
            
            <View style={styles.reviewCard}>
              <Text style={styles.reviewLabel}>Name</Text>
              <Text style={styles.reviewValue}>{formData.fullName}</Text>
              
              <Text style={styles.reviewLabel}>Email</Text>
              <Text style={styles.reviewValue}>{formData.email}</Text>
              
              <Text style={styles.reviewLabel}>Phone</Text>
              <Text style={styles.reviewValue}>{formData.phone}</Text>
              
              <Text style={styles.reviewLabel}>Location</Text>
              <Text style={styles.reviewValue}>{formData.city}, {formData.country}</Text>
              
              <Text style={styles.reviewLabel}>Property</Text>
              <Text style={styles.reviewValue}>{formData.propertyType} • {images.length} photos</Text>
            </View>

            <TouchableOpacity 
              style={[styles.checkboxContainer, agreedToTerms && styles.checkboxContainerChecked]} 
              onPress={() => { setAgreedToTerms(!agreedToTerms); setError(null); }}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                {agreedToTerms && <Text style={styles.checkboxTick}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>
                I agree to the <Text style={styles.link}>Terms of Service</Text> and <Text style={styles.link}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      {/* Header with Progress */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Become a Host</Text>
          <Text style={styles.headerProgress}>{progressPercent}%</Text>
        </View>
        
        <ProgressBar 
          progress={progress} 
          color="#fff" 
          style={styles.progressBar}
        />
        
        <Text style={styles.stepIndicator}>
          Step {currentStep} of {TOTAL_STEPS}: {STEP_TITLES[currentStep - 1]}
        </Text>
      </View>

      {/* Error Box */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Step Content */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {renderStepContent()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationButtons}>
        {currentStep > 1 && (
          <Button 
            mode="outlined" 
            onPress={handleBack}
            style={styles.backButton}
            textColor="#6366F1"
          >
            ← Back
          </Button>
        )}
        
        {currentStep < TOTAL_STEPS ? (
          <Button 
            mode="contained" 
            onPress={handleNext}
            style={[styles.nextButton, currentStep === 1 && styles.fullWidthButton]}
            buttonColor="#6366F1"
          >
            Next →
          </Button>
        ) : (
          <Button 
            mode="contained" 
            onPress={handleSubmit}
            loading={isSubmitting || uploadingImages}
            disabled={isSubmitting || uploadingImages || !agreedToTerms}
            style={styles.submitButton}
            buttonColor="#22C55E"
          >
            {uploadingImages ? "Uploading..." : isSubmitting ? "Submitting..." : "Submit Application ✓"}
          </Button>
        )}
      </View>

      {/* Picker Modal */}
      <Modal visible={pickerVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{getPickerTitle()}</Text>
              <TouchableOpacity onPress={() => { setPickerVisible(false); setSearchQuery(""); }}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            {pickerType !== "gender" && (
              <Searchbar
                placeholder="Type to search..."
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchBar}
                autoFocus={true}
              />
            )}
            <FlatList
              data={filteredData}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => handlePickerSelect(item)}>
                  <Text style={styles.modalItemText}>{item}</Text>
                  {((pickerType === "country" && formData.country === item) ||
                    (pickerType === "propertyType" && formData.propertyType === item) ||
                    (pickerType === "gender" && formData.gender === item)) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              style={styles.modalList}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  
  // Header
  header: { 
    backgroundColor: "#6366F1", 
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: { color: "#fff", fontSize: 18 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  headerProgress: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  progressBar: { height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.3)" },
  stepIndicator: { color: "#E0E7FF", fontSize: 13, marginTop: 8, textAlign: "center" },
  
  // Scroll
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  
  // Step Content
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 24, fontWeight: "bold", color: "#111827", marginBottom: 8 },
  stepSubtitle: { fontSize: 15, color: "#6B7280", marginBottom: 24 },
  
  // Error
  errorBox: { backgroundColor: "#FEE2E2", padding: 12, marginHorizontal: 16, marginTop: 8, borderRadius: 8 },
  errorText: { color: "#DC2626", fontSize: 14, textAlign: "center" },
  
  // Inputs
  input: { marginBottom: 16, backgroundColor: "#fff" },
  fieldLabel: { fontSize: 14, color: "#374151", marginBottom: 8, fontWeight: "600" },
  
  // Description
  descriptionInput: { minHeight: 100, textAlignVertical: "top" },
  charCount: { fontSize: 12, textAlign: "right", marginTop: -12, marginBottom: 16 },
  charCountValid: { color: "#059669" },
  charCountInvalid: { color: "#DC2626" },
  
  // Date Picker
  datePickerButton: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  datePickerEmoji: { fontSize: 48, marginBottom: 12 },
  datePickerText: { fontSize: 16, color: "#9CA3AF" },
  datePickerTextSelected: { fontSize: 18, color: "#111827", fontWeight: "600" },
  ageBox: {
    backgroundColor: "#ECFDF5",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  ageText: { fontSize: 16, color: "#059669", fontWeight: "500" },
  
  // Picker Button
  pickerButton: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center",
    backgroundColor: "#fff", 
    borderWidth: 1, 
    borderColor: "#ccc", 
    borderRadius: 4, 
    padding: 16,
    marginBottom: 16,
  },
  pickerButtonText: { color: "#9CA3AF", fontSize: 16 },
  pickerButtonTextSelected: { color: "#111827", fontSize: 16 },
  pickerArrow: { color: "#6B7280", fontSize: 12 },
  
  // Row
  row: { flexDirection: "row", gap: 12 },
  rowItem: { flex: 1 },
  
  // Images
  imageScroll: { flexDirection: "row", marginBottom: 8 },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#6366F1",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#F5F3FF",
  },
  addImageIcon: { fontSize: 24, marginBottom: 4 },
  addImageText: { fontSize: 12, color: "#6366F1", fontWeight: "600" },
  imageCount: { fontSize: 10, color: "#6B7280", marginTop: 2 },
  imagePreviewContainer: { position: "relative", marginRight: 12 },
  imagePreview: { width: 100, height: 100, borderRadius: 12 },
  coverBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: "#6366F1",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coverBadgeText: { color: "#fff", fontSize: 8, fontWeight: "bold" },
  removeImageButton: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#EF4444",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  removeImageText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  uploadOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  photoWarning: { fontSize: 13, color: "#DC2626", marginTop: 8 },
  
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
  amenityIcon: { fontSize: 14, marginRight: 6 },
  amenityLabel: { fontSize: 12, color: "#6B7280" },
  amenityLabelSelected: { color: "#6366F1", fontWeight: "500" },
  
  // Review
  reviewCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  reviewLabel: { fontSize: 12, color: "#6B7280", marginTop: 8 },
  reviewValue: { fontSize: 16, color: "#111827", fontWeight: "500" },
  
  // Checkbox
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
  },
  checkboxContainerChecked: {
    borderColor: "#6366F1",
    backgroundColor: "#F5F3FF",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#9CA3AF",
    borderRadius: 6,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
  },
  checkboxTick: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  checkboxLabel: { flex: 1, fontSize: 14, color: "#374151" },
  link: { color: "#6366F1", fontWeight: "600" },
  
  // Navigation Buttons
  navigationButtons: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 12,
  },
  backButton: { flex: 1, borderColor: "#6366F1" },
  nextButton: { flex: 2 },
  fullWidthButton: { flex: 1 },
  submitButton: { flex: 2 },
  
  // Success
  successContent: { flex: 1, padding: 24, justifyContent: "center", alignItems: "center" },
  successIcon: { fontSize: 64, marginBottom: 16 },
  successTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  successText: { textAlign: "center", color: "#6B7280", fontSize: 16, marginBottom: 24 },
  homeButton: { paddingVertical: 6, minWidth: 200 },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "70%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  modalClose: { fontSize: 20, color: "#6B7280", padding: 4 },
  searchBar: { margin: 12, backgroundColor: "#F3F4F6" },
  modalList: { paddingHorizontal: 8 },
  modalItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  modalItemText: { fontSize: 16 },
  checkmark: { color: "#6366F1", fontSize: 18, fontWeight: "bold" },
});