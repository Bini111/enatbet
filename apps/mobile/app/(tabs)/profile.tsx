import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Button, Divider, List, Avatar } from "react-native-paper";
import { router } from "expo-router";
import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth";

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const auth = getAuth();
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const getInitials = (name: string | null): string => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return <View style={styles.loadingContainer}><Text>Loading...</Text></View>;
  }

  if (user) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.userHeader}>
          <Avatar.Text size={80} label={getInitials(user.displayName)} style={styles.avatar} />
          <Text variant="headlineSmall" style={styles.userName}>{user.displayName || "Enatbet User"}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
        <View style={styles.content}>
          <Text variant="titleMedium" style={styles.sectionTitle}>Account</Text>
          <List.Item title="My Bookings" left={(props) => <List.Icon {...props} icon="calendar-check" />} right={(props) => <List.Icon {...props} icon="chevron-right" />} onPress={() => router.push("/(tabs)/bookings")} style={styles.listItem} />
          <Divider style={styles.divider} />
          <Text variant="titleMedium" style={styles.sectionTitle}>Hosting</Text>
          <List.Item title="Become a Host" description="Share your home and earn" left={(props) => <List.Icon {...props} icon="home-plus" />} right={(props) => <List.Icon {...props} icon="chevron-right" />} onPress={() => router.push("/become-a-host")} style={styles.listItem} />
          <List.Item title="Resources & Help" description="Guides and FAQs" left={(props) => <List.Icon {...props} icon="book-open-variant" />} right={(props) => <List.Icon {...props} icon="chevron-right" />} onPress={() => router.push("/resources")} style={styles.listItem} />
          <Divider style={styles.divider} />
          <Text variant="titleMedium" style={styles.sectionTitle}>Support</Text>
          <List.Item title="Contact Us" description="Get help from our team" left={(props) => <List.Icon {...props} icon="email-outline" />} right={(props) => <List.Icon {...props} icon="chevron-right" />} onPress={() => router.push("/contact")} style={styles.listItem} />
          <Divider style={styles.divider} />
          <Text variant="titleMedium" style={styles.sectionTitle}>Legal & Privacy</Text>
          <List.Item title="Terms of Service" left={(props) => <List.Icon {...props} icon="file-document-outline" />} right={(props) => <List.Icon {...props} icon="chevron-right" />} onPress={() => router.push("/terms-of-service")} style={styles.listItem} />
          <List.Item title="Privacy Policy" left={(props) => <List.Icon {...props} icon="shield-check-outline" />} right={(props) => <List.Icon {...props} icon="chevron-right" />} onPress={() => router.push("/privacy-policy")} style={styles.listItem} />
          <Divider style={styles.divider} />
          <Button mode="outlined" onPress={handleSignOut} loading={isSigningOut} disabled={isSigningOut} style={styles.signOutButton} textColor="#DC2626">{isSigningOut ? "Signing Out..." : "Sign Out"}</Button>
          <View style={styles.footer}>
            <Text style={styles.footerText}>🇪🇹🏠🇪🇷 Enatbet</Text>
            <Text style={styles.versionText}>v1.0.0</Text>
            <Text style={styles.copyrightText}>© 2025 Enatbet. All rights reserved.</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>Profile</Text>
        <View style={styles.authButtons}>
          <Button mode="contained" onPress={() => router.push("/login")} style={styles.signInButton} buttonColor="#6366F1">Sign In</Button>
          <Button mode="outlined" onPress={() => router.push("/signup")} style={styles.createButton} textColor="#6366F1">Create Account</Button>
        </View>
        <Divider style={styles.divider} />
        <Text variant="titleMedium" style={styles.sectionTitle}>Hosting</Text>
        <List.Item title="Become a Host" description="Share your home and earn" left={(props) => <List.Icon {...props} icon="home-plus" />} right={(props) => <List.Icon {...props} icon="chevron-right" />} onPress={() => router.push("/become-a-host")} style={styles.listItem} />
        <List.Item title="Resources & Help" description="Guides and FAQs" left={(props) => <List.Icon {...props} icon="book-open-variant" />} right={(props) => <List.Icon {...props} icon="chevron-right" />} onPress={() => router.push("/resources")} style={styles.listItem} />
        <Divider style={styles.divider} />
        <Text variant="titleMedium" style={styles.sectionTitle}>Support</Text>
        <List.Item title="Contact Us" description="Get help from our team" left={(props) => <List.Icon {...props} icon="email-outline" />} right={(props) => <List.Icon {...props} icon="chevron-right" />} onPress={() => router.push("/contact")} style={styles.listItem} />
        <Divider style={styles.divider} />
        <Text variant="titleMedium" style={styles.sectionTitle}>Legal & Privacy</Text>
        <List.Item title="Terms of Service" left={(props) => <List.Icon {...props} icon="file-document-outline" />} right={(props) => <List.Icon {...props} icon="chevron-right" />} onPress={() => router.push("/terms-of-service")} style={styles.listItem} />
        <List.Item title="Privacy Policy" left={(props) => <List.Icon {...props} icon="shield-check-outline" />} right={(props) => <List.Icon {...props} icon="chevron-right" />} onPress={() => router.push("/privacy-policy")} style={styles.listItem} />
        <View style={styles.footer}>
          <Text style={styles.footerText}>🇪🇹🏠🇪🇷 Enatbet</Text>
          <Text style={styles.versionText}>v1.0.0</Text>
          <Text style={styles.copyrightText}>© 2025 Enatbet. All rights reserved.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { padding: 16 },
  title: { fontWeight: "bold", textAlign: "center", marginVertical: 24 },
  authButtons: { gap: 12, marginBottom: 24 },
  signInButton: { paddingVertical: 6 },
  createButton: { paddingVertical: 6, borderColor: "#6366F1" },
  userHeader: { backgroundColor: "#6366F1", padding: 24, alignItems: "center" },
  avatar: { backgroundColor: "#fff", marginBottom: 12 },
  userName: { color: "#fff", fontWeight: "bold" },
  userEmail: { color: "#E0E7FF", marginTop: 4 },
  sectionTitle: { fontWeight: "600", marginTop: 16, marginBottom: 8, color: "#374151" },
  listItem: { backgroundColor: "#fff", marginBottom: 1 },
  divider: { marginVertical: 8 },
  signOutButton: { marginTop: 16, borderColor: "#DC2626" },
  footer: { alignItems: "center", marginTop: 32, marginBottom: 24 },
  footerText: { fontSize: 18, fontWeight: "bold" },
  versionText: { color: "#999", fontSize: 12, marginTop: 4 },
  copyrightText: { color: "#999", fontSize: 12, marginTop: 2 },
});
