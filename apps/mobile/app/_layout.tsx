import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="login"
          options={{
            title: "Sign In",
            presentation: "modal",
            headerStyle: { backgroundColor: "#667eea" },
            headerTintColor: "#fff",
          }}
        />
        <Stack.Screen
          name="signup"
          options={{
            title: "Create Account",
            presentation: "modal",
            headerStyle: { backgroundColor: "#667eea" },
            headerTintColor: "#fff",
          }}
        />
      </Stack>
    </>
  );
}
