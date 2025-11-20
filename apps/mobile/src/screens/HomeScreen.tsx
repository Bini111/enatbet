import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} bounces={false}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <View style={styles.flagContainer}>
          <Text style={styles.flag}>🇪🇹</Text>
          <Text style={styles.logo}>ENATBET</Text>
          <Text style={styles.flag}>🇪🇷</Text>
        </View>

        <Text style={styles.tagline}>"Book a home, not just a room"</Text>
        <Text style={styles.subtitle}>
          Connecting Ethiopian & Eritrean diaspora communities worldwide
        </Text>

        <TouchableOpacity style={styles.exploreButton}>
          <Text style={styles.exploreButtonText}>Start Exploring</Text>
        </TouchableOpacity>
      </View>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Why Choose Enatbet?</Text>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🏡</Text>
          <Text style={styles.featureTitle}>Community Homes</Text>
          <Text style={styles.featureText}>
            Stay with Ethiopian & Eritrean families worldwide
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>☕</Text>
          <Text style={styles.featureTitle}>Cultural Experience</Text>
          <Text style={styles.featureText}>
            Enjoy coffee ceremonies and traditional hospitality
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🤝</Text>
          <Text style={styles.featureTitle}>Trusted Network</Text>
          <Text style={styles.featureText}>
            Book with confidence within our community
          </Text>
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>
          Ready to Find Your Home Away From Home?
        </Text>
        <Text style={styles.ctaSubtitle}>
          Join thousands in our global Ethiopian & Eritrean community
        </Text>

        <View style={styles.ctaButtons}>
          <TouchableOpacity style={styles.findHomeButton}>
            <Text style={styles.findHomeButtonText}>Find a Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.listHomeButton}>
            <Text style={styles.listHomeButtonText}>List Your Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  hero: {
    backgroundColor: "#ec4899",
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  flagContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  flag: {
    fontSize: 50,
    marginHorizontal: 10,
  },
  logo: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 24,
    color: "#fff",
    fontStyle: "italic",
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  exploreButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: "#ec4899",
    fontSize: 18,
    fontWeight: "600",
  },
  featuresSection: {
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#111",
  },
  featureCard: {
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 8,
    padding: 24,
    marginBottom: 16,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  featureIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    color: "#111",
  },
  featureText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  ctaSection: {
    backgroundColor: "#f0fdf4",
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    color: "#111",
  },
  ctaSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  ctaButtons: {
    flexDirection: "row",
  },
  findHomeButton: {
    backgroundColor: "#ec4899",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 8,
    marginRight: 10,
  },
  findHomeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  listHomeButton: {
    backgroundColor: "#1f2937",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 8,
  },
  listHomeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
