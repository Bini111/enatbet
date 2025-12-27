import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { Text, Avatar, Divider, Switch } from "react-native-paper";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";

interface SettingsItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
  badge?: string;
  badgeColor?: string;
}

const SettingsItem = ({
  icon,
  title,
  subtitle,
  onPress,
  rightElement,
  showChevron = true,
  badge,
  badgeColor = "#667eea",
}: SettingsItemProps) => (
  <TouchableOpacity
    style={styles.settingsItem}
    onPress={onPress}
    disabled={!onPress}
  >
    <View style={styles.settingsItemLeft}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={22} color="#667eea" />
      </View>
      <View style={styles.settingsItemText}>
        <Text style={styles.settingsItemTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingsItemSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    <View style={styles.settingsItemRight}>
      {badge && (
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      {rightElement}
      {showChevron && onPress && (
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      )}
    </View>
  </TouchableOpacity>
);

export default function SettingsScreen() {
  const { user, userData } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          setIsSigningOut(true);
          try {
            await signOut(auth);
            router.replace("/login");
          } catch (error) {
            Alert.alert("Error", "Failed to sign out");
          } finally {
            setIsSigningOut(false);
          }
        },
      },
    ]);
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
        <View style={styles.signInPrompt}>
          <Ionicons name="person-circle-outline" size={80} color="#ccc" />
          <Text style={styles.signInTitle}>Sign in to access settings</Text>
          <Text style={styles.signInSubtitle}>
            Manage your profile, payments, and preferences
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => router.push("/signup")}
          >
            <Text style={styles.signUpButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isHost = userData?.role === "host";
  const isVerified = userData?.isVerified === true;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => router.push("/settings/profile")}
        >
          <View style={styles.profileLeft}>
            {userData?.photoURL ? (
              <Image source={{ uri: userData.photoURL }} style={styles.profileImage} />
            ) : (
              <Avatar.Text
                size={64}
                label={getInitials(userData?.displayName || user.displayName)}
                style={styles.profileAvatar}
              />
            )}
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>
                  {userData?.displayName || user.displayName || "User"}
                </Text>
                {isVerified && (
                  <Ionicons name="checkmark-circle" size={18} color="#667eea" />
                )}
              </View>
              <Text style={styles.profileEmail}>{user.email}</Text>
              <Text style={styles.profileRole}>
                {isHost ? "Host" : "Guest"} Account
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            <SettingsItem
              icon="person-outline"
              title="Personal Information"
              subtitle="Name, phone, emergency contact"
              onPress={() => router.push("/settings/profile")}
            />
            <SettingsItem
              icon="card-outline"
              title="Payment Methods"
              subtitle="Manage your saved cards"
              onPress={() => router.push("/settings/payment-methods")}
            />
            <SettingsItem
              icon="shield-checkmark-outline"
              title="Verification"
              subtitle={isVerified ? "Verified ✓" : "Get verified for $5"}
              badge={isVerified ? undefined : "NEW"}
              onPress={() => router.push("/settings/verification")}
            />
            <SettingsItem
              icon="lock-closed-outline"
              title="Login & Security"
              subtitle="Password, connected accounts"
              onPress={() => router.push("/settings/security")}
            />
          </View>
        </View>

        {/* Hosting Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hosting</Text>
          <View style={styles.sectionContent}>
            {isHost ? (
              <>
                <SettingsItem
                  icon="business-outline"
                  title="Host Dashboard"
                  subtitle="Manage your listings"
                  onPress={() => router.push("/settings/host-dashboard")}
                />
                <SettingsItem
                  icon="wallet-outline"
                  title="Payout Settings"
                  subtitle="Bank account, payout schedule"
                  onPress={() => router.push("/settings/host-payouts")}
                />
              </>
            ) : (
              <SettingsItem
                icon="home-outline"
                title="Become a Host"
                subtitle="Start earning with your property"
                onPress={() => router.push("/become-a-host")}
              />
            )}
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.sectionContent}>
            <SettingsItem
              icon="notifications-outline"
              title="Notifications"
              subtitle="Push, email, SMS preferences"
              onPress={() => router.push("/settings/notifications")}
            />
            <SettingsItem
              icon="globe-outline"
              title="Language & Currency"
              subtitle="English, USD"
              onPress={() => router.push("/settings/language")}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.sectionContent}>
            <SettingsItem
              icon="help-circle-outline"
              title="Help Center"
              onPress={() => router.push("/settings/help")}
            />
            <SettingsItem
              icon="chatbox-outline"
              title="Contact Us"
              onPress={() => router.push("/contact")}
            />
            <SettingsItem
              icon="document-text-outline"
              title="Terms of Service"
              onPress={() => router.push("/terms-of-service")}
            />
            <SettingsItem
              icon="shield-outline"
              title="Privacy Policy"
              onPress={() => router.push("/privacy-policy")}
            />
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          disabled={isSigningOut}
        >
          <Ionicons name="log-out-outline" size={22} color="#ff4444" />
          <Text style={styles.signOutText}>
            {isSigningOut ? "Signing out..." : "Sign Out"}
          </Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.version}>Enatbet v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  profileAvatar: {
    backgroundColor: "#667eea",
  },
  profileInfo: {
    marginLeft: 14,
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  profileEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  profileRole: {
    fontSize: 13,
    color: "#667eea",
    marginTop: 4,
    fontWeight: "500",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#999",
    marginBottom: 8,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  settingsItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f0f3ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingsItemText: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1a1a1a",
  },
  settingsItemSubtitle: {
    fontSize: 13,
    color: "#999",
    marginTop: 2,
  },
  settingsItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  signInPrompt: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  signInTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    color: "#1a1a1a",
  },
  signInSubtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },
  signInButton: {
    marginTop: 24,
    backgroundColor: "#667eea",
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 8,
  },
  signInButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  signUpButton: {
    marginTop: 12,
    paddingHorizontal: 48,
    paddingVertical: 14,
  },
  signUpButtonText: {
    color: "#667eea",
    fontSize: 16,
    fontWeight: "600",
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 32,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    gap: 8,
  },
  signOutText: {
    color: "#ff4444",
    fontSize: 16,
    fontWeight: "600",
  },
  version: {
    textAlign: "center",
    color: "#999",
    fontSize: 13,
    marginTop: 16,
    marginBottom: 32,
  },
});
