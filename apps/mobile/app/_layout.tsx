import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PaperProvider } from "react-native-paper";
import "../lib/firebase";

export default function RootLayout() {
  return (
    <PaperProvider>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: "Sign In", presentation: "modal", headerStyle: { backgroundColor: "#6366F1" }, headerTintColor: "#fff" }} />
        <Stack.Screen name="signup" options={{ title: "Create Account", presentation: "modal", headerStyle: { backgroundColor: "#6366F1" }, headerTintColor: "#fff" }} />
        <Stack.Screen name="forgot-password" options={{ title: "Reset Password", presentation: "modal", headerStyle: { backgroundColor: "#6366F1" }, headerTintColor: "#fff" }} />
        <Stack.Screen name="become-a-host" options={{ title: "Become a Host", headerStyle: { backgroundColor: "#6366F1" }, headerTintColor: "#fff" }} />
        <Stack.Screen name="contact" options={{ title: "Contact Us", headerStyle: { backgroundColor: "#6366F1" }, headerTintColor: "#fff" }} />
        <Stack.Screen name="resources" options={{ title: "Resources & Help", headerStyle: { backgroundColor: "#6366F1" }, headerTintColor: "#fff" }} />
        <Stack.Screen name="terms-of-service" options={{ title: "Terms of Service", headerStyle: { backgroundColor: "#6366F1" }, headerTintColor: "#fff" }} />
        <Stack.Screen name="privacy-policy" options={{ title: "Privacy Policy", headerStyle: { backgroundColor: "#6366F1" }, headerTintColor: "#fff" }} />
      </Stack>
    </PaperProvider>
  );
}
