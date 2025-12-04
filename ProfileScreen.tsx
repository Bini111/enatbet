import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Avatar, List } from "react-native-paper";
import { useAuthStore } from "../store/authStore";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

export default function ProfileScreen({ navigation }: Props) {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigation.replace("Home");
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginButtonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => navigation.navigate("SignUp")}
        >
          <Text style={styles.signupButtonText}>Create Account</Text>
        </TouchableOpacity>

        {/* Legal Links Section */}
        <View style={styles.legalSection}>
          <List.Item
            title="About Enatbet"
            left={(props) => <List.Icon {...props} icon="information" />}
            onPress={() => navigation.navigate("About")}
          />
          <List.Item
            title="Privacy Policy"
            left={(props) => <List.Icon {...props} icon="shield-lock" />}
            onPress={() => navigation.navigate("PrivacyPolicy")}
          />
          <List.Item
            title="Terms of Service"
            left={(props) => <List.Icon {...props} icon="file-document" />}
            onPress={() => navigation.navigate("TermsOfService")}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text
          size={80}
          label={user.displayName.substring(0, 2).toUpperCase()}
        />
        <Text style={styles.name}>{user.displayName}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.section}>
        <List.Item
          title="My Bookings"
          left={(props) => <List.Icon {...props} icon="calendar" />}
          onPress={() => navigation.navigate("MyBookings")}
        />
        <List.Item
          title="Favorites"
          left={(props) => <List.Icon {...props} icon="heart" />}
          onPress={() => navigation.navigate("Favorites")}
        />
        <List.Item
          title="Messages"
          left={(props) => <List.Icon {...props} icon="message" />}
          onPress={() => navigation.navigate("Messages")}
        />
      </View>

      {/* Legal Section for Logged In Users */}
      <View style={styles.section}>
        <List.Item
          title="About Enatbet"
          left={(props) => <List.Icon {...props} icon="information" />}
          onPress={() => navigation.navigate("About")}
        />
        <List.Item
          title="Privacy Policy"
          left={(props) => <List.Icon {...props} icon="shield-lock" />}
          onPress={() => navigation.navigate("PrivacyPolicy")}
        />
        <List.Item
          title="Terms of Service"
          left={(props) => <List.Icon {...props} icon="file-document" />}
          onPress={() => navigation.navigate("TermsOfService")}
        />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    alignItems: "center",
    padding: 24,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
  },
  email: {
    fontSize: 16,
    color: "#717171",
    marginTop: 4,
  },
  section: {
    marginTop: 16,
  },
  legalSection: {
    marginTop: 32,
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 48,
    marginBottom: 32,
  },
  loginButton: {
    backgroundColor: "#667eea",
    padding: 18,
    borderRadius: 12,
    margin: 24,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  signupButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#667eea",
    padding: 18,
    borderRadius: 12,
    marginHorizontal: 24,
    alignItems: "center",
  },
  signupButtonText: {
    color: "#667eea",
    fontSize: 18,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#dc2626",
    padding: 18,
    borderRadius: 12,
    margin: 24,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
