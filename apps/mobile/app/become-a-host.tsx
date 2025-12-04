import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Text, TextInput, Button, Checkbox, Card } from "react-native-paper";
import { router } from "expo-router";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s\-\+\(\)]{10,20}$/;

export default function BecomeAHostScreen() {
  const auth = getAuth();
  const [formData, setFormData] = useState({ fullName: "", email: auth.currentUser?.email || "", phone: "", propertyCity: "", propertyType: "", message: "" });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const propertyTypes = ["Apartment", "House", "Condo", "Townhouse", "Private Room", "Other"];

  useEffect(() => {
    if (auth.currentUser?.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: auth.currentUser?.email || "" }));
    }
  }, [auth.currentUser]);

  const validateForm = (): string | null => {
    if (!formData.fullName.trim()) return "Please enter your full name";
    if (!formData.email.trim()) return "Please enter your email";
    if (!EMAIL_REGEX.test(formData.email.trim().toLowerCase())) return "Please enter a valid email address";
    if (!formData.phone.trim()) return "Please enter your phone number";
    if (!PHONE_REGEX.test(formData.phone.replace(/\s/g, ""))) return "Please enter a valid phone number";
    if (!formData.propertyCity.trim()) return "Please enter your property location";
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
        propertyCity: formData.propertyCity.trim(),
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
          <TextInput label="Property Location (City) *" value={formData.propertyCity} onChangeText={(t) => { setFormData({ ...formData, propertyCity: t }); setError(null); }} mode="outlined" style={styles.input} />
          <Text style={styles.selectLabel}>Property Type *</Text>
          <View style={styles.typeGrid}>
            {propertyTypes.map((type) => (
              <Button key={type} mode={formData.propertyType === type ? "contained" : "outlined"} onPress={() => { setFormData({ ...formData, propertyType: type }); setError(null); }} style={styles.typeButton} buttonColor={formData.propertyType === type ? "#6366F1" : undefined} textColor={formData.propertyType === type ? "#fff" : "#6366F1"} compact>{type}</Button>
            ))}
          </View>
          <TextInput label="Tell us about your property (optional)" value={formData.message} onChangeText={(t) => setFormData({ ...formData, message: t })} mode="outlined" multiline numberOfLines={3} maxLength={500} style={styles.input} />
          <View style={styles.checkboxRow}>
            <Checkbox status={agreedToTerms ? "checked" : "unchecked"} onPress={() => { setAgreedToTerms(!agreedToTerms); setError(null); }} color="#6366F1" />
            <Text style={styles.checkboxLabel}>I agree to the <Text style={styles.link} onPress={() => router.push("/terms-of-service")}>Terms of Service</Text> *</Text>
          </View>
          <Button mode="contained" onPress={handleSubmit} loading={isSubmitting} disabled={isSubmitting} style={styles.submitButton} buttonColor="#6366F1">{isSubmitting ? "Submitting..." : "Submit Application"}</Button>
        </View>
      </ScrollView>
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
  selectLabel: { fontSize: 14, color: "#666", marginBottom: 8 },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  typeButton: { marginRight: 4, marginBottom: 4 },
  checkboxRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  checkboxLabel: { flex: 1, fontSize: 14, color: "#666" },
  link: { color: "#6366F1" },
  submitButton: { paddingVertical: 6 },
  successContent: { flex: 1, padding: 24, justifyContent: "center", alignItems: "center" },
  successIcon: { fontSize: 64, marginBottom: 16 },
  successTitle: { fontWeight: "bold", marginBottom: 16 },
  successText: { textAlign: "center", color: "#666", fontSize: 16, marginBottom: 24 },
  homeButton: { paddingVertical: 6, minWidth: 200 },
});
