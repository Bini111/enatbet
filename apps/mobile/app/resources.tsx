import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Card, Button } from "react-native-paper";
import { router } from "expo-router";

export default function ResourcesScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>Resources & Help</Text>
        <Text style={styles.subtitle}>Everything you need to know about using Enatbet</Text>
      </View>

      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>🧳 For Guests</Text>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>How to Book</Text>
            <Text style={styles.listItem}>1. Browse properties in your destination</Text>
            <Text style={styles.listItem}>2. Check availability and reviews</Text>
            <Text style={styles.listItem}>3. Click "Book Now" and select dates</Text>
            <Text style={styles.listItem}>4. Complete payment via Stripe</Text>
            <Text style={styles.listItem}>5. Receive confirmation and host details</Text>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>Payment & Security</Text>
            <Text style={styles.listItem}>All payments processed securely via Stripe</Text>
            <Text style={styles.listItem}>Never pay outside the platform</Text>
            <Text style={styles.listItem}>Funds held until 24 hours after check-in</Text>
            <Text style={styles.listItem}>Full refund per cancellation policy</Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>🏠 For Hosts</Text>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>Getting Started</Text>
            <Text style={styles.listItem}>1. Submit your host application</Text>
            <Text style={styles.listItem}>2. Get verified by our team (2-3 days)</Text>
            <Text style={styles.listItem}>3. Create your property listing</Text>
            <Text style={styles.listItem}>4. Set pricing and availability</Text>
            <Text style={styles.listItem}>5. Start receiving bookings</Text>
            <Button mode="contained" onPress={() => router.push("/become-a-host")} style={styles.cardButton} buttonColor="#6366F1">Apply to Host</Button>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>Payments & Payouts</Text>
            <Text style={styles.listItem}>Payouts within 24 hours of guest check-in</Text>
            <Text style={styles.listItem}>Direct deposit to your bank account</Text>
            <Text style={styles.listItem}>Platform service fee: 10% of booking</Text>
            <Text style={styles.listItem}>View earnings anytime in your dashboard</Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>❓ FAQs</Text>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>What makes Enatbet different?</Text>
            <Text style={styles.cardText}>Enatbet is built specifically for Ethiopian and Eritrean diaspora, connecting community members with welcoming homes that understand your cultural needs.</Text>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.cardTitle}>How do I report an issue?</Text>
            <Text style={styles.cardText}>Contact our support team immediately with details about your concern. We respond within 24-48 hours.</Text>
            <Button mode="contained" onPress={() => router.push("/contact")} style={styles.cardButton} buttonColor="#6366F1">Contact Support</Button>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.legalSection}>
        <Text variant="titleMedium" style={styles.legalTitle}>Legal & Policies</Text>
        <View style={styles.legalLinks}>
          <Button mode="text" onPress={() => router.push("/terms-of-service")} textColor="#6366F1">Terms of Service</Button>
          <Button mode="text" onPress={() => router.push("/privacy-policy")} textColor="#6366F1">Privacy Policy</Button>
        </View>
      </View>
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: { padding: 24, alignItems: "center" },
  title: { fontWeight: "bold", marginBottom: 8 },
  subtitle: { color: "#666", textAlign: "center" },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontWeight: "bold", marginBottom: 12 },
  card: { marginBottom: 12, backgroundColor: "#fff" },
  cardTitle: { fontWeight: "bold", marginBottom: 12 },
  cardText: { color: "#666", lineHeight: 22 },
  listItem: { color: "#666", lineHeight: 24, marginBottom: 4 },
  cardButton: { marginTop: 16 },
  legalSection: { padding: 16, alignItems: "center", backgroundColor: "#fff", marginHorizontal: 16, borderRadius: 12 },
  legalTitle: { fontWeight: "bold", marginBottom: 8 },
  legalLinks: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  bottomPadding: { height: 40 },
});
