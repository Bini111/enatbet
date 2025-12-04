import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from "react-native";
import { Text, TextInput, Button, Card } from "react-native-paper";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";

type ContactScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Contact">;
};

const subjects = [
  { label: "General Inquiry", value: "general" },
  { label: "Booking Help", value: "booking" },
  { label: "Hosting Questions", value: "hosting" },
  { label: "Payment Issues", value: "payment" },
  { label: "Technical Support", value: "technical" },
  { label: "Feedback", value: "feedback" },
];

export const ContactScreen: React.FC<ContactScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    if (!formData.name.trim()) {
      setError("Please enter your name");
      return;
    }
    if (!formData.email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!formData.subject) {
      setError("Please select a subject");
      return;
    }
    if (!formData.message.trim()) {
      setError("Please enter your message");
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Send to Firestore when Firebase is connected
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSubmitted(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to send message. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailPress = () => {
    Linking.openURL("mailto:support@enatbet.com");
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <View style={styles.successContent}>
          <Text style={styles.successIcon}>📬</Text>
          <Text variant="headlineMedium" style={styles.successTitle}>
            Message Sent!
          </Text>
          <Text style={styles.successText}>
            Thank you for reaching out. Our team will respond to your message
            within 24-48 hours.
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate("MainTabs")}
            style={styles.homeButton}
            buttonColor="#6366F1"
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
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Contact Us
          </Text>
          <Text style={styles.subtitle}>
            Have questions or need help? We are here for you.
          </Text>
        </View>

        {/* Contact Info Cards */}
        <View style={styles.infoSection}>
          <Card style={styles.infoCard} onPress={handleEmailPress}>
            <Card.Content style={styles.infoContent}>
              <Text style={styles.infoIcon}>📧</Text>
              <View>
                <Text style={styles.infoTitle}>Email Us</Text>
                <Text style={styles.infoValue}>support@enatbet.com</Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.infoCard}>
            <Card.Content style={styles.infoContent}>
              <Text style={styles.infoIcon}>⏰</Text>
              <View>
                <Text style={styles.infoTitle}>Response Time</Text>
                <Text style={styles.infoValue}>24-48 hours</Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={styles.infoCard}>
            <Card.Content style={styles.infoContent}>
              <Text style={styles.infoIcon}>🌍</Text>
              <View>
                <Text style={styles.infoTitle}>Global Community</Text>
                <Text style={styles.infoValue}>Serving diaspora worldwide</Text>
              </View>
            </Card.Content>
          </Card>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          <Text variant="titleLarge" style={styles.formTitle}>
            Send a Message
          </Text>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TextInput
            label="Your Name *"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Email Address *"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <Text style={styles.selectLabel}>Subject *</Text>
          <View style={styles.subjectGrid}>
            {subjects.map((subject) => (
              <Button
                key={subject.value}
                mode={
                  formData.subject === subject.value ? "contained" : "outlined"
                }
                onPress={() =>
                  setFormData({ ...formData, subject: subject.value })
                }
                style={styles.subjectButton}
                buttonColor={
                  formData.subject === subject.value ? "#6366F1" : undefined
                }
                textColor={
                  formData.subject === subject.value ? "#fff" : "#6366F1"
                }
                compact
              >
                {subject.label}
              </Button>
            ))}
          </View>

          <TextInput
            label="Message *"
            value={formData.message}
            onChangeText={(text) => setFormData({ ...formData, message: text })}
            mode="outlined"
            multiline
            numberOfLines={5}
            placeholder="How can we help you?"
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}
            buttonColor="#6366F1"
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "#666",
    textAlign: "center",
  },
  infoSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  infoCard: {
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  infoContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  infoTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  infoValue: {
    color: "#6366F1",
    fontSize: 14,
  },
  formSection: {
    padding: 16,
  },
  formTitle: {
    fontWeight: "bold",
    marginBottom: 16,
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
  selectLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    marginTop: 4,
  },
  subjectGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  subjectButton: {
    marginRight: 4,
    marginBottom: 4,
  },
  submitButton: {
    paddingVertical: 6,
    marginTop: 8,
  },
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
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
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

export default ContactScreen;
