import React, { useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { router } from "expo-router";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) { setError("Please enter your email"); return; }
    if (!EMAIL_REGEX.test(trimmedEmail)) { setError("Please enter a valid email address"); return; }
    if (!password) { setError("Please enter your password"); return; }

    setIsLoading(true);
    setError(null);

    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, trimmedEmail, password);
      router.replace("/(tabs)");
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      switch (firebaseError.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("Invalid email or password");
          break;
        case "auth/too-many-requests":
          setError("Too many attempts. Please try again later");
          break;
        case "auth/network-request-failed":
          setError("Network error. Please check your connection");
          break;
        default:
          setError("Sign in failed. Please try again");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineLarge" style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
        {error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}
        <TextInput label="Email" value={email} onChangeText={(text) => { setEmail(text); setError(null); }} mode="outlined" keyboardType="email-address" autoCapitalize="none" autoComplete="email" style={styles.input} />
        <View style={styles.passwordHeader}>
          <Text style={styles.passwordLabel}>Password</Text>
          <TouchableOpacity onPress={() => router.push("/forgot-password")}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>
        <TextInput value={password} onChangeText={(text) => { setPassword(text); setError(null); }} mode="outlined" secureTextEntry={!showPassword} placeholder="Enter password" right={<TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />} style={styles.input} />
        <Button mode="contained" onPress={handleLogin} loading={isLoading} disabled={isLoading} style={styles.loginButton} buttonColor="#6366F1">{isLoading ? "Signing in..." : "Sign In"}</Button>
        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Do not have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, padding: 24, justifyContent: "center" },
  title: { textAlign: "center", fontWeight: "bold", marginBottom: 8 },
  subtitle: { textAlign: "center", color: "#666", marginBottom: 32 },
  errorBox: { backgroundColor: "#FEE2E2", padding: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { color: "#DC2626", fontSize: 14 },
  input: { marginBottom: 16, backgroundColor: "#fff" },
  passwordHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  passwordLabel: { fontSize: 12, color: "#666" },
  forgotPassword: { color: "#6366F1", fontSize: 14, fontWeight: "500" },
  loginButton: { marginTop: 8, paddingVertical: 6 },
  signupRow: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  signupText: { color: "#666" },
  signupLink: { color: "#6366F1", fontWeight: "600" },
});
