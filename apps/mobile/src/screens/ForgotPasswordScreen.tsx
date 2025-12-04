import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Text, TextInput, Button, Snackbar } from "react-native-paper";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

type ForgotPasswordScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ForgotPassword">;
};

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigation,
}) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      setSuccess(true);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      
      switch (firebaseError.code) {
        case "auth/user-not-found":
          setError("No account found with this email address");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address");
          break;
        case "auth/too-many-requests":
          setError("Too many attempts. Please try again later");
          break;
        default:
          setError(firebaseError.message || "Failed to send reset email");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.successContent}>
          <Text style={styles.successIcon}>✉️</Text>
          <Text variant="headlineMedium" style={styles.successTitle}>
            Check Your Email
          </Text>
          <Text style={styles.successText}>
            If an account exists for {email}, you will receive a password reset
            link shortly.
          </Text>
          <Text style={styles.spamNote}>
            Did not receive it? Check your spam folder or try again in a few
            minutes.
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate("Login")}
            style={styles.backButton}
            buttonColor="#6366F1"
          >
            Back to Sign In
          </Button>
          <Button
            mode="text"
            onPress={() => {
              setSuccess(false);
              setEmail("");
            }}
            textColor="#6366F1"
          >
            Try a different email
          </Button>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text variant="headlineLarge" style={styles.title}>
            Forgot Password?
          </Text>
          <Text style={styles.subtitle}>
            No worries! Enter your email and we will send you a reset link.
          </Text>

          <TextInput
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            style={styles.input}
            error={!!error}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Button
            mode="contained"
            onPress={handleResetPassword}
            loading={isLoading}
            disabled={isLoading}
            style={styles.resetButton}
            buttonColor="#6366F1"
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </Button>

          <Button
            mode="text"
            onPress={() => navigation.navigate("Login")}
            style={styles.backLink}
            textColor="#6366F1"
          >
            ← Back to Sign In
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
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
    fontSize: 16,
  },
  input: {
    marginBottom: 8,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
    marginBottom: 16,
  },
  resetButton: {
    marginTop: 16,
    paddingVertical: 6,
  },
  backLink: {
    marginTop: 16,
  },
  successContent: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  successTitle: {
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  successText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  spamNote: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 8,
    paddingVertical: 6,
    minWidth: 200,
  },
});

export default ForgotPasswordScreen;
