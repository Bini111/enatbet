import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Modal, TouchableOpacity, FlatList } from "react-native";
import { Text, TextInput, Button, Checkbox, Card, Searchbar } from "react-native-paper";
import { router } from "expo-router";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s\-\+\(\)]{10,20}$/;

// Location data structure
const LOCATIONS: Record<string, Record<string, string[]>> = {
  "Africa": {
    "Ethiopia": ["Addis Ababa", "Dire Dawa", "Bahir Dar", "Gondar", "Hawassa", "Mekelle", "Jimma", "Adama"],
    "Eritrea": ["Asmara", "Keren", "Massawa", "Assab", "Mendefera", "Barentu"],
    "Kenya": ["Nairobi", "Mombasa", "Kisumu"],
    "South Africa": ["Johannesburg", "Cape Town", "Durban", "Pretoria"],
  },
  "North America": {
    "United States": ["New York", "Los Angeles", "Washington DC", "Atlanta", "Dallas", "Houston", "Seattle", "Denver", "Chicago", "Minneapolis", "San Francisco", "San Diego", "Las Vegas", "Phoenix", "Boston"],
    "Canada": ["Toronto", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Montreal"],
  },
  "Europe": {
    "United Kingdom": ["London", "Manchester", "Birmingham", "Bristol", "Leeds"],
    "Germany": ["Berlin", "Frankfurt", "Munich", "Hamburg", "Cologne"],
    "Sweden": ["Stockholm", "Gothenburg", "Malmö"],
    "Norway": ["Oslo", "Bergen"],
    "Netherlands": ["Amsterdam", "Rotterdam", "The Hague"],
    "Italy": ["Rome", "Milan", "Turin"],
    "France": ["Paris", "Lyon", "Marseille"],
  },
  "Middle East": {
    "United Arab Emirates": ["Dubai", "Abu Dhabi", "Sharjah"],
    "Saudi Arabia": ["Riyadh", "Jeddah", "Dammam"],
    "Israel": ["Tel Aviv", "Jerusalem", "Haifa"],
  },
  "Australia & Oceania": {
    "Australia": ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide"],
    "New Zealand": ["Auckland", "Wellington", "Christchurch"],
  },
};

const PROPERTY_TYPES = ["Apartment", "House", "Condo", "Townhouse", "Private Room", "Other"];

type PickerType = "continent" | "country" | "city" | "propertyType" | null;

export default function BecomeAHostScreen() {
  const auth = getAuth();
  const [formData, setFormData] = useState({ 
    fullName: "", 
    email: auth.currentUser?.email || "", 
    phone: "", 
    continent: "",
    country: "",
    city: "",
    propertyType: "", 
    message: "" 
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Picker modal state
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerType, setPickerType] = useState<PickerType>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (auth.currentUser?.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: auth.currentUser?.email || "" }));
    }
  }, [auth.currentUser]);

  const getPickerData = (): string[] => {
    switch (pickerType) {
      case "continent":
        return Object.keys(LOCATIONS);
      case "country":
        return formData.continent ? Object.keys(LOCATIONS[formData.continent] || {}) : [];
      case "city":
        return formData.continent && formData.country 
          ? LOCATIONS[formData.continent]?.[formData.country] || []
          : [];
      case "propertyType":
        return PROPERTY_TYPES;
      default:
        return [];
    }
  };

  const getPickerTitle = (): string => {
    switch (pickerType) {
      case "continent": return "Select Continent";
      case "country": return "Select Country";
      case "city": return "Select City";
      case "propertyType": return "Select Property Type";
      default: return "";
    }
  };

  const handlePickerSelect = (value: string) => {
    switch (pickerType) {
      case "continent":
        setFormData(prev => ({ ...prev, continent: value, country: "", city: "" }));
        break;
      case "country":
        setFormData(prev => ({ ...prev, country: value, city: "" }));
        break;
      case "city":
        setFormData(prev => ({ ...prev, city: value }));
        break;
      case "propertyType":
        setFormData(prev => ({ ...prev, propertyType: value }));
        break;
    }
    setPickerVisible(false);
    setSearchQuery("");
    setError(null);
  };

  const openPicker = (type: PickerType) => {
    if (type === "country" && !formData.continent) {
      setError("Please select a continent first");
      return;
    }
    if (type === "city" && !formData.country) {
      setError("Please select a country first");
      return;
    }
    setPickerType(type);
    setPickerVisible(true);
  };

  const filteredData = getPickerData().filter(item => 
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLocationDisplay = (): string => {
    if (formData.city) return `${formData.city}, ${formData.country}`;
    if (formData.country) return `${formData.country}, ${formData.continent}`;
    if (formData.continent) return formData.continent;
    return "";
  };

  const validateForm = (): string | null => {
    if (!formData.fullName.trim()) return "Please enter your full name";
    if (!formData.email.trim()) return "Please enter your email";
    if (!EMAIL_REGEX.test(formData.email.trim().toLowerCase())) return "Please enter a valid email address";
    if (!formData.phone.trim()) return "Please enter your phone number";
    if (!PHONE_REGEX.test(formData.phone.replace(/\s/g, ""))) return "Please enter a valid phone number";
    if (!formData.continent) return "Please select a continent";
    if (!formData.country) return "Please select a country";
    if (!formData.city) return "Please select a city";
    if (!formData.propertyType) return "Please select a property type";
    if (!agreedToTerms) return "Please agree to the Terms of Service";
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) { setError(validationError); return; }
    setIsSubmitting(true);
    setError(null);
    try {
      const db = getFirestore();
      await addDoc(collection(db, "hostApplications"), {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        propertyLocation: {
          continent: formData.continent,
          country: formData.country,
          city: formData.city,
        },
        propertyCity: formData.city, // Keep for backwards compatibility
        propertyType: formData.propertyType,
        message: formData.message.trim(),
        userId: auth.currentUser?.uid || null,
        status: "pending",
        source: "mobile",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Host application error:", err);
      setError("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <View style={styles.successContent}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text variant="headlineMedium" style={styles.successTitle}>Application Received!</Text>
          <Text style={styles.successText}>Our team will review your application and contact you within 2-3 business days.</Text>
          <Button mode="contained" onPress={() => router.push("/(tabs)")} style={styles.homeButton} buttonColor="#6366F1">Back to Home</Button>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>🇪🇹 Become an Enatbet Host 🇪🇷</Text>
          <Text style={styles.heroSubtitle}>Share your home with the Ethiopian and Eritrean diaspora community.</Text>
        </View>
        <View style={styles.benefitsRow}>
          <Card style={styles.benefitCard}><Card.Content style={styles.benefitContent}><Text style={styles.benefitIcon}>💰</Text><Text style={styles.benefitTitle}>Earn Income</Text></Card.Content></Card>
          <Card style={styles.benefitCard}><Card.Content style={styles.benefitContent}><Text style={styles.benefitIcon}>🤝</Text><Text style={styles.benefitTitle}>Community</Text></Card.Content></Card>
          <Card style={styles.benefitCard}><Card.Content style={styles.benefitContent}><Text style={styles.benefitIcon}>🛡️</Text><Text style={styles.benefitTitle}>Protection</Text></Card.Content></Card>
        </View>
        <View style={styles.formSection}>
          <Text variant="titleLarge" style={styles.formTitle}>Host Application</Text>
          {!auth.currentUser && (
            <View style={styles.authNotice}>
              <Text style={styles.authNoticeText}>Already have an account? <Text style={styles.authLink} onPress={() => router.push("/login")}>Sign in</Text> to auto-fill.</Text>
            </View>
          )}
          {error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}
          
          <TextInput label="Full Name *" value={formData.fullName} onChangeText={(t) => { setFormData({ ...formData, fullName: t }); setError(null); }} mode="outlined" style={styles.input} />
          <TextInput label="Email *" value={formData.email} onChangeText={(t) => { setFormData({ ...formData, email: t }); setError(null); }} mode="outlined" keyboardType="email-address" autoCapitalize="none" style={styles.input} disabled={!!auth.currentUser?.email} />
          <TextInput label="Phone *" value={formData.phone} onChangeText={(t) => { setFormData({ ...formData, phone: t }); setError(null); }} mode="outlined" keyboardType="phone-pad" placeholder="+1 (555) 123-4567" style={styles.input} />
          
          {/* Property Location - Cascading Pickers */}
          <Text style={styles.selectLabel}>Property Location *</Text>
          <View style={styles.locationRow}>
            <TouchableOpacity style={[styles.pickerButton, styles.locationPicker]} onPress={() => openPicker("continent")}>
              <Text style={formData.continent ? styles.pickerButtonTextSelected : styles.pickerButtonText}>
                {formData.continent || "Continent"}
              </Text>
              <Text style={styles.pickerArrow}>▼</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.locationRow}>
            <TouchableOpacity 
              style={[styles.pickerButton, styles.locationPicker, !formData.continent && styles.pickerButtonDisabled]} 
              onPress={() => openPicker("country")}
            >
              <Text style={formData.country ? styles.pickerButtonTextSelected : styles.pickerButtonText}>
                {formData.country || "Country"}
              </Text>
              <Text style={styles.pickerArrow}>▼</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.locationRow}>
            <TouchableOpacity 
              style={[styles.pickerButton, styles.locationPicker, !formData.country && styles.pickerButtonDisabled]} 
              onPress={() => openPicker("city")}
            >
              <Text style={formData.city ? styles.pickerButtonTextSelected : styles.pickerButtonText}>
                {formData.city || "City"}
              </Text>
              <Text style={styles.pickerArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Property Type Picker */}
          <Text style={styles.selectLabel}>Property Type *</Text>
          <TouchableOpacity style={styles.pickerButton} onPress={() => openPicker("propertyType")}>
            <Text style={formData.propertyType ? styles.pickerButtonTextSelected : styles.pickerButtonText}>
              {formData.propertyType || "Select property type"}
            </Text>
            <Text style={styles.pickerArrow}>▼</Text>
          </TouchableOpacity>
          
          <TextInput label="Tell us about your property (optional)" value={formData.message} onChangeText={(t) => setFormData({ ...formData, message: t })} mode="outlined" multiline numberOfLines={3} maxLength={500} style={[styles.input, { marginTop: 16 }]} />
          
          <View style={styles.checkboxRow}>
            <Checkbox status={agreedToTerms ? "checked" : "unchecked"} onPress={() => { setAgreedToTerms(!agreedToTerms); setError(null); }} color="#6366F1" />
            <Text style={styles.checkboxLabel}>I agree to the <Text style={styles.link} onPress={() => router.push("/terms-of-service")}>Terms of Service</Text> *</Text>
          </View>
          <Button mode="contained" onPress={handleSubmit} loading={isSubmitting} disabled={isSubmitting} style={styles.submitButton} buttonColor="#6366F1">{isSubmitting ? "Submitting..." : "Submit Application"}</Button>
        </View>
      </ScrollView>

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
            <Searchbar
              placeholder="Search..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
            />
            <FlatList
              data={filteredData}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => handlePickerSelect(item)}>
                  <Text style={styles.modalItemText}>{item}</Text>
                  {((pickerType === "continent" && formData.continent === item) ||
                    (pickerType === "country" && formData.country === item) ||
                    (pickerType === "city" && formData.city === item) ||
                    (pickerType === "propertyType" && formData.propertyType === item)) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              )}
              style={styles.modalList}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  scrollContent: { paddingBottom: 40 },
  hero: { backgroundColor: "#6366F1", padding: 24, alignItems: "center" },
  heroTitle: { fontSize: 22, fontWeight: "bold", color: "#fff", textAlign: "center", marginBottom: 8 },
  heroSubtitle: { fontSize: 14, color: "#E0E7FF", textAlign: "center" },
  benefitsRow: { flexDirection: "row", justifyContent: "space-around", padding: 16, marginTop: -20 },
  benefitCard: { width: "30%", backgroundColor: "#fff" },
  benefitContent: { alignItems: "center", paddingVertical: 12 },
  benefitIcon: { fontSize: 28, marginBottom: 4 },
  benefitTitle: { fontSize: 12, fontWeight: "600", textAlign: "center" },
  formSection: { padding: 16 },
  formTitle: { fontWeight: "bold", marginBottom: 16 },
  authNotice: { backgroundColor: "#EFF6FF", padding: 12, borderRadius: 8, marginBottom: 16 },
  authNoticeText: { color: "#1E40AF", fontSize: 14 },
  authLink: { color: "#6366F1", fontWeight: "bold" },
  errorBox: { backgroundColor: "#FEE2E2", padding: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { color: "#DC2626", fontSize: 14 },
  input: { marginBottom: 12, backgroundColor: "#fff" },
  selectLabel: { fontSize: 14, color: "#666", marginBottom: 8, marginTop: 4 },
  locationRow: { marginBottom: 8 },
  locationPicker: { flex: 1 },
  pickerButton: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center",
    backgroundColor: "#fff", 
    borderWidth: 1, 
    borderColor: "#ccc", 
    borderRadius: 4, 
    padding: 16,
    marginBottom: 8,
  },
  pickerButtonDisabled: { backgroundColor: "#f5f5f5", borderColor: "#e0e0e0" },
  pickerButtonText: { color: "#999", fontSize: 16 },
  pickerButtonTextSelected: { color: "#333", fontSize: 16 },
  pickerArrow: { color: "#666", fontSize: 12 },
  checkboxRow: { flexDirection: "row", alignItems: "center", marginBottom: 16, marginTop: 8 },
  checkboxLabel: { flex: 1, fontSize: 14, color: "#666" },
  link: { color: "#6366F1" },
  submitButton: { paddingVertical: 6 },
  successContent: { flex: 1, padding: 24, justifyContent: "center", alignItems: "center" },
  successIcon: { fontSize: 64, marginBottom: 16 },
  successTitle: { fontWeight: "bold", marginBottom: 16 },
  successText: { textAlign: "center", color: "#666", fontSize: 16, marginBottom: 24 },
  homeButton: { paddingVertical: 6, minWidth: 200 },
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "70%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee" },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  modalClose: { fontSize: 20, color: "#666", padding: 4 },
  searchBar: { margin: 12, backgroundColor: "#f5f5f5" },
  modalList: { paddingHorizontal: 8 },
  modalItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  modalItemText: { fontSize: 16 },
  checkmark: { color: "#6366F1", fontSize: 18, fontWeight: "bold" },
});
