import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Home">;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
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

        <TouchableOpacity 
          style={styles.exploreButton}
          onPress={() => navigation.navigate("Search")}
        >
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
          <TouchableOpacity 
            style={styles.ctaButton}
            onPress={() => navigation.navigate("Search")}
          >
            <Text style={styles.ctaButtonText}>Find a Home</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.ctaButton, styles.ctaButtonSecondary]}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={[styles.ctaButtonText, styles.ctaButtonTextSecondary]}>
              List Your Home
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  hero: {
    backgroundColor: "#E91E8C",
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  flagContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  flag: {
    fontSize: 40,
  },
  logo: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginHorizontal: 16,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 24,
    fontStyle: "italic",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 32,
  },
  exploreButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: "#E91E8C",
    fontSize: 18,
    fontWeight: "600",
  },
  featuresSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 32,
    color: "#1a1a1a",
  },
  featureCard: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  featureIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
    color: "#1a1a1a",
  },
  featureText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  ctaSection: {
    backgroundColor: "#f0f9ff",
    padding: 32,
    alignItems: "center",
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#1a1a1a",
  },
  ctaSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
  },
  ctaButtons: {
    flexDirection: "row",
    gap: 16,
  },
  ctaButton: {
    backgroundColor: "#E91E8C",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  ctaButtonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#1a1a1a",
  },
  ctaButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  ctaButtonTextSecondary: {
    color: "#1a1a1a",
  },
});