import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { useAuthStore } from "../store/authStore";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";

type LoginScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Login">;
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    try {
      await signIn(email.trim().toLowerCase(), password);
      navigation.navigate("MainTabs");
    } catch (err) {
      // Error handled by store
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text variant="headlineLarge" style={styles.title}>
          Welcome Back
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Sign in to continue
        </Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          style={styles.input}
        />

        <View style={styles.passwordHeader}>
          <Text style={styles.passwordLabel}>Password</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry={!showPassword}
          placeholder="Enter password"
          right={
            <TextInput.Icon
              icon={showPassword ? "eye-off" : "eye"}
              onPress={() => setShowPassword(!showPassword)}
            />
          }
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          loading={isLoading}
          disabled={isLoading}
          style={styles.loginButton}
          buttonColor="#6366F1"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("MainTabs")}
          style={styles.backHome}
        >
          <Text style={styles.backHomeText}>← Back to Home</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  title: {
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 32,
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  passwordHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  passwordLabel: {
    fontSize: 12,
    color: "#666",
  },
  forgotPassword: {
    color: "#6366F1",
    fontSize: 14,
    fontWeight: "500",
  },
  loginButton: {
    marginTop: 8,
    paddingVertical: 6,
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  signupText: {
    color: "#666",
  },
  signupLink: {
    color: "#6366F1",
    fontWeight: "600",
  },
  backHome: {
    marginTop: 16,
    alignItems: "center",
  },
  backHomeText: {
    color: "#6366F1",
  },
});

export default LoginScreen;
