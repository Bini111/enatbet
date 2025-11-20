import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const PrivacyPolicyScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title} accessibilityRole="header">
          Privacy Policy
        </Text>
        <Text style={styles.updated}>Last Updated: November 2024</Text>

        <Text style={styles.section} accessibilityRole="header">
          1. Information We Collect
        </Text>
        <Text style={styles.text}>
          We collect information you provide when creating an account, booking
          properties, or communicating with hosts. This includes your name,
          email, phone number, and payment information.
        </Text>

        <Text style={styles.section} accessibilityRole="header">
          2. How We Use Your Information
        </Text>
        <View style={styles.bulletContainer}>
          <Text style={styles.text}>
            • To facilitate bookings between guests and hosts
          </Text>
          <Text style={styles.text}>• To process payments securely</Text>
          <Text style={styles.text}>
            • To send booking confirmations and updates
          </Text>
          <Text style={styles.text}>• To improve our services</Text>
          <Text style={styles.text}>• To comply with legal requirements</Text>
        </View>

        <Text style={styles.section} accessibilityRole="header">
          3. Information Sharing
        </Text>
        <Text style={styles.text}>
          We share your information with hosts only as necessary to complete
          bookings. We never sell your personal information to third parties.
        </Text>

        <Text style={styles.section} accessibilityRole="header">
          4. Data Security
        </Text>
        <Text style={styles.text}>
          We use industry-standard encryption and security measures to protect
          your data. Payment information is processed securely through Stripe.
        </Text>

        <Text style={styles.section} accessibilityRole="header">
          5. Your Rights
        </Text>
        <Text style={styles.text}>
          You have the right to access, correct, or delete your personal
          information. Contact us at privacy@enatbet.app for requests.
        </Text>

        <Text style={styles.section} accessibilityRole="header">
          6. Contact Us
        </Text>
        <Text style={styles.text}>
          For privacy concerns, email us at privacy@enatbet.app
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1a1a1a",
  },
  updated: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
  },
  section: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 8,
    color: "#1a1a1a",
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: "#4a5568",
    marginBottom: 8,
  },
  bulletContainer: {
    marginLeft: 8,
  },
});

export default PrivacyPolicyScreen;
