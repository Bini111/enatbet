import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuthStore } from "../store/authStore";
import { RootStackParamList } from "../navigation/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface UserProfile {
  displayName: string;
  email: string;
  photoURL?: string;
  phone?: string;
  dateOfBirth?: string;
  isVerified?: boolean;
  isHost?: boolean;
  isAdmin?: boolean;
  role?: string;
  listingsCount?: number;
  stripeAccountId?: string;
  onboardingCompleted?: boolean;
}

export default function ProfileScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user, signOut, isLoading: authLoading } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Refresh profile when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchProfile();
      } else {
        setLoading(false);
        setProfile(null);
      }
    }, [user])
  );

  const fetchProfile = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfile({
          displayName: data.displayName || user.displayName || "User",
          email: data.email || user.email || "",
          photoURL: data.photoURL || user.photoURL,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth,
          isVerified: data.isVerified || false,
          isHost: data.isHost || data.role === "host" || data.role === "admin",
          isAdmin: data.isAdmin || data.role === "admin",
          role: data.role,
          listingsCount: data.listingsCount || 0,
          stripeAccountId: data.stripeAccountId,
          onboardingCompleted: data.onboardingCompleted,
        });
      } else {
        setProfile({
          displayName: user.displayName || "User",
          email: user.email || "",
          photoURL: user.photoURL || undefined,
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            navigation.reset({
              index: 0,
              routes: [{ name: "MainTabs" }],
            });
          } catch (error) {
            console.error("Sign out error:", error);
            Alert.alert("Error", "Failed to sign out. Please try again.");
          }
        },
      },
    ]);
  };

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

    if (!agreedToTerms && !profile?.isHost) {
      Alert.alert(
        "Terms Required",
        "Please agree to the Terms of Service and Privacy Policy to continue."
      );
      return;
    }

    // Direct to listing creation - no BecomeAHost gate
    navigation.navigate("CreateListingStep1", {});
  };

  const handleSwitchToHosting = () => {
    navigation.navigate("HostTabs");
  };

  const handleSwitchToTraveling = () => {
    navigation.navigate("MainTabs");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const openTerms = () => navigation.navigate("TermsOfService");
  const openPrivacy = () => navigation.navigate("PrivacyPolicy");

  // Loading State
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      </SafeAreaView>
    );
  }

  // =====================================================
  // LOGGED OUT STATE - Apple ID Style
  // =====================================================
  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>
          </View>

          {/* Logo & Branding */}
          <View style={styles.brandingSection}>
            <Image
              source={require("../../assets/icon.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.brandTextRow}>
              <Text style={styles.flag}>🇪🇹</Text>
              <Text style={styles.appName}>Enatbet</Text>
              <Text style={styles.flag}>🇪🇷</Text>
            </View>
            <Text style={styles.tagline}>Home away from home</Text>
          </View>

          {/* Auth Buttons */}
          <View style={styles.authButtonsContainer}>
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => navigation.navigate("Login")}
              activeOpacity={0.8}
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.createAccountButton}
              onPress={() => navigation.navigate("SignUp")}
              activeOpacity={0.8}
            >
              <Text style={styles.createAccountButtonText}>Create Account</Text>
            </TouchableOpacity>

            {/* Terms Checkbox */}
            <TouchableOpacity
              style={styles.termsRow}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                {agreedToTerms && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </View>
              <View style={styles.termsTextContainer}>
                <Text style={styles.termsText}>I agree to the </Text>
                <TouchableOpacity onPress={openTerms}>
                  <Text style={styles.termsLink}>Terms of Service</Text>
                </TouchableOpacity>
                <Text style={styles.termsText}> and </Text>
                <TouchableOpacity onPress={openPrivacy}>
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>

          {/* Card 1: Hosting & Resources */}
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleStartHosting}
              activeOpacity={0.6}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: "#FEF3C7" }]}>
                <Ionicons name="home-outline" size={20} color="#D97706" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Start Hosting</Text>
                <Text style={styles.menuSubtitle}>Share your home and earn</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("Resources")}
              activeOpacity={0.6}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: "#E0E7FF" }]}>
                <Ionicons name="book-outline" size={20} color="#6366F1" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Resources & Help</Text>
                <Text style={styles.menuSubtitle}>Guides, FAQs, and support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          </View>

          {/* Card 2: About */}
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("About")}
              activeOpacity={0.6}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: "#F3F4F6" }]}>
                <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>About Enatbet</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <View style={styles.menuItem}>
              <View style={[styles.menuIconContainer, { backgroundColor: "#F3F4F6" }]}>
                <Ionicons name="phone-portrait-outline" size={20} color="#6B7280" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>App Version</Text>
              </View>
              <Text style={styles.menuValue}>1.0.0</Text>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2025 Enatbet. All rights reserved.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // =====================================================
  // LOGGED IN STATE - Apple ID Style
  // =====================================================
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* Profile Card - Apple ID Style Header */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => navigation.navigate("EditProfile")}
          activeOpacity={0.7}
        >
          {profile?.photoURL ? (
            <Image source={{ uri: profile.photoURL }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileInitials}>
                {getInitials(profile?.displayName || "U")}
              </Text>
            </View>
          )}
          <Text style={styles.profileName}>{profile?.displayName}</Text>
          <Text style={styles.profileEmail}>{profile?.email}</Text>
          {profile?.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#3B82F6" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Card 1: Personal Information */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("EditProfile")}
            activeOpacity={0.6}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: "#DBEAFE" }]}>
              <Ionicons name="person-outline" size={20} color="#3B82F6" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Personal Information</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Settings")}
            activeOpacity={0.6}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: "#F3F4F6" }]}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#6B7280" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Sign-In & Security</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("PaymentMethods")}
            activeOpacity={0.6}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: "#FEE2E2" }]}>
              <Ionicons name="card-outline" size={20} color="#DC2626" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Payment Methods</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* Card 2: Hosting */}
        <View style={styles.card}>
          {profile?.isHost ? (
            <>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleSwitchToHosting}
                activeOpacity={0.6}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: "#FEF3C7" }]}>
                  <Ionicons name="swap-horizontal-outline" size={20} color="#D97706" />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>Switch to Hosting</Text>
                  <Text style={styles.menuSubtitle}>Manage your listings</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate("ManageListings")}
                activeOpacity={0.6}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: "#DCFCE7" }]}>
                  <Ionicons name="home-outline" size={20} color="#16A34A" />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>My Listings</Text>
                  <Text style={styles.menuSubtitle}>
                    {profile.listingsCount || 0} active listing{(profile.listingsCount || 0) !== 1 ? "s" : ""}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => navigation.navigate("Earnings")}
                activeOpacity={0.6}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: "#E0E7FF" }]}>
                  <Ionicons name="wallet-outline" size={20} color="#6366F1" />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>Earnings</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleStartHosting}
                activeOpacity={0.6}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: "#FEF3C7" }]}>
                  <Ionicons name="home-outline" size={20} color="#D97706" />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>Start Hosting</Text>
                  <Text style={styles.menuSubtitle}>Share your home and earn</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </TouchableOpacity>

              {/* Terms checkbox for non-hosts */}
              <View style={styles.menuDivider} />
              <TouchableOpacity
                style={styles.termsMenuItem}
                onPress={() => setAgreedToTerms(!agreedToTerms)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                  {agreedToTerms && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
                <View style={styles.termsTextContainer}>
                  <Text style={styles.termsText}>I agree to the </Text>
                  <TouchableOpacity onPress={openTerms}>
                    <Text style={styles.termsLink}>Terms of Service</Text>
                  </TouchableOpacity>
                  <Text style={styles.termsText}> and </Text>
                  <TouchableOpacity onPress={openPrivacy}>
                    <Text style={styles.termsLink}>Privacy Policy</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Card 3: Notifications & Help */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Notifications")}
            activeOpacity={0.6}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: "#FEE2E2" }]}>
              <Ionicons name="notifications-outline" size={20} color="#DC2626" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Favorites")}
            activeOpacity={0.6}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: "#FCE7F3" }]}>
              <Ionicons name="heart-outline" size={20} color="#DB2777" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Saved Properties</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("Resources")}
            activeOpacity={0.6}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: "#E0E7FF" }]}>
              <Ionicons name="help-circle-outline" size={20} color="#6366F1" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Resources & Help</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        </View>

        {/* Card 4: About */}
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate("About")}
            activeOpacity={0.6}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: "#F3F4F6" }]}>
              <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>About Enatbet</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <View style={styles.menuItem}>
            <View style={[styles.menuIconContainer, { backgroundColor: "#F3F4F6" }]}>
              <Ionicons name="phone-portrait-outline" size={20} color="#6B7280" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>App Version</Text>
            </View>
            <Text style={styles.menuValue}>1.0.0</Text>
          </View>
        </View>

        {/* Admin Access */}
        {profile?.isAdmin && (
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate("AdminDashboard")}
              activeOpacity={0.6}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: "#FEF3C7" }]}>
                <Ionicons name="settings-outline" size={20} color="#D97706" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Admin Dashboard</Text>
                <Text style={styles.menuSubtitle}>Manage platform</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          </View>
        )}

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerBranding}>
            <Text style={styles.flag}>🇪🇹</Text>
            <Text style={styles.footerAppName}>Enatbet</Text>
            <Text style={styles.flag}>🇪🇷</Text>
          </View>
          <Text style={styles.footerText}>© 2025 Enatbet. All rights reserved.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  // Header
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F2F2F7",
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "700",
    color: "#000000",
  },
  // Branding Section (Logged Out)
  brandingSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  brandTextRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  flag: {
    fontSize: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  tagline: {
    fontSize: 15,
    color: "#6B7280",
    fontStyle: "italic",
    marginTop: 4,
  },
  // Auth Buttons
  authButtonsContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  signInButton: {
    backgroundColor: "#6366F1",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
  createAccountButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#6366F1",
    marginBottom: 16,
  },
  createAccountButtonText: {
    color: "#6366F1",
    fontSize: 17,
    fontWeight: "600",
  },
  // Terms Checkbox
  termsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
  },
  termsMenuItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#6366F1",
    marginRight: 12,
    marginTop: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
  },
  termsTextContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  termsText: {
    fontSize: 14,
    color: "#6B7280",
  },
  termsLink: {
    fontSize: 14,
    color: "#6366F1",
    fontWeight: "500",
  },
  // Profile Card (Logged In)
  profileCard: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  profileInitials: {
    fontSize: 28,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 15,
    color: "#6B7280",
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    fontSize: 13,
    color: "#3B82F6",
    fontWeight: "500",
  },
  // Cards
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    color: "#000000",
  },
  menuSubtitle: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 2,
  },
  menuValue: {
    fontSize: 16,
    color: "#8E8E93",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#E5E5EA",
    marginLeft: 62,
  },
  // Sign Out
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  signOutText: {
    fontSize: 17,
    fontWeight: "500",
    color: "#DC2626",
  },
  // Footer
  footer: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 16,
  },
  footerBranding: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  footerAppName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  footerText: {
    fontSize: 13,
    color: "#8E8E93",
  },
});