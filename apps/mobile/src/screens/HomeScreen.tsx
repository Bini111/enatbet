import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { collection, query, where, limit, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuthStore } from "../store/authStore";
import { RootStackParamList } from "../navigation/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH * 0.7;

interface Listing {
  id: string;
  title: string;
  pricePerNight: number;
  currency: string;
  city: string;
  country: string;
  photos: { url: string }[];
  coverPhoto?: string;
  averageRating?: number;
  reviewCount?: number;
  propertyType?: string;
}

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeaturedListings = useCallback(async () => {
    try {
      const q = query(
        collection(db, "listings"),
        where("status", "==", "active"),
        orderBy("createdAt", "desc"),
        limit(8)
      );
      const snapshot = await getDocs(q);
      const listings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Listing[];
      setFeaturedListings(listings);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFeaturedListings();
  }, [fetchFeaturedListings]);

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      if (!loading) {
        fetchFeaturedListings();
      }
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFeaturedListings();
  }, [fetchFeaturedListings]);

  const handleStartHosting = () => {
    if (!user) {
      Alert.alert(
        "Sign In Required",
        "Please sign in to start hosting your property.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Sign In", onPress: () => navigation.navigate("Login") },
        ]
      );
      return;
    }
    // Direct navigation to listing creation - no BecomeAHost gate
    navigation.navigate("CreateListingStep1", {});
  };

  const handleBrowseProperties = () => {
    navigation.navigate("Search", {});
  };

  const getListingImage = (listing: Listing): string => {
    if (listing.coverPhoto) return listing.coverPhoto;
    if (listing.photos && listing.photos.length > 0) return listing.photos[0].url;
    return "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400";
  };

  const formatPrice = (price: number, currency: string): string => {
    if (currency === "ETB") return `ETB ${price.toLocaleString()}`;
    return `$${price.toLocaleString()}`;
  };

  const renderListingCard = ({ item }: { item: Listing }) => (
    <TouchableOpacity
      style={styles.listingCard}
      onPress={() => navigation.navigate("PropertyDetails", { listingId: item.id })}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: getListingImage(item) }}
        style={styles.listingImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.7)"]}
        style={styles.listingGradient}
      />
      <View style={styles.listingContent}>
        <View style={styles.listingHeader}>
          {item.averageRating && (
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#FCD34D" />
              <Text style={styles.ratingText}>{item.averageRating.toFixed(1)}</Text>
            </View>
          )}
        </View>
        <View style={styles.listingInfo}>
          <Text style={styles.listingTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.listingLocation} numberOfLines={1}>
            {item.city}, {item.country}
          </Text>
          <Text style={styles.listingPrice}>
            {formatPrice(item.pricePerNight, item.currency)}
            <Text style={styles.perNight}> / night</Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#6366F1"
          />
        }
      >
        {/* Hero Section */}
        <LinearGradient
          colors={["#7C3AED", "#6366F1", "#4F46E5"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          <SafeAreaView edges={["top"]}>
            <View style={styles.heroContent}>
              <View style={styles.logoContainer}>
                <Image
                  source={require("../../assets/icon.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.appName}>ENATBET</Text>
              <Text style={styles.tagline}>"Book a home, not just a room!"</Text>
              <Text style={styles.subtitle}>
                Connecting Ethiopian & Eritrean diaspora{"\n"}communities worldwide
              </Text>

              {/* Search Bar */}
              <TouchableOpacity
                style={styles.searchBar}
                onPress={handleBrowseProperties}
                activeOpacity={0.9}
              >
                <Ionicons name="search" size={20} color="#6B7280" />
                <Text style={styles.searchPlaceholder}>Where are you going?</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>

        {/* Welcome Message */}
        {user && (
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>
              Welcome back, {user.displayName?.split(" ")[0] || "Guest"}! 👋
            </Text>
          </View>
        )}

        {/* Featured Listings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Homes</Text>
            <TouchableOpacity onPress={handleBrowseProperties}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6366F1" />
            </View>
          ) : featuredListings.length > 0 ? (
            <FlatList
              data={featuredListings}
              renderItem={renderListingCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listingsContainer}
              snapToInterval={CARD_WIDTH + 16}
              decelerationRate="fast"
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🏠</Text>
              <Text style={styles.emptyStateText}>No listings available yet</Text>
              <Text style={styles.emptyStateSubtext}>Be the first to list your property!</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get Started</Text>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleBrowseProperties}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: "#EEF2FF" }]}>
              <Ionicons name="search" size={24} color="#6366F1" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Browse Properties</Text>
              <Text style={styles.actionSubtitle}>Find your perfect stay</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleStartHosting}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: "#FEF3C7" }]}>
              <Ionicons name="home" size={24} color="#D97706" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Start Hosting</Text>
              <Text style={styles.actionSubtitle}>Share your home with the community</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Why Choose Enatbet */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Enatbet?</Text>

          <View style={styles.featuresGrid}>
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

            <View style={styles.featureCard}>
              <Text style={styles.featureEmoji}>💰</Text>
              <Text style={styles.featureTitle}>Fair Pricing</Text>
              <Text style={styles.featureSubtitle}>
                Competitive rates with transparent fees
              </Text>
            </View>
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
          <Text style={styles.footerCopyright}>© 2025 Enatbet. All rights reserved.</Text>
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
  // Hero
  heroSection: {
    paddingBottom: 32,
  },
  heroContent: {
    alignItems: "center",
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: "#FDF6E3",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 12,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 30,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: "#9CA3AF",
    marginLeft: 10,
  },
  // Welcome
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  // Sections
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
  },
  seeAllText: {
    fontSize: 15,
    color: "#6366F1",
    fontWeight: "600",
  },
  // Loading
  loadingContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  // Listings
  listingsContainer: {
    paddingRight: 20,
  },
  listingCard: {
    width: CARD_WIDTH,
    height: 220,
    borderRadius: 16,
    marginRight: 16,
    overflow: "hidden",
    backgroundColor: "#E5E7EB",
  },
  listingImage: {
    width: "100%",
    height: "100%",
  },
  listingGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  listingContent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 14,
    justifyContent: "space-between",
  },
  listingHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  listingInfo: {
    gap: 4,
  },
  listingTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  listingLocation: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  perNight: {
    fontSize: 13,
    fontWeight: "400",
    color: "rgba(255,255,255,0.9)",
  },
  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginHorizontal: 4,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#6B7280",
  },
  // Action Cards
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  actionSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  // Features Grid
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  featureCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
    textAlign: "center",
  },
  featureSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 16,
  },
  // Footer
  footer: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginTop: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  footerLogo: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  footerTextRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerFlag: {
    fontSize: 18,
  },
  footerAppName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  footerTagline: {
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
    marginTop: 4,
  },
  footerCopyright: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 8,
  },
});