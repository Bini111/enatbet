import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";

export default function Properties() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => setLoading(false), 1000);
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading properties...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Explore Properties</Text>
        <Text style={styles.subtitle}>Find your home away from home</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardIcon}>🏠</Text>
          <Text style={styles.cardTitle}>Properties Coming Soon!</Text>
          <Text style={styles.cardText}>
            Browse Ethiopian & Eritrean community homes worldwide.
          </Text>
        </View>

        <View style={styles.locationSection}>
          <Text style={styles.sectionTitle}>Featured Locations</Text>

          <View style={styles.locationCard}>
            <Text style={styles.locationFlag}>🇪🇹</Text>
            <View style={styles.locationInfo}>
              <Text style={styles.locationTitle}>Ethiopia</Text>
              <Text style={styles.locationCities}>
                Addis Ababa • Bahir Dar • Hawassa
              </Text>
            </View>
          </View>

          <View style={styles.locationCard}>
            <Text style={styles.locationFlag}>🇪🇷</Text>
            <View style={styles.locationInfo}>
              <Text style={styles.locationTitle}>Eritrea</Text>
              <Text style={styles.locationCities}>
                Asmara • Massawa • Keren
              </Text>
            </View>
          </View>

          <View style={styles.locationCard}>
            <Text style={styles.locationFlag}>🌍</Text>
            <View style={styles.locationInfo}>
              <Text style={styles.locationTitle}>Global Diaspora</Text>
              <Text style={styles.locationCities}>USA • Canada • UK • UAE</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push("/login")}
          accessibilityRole="button"
          accessibilityLabel="Sign in to book properties"
        >
          <Text style={styles.ctaButtonText}>Sign In to Book</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: { marginTop: 16, fontSize: 16, color: "#666" },
  header: { padding: 24, paddingTop: 60, backgroundColor: "#667eea" },
  backButton: { color: "#fff", fontSize: 16, marginBottom: 16 },
  title: { fontSize: 32, fontWeight: "bold", color: "#fff", marginBottom: 8 },
  subtitle: { fontSize: 16, color: "#fff", opacity: 0.9 },
  content: { padding: 24 },
  card: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  cardIcon: { fontSize: 48, marginBottom: 12 },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  cardText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  locationSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  locationFlag: { fontSize: 32, marginRight: 16 },
  locationInfo: { flex: 1 },
  locationTitle: { fontSize: 18, fontWeight: "600", marginBottom: 4 },
  locationCities: { fontSize: 14, color: "#666" },
  ctaButton: {
    backgroundColor: "#667eea",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  ctaButtonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
});
