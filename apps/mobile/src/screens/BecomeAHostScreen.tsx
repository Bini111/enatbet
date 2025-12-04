import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Text, TextInput, Button, Checkbox, Card } from "react-native-paper";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useAuthStore } from "../store/authStore";

type BecomeAHostScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "BecomeAHost">;
};

export const BecomeAHostScreen: React.FC<BecomeAHostScreenProps> = ({
  navigation,
}) => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    fullName: "",
    email: user?.email || "",
    phone: "",
    propertyCity: "",
    propertyType: "",
    message: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const propertyTypes = [
    "Apartment",
    "House",
    "Condo",
    "Townhouse",
    "Private Room",
    "Other",
  ];

  const [showPropertyTypes, setShowPropertyTypes] = useState(false);

  const validatePhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.length >= 10 && cleaned.length <= 15;
  };

  const handleSubmit = async () => {
    setError(null);

    if (!formData.fullName.trim()) {
      setError("Please enter your full name");
      return;
    }
    if (!formData.email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!validatePhone(formData.phone)) {
      setError("Please enter a valid phone number (10-15 digits)");
      return;
    }
    if (!formData.propertyCity.trim()) {
      setError("Please enter your property location");
      return;
    }
    if (!formData.propertyType) {
      setError("Please select a property type");
      return;
    }
    if (!agreedToTerms) {
      setError("Please agree to the Terms of Service and Host Agreement");
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
        setError("Failed to submit application. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <View style={styles.successContent}>
          <Text style={styles.successIcon}>🎉</Text>
          <Text variant="headlineMedium" style={styles.successTitle}>
            Application Received!
          </Text>
          <Text style={styles.successText}>
            Thank you for your interest in becoming a host. Our team will review
            your application and contact you within 2-3 business days.
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
          <Text variant="titleLarge" style={styles.formTitle}>
            Host Application
          </Text>

          {!user && (
            <View style={styles.authNotice}>
              <Text style={styles.authNoticeText}>
                Already have an account?{" "}
                <Text
                  style={styles.authLink}
                  onPress={() => navigation.navigate("Login")}
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
            onChangeText={(text) =>
              setFormData({ ...formData, fullName: text })
            }
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
            disabled={!!user?.email}
            style={styles.input}
          />

          <TextInput
            label="Phone Number *"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            mode="outlined"
            keyboardType="phone-pad"
            placeholder="+1 (555) 123-4567"
            style={styles.input}
          />

          <TextInput
            label="Property Location (City) *"
            value={formData.propertyCity}
            onChangeText={(text) =>
              setFormData({ ...formData, propertyCity: text })
            }
            mode="outlined"
            placeholder="e.g., Washington DC, Toronto"
            style={styles.input}
          />

          <Text style={styles.selectLabel}>Property Type *</Text>
          <View style={styles.propertyTypeGrid}>
            {propertyTypes.map((type) => (
              <Button
                key={type}
                mode={formData.propertyType === type ? "contained" : "outlined"}
                onPress={() => setFormData({ ...formData, propertyType: type })}
                style={styles.propertyTypeButton}
                buttonColor={
                  formData.propertyType === type ? "#6366F1" : undefined
                }
                textColor={formData.propertyType === type ? "#fff" : "#6366F1"}
                compact
              >
                {type}
              </Button>
            ))}
          </View>

          <TextInput
            label="Tell us about your property"
            value={formData.message}
            onChangeText={(text) => setFormData({ ...formData, message: text })}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={styles.input}
          />

          <View style={styles.checkboxRow}>
            <Checkbox
              status={agreedToTerms ? "checked" : "unchecked"}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              color="#6366F1"
            />
            <Text style={styles.checkboxLabel}>
              I agree to the{" "}
              <Text
                style={styles.link}
                onPress={() => navigation.navigate("TermsOfService")}
              >
                Terms of Service
              </Text>{" "}
              and Host Agreement *
            </Text>
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}
            buttonColor="#6366F1"
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
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
    fontWeight: "bold",
    marginBottom: 16,
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
  selectLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    marginTop: 4,
  },
  propertyTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  propertyTypeButton: {
    marginRight: 4,
    marginBottom: 4,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: "#666",
  },
  link: {
    color: "#6366F1",
  },
  submitButton: {
    paddingVertical: 6,
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

export default BecomeAHostScreen;
