import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card, Button } from "react-native-paper";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";

type ResourcesScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Resources">;
};

export const ResourcesScreen: React.FC<ResourcesScreenProps> = ({
  navigation,
}) => {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Resources & Help
        </Text>
        <Text style={styles.subtitle}>
          Everything you need to know about using Enatbet
        </Text>
      </View>

      {/* For Guests */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          🧳 For Guests
        </Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              How to Book a Property
            </Text>
            <View style={styles.listContainer}>
              <Text style={styles.listItem}>1. Browse properties in your destination</Text>
              <Text style={styles.listItem}>2. Check availability and reviews</Text>
              <Text style={styles.listItem}>3. Click "Book Now" and select dates</Text>
              <Text style={styles.listItem}>4. Complete payment via Stripe</Text>
              <Text style={styles.listItem}>5. Receive confirmation and host details</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Booking Tips
            </Text>
            <View style={styles.listContainer}>
              <Text style={styles.listItem}>• Book early for popular dates</Text>
              <Text style={styles.listItem}>• Read property descriptions carefully</Text>
              <Text style={styles.listItem}>• Message hosts before booking</Text>
              <Text style={styles.listItem}>• Review the cancellation policy</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Payment & Security
            </Text>
            <View style={styles.listContainer}>
              <Text style={styles.listItem}>• All payments via secure Stripe</Text>
              <Text style={styles.listItem}>• Never pay outside the platform</Text>
              <Text style={styles.listItem}>• Funds held until 24h after check-in</Text>
              <Text style={styles.listItem}>• Full refund per cancellation policy</Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* For Hosts */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          🏠 For Hosts
        </Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Getting Started as a Host
            </Text>
            <View style={styles.listContainer}>
              <Text style={styles.listItem}>1. Submit your host application</Text>
              <Text style={styles.listItem}>2. Get verified by our team</Text>
              <Text style={styles.listItem}>3. Create your property listing</Text>
              <Text style={styles.listItem}>4. Set pricing and availability</Text>
              <Text style={styles.listItem}>5. Start receiving bookings</Text>
            </View>
            <Button
              mode="contained"
              onPress={() => navigation.navigate("BecomeAHost")}
              style={styles.cardButton}
              buttonColor="#6366F1"
            >
              Apply to Host
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Hosting Best Practices
            </Text>
            <View style={styles.listContainer}>
              <Text style={styles.listItem}>• Take high-quality photos</Text>
              <Text style={styles.listItem}>• Write detailed descriptions</Text>
              <Text style={styles.listItem}>• Respond within 24 hours</Text>
              <Text style={styles.listItem}>• Keep your calendar updated</Text>
              <Text style={styles.listItem}>• Provide clean linens and essentials</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Payments & Payouts
            </Text>
            <View style={styles.listContainer}>
              <Text style={styles.listItem}>• Payouts within 24h of check-in</Text>
              <Text style={styles.listItem}>• Direct deposit to your bank</Text>
              <Text style={styles.listItem}>• Platform fee: 10% of booking</Text>
              <Text style={styles.listItem}>• View earnings in dashboard</Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* FAQs */}
      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          ❓ FAQs
        </Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              What makes Enatbet different?
            </Text>
            <Text style={styles.cardText}>
              Enatbet is built specifically for the Ethiopian and Eritrean
              diaspora community, connecting community members worldwide with
              welcoming homes that understand your cultural needs.
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              Is Enatbet available in my country?
            </Text>
            <Text style={styles.cardText}>
              We are growing! Currently we have hosts in major cities across
              North America, Europe, and Africa. Check our properties page for
              available listings.
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              How do I cancel a booking?
            </Text>
            <Text style={styles.cardText}>
              You can cancel bookings from your dashboard. Refund amounts depend
              on the property cancellation policy and how far in advance you
              cancel.
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>
              How do I report an issue?
            </Text>
            <Text style={styles.cardText}>
              Please contact our support team immediately with details about
              your concern. We take all reports seriously.
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate("Contact")}
              style={styles.cardButton}
              buttonColor="#6366F1"
            >
              Contact Support
            </Button>
          </Card.Content>
        </Card>
      </View>

      {/* Legal Links */}
      <View style={styles.legalSection}>
        <Text variant="titleMedium" style={styles.legalTitle}>
          Legal & Policies
        </Text>
        <View style={styles.legalLinks}>
          <Button
            mode="text"
            onPress={() => navigation.navigate("TermsOfService")}
            textColor="#6366F1"
          >
            Terms of Service
          </Button>
          <Button
            mode="text"
            onPress={() => navigation.navigate("PrivacyPolicy")}
            textColor="#6366F1"
          >
            Privacy Policy
          </Button>
        </View>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
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
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: "bold",
    marginBottom: 12,
  },
  card: {
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  cardTitle: {
    fontWeight: "bold",
    marginBottom: 12,
  },
  cardText: {
    color: "#666",
    lineHeight: 22,
  },
  listContainer: {
    gap: 6,
  },
  listItem: {
    color: "#666",
    lineHeight: 22,
  },
  cardButton: {
    marginTop: 16,
  },
  legalSection: {
    padding: 16,
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 12,
  },
  legalTitle: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  legalLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  bottomPadding: {
    height: 40,
  },
});

export default ResourcesScreen;
