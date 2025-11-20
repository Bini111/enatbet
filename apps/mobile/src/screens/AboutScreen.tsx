import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "react-native-paper";

export const AboutScreen: React.FC = () => {
  const handleEmailPress = async () => {
    try {
      const supported = await Linking.canOpenURL("mailto:support@enatbet.app");
      if (supported) {
        await Linking.openURL("mailto:support@enatbet.app");
      } else {
        Alert.alert("Error", "Cannot open email client");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open email client");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title} accessibilityRole="header">
          About Enatbet
        </Text>
        <Text style={styles.tagline}>Book a home, not just a room</Text>

        <Text style={styles.section} accessibilityRole="header">
          Our Mission
        </Text>
        <Text style={styles.text}>
          Enatbet connects Ethiopian and Eritrean diaspora communities worldwide
          by providing authentic cultural experiences through home stays and
          property rentals with families who share your heritage.
        </Text>

        <Text style={styles.section} accessibilityRole="header">
          What We Offer
        </Text>
        <View style={styles.bulletContainer}>
          <Text style={styles.text}>
            • Authentic cultural experiences with host families
          </Text>
          <Text style={styles.text}>
            • Properties in Ethiopia, Eritrea, and diaspora communities
          </Text>
          <Text style={styles.text}>
            • Coffee ceremonies and traditional hospitality
          </Text>
          <Text style={styles.text}>• Safe and verified listings</Text>
          <Text style={styles.text}>• Direct connection to your roots</Text>
        </View>

        <Text style={styles.section} accessibilityRole="header">
          Contact Us
        </Text>
        <Button
          mode="outlined"
          onPress={handleEmailPress}
          style={styles.button}
          accessibilityLabel="Contact support via email"
        >
          support@enatbet.app
        </Button>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1a1a1a",
  },
  tagline: {
    fontSize: 18,
    fontStyle: "italic",
    color: "#667eea",
    marginBottom: 24,
  },
  section: {
    fontSize: 22,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 12,
    color: "#1a1a1a",
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: "#4a5568",
    marginBottom: 8,
  },
  bulletContainer: {
    marginLeft: 8,
  },
  button: {
    marginTop: 12,
  },
  version: {
    marginTop: 32,
    textAlign: "center",
    color: "#999",
    fontSize: 14,
  },
});

export default AboutScreen;
