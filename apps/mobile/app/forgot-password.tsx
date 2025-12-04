import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { router } from "expo-router";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) { setError("Please enter your email address"); return; }
    if (!EMAIL_REGEX.test(trimmedEmail)) { setError("Please enter a valid email address"); return; }

    setIsLoading(true);
    setError(null);

    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, trimmedEmail);
      setSuccess(true);
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      switch (firebaseError.code) {
        case "auth/user-not-found": setSuccess(true); break;
        case "auth/invalid-email": setError("Please enter a valid email address"); break;
        case "auth/too-many-requests": setError("Too many attempts. Please try again later"); break;
        default: setError("Something went wrong. Please try again");
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
          <Text variant="headlineMedium" style={styles.successTitle}>Check Your Email</Text>
          <Text style={styles.successText}>If an account exists for {email.trim().toLowerCase()}, you will receive a password reset link shortly.</Text>
          <Button mode="contained" onPress={() => router.push("/login")} style={styles.backButton} buttonColor="#6366F1">Back to Sign In</Button>
          <Button mode="text" onPress={() => { setSuccess(false); setEmail(""); }} textColor="#6366F1">Try a different email</Button>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <Text variant="headlineLarge" style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>No worries! Enter your email and we will send you a reset link.</Text>
          {error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}
          <TextInput label="Email Address" value={email} onChangeText={(text) => { setEmail(text); setError(null); }} mode="outlined" keyboardType="email-address" autoCapitalize="none" style={styles.input} />
          <Button mode="contained" onPress={handleResetPassword} loading={isLoading} disabled={isLoading} style={styles.resetButton} buttonColor="#6366F1">{isLoading ? "Sending..." : "Send Reset Link"}</Button>
          <Button mode="text" onPress={() => router.push("/login")} textColor="#6366F1">Back to Sign In</Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1, padding: 24, justifyContent: "center" },
  title: { textAlign: "center", fontWeight: "bold", marginBottom: 8 },
  subtitle: { textAlign: "center", color: "#666", marginBottom: 32, fontSize: 16 },
  input: { marginBottom: 16, backgroundColor: "#fff" },
  errorBox: { backgroundColor: "#FEE2E2", padding: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { color: "#DC2626", fontSize: 14 },
  resetButton: { marginTop: 8, paddingVertical: 6 },
  successContent: { flex: 1, padding: 24, justifyContent: "center", alignItems: "center" },
  successIcon: { fontSize: 64, marginBottom: 16 },
  successTitle: { fontWeight: "bold", marginBottom: 16 },
  successText: { textAlign: "center", color: "#666", fontSize: 16, marginBottom: 24 },
  backButton: { marginBottom: 8, paddingVertical: 6, minWidth: 200 },
});
