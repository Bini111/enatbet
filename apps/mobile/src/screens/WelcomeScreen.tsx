import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function WelcomeScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section with Gradient */}
        <LinearGradient
          colors={["#E879F9", "#A855F7", "#7C3AED"]}
          style={styles.heroSection}
        >
          <SafeAreaView edges={["top"]}>
            <View style={styles.heroContent}>
              {/* Logo */}
              <View style={styles.logoContainer}>
                <Image
                  source={require("../../assets/icon.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              {/* App Name */}
              <Text style={styles.appName}>ENATBET</Text>

              {/* Tagline */}
              <Text style={styles.tagline}>"Book a home, not just a room!"</Text>

              {/* Subtitle */}
              <Text style={styles.subtitle}>
                Connecting Ethiopian & Eritrean diaspora{"\n"}communities worldwide
              </Text>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Auth Buttons Section */}
        <View style={styles.authSection}>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => navigation.navigate("Login" as never)}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.createAccountButton}
            onPress={() => navigation.navigate("SignUp" as never)}
          >
            <Text style={styles.createAccountButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Get Started Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get Started</Text>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => navigation.navigate("Login" as never)}
          >
            <View style={styles.optionIconContainer}>
              <Text style={styles.optionEmoji}>🔍</Text>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Browse Properties</Text>
              <Text style={styles.optionSubtitle}>Find your perfect stay</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => navigation.navigate("SignUp" as never)}
          >
            <View style={styles.optionIconContainer}>
              <Text style={styles.optionEmoji}>🏠</Text>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Become a Host</Text>
              <Text style={styles.optionSubtitle}>Share your home with the community</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Why Choose Enatbet Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Enatbet?</Text>

          <View style={styles.featureCard}>
            <Text style={styles.featureEmoji}>🏡</Text>
            <Text style={styles.featureTitle}>Community Homes</Text>
            <Text style={styles.featureSubtitle}>
              Stay with Ethiopian & Eritrean families worldwide
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureEmoji}>☕</Text>
            <Text style={styles.featureTitle}>Cultural Experience</Text>
            <Text style={styles.featureSubtitle}>
              Enjoy coffee ceremonies and traditional hospitality
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureEmoji}>🤝</Text>
            <Text style={styles.featureTitle}>Trusted Network</Text>
            <Text style={styles.featureSubtitle}>
              Book with confidence within our community
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Image
            source={require("../../assets/icon.png")}
            style={styles.footerLogo}
            resizeMode="contain"
          />
          <View style={styles.footerTextRow}>
            <Text style={styles.footerFlag}>🇪🇹</Text>
            <Text style={styles.footerAppName}>Enatbet</Text>
            <Text style={styles.footerFlag}>🇪🇷</Text>
          </View>
          <Text style={styles.footerTagline}>Home away from home</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    flexGrow: 1,
  },
  // Hero Section
  heroSection: {
    paddingBottom: 50,
  },
  heroContent: {
    alignItems: "center",
    paddingTop: 40,
  },
  logoContainer: {
    width: 140,
    height: 140,
    backgroundColor: "#FDF6E3",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    width: 120,
    height: 120,
  },
  appName: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFF",
    marginTop: 24,
    letterSpacing: 3,
  },
  tagline: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFF",
    marginTop: 12,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  // Auth Section
  authSection: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    backgroundColor: "#F9FAFB",
    marginTop: -24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  signInButton: {
    backgroundColor: "#6366F1",
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 16,
  },
  signInButtonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "600",
  },
  createAccountButton: {
    backgroundColor: "#FFF",
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#6366F1",
  },
  createAccountButtonText: {
    color: "#6366F1",
    fontSize: 17,
    fontWeight: "600",
  },
  // Sections
  section: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 20,
    textAlign: "center",
  },
  // Option Cards
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  optionEmoji: {
    fontSize: 28,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  optionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  // Feature Cards
  featureCard: {
    backgroundColor: "#FFF",
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
  },
  featureSubtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
  // Footer
  footer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  footerLogo: {
    width: 70,
    height: 70,
    marginBottom: 12,
  },
  footerTextRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerFlag: {
    fontSize: 20,
  },
  footerAppName: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1F2937",
  },
  footerTagline: {
    fontSize: 16,
    color: "#6B7280",
    fontStyle: "italic",
    marginTop: 8,
  },
});
