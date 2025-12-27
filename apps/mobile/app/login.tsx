import React, { useState } from "react";
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  TouchableOpacity,
  Alert 
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { router } from "expo-router";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail
} from "firebase/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): string | null => {
    if (!email.trim()) return "Please enter your email";
    if (!EMAIL_REGEX.test(email.trim().toLowerCase())) return "Please enter a valid email";
    if (!password) return "Please enter your password";
    return null;
  };

  const handleLogin = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );

      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        Alert.alert(
          "Email Not Verified",
          "Your email is not verified. Would you like us to send a new verification link?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Resend",
              onPress: async () => {
                try {
                  await sendEmailVerification(userCredential.user);
                  Alert.alert("Email Sent", "Please check your inbox and verify your email.");
                } catch (err) {
                  Alert.alert("Error", "Failed to send verification email.");
                }
              },
            },
          ]
        );
        // Still allow login but show warning
      }

      // Navigate to home
      router.replace("/(tabs)");
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Invalid email or password. Please try again.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("Failed to sign in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Enter Email", "Please enter your email address first.");
      return;
    }

    if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      Alert.alert(
        "Password Reset Email Sent",
        "Check your inbox for instructions to reset your password."
      );
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        Alert.alert("Error", "No account found with this email.");
      } else {
        Alert.alert("Error", "Failed to send reset email. Please try again.");
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>🇪🇹 🇪🇷</Text>
          <Text style={styles.headerTitle}>Welcome Back</Text>
          <Text style={styles.headerSubtitle}>Sign in to your Enatbet account</Text>
        </View>

        <View style={styles.formSection}>
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TextInput
            label="Email"
            value={email}
            onChangeText={(t) => { setEmail(t); setError(null); }}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={(t) => { setPassword(t); setError(null); }}
            mode="outlined"
            style={styles.input}
            secureTextEntry={!showPassword}
            right={
              <TextInput.Icon 
                icon={showPassword ? "eye-off" : "eye"} 
                onPress={() => setShowPassword(!showPassword)} 
              />
            }
          />

          <TouchableOpacity 
            onPress={handleForgotPassword}
            style={styles.forgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={styles.submitButton}
            buttonColor="#6366F1"
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>

          <View style={styles.signUpPrompt}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text style={styles.signUpLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>🔐 Account Security</Text>
          <Text style={styles.infoText}>
            Your email must be verified to become a host. If you haven't verified yet, 
            we'll send you a verification link after signing in.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: "#6366F1",
    padding: 24,
    paddingTop: 48,
    alignItems: "center",
  },
  headerEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#E0E7FF",
  },
  formSection: {
    padding: 20,
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
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#6366F1",
    fontSize: 14,
    fontWeight: "500",
  },
  submitButton: {
    paddingVertical: 6,
    borderRadius: 25,
  },
  signUpPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  signUpText: {
    color: "#6B7280",
    fontSize: 14,
  },
  signUpLink: {
    color: "#6366F1",
    fontSize: 14,
    fontWeight: "600",
  },
  infoBox: {
    backgroundColor: "#EFF6FF",
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E40AF",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#3B82F6",
    lineHeight: 20,
  },
});