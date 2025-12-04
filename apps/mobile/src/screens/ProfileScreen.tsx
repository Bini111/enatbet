import React from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Text, Button, Divider, List } from "react-native-paper";
import { useAuthStore } from "../store/authStore";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useNavigation } from "@react-navigation/native";

type ProfileScreenProps = {
  navigation?: NativeStackNavigationProp<RootStackParamList, "Profile">;
};

export const ProfileScreen: React.FC<ProfileScreenProps> = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, signOut, isLoading } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.guestContent}>
          <Text variant="headlineMedium" style={styles.title}>
            Profile
          </Text>

          <View style={styles.authButtons}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate("Login")}
              style={styles.signInButton}
              buttonColor="#6366F1"
            >
              Sign In
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate("SignUp")}
              style={styles.createButton}
              textColor="#6366F1"
            >
              Create Account
            </Button>
          </View>

          <Divider style={styles.divider} />

          {/* Hosting Section */}
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Hosting
          </Text>
          <List.Item
            title="Become a Host"
            description="Share your home and earn"
            left={(props) => <List.Icon {...props} icon="home-plus" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate("BecomeAHost")}
            style={styles.listItem}
          />
          <List.Item
            title="Resources & Help"
            description="Guides and FAQs"
            left={(props) => <List.Icon {...props} icon="book-open-variant" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate("Resources")}
            style={styles.listItem}
          />

          <Divider style={styles.divider} />

          {/* Support Section */}
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Support
          </Text>
          <List.Item
            title="Contact Us"
            description="Get help from our team"
            left={(props) => <List.Icon {...props} icon="email-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate("Contact")}
            style={styles.listItem}
          />
          <List.Item
            title="About Enatbet"
            left={(props) => <List.Icon {...props} icon="information-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate("About")}
            style={styles.listItem}
          />

          <Divider style={styles.divider} />

          {/* Legal Section */}
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Legal & Privacy
          </Text>
          <List.Item
            title="Terms of Service"
            left={(props) => <List.Icon {...props} icon="file-document-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate("TermsOfService")}
            style={styles.listItem}
          />
          <List.Item
            title="Privacy Policy"
            left={(props) => <List.Icon {...props} icon="shield-check-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate("PrivacyPolicy")}
            style={styles.listItem}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>🇪🇹🏠🇪🇷 Enatbet</Text>
            <Text style={styles.versionText}>v1.0.0</Text>
            <Text style={styles.copyrightText}>© 2025 Enatbet. All rights reserved.</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  // Logged in user view
  return (
    <ScrollView style={styles.container}>
      <View style={styles.userHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.displayName?.charAt(0).toUpperCase() || "U"}
          </Text>
        </View>
        <Text variant="headlineSmall" style={styles.userName}>
          {user.displayName || "User"}
        </Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>

      <View style={styles.content}>
        {/* Account Section */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Account
        </Text>
        <List.Item
          title="Edit Profile"
          left={(props) => <List.Icon {...props} icon="account-edit-outline" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          style={styles.listItem}
        />
        <List.Item
          title="My Bookings"
          left={(props) => <List.Icon {...props} icon="calendar-check" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate("Bookings" as any)}
          style={styles.listItem}
        />

        <Divider style={styles.divider} />

        {/* Hosting Section */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Hosting
        </Text>
        <List.Item
          title="Become a Host"
          description="Share your home and earn"
          left={(props) => <List.Icon {...props} icon="home-plus" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate("BecomeAHost")}
          style={styles.listItem}
        />
        <List.Item
          title="Resources & Help"
          left={(props) => <List.Icon {...props} icon="book-open-variant" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate("Resources")}
          style={styles.listItem}
        />

        <Divider style={styles.divider} />

        {/* Support Section */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Support
        </Text>
        <List.Item
          title="Contact Us"
          left={(props) => <List.Icon {...props} icon="email-outline" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate("Contact")}
          style={styles.listItem}
        />
        <List.Item
          title="About Enatbet"
          left={(props) => <List.Icon {...props} icon="information-outline" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate("About")}
          style={styles.listItem}
        />

        <Divider style={styles.divider} />

        {/* Legal Section */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Legal & Privacy
        </Text>
        <List.Item
          title="Terms of Service"
          left={(props) => <List.Icon {...props} icon="file-document-outline" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate("TermsOfService")}
          style={styles.listItem}
        />
        <List.Item
          title="Privacy Policy"
          left={(props) => <List.Icon {...props} icon="shield-check-outline" />}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate("PrivacyPolicy")}
          style={styles.listItem}
        />

        <Divider style={styles.divider} />

        <Button
          mode="outlined"
          onPress={handleSignOut}
          loading={isLoading}
          style={styles.signOutButton}
          textColor="#DC2626"
        >
          Sign Out
        </Button>

        <View style={styles.footer}>
          <Text style={styles.footerText}>🇪🇹🏠🇪🇷 Enatbet</Text>
          <Text style={styles.versionText}>v1.0.0</Text>
          <Text style={styles.copyrightText}>© 2025 Enatbet. All rights reserved.</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  guestContent: {
    padding: 16,
  },
  content: {
    padding: 16,
  },
  title: {
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 24,
  },
  authButtons: {
    gap: 12,
    marginBottom: 24,
  },
  signInButton: {
    paddingVertical: 6,
  },
  createButton: {
    paddingVertical: 6,
    borderColor: "#6366F1",
  },
  userHeader: {
    backgroundColor: "#6366F1",
    padding: 24,
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#6366F1",
  },
  userName: {
    color: "#fff",
    fontWeight: "bold",
  },
  userEmail: {
    color: "#E0E7FF",
    marginTop: 4,
  },
  sectionTitle: {
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    color: "#374151",
  },
  listItem: {
    backgroundColor: "#fff",
    marginBottom: 1,
  },
  divider: {
    marginVertical: 8,
  },
  signOutButton: {
    marginTop: 16,
    borderColor: "#DC2626",
  },
  footer: {
    alignItems: "center",
    marginTop: 32,
    marginBottom: 24,
  },
  footerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  versionText: {
    color: "#999",
    fontSize: 12,
    marginTop: 4,
  },
  copyrightText: {
    color: "#999",
    fontSize: 12,
    marginTop: 2,
  },
});

export default ProfileScreen;
