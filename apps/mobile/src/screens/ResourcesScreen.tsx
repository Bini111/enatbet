import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useAuthStore } from "../store/authStore";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ResourcesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();

  const handleStartHosting = () => {
    if (!user) {
      Alert.alert(
        "Sign In Required",
        "Please sign in to start hosting.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: () => navigation.navigate("Login") },
        ]
      );
      return;
    }
    // Direct to listing creation - no BecomeAHost gate
    navigation.navigate("CreateListingStep1", {});
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Resources & Help</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Description */}
        <Text style={styles.description}>
          Everything you need to know about using Enatbet
        </Text>

        {/* For Guests Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEmoji}>🧳</Text>
            <Text style={styles.sectionTitle}>For Guests</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>How to Book a Property</Text>
            <View style={styles.stepsList}>
              <StepItem number="1" text="Browse properties in your destination" />
              <StepItem number="2" text="Check availability and reviews" />
              <StepItem number="3" text='Click "Book Now" and select dates' />
              <StepItem number="4" text="Complete payment via Stripe" />
              <StepItem number="5" text="Receive confirmation and host details" />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Booking Tips</Text>
            <View style={styles.tipsList}>
              <TipItem text="Book early for popular dates" />
              <TipItem text="Read property descriptions carefully" />
              <TipItem text="Message hosts before booking" />
              <TipItem text="Review the cancellation policy" />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Payment & Security</Text>
            <View style={styles.tipsList}>
              <TipItem text="All payments via secure Stripe" />
              <TipItem text="Never pay outside the platform" />
              <TipItem text="Funds held until 24h after check-in" />
              <TipItem text="Full refund per cancellation policy" />
            </View>
          </View>
        </View>

        {/* For Hosts Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEmoji}>🏠</Text>
            <Text style={styles.sectionTitle}>For Hosts</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Getting Started as a Host</Text>
            <View style={styles.stepsList}>
              <StepItem number="1" text="Sign in to your Enatbet account" />
              <StepItem number="2" text="Click 'Start Hosting' from your profile" />
              <StepItem number="3" text="Create your property listing" />
              <StepItem number="4" text="Set pricing and availability" />
              <StepItem number="5" text="Submit for review and go live!" />
            </View>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleStartHosting}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>Start Hosting</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Hosting Best Practices</Text>
            <View style={styles.tipsList}>
              <TipItem text="Take high-quality photos" />
              <TipItem text="Write detailed descriptions" />
              <TipItem text="Respond within 24 hours" />
              <TipItem text="Keep your calendar updated" />
              <TipItem text="Provide clean linens and essentials" />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Payments & Payouts</Text>
            <View style={styles.tipsList}>
              <TipItem text="Payouts within 24h of check-in" />
              <TipItem text="Direct deposit to your bank" />
              <TipItem text="Platform fee: 10% of booking" />
              <TipItem text="View earnings in dashboard" />
            </View>
          </View>
        </View>

        {/* FAQs Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEmoji}>❓</Text>
            <Text style={styles.sectionTitle}>FAQs</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>What makes Enatbet different?</Text>
            <Text style={styles.cardText}>
              Enatbet is built specifically for the Ethiopian and Eritrean
              diaspora community, connecting community members worldwide with
              welcoming homes that understand your cultural needs.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Is Enatbet available in my country?</Text>
            <Text style={styles.cardText}>
              We are growing! Currently we have hosts in major cities across
              North America, Europe, and Africa. Check our properties page for
              available listings.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>How do I cancel a booking?</Text>
            <Text style={styles.cardText}>
              You can cancel bookings from your Bookings tab. Refund amounts depend
              on the property's cancellation policy and how far in advance you
              cancel.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>How do I report an issue?</Text>
            <Text style={styles.cardText}>
              Please contact our support team immediately with details about
              your concern. We take all reports seriously.
            </Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("Contact")}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Legal Links */}
        <View style={styles.legalSection}>
          <Text style={styles.legalTitle}>Legal & Policies</Text>
          <View style={styles.legalLinks}>
            <TouchableOpacity
              style={styles.legalLink}
              onPress={() => navigation.navigate("TermsOfService")}
            >
              <Text style={styles.legalLinkText}>Terms of Service</Text>
              <Ionicons name="chevron-forward" size={16} color="#6366F1" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.legalLink}
              onPress={() => navigation.navigate("PrivacyPolicy")}
            >
              <Text style={styles.legalLinkText}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={16} color="#6366F1" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.legalLink}
              onPress={() => navigation.navigate("CancellationPolicy")}
            >
              <Text style={styles.legalLinkText}>Cancellation Policy</Text>
              <Ionicons name="chevron-forward" size={16} color="#6366F1" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.legalLink}
              onPress={() => navigation.navigate("HostAgreement")}
            >
              <Text style={styles.legalLinkText}>Host Agreement</Text>
              <Ionicons name="chevron-forward" size={16} color="#6366F1" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper Components
const StepItem = ({ number, text }: { number: string; text: string }) => (
  <View style={styles.stepItem}>
    <View style={styles.stepNumber}>
      <Text style={styles.stepNumberText}>{number}</Text>
    </View>
    <Text style={styles.stepText}>{text}</Text>
  </View>
);

const TipItem = ({ text }: { text: string }) => (
  <View style={styles.tipItem}>
    <Ionicons name="checkmark-circle" size={18} color="#10B981" />
    <Text style={styles.tipText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  headerSpacer: {
    width: 32,
  },
  description: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  // Sections
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionEmoji: {
    fontSize: 22,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  // Cards
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
  },
  // Steps
  stepsList: {
    gap: 10,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6366F1",
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: "#4B5563",
  },
  // Tips
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#4B5563",
  },
  // Action Button
  actionButton: {
    backgroundColor: "#6366F1",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 16,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Legal Section
  legalSection: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
  },
  legalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  legalLinks: {
    gap: 4,
  },
  legalLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  legalLinkText: {
    fontSize: 15,
    color: "#6366F1",
    fontWeight: "500",
  },
});