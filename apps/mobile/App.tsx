import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StripeProvider } from "@stripe/stripe-react-native";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";
import AppNavigator from "./src/navigation/AppNavigator";

// Use a placeholder key for now - you'll add real key later
const STRIPE_KEY = "pk_test_placeholder";

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <StripeProvider publishableKey={STRIPE_KEY}>
          <NavigationContainer>
            <View style={styles.container}>
              <AppNavigator />
              <StatusBar style="auto" />
            </View>
          </NavigationContainer>
        </StripeProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});