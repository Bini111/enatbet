import React, { useState } from "react";
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Linking } from "react-native";
import { Text, TextInput, Button, Card } from "react-native-paper";
import { router } from "expo-router";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const subjects = [
  { label: "General Inquiry", value: "general" },
  { label: "Booking Help", value: "booking" },
  { label: "Hosting Questions", value: "hosting" },
  { label: "Payment Issues", value: "payment" },
  { label: "Technical Support", value: "technical" },
];

export default function ContactScreen() {
  const auth = getAuth();
  const [formData, setFormData] = useState({ name: auth.currentUser?.displayName || "", email: auth.currentUser?.email || "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return "Please enter your name";
    if (!formData.email.trim()) return "Please enter your email";
    if (!EMAIL_REGEX.test(formData.email.trim().toLowerCase())) return "Please enter a valid email address";
    if (!formData.subject) return "Please select a subject";
    if (!formData.message.trim()) return "Please enter your message";
    if (formData.message.trim().length < 10) return "Message must be at least 10 characters";
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) { setError(validationError); return; }
    setIsSubmitting(true);
    setError(null);
    try {
      const db = getFirestore();
      await addDoc(collection(db, "contactMessages"), {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        subject: formData.subject,
        subjectLabel: subjects.find(s => s.value === formData.subject)?.label || formData.subject,
        message: formData.message.trim(),
        userId: auth.currentUser?.uid || null,
        status: "unread",
        source: "mobile",
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Contact form error:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <View style={styles.successContent}>
          <Text style={styles.successIcon}>📬</Text>
          <Text variant="headlineMedium" style={styles.successTitle}>Message Sent!</Text>
          <Text style={styles.successText}>Our team will respond within 24-48 hours.</Text>
          <Button mode="contained" onPress={() => router.push("/(tabs)")} style={styles.homeButton} buttonColor="#6366F1">Back to Home</Button>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>Contact Us</Text>
          <Text style={styles.subtitle}>Have questions? We are here to help.</Text>
        </View>
        <View style={styles.infoSection}>
          <Card style={styles.infoCard} onPress={() => Linking.openURL("mailto:support@enatbet.com")}>
            <Card.Content style={styles.infoContent}><Text style={styles.infoIcon}>📧</Text><View><Text style={styles.infoTitle}>Email Us</Text><Text style={styles.infoValue}>support@enatbet.com</Text></View></Card.Content>
          </Card>
          <Card style={styles.infoCard}>
            <Card.Content style={styles.infoContent}><Text style={styles.infoIcon}>⏰</Text><View><Text style={styles.infoTitle}>Response Time</Text><Text style={styles.infoValue}>24-48 hours</Text></View></Card.Content>
          </Card>
        </View>
        <View style={styles.formSection}>
          <Text variant="titleLarge" style={styles.formTitle}>Send a Message</Text>
          {error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}
          <TextInput label="Your Name *" value={formData.name} onChangeText={(t) => { setFormData({ ...formData, name: t }); setError(null); }} mode="outlined" style={styles.input} />
          <TextInput label="Email *" value={formData.email} onChangeText={(t) => { setFormData({ ...formData, email: t }); setError(null); }} mode="outlined" keyboardType="email-address" autoCapitalize="none" style={styles.input} />
          <Text style={styles.selectLabel}>Subject *</Text>
          <View style={styles.subjectGrid}>
            {subjects.map((s) => (
              <Button key={s.value} mode={formData.subject === s.value ? "contained" : "outlined"} onPress={() => { setFormData({ ...formData, subject: s.value }); setError(null); }} style={styles.subjectButton} buttonColor={formData.subject === s.value ? "#6366F1" : undefined} textColor={formData.subject === s.value ? "#fff" : "#6366F1"} compact>{s.label}</Button>
            ))}
          </View>
          <TextInput label="Message *" value={formData.message} onChangeText={(t) => { setFormData({ ...formData, message: t }); setError(null); }} mode="outlined" multiline numberOfLines={5} maxLength={1000} placeholder="How can we help you?" style={styles.input} />
          <Button mode="contained" onPress={handleSubmit} loading={isSubmitting} disabled={isSubmitting} style={styles.submitButton} buttonColor="#6366F1">{isSubmitting ? "Sending..." : "Send Message"}</Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  scrollContent: { paddingBottom: 40 },
  header: { padding: 24, alignItems: "center" },
  title: { fontWeight: "bold", marginBottom: 8 },
  subtitle: { color: "#666" },
  infoSection: { paddingHorizontal: 16, marginBottom: 16 },
  infoCard: { marginBottom: 12, backgroundColor: "#fff" },
  infoContent: { flexDirection: "row", alignItems: "center" },
  infoIcon: { fontSize: 32, marginRight: 16 },
  infoTitle: { fontWeight: "bold", fontSize: 16 },
  infoValue: { color: "#6366F1", fontSize: 14 },
  formSection: { padding: 16 },
  formTitle: { fontWeight: "bold", marginBottom: 16 },
  errorBox: { backgroundColor: "#FEE2E2", padding: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { color: "#DC2626", fontSize: 14 },
  input: { marginBottom: 12, backgroundColor: "#fff" },
  selectLabel: { fontSize: 14, color: "#666", marginBottom: 8 },
  subjectGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  subjectButton: { marginRight: 4, marginBottom: 4 },
  submitButton: { paddingVertical: 6, marginTop: 8 },
  successContent: { flex: 1, padding: 24, justifyContent: "center", alignItems: "center" },
  successIcon: { fontSize: 64, marginBottom: 16 },
  successTitle: { fontWeight: "bold", marginBottom: 16 },
  successText: { textAlign: "center", color: "#666", fontSize: 16, marginBottom: 24 },
  homeButton: { paddingVertical: 6, minWidth: 200 },
});
