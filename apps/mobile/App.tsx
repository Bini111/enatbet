import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StripeProvider } from "@stripe/stripe-react-native";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import HomeScreen from "./src/screens/HomeScreen";

// Use a placeholder key for now - you'll add real key later
const STRIPE_KEY = "pk_test_placeholder";

export default function App() {
  return (
    <StripeProvider publishableKey={STRIPE_KEY}>
      <NavigationContainer>
        <View style={styles.container}>
          <HomeScreen />
          <StatusBar style="auto" />
        </View>
      </NavigationContainer>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
