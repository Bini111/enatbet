import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const TermsOfServiceScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title} accessibilityRole="header">
          Terms of Service
        </Text>
        <Text style={styles.updated}>Last Updated: November 2024</Text>

        <Text style={styles.section} accessibilityRole="header">
          1. Acceptance of Terms
        </Text>
        <Text style={styles.text}>
          By using Enatbet, you agree to these Terms of Service. If you do not
          agree, please do not use our services.
        </Text>

        <Text style={styles.section} accessibilityRole="header">
          2. User Accounts
        </Text>
        <Text style={styles.text}>
          You must be 18+ to create an account. You are responsible for
          maintaining account security and all activities under your account.
        </Text>

        <Text style={styles.section} accessibilityRole="header">
          3. Bookings and Payments
        </Text>
        <View style={styles.bulletContainer}>
          <Text style={styles.text}>
            • All bookings are subject to host approval
          </Text>
          <Text style={styles.text}>
            • Payments are processed securely through Stripe
          </Text>
          <Text style={styles.text}>
            • Cancellation policies vary by listing
          </Text>
          <Text style={styles.text}>• Platform fee: 10% on all bookings</Text>
        </View>

        <Text style={styles.section} accessibilityRole="header">
          4. Host Responsibilities
        </Text>
        <Text style={styles.text}>
          Hosts must accurately describe their properties, maintain cleanliness,
          and honor confirmed bookings. False listings will result in account
          termination.
        </Text>

        <Text style={styles.section} accessibilityRole="header">
          5. Guest Responsibilities
        </Text>
        <Text style={styles.text}>
          Guests must respect property rules, treat homes with care, and
          communicate respectfully with hosts.
        </Text>

        <Text style={styles.section} accessibilityRole="header">
          6. Prohibited Activities
        </Text>
        <View style={styles.bulletContainer}>
          <Text style={styles.text}>• Fraudulent listings or bookings</Text>
          <Text style={styles.text}>• Harassment or discrimination</Text>
          <Text style={styles.text}>• Violating local laws</Text>
          <Text style={styles.text}>• Unauthorized commercial use</Text>
        </View>

        <Text style={styles.section} accessibilityRole="header">
          7. Limitation of Liability
        </Text>
        <Text style={styles.text}>
          Enatbet is a platform connecting guests and hosts. We are not
          responsible for the condition of properties or conduct of users.
        </Text>

        <Text style={styles.section} accessibilityRole="header">
          8. Contact
        </Text>
        <Text style={styles.text}>Questions? Email legal@enatbet.app</Text>
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

export default TermsOfServiceScreen;
