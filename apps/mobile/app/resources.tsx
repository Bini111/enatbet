import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { Text, Card, TextInput, Button, Divider } from "react-native-paper";
import { router } from "expo-router";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const FAQ_DATA = [
  {
    question: "How do I become a host?",
    answer: "Go to Profile > Become a Host. Complete all required fields, upload at least 5 photos, and submit. Your application will be auto-approved once all requirements are met.",
  },
  {
    question: "Is there a fee to use Enatbet?",
    answer: "In Ethiopia, Enatbet is completely free! In Africa, there's a flat $10/night platform fee. Globally, we charge 15% (similar to other platforms).",
  },
  {
    question: "How do I verify my email?",
    answer: "After signing up, check your inbox for a verification email. Click the link to verify. You must verify your email before becoming a host.",
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept major credit/debit cards through Stripe. Payments are secure and protected.",
  },
  {
    question: "How do I contact a host?",
    answer: "Once you find a property, use the 'Contact Host' button to send a message. You'll need to be signed in.",
  },
  {
    question: "What if I need to cancel?",
    answer: "Cancellation policies vary by property. Check the listing details for the specific cancellation policy before booking.",
  },
];

export default function ResourcesScreen() {
  const auth = getAuth();
  const user = auth.currentUser;
  
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = async () => {
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const db = getFirestore();
      await addDoc(collection(db, "contactMessages"), {
        ...contactForm,
        userId: user?.uid || null,
        status: "new",
        source: "mobile",
        createdAt: serverTimestamp(),
      });
      
      Alert.alert("Message Sent", "Thank you! We'll get back to you within 24-48 hours.");
      setShowContactForm(false);
      setContactForm({ ...contactForm, subject: "", message: "" });
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>📚</Text>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <Text style={styles.headerSubtitle}>Guides, FAQs, and contact us</Text>
      </View>

      {/* Quick Links */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Links</Text>
        
        <View style={styles.quickLinksRow}>
          <TouchableOpacity 
            style={styles.quickLink}
            onPress={() => router.push("/become-a-host")}
          >
            <Text style={styles.quickLinkEmoji}>🏠</Text>
            <Text style={styles.quickLinkText}>Host Guide</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickLink}
            onPress={() => router.push("/(tabs)/properties")}
          >
            <Text style={styles.quickLinkEmoji}>🔍</Text>
            <Text style={styles.quickLinkText}>Book a Stay</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickLink}
            onPress={() => Linking.openURL("https://enatbet.app")}
          >
            <Text style={styles.quickLinkEmoji}>🌐</Text>
            <Text style={styles.quickLinkText}>Website</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* FAQ Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        
        {FAQ_DATA.map((faq, index) => (
          <TouchableOpacity
            key={index}
            style={styles.faqItem}
            onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
            activeOpacity={0.7}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Text style={styles.faqArrow}>
                {expandedFaq === index ? "▲" : "▼"}
              </Text>
            </View>
            {expandedFaq === index && (
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <Divider style={styles.divider} />

      {/* Contact Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        
        {!showContactForm ? (
          <View>
            <Card style={styles.contactCard}>
              <Card.Content>
                <Text style={styles.contactInfo}>
                  📧 support@enatbet.app
                </Text>
                <Text style={styles.contactInfo}>
                  📍 Toronto, Canada
                </Text>
                <Text style={styles.contactNote}>
                  We typically respond within 24-48 hours
                </Text>
              </Card.Content>
            </Card>
            
            <Button
              mode="contained"
              onPress={() => setShowContactForm(true)}
              style={styles.contactButton}
              buttonColor="#6366F1"
            >
              Send Us a Message
            </Button>
          </View>
        ) : (
          <View style={styles.contactForm}>
            <TextInput
              label="Your Name *"
              value={contactForm.name}
              onChangeText={(t) => setContactForm({ ...contactForm, name: t })}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Your Email *"
              value={contactForm.email}
              onChangeText={(t) => setContactForm({ ...contactForm, email: t })}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            <TextInput
              label="Subject"
              value={contactForm.subject}
              onChangeText={(t) => setContactForm({ ...contactForm, subject: t })}
              mode="outlined"
              style={styles.input}
            />
            <TextInput
              label="Message *"
              value={contactForm.message}
              onChangeText={(t) => setContactForm({ ...contactForm, message: t })}
              mode="outlined"
              multiline
              numberOfLines={4}
              style={[styles.input, styles.messageInput]}
            />
            
            <View style={styles.formButtons}>
              <Button
                mode="outlined"
                onPress={() => setShowContactForm(false)}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleContactSubmit}
                loading={isSubmitting}
                disabled={isSubmitting}
                style={styles.sendButton}
                buttonColor="#6366F1"
              >
                Send Message
              </Button>
            </View>
          </View>
        )}
      </View>

      {/* Legal Links */}
      <View style={styles.legalSection}>
        <TouchableOpacity onPress={() => router.push("/terms-of-service")}>
          <Text style={styles.legalLink}>Terms of Service</Text>
        </TouchableOpacity>
        <Text style={styles.legalDivider}>•</Text>
        <TouchableOpacity onPress={() => router.push("/privacy-policy")}>
          <Text style={styles.legalLink}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>🇪🇹 Enatbet 🇪🇷</Text>
        <Text style={styles.footerVersion}>v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: "#6366F1",
    padding: 24,
    alignItems: "center",
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#E0E7FF",
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  quickLinksRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  quickLink: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    width: "30%",
  },
  quickLinkEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  quickLinkText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  faqItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },
  faqArrow: {
    fontSize: 12,
    color: "#6B7280",
  },
  faqAnswer: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 12,
    lineHeight: 20,
  },
  divider: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  contactCard: {
    marginBottom: 16,
  },
  contactInfo: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
  },
  contactNote: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
    marginTop: 8,
  },
  contactButton: {
    borderRadius: 25,
  },
  contactForm: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  input: {
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  messageInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  formButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
  },
  sendButton: {
    flex: 1,
  },
  legalSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  legalLink: {
    color: "#6366F1",
    fontSize: 14,
  },
  legalDivider: {
    color: "#9CA3AF",
    marginHorizontal: 12,
  },
  footer: {
    alignItems: "center",
    padding: 16,
  },
  footerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
  },
  footerVersion: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
});