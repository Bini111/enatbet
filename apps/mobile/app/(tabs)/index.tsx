import React from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero section */}
      <LinearGradient
        colors={["#ec4899", "#7c3aed"]} // pink-500 → purple-600
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.hero}
      >
        <Text style={styles.heroFlags}>🇪🇹 ENATBET 🇪🇷</Text>

        <Text style={styles.heroTitle}>ENATBET</Text>

        <Text style={styles.heroTagline}>"Book a home, not just a room"</Text>

        <Text style={styles.heroSubtitle}>
          Connecting Ethiopian &amp; Eritrean diaspora communities worldwide
        </Text>

        <TouchableOpacity
          style={styles.heroButton}
          activeOpacity={0.9}
          onPress={() => router.push("/properties")}
        >
          <Text style={styles.heroButtonText}>Start Exploring</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Why Choose Enatbet */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why Choose Enatbet?</Text>

        <View style={styles.card}>
          <Text style={styles.cardEmoji}>🏡</Text>
          <Text style={styles.cardTitle}>Community Homes</Text>
          <Text style={styles.cardText}>
            Stay with Ethiopian &amp; Eritrean families worldwide
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardEmoji}>☕️</Text>
          <Text style={styles.cardTitle}>Cultural Experience</Text>
          <Text style={styles.cardText}>
            Enjoy coffee ceremonies and traditional hospitality
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardEmoji}>🤝</Text>
          <Text style={styles.cardTitle}>Trusted Network</Text>
          <Text style={styles.cardText}>
            Book with confidence within our community
          </Text>
        </View>
      </View>

      {/* Bottom CTA / Auth */}
      <View style={styles.section}>
        <View style={styles.ctaBox}>
          <Text style={styles.ctaTitle}>Ready to get started?</Text>
          <Text style={styles.ctaText}>
            Browse homes, connect with hosts, or list your own place for the
            community.
          </Text>

          <View style={styles.ctaButtonsRow}>
            <TouchableOpacity
              style={[styles.ctaButton, styles.ctaPrimaryButton]}
              activeOpacity={0.9}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.ctaPrimaryText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.ctaButton, styles.ctaSecondaryButton]}
              activeOpacity={0.9}
              onPress={() => router.push("/signup")}
            >
              <Text style={styles.ctaSecondaryText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    paddingBottom: 32,
  },

  // Hero
  hero: {
    paddingHorizontal: 24,
    paddingVertical: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  heroFlags: {
    fontSize: 16,
    color: "#fee2e2",
    marginBottom: 8,
    fontWeight: "600",
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: "800",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  heroTagline: {
    fontSize: 18,
    fontWeight: "600",
    color: "#f9fafb",
    textAlign: "center",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "#e5e7eb",
    textAlign: "center",
    marginBottom: 24,
    maxWidth: 320,
  },
  heroButton: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 999,
  },
  heroButtonText: {
    color: "#ec4899",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },

  // Sections
  section: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 24,
    color: "#111827",
  },

  // Feature cards
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "#ffffff",
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    alignItems: "center",
  },
  cardEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    color: "#111827",
    textAlign: "center",
  },
  cardText: {
    fontSize: 14,
    color: "#4b5563",
    textAlign: "center",
  },

  // CTA / Auth
  ctaBox: {
    borderRadius: 20,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  ctaText: {
    fontSize: 14,
    color: "#4b5563",
    textAlign: "center",
    marginBottom: 20,
  },
  ctaButtonsRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  ctaButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    minWidth: 120,
    alignItems: "center",
    marginHorizontal: 6,
  },
  ctaPrimaryButton: {
    backgroundColor: "#ec4899",
  },
  ctaPrimaryText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  ctaSecondaryButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  ctaSecondaryText: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "600",
  },
});
