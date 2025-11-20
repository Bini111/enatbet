import "react-native-gesture-handler";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
    </GestureHandlerRootView>
  );
}
