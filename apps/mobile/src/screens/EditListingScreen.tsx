import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, auth, storage } from "../../lib/firebase";

type RouteParams = {
  EditListing: {
    listingId: string;
  };
};

interface ListingData {
  title: string;
  description: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities: string[];
  country: string;
  city: string;
  address: string;
  airportDistance: string;
  photos: string[];
  pricePerNight: number;
  cleaningFee: number;
  weeklyDiscount: number;
  monthlyDiscount: number;
  currency: "USD" | "ETB";
  isActive: boolean;
  instantBook: boolean;
  houseRules: string;
  checkInTime: string;
  checkOutTime: string;
}

const PROPERTY_TYPES = [
  "Entire home",
  "Private room",
  "Shared room",
  "Apartment",
  "Villa",
  "Condo",
  "Traditional home",
];

const AMENITIES = [
  { id: "wifi", label: "WiFi", icon: "wifi" },
  { id: "kitchen", label: "Kitchen", icon: "restaurant" },
  { id: "parking", label: "Free parking", icon: "car" },
  { id: "ac", label: "Air conditioning", icon: "snow" },
  { id: "heating", label: "Heating", icon: "flame" },
  { id: "washer", label: "Washer", icon: "water" },
  { id: "dryer", label: "Dryer", icon: "sunny" },
  { id: "tv", label: "TV", icon: "tv" },
  { id: "pool", label: "Pool", icon: "water" },
  { id: "gym", label: "Gym", icon: "fitness" },
  { id: "hotTub", label: "Hot tub", icon: "thermometer" },
  { id: "patio", label: "Patio/Balcony", icon: "leaf" },
  { id: "bbq", label: "BBQ grill", icon: "flame" },
  { id: "fireplace", label: "Fireplace", icon: "bonfire" },
  { id: "workspace", label: "Workspace", icon: "desktop" },
  { id: "crib", label: "Crib", icon: "bed" },
  { id: "pets", label: "Pets allowed", icon: "paw" },
  { id: "smoking", label: "Smoking allowed", icon: "cloudy" },
];

export default function EditListingScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, "EditListing">>();
  const { listingId } = route.params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>("basics");

  const [listing, setListing] = useState<ListingData>({
    title: "",
    description: "",
    propertyType: "Entire home",
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    amenities: [],
    country: "",
    city: "",
    address: "",
    airportDistance: "",
    photos: [],
    pricePerNight: 50,
    cleaningFee: 0,
    weeklyDiscount: 0,
    monthlyDiscount: 0,
    currency: "USD",
    isActive: true,
    instantBook: false,
    houseRules: "",
    checkInTime: "3:00 PM",
    checkOutTime: "11:00 AM",
  });

  useEffect(() => {
    fetchListing();
  }, [listingId]);

  const fetchListing = async () => {
    try {
      const docRef = doc(db, "listings", listingId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setListing({
          title: data.title || "",
          description: data.description || "",
          propertyType: data.propertyType || "Entire home",
          bedrooms: data.bedrooms || 1,
          bathrooms: data.bathrooms || 1,
          maxGuests: data.maxGuests || 2,
          amenities: data.amenities || [],
          country: data.country || "",
          city: data.city || "",
          address: data.address || "",
          airportDistance: data.airportDistance || "",
          photos: data.photos || [],
          pricePerNight: data.pricePerNight || 50,
          cleaningFee: data.cleaningFee || 0,
          weeklyDiscount: data.weeklyDiscount || 0,
          monthlyDiscount: data.monthlyDiscount || 0,
          currency: data.currency || "USD",
          isActive: data.isActive !== false,
          instantBook: data.instantBook || false,
          houseRules: data.houseRules || "",
          checkInTime: data.checkInTime || "3:00 PM",
          checkOutTime: data.checkOutTime || "11:00 AM",
        });
      } else {
        Alert.alert("Error", "Listing not found");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error fetching listing:", error);
      Alert.alert("Error", "Failed to load listing");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!listing.title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }
    if (!listing.description.trim() || listing.description.length < 100) {
      Alert.alert("Error", "Description must be at least 100 characters");
      return;
    }
    if (listing.photos.length === 0) {
      Alert.alert("Error", "Please add at least one photo");
      return;
    }
    if (listing.pricePerNight < 1) {
      Alert.alert("Error", "Please enter a valid price");
      return;
    }

    setSaving(true);
    try {
      const docRef = doc(db, "listings", listingId);
      await updateDoc(docRef, {
        ...listing,
        updatedAt: serverTimestamp(),
      });

      Alert.alert("Success", "Listing updated successfully", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Error updating listing:", error);
      Alert.alert("Error", "Failed to update listing");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Listing",
      "Are you sure you want to delete this listing? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              // Delete photos from storage
              for (const photoUrl of listing.photos) {
                try {
                  const photoRef = ref(storage, photoUrl);
                  await deleteObject(photoRef);
                } catch (e) {
                  console.log("Photo already deleted or not found");
                }
              }

              // Delete listing document
              await deleteDoc(doc(db, "listings", listingId));

              Alert.alert("Success", "Listing deleted successfully", [
                {
                  text: "OK",
                  onPress: () => navigation.navigate("ManageListings" as never),
                },
              ]);
            } catch (error) {
              console.error("Error deleting listing:", error);
              Alert.alert("Error", "Failed to delete listing");
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const pickImage = async () => {
    if (listing.photos.length >= 10) {
      Alert.alert("Limit Reached", "Maximum 10 photos allowed");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    const user = auth.currentUser;
    if (!user) return;

    setUploadingImage(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `listings/${listingId}/${Date.now()}.jpg`;
      const storageRef = ref(storage, filename);

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      setListing((prev) => ({
        ...prev,
        photos: [...prev.photos, downloadURL],
      }));
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error", "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = async (index: number) => {
    const photoUrl = listing.photos[index];

    Alert.alert("Remove Photo", "Are you sure you want to remove this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            const photoRef = ref(storage, photoUrl);
            await deleteObject(photoRef);
          } catch (e) {
            console.log("Photo not found in storage");
          }

          setListing((prev) => ({
            ...prev,
            photos: prev.photos.filter((_, i) => i !== index),
          }));
        },
      },
    ]);
  };

  const toggleAmenity = (amenityId: string) => {
    setListing((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter((a) => a !== amenityId)
        : [...prev.amenities, amenityId],
    }));
  };

  const updateCount = (
    field: "bedrooms" | "bathrooms" | "maxGuests",
    increment: number
  ) => {
    setListing((prev) => ({
      ...prev,
      [field]: Math.max(1, prev[field] + increment),
    }));
  };

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const renderSection = (
    id: string,
    title: string,
    icon: string,
    content: React.ReactNode
  ) => (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => toggleSection(id)}
      >
        <View style={styles.sectionTitleRow}>
          <Ionicons name={icon as any} size={22} color="#D4A373" />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Ionicons
          name={activeSection === id ? "chevron-up" : "chevron-down"}
          size={22}
          color="#666"
        />
      </TouchableOpacity>
      {activeSection === id && <View style={styles.sectionContent}>{content}</View>}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4A373" />
          <Text style={styles.loadingText}>Loading listing...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Listing</Text>
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={styles.saveButton}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Active Toggle */}
          <View style={styles.activeToggle}>
            <View>
              <Text style={styles.activeLabel}>Listing Status</Text>
              <Text style={styles.activeStatus}>
                {listing.isActive ? "Active - Visible to guests" : "Paused - Hidden from search"}
              </Text>
            </View>
            <Switch
              value={listing.isActive}
              onValueChange={(value) =>
                setListing((prev) => ({ ...prev, isActive: value }))
              }
              trackColor={{ false: "#E5E7EB", true: "#D4A373" }}
              thumbColor="#FFF"
            />
          </View>

          {/* Basics Section */}
          {renderSection(
            "basics",
            "Basics",
            "home-outline",
            <>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={listing.title}
                onChangeText={(text) =>
                  setListing((prev) => ({ ...prev, title: text }))
                }
                placeholder="Give your place a catchy title"
                maxLength={50}
              />
              <Text style={styles.charCount}>{listing.title.length}/50</Text>

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={listing.description}
                onChangeText={(text) =>
                  setListing((prev) => ({ ...prev, description: text }))
                }
                placeholder="Describe your place (minimum 100 characters)"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              <Text
                style={[
                  styles.charCount,
                  listing.description.length < 100 && styles.charCountError,
                ]}
              >
                {listing.description.length}/100 minimum
              </Text>

              <Text style={styles.label}>Property Type</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.typeScroll}
              >
                {PROPERTY_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeChip,
                      listing.propertyType === type && styles.typeChipActive,
                    ]}
                    onPress={() =>
                      setListing((prev) => ({ ...prev, propertyType: type }))
                    }
                  >
                    <Text
                      style={[
                        styles.typeChipText,
                        listing.propertyType === type && styles.typeChipTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.countersRow}>
                <View style={styles.counterItem}>
                  <Text style={styles.counterLabel}>Bedrooms</Text>
                  <View style={styles.counter}>
                    <TouchableOpacity
                      style={styles.counterBtn}
                      onPress={() => updateCount("bedrooms", -1)}
                    >
                      <Ionicons name="remove" size={20} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{listing.bedrooms}</Text>
                    <TouchableOpacity
                      style={styles.counterBtn}
                      onPress={() => updateCount("bedrooms", 1)}
                    >
                      <Ionicons name="add" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.counterItem}>
                  <Text style={styles.counterLabel}>Bathrooms</Text>
                  <View style={styles.counter}>
                    <TouchableOpacity
                      style={styles.counterBtn}
                      onPress={() => updateCount("bathrooms", -1)}
                    >
                      <Ionicons name="remove" size={20} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{listing.bathrooms}</Text>
                    <TouchableOpacity
                      style={styles.counterBtn}
                      onPress={() => updateCount("bathrooms", 1)}
                    >
                      <Ionicons name="add" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.counterItem}>
                  <Text style={styles.counterLabel}>Guests</Text>
                  <View style={styles.counter}>
                    <TouchableOpacity
                      style={styles.counterBtn}
                      onPress={() => updateCount("maxGuests", -1)}
                    >
                      <Ionicons name="remove" size={20} color="#666" />
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{listing.maxGuests}</Text>
                    <TouchableOpacity
                      style={styles.counterBtn}
                      onPress={() => updateCount("maxGuests", 1)}
                    >
                      <Ionicons name="add" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* Location Section */}
          {renderSection(
            "location",
            "Location",
            "location-outline",
            <>
              <Text style={styles.label}>Country</Text>
              <TextInput
                style={styles.input}
                value={listing.country}
                onChangeText={(text) =>
                  setListing((prev) => ({ ...prev, country: text }))
                }
                placeholder="e.g., Ethiopia, USA, Canada"
              />

              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                value={listing.city}
                onChangeText={(text) =>
                  setListing((prev) => ({ ...prev, city: text }))
                }
                placeholder="e.g., Addis Ababa, Washington DC"
              />

              <Text style={styles.label}>Address</Text>
              <TextInput
                style={styles.input}
                value={listing.address}
                onChangeText={(text) =>
                  setListing((prev) => ({ ...prev, address: text }))
                }
                placeholder="Street address (hidden until booking)"
              />

              <Text style={styles.label}>Distance from Airport</Text>
              <TextInput
                style={styles.input}
                value={listing.airportDistance}
                onChangeText={(text) =>
                  setListing((prev) => ({ ...prev, airportDistance: text }))
                }
                placeholder="e.g., 15 min drive from Bole International"
              />
            </>
          )}

          {/* Photos Section */}
          {renderSection(
            "photos",
            "Photos",
            "images-outline",
            <>
              <View style={styles.photosGrid}>
                {listing.photos.map((photo, index) => (
                  <View key={index} style={styles.photoItem}>
                    <Image source={{ uri: photo }} style={styles.photo} />
                    <TouchableOpacity
                      style={styles.removePhotoBtn}
                      onPress={() => removeImage(index)}
                    >
                      <Ionicons name="close-circle" size={24} color="#EF4444" />
                    </TouchableOpacity>
                    {index === 0 && (
                      <View style={styles.coverBadge}>
                        <Text style={styles.coverBadgeText}>Cover</Text>
                      </View>
                    )}
                  </View>
                ))}

                {listing.photos.length < 10 && (
                  <TouchableOpacity
                    style={styles.addPhotoBtn}
                    onPress={pickImage}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <ActivityIndicator color="#D4A373" />
                    ) : (
                      <>
                        <Ionicons name="add" size={32} color="#D4A373" />
                        <Text style={styles.addPhotoText}>Add Photo</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.photoHint}>
                {listing.photos.length}/10 photos • First photo is the cover
              </Text>
            </>
          )}

          {/* Amenities Section */}
          {renderSection(
            "amenities",
            "Amenities",
            "checkmark-circle-outline",
            <View style={styles.amenitiesGrid}>
              {AMENITIES.map((amenity) => (
                <TouchableOpacity
                  key={amenity.id}
                  style={[
                    styles.amenityItem,
                    listing.amenities.includes(amenity.id) &&
                      styles.amenityItemActive,
                  ]}
                  onPress={() => toggleAmenity(amenity.id)}
                >
                  <Ionicons
                    name={amenity.icon as any}
                    size={22}
                    color={
                      listing.amenities.includes(amenity.id) ? "#D4A373" : "#666"
                    }
                  />
                  <Text
                    style={[
                      styles.amenityLabel,
                      listing.amenities.includes(amenity.id) &&
                        styles.amenityLabelActive,
                    ]}
                  >
                    {amenity.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Pricing Section */}
          {renderSection(
            "pricing",
            "Pricing",
            "pricetag-outline",
            <>
              <View style={styles.currencyToggle}>
                <TouchableOpacity
                  style={[
                    styles.currencyBtn,
                    listing.currency === "USD" && styles.currencyBtnActive,
                  ]}
                  onPress={() =>
                    setListing((prev) => ({ ...prev, currency: "USD" }))
                  }
                >
                  <Text
                    style={[
                      styles.currencyBtnText,
                      listing.currency === "USD" && styles.currencyBtnTextActive,
                    ]}
                  >
                    USD ($)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.currencyBtn,
                    listing.currency === "ETB" && styles.currencyBtnActive,
                  ]}
                  onPress={() =>
                    setListing((prev) => ({ ...prev, currency: "ETB" }))
                  }
                >
                  <Text
                    style={[
                      styles.currencyBtnText,
                      listing.currency === "ETB" && styles.currencyBtnTextActive,
                    ]}
                  >
                    ETB (Birr)
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Price per Night</Text>
              <View style={styles.priceInput}>
                <Text style={styles.currencySymbol}>
                  {listing.currency === "USD" ? "$" : "ETB"}
                </Text>
                <TextInput
                  style={styles.priceTextInput}
                  value={listing.pricePerNight.toString()}
                  onChangeText={(text) =>
                    setListing((prev) => ({
                      ...prev,
                      pricePerNight: parseInt(text) || 0,
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>

              <Text style={styles.label}>Cleaning Fee (optional)</Text>
              <View style={styles.priceInput}>
                <Text style={styles.currencySymbol}>
                  {listing.currency === "USD" ? "$" : "ETB"}
                </Text>
                <TextInput
                  style={styles.priceTextInput}
                  value={listing.cleaningFee.toString()}
                  onChangeText={(text) =>
                    setListing((prev) => ({
                      ...prev,
                      cleaningFee: parseInt(text) || 0,
                    }))
                  }
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>

              <Text style={styles.label}>Weekly Discount (%)</Text>
              <TextInput
                style={styles.input}
                value={listing.weeklyDiscount.toString()}
                onChangeText={(text) =>
                  setListing((prev) => ({
                    ...prev,
                    weeklyDiscount: Math.min(100, parseInt(text) || 0),
                  }))
                }
                keyboardType="numeric"
                placeholder="0"
              />

              <Text style={styles.label}>Monthly Discount (%)</Text>
              <TextInput
                style={styles.input}
                value={listing.monthlyDiscount.toString()}
                onChangeText={(text) =>
                  setListing((prev) => ({
                    ...prev,
                    monthlyDiscount: Math.min(100, parseInt(text) || 0),
                  }))
                }
                keyboardType="numeric"
                placeholder="0"
              />
            </>
          )}

          {/* Rules Section */}
          {renderSection(
            "rules",
            "House Rules",
            "document-text-outline",
            <>
              <View style={styles.toggleRow}>
                <View>
                  <Text style={styles.toggleLabel}>Instant Book</Text>
                  <Text style={styles.toggleHint}>
                    Guests can book without approval
                  </Text>
                </View>
                <Switch
                  value={listing.instantBook}
                  onValueChange={(value) =>
                    setListing((prev) => ({ ...prev, instantBook: value }))
                  }
                  trackColor={{ false: "#E5E7EB", true: "#D4A373" }}
                  thumbColor="#FFF"
                />
              </View>

              <Text style={styles.label}>Check-in Time</Text>
              <TextInput
                style={styles.input}
                value={listing.checkInTime}
                onChangeText={(text) =>
                  setListing((prev) => ({ ...prev, checkInTime: text }))
                }
                placeholder="e.g., 3:00 PM"
              />

              <Text style={styles.label}>Check-out Time</Text>
              <TextInput
                style={styles.input}
                value={listing.checkOutTime}
                onChangeText={(text) =>
                  setListing((prev) => ({ ...prev, checkOutTime: text }))
                }
                placeholder="e.g., 11:00 AM"
              />

              <Text style={styles.label}>House Rules</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={listing.houseRules}
                onChangeText={(text) =>
                  setListing((prev) => ({ ...prev, houseRules: text }))
                }
                placeholder="Any rules guests should know about?"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </>
          )}

          {/* Delete Button */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator color="#EF4444" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                <Text style={styles.deleteButtonText}>Delete Listing</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFF",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  saveButton: {
    backgroundColor: "#D4A373",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
  activeToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  activeLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  activeStatus: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  section: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  sectionContent: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: "#1F2937",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "right",
    marginTop: 4,
  },
  charCountError: {
    color: "#EF4444",
  },
  typeScroll: {
    marginTop: 8,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
  },
  typeChipActive: {
    backgroundColor: "#D4A373",
  },
  typeChipText: {
    fontSize: 14,
    color: "#666",
  },
  typeChipTextActive: {
    color: "#FFF",
    fontWeight: "500",
  },
  countersRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  counterItem: {
    alignItems: "center",
  },
  counterLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  counter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 4,
  },
  counterBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  counterValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    minWidth: 40,
    textAlign: "center",
  },
  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  photoItem: {
    position: "relative",
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  removePhotoBtn: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FFF",
    borderRadius: 12,
  },
  coverBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  coverBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "600",
  },
  addPhotoBtn: {
    width: 100,
    height: 100,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D4A373",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoText: {
    fontSize: 12,
    color: "#D4A373",
    marginTop: 4,
  },
  photoHint: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 12,
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
  },
  amenityItemActive: {
    backgroundColor: "#FDF8F3",
    borderWidth: 1,
    borderColor: "#D4A373",
  },
  amenityLabel: {
    fontSize: 14,
    color: "#666",
  },
  amenityLabelActive: {
    color: "#D4A373",
    fontWeight: "500",
  },
  currencyToggle: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 4,
    marginTop: 12,
  },
  currencyBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  currencyBtnActive: {
    backgroundColor: "#FFF",
  },
  currencyBtnText: {
    fontSize: 14,
    color: "#666",
  },
  currencyBtnTextActive: {
    color: "#1F2937",
    fontWeight: "600",
  },
  priceInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingHorizontal: 14,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginRight: 8,
  },
  priceTextInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "600",
    color: "#1F2937",
    paddingVertical: 14,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1F2937",
  },
  toggleHint: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#EF4444",
  },
});
