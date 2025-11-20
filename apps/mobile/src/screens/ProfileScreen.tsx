import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { Text, Button, Avatar, List, Divider } from "react-native-paper";
import { useAuthStore } from "../store/authStore";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";

type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Profile">;
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    navigation.navigate("Home");
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text variant="headlineMedium" style={styles.title}>
            Sign in to continue
          </Text>
          <Button mode="contained" onPress={() => navigation.navigate("Login")} style={styles.button}>
            Sign In
          </Button>
          <Button mode="outlined" onPress={() => navigation.navigate("SignUp")} style={styles.button}>
            Create Account
          </Button>

          {/* Legal Links for Non-Logged In Users */}
          <Divider style={styles.divider} />
          <List.Section>
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
          </List.Section>
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
        <Text variant="headlineMedium" style={styles.name}>
          {user.displayName}
        </Text>
        <Text variant="bodyLarge" style={styles.email}>
          {user.email}
        </Text>
      </View>

      <Divider />

      <List.Section>
        <List.Item
          title="My Bookings"
          left={(props) => <List.Icon {...props} icon="calendar" />}
          onPress={() => navigation.navigate("MyBookings")}
        />
        <List.Item
          title="Favorites"
          left={(props) => <List.Icon {...props} icon="heart" />}
        />
        <List.Item
          title="Settings"
          left={(props) => <List.Icon {...props} icon="cog" />}
        />
        <List.Item
          title="Help & Support"
          left={(props) => <List.Icon {...props} icon="help-circle" />}
        />
      </List.Section>

      <Divider />

      {/* Legal Links for Logged In Users */}
      <List.Section>
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
      </List.Section>

      <View style={styles.footer}>
        <Button mode="outlined" onPress={handleSignOut}>
          Sign Out
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  header: {
    alignItems: "center",
    padding: 32,
  },
  name: {
    marginTop: 16,
    fontWeight: "bold",
  },
  email: {
    color: "#717171",
    marginTop: 4,
  },
  title: {
    marginBottom: 24,
  },
  button: {
    marginTop: 12,
    width: "100%",
  },
  divider: {
    marginTop: 32,
    marginBottom: 16,
  },
  footer: {
    padding: 16,
    marginTop: 32,
  },
});