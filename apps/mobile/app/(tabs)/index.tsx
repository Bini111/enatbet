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
        colors={["#ec4899", "#7c3aed"]}
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

      {/* Auth Buttons - Always visible */}
      <View style={styles.authSection}>
        <TouchableOpacity
          style={styles.signInButton}
          activeOpacity={0.8}
          onPress={() => router.push("/login")}
        >
          <Text style={styles.signInButtonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.createAccountButton}
          activeOpacity={0.8}
          onPress={() => router.push("/signup")}
        >
          <Text style={styles.createAccountButtonText}>Create Account</Text>
        </TouchableOpacity>
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
    paddingBottom: 40,
  },
  hero: {
    paddingHorizontal: 24,
    paddingVertical: 60,
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
  section: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 24,
    color: "#111827",
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "#ffffff",
    marginBottom: 16,
    alignItems: "center",
  },
  cardEmoji: {
    fontSize: 36,
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
    lineHeight: 20,
  },
  authSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  signInButton: {
    backgroundColor: "#667eea",
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 12,
  },
  signInButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  createAccountButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#667eea",
    paddingVertical: 16,
    borderRadius: 25,
  },
  createAccountButtonText: {
    color: "#667eea",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
