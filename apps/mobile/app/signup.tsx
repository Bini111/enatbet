import React, { useState } from "react";
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { router } from "expo-router";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupScreen() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    dateOfBirth: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const validateDateOfBirth = (dob: string): boolean => {
    const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/(19|20)\d{2}$/;
    if (!regex.test(dob)) return false;
    const [month, day, year] = dob.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    const now = new Date();
    const age = now.getFullYear() - date.getFullYear();
    return age >= 18 && age <= 120;
  };

  const validateForm = (): string | null => {
    if (!formData.fullName.trim()) return "Please enter your full name";
    if (!formData.email.trim()) return "Please enter your email";
    if (!EMAIL_REGEX.test(formData.email.trim().toLowerCase())) return "Please enter a valid email address";
    if (!formData.dateOfBirth.trim()) return "Please enter your date of birth";
    if (!validateDateOfBirth(formData.dateOfBirth)) return "Please enter a valid date of birth (MM/DD/YYYY, must be 18+)";
    if (!formData.password) return "Please enter a password";
    if (formData.password.length < 8) return "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match";
    if (!agreedToTerms) return "Please agree to the Terms of Service and Privacy Policy";
    return null;
  };

  const handleSignup = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email.trim().toLowerCase(),
        formData.password
      );

      // Update display name
      await updateProfile(userCredential.user, {
        displayName: formData.fullName.trim(),
      });

      // Save additional user data to Firestore
      const db = getFirestore();
      await setDoc(doc(db, "users", userCredential.user.uid), {
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        dateOfBirth: formData.dateOfBirth.trim(),
        agreedToTerms: true,
        agreedToTermsAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Navigate to home
      router.replace("/(tabs)");
    } catch (err: any) {
      console.error("Signup error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please sign in instead.");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Please use a stronger password.");
      } else {
        setError("Failed to create account. Please try again.");
      }
    } finally {
      setIsLoading(false);
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
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>Join the Enatbet community</Text>
        </View>

        <View style={styles.formSection}>
          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TextInput
            label="Full Name *"
            value={formData.fullName}
            onChangeText={(t) => { setFormData({ ...formData, fullName: t }); setError(null); }}
            mode="outlined"
            style={styles.input}
            autoCapitalize="words"
          />

          <TextInput
            label="Email *"
            value={formData.email}
            onChangeText={(t) => { setFormData({ ...formData, email: t }); setError(null); }}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            label="Date of Birth *"
            value={formData.dateOfBirth}
            onChangeText={(t) => { setFormData({ ...formData, dateOfBirth: t }); setError(null); }}
            mode="outlined"
            style={styles.input}
            keyboardType="number-pad"
            placeholder="MM/DD/YYYY"
            maxLength={10}
          />
          <Text style={styles.helperText}>You must be 18 or older to create an account</Text>

          <TextInput
            label="Password *"
            value={formData.password}
            onChangeText={(t) => { setFormData({ ...formData, password: t }); setError(null); }}
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

          <TextInput
            label="Confirm Password *"
            value={formData.confirmPassword}
            onChangeText={(t) => { setFormData({ ...formData, confirmPassword: t }); setError(null); }}
            mode="outlined"
            style={styles.input}
            secureTextEntry={!showPassword}
          />

          {/* Terms Checkbox */}
          <TouchableOpacity 
            style={[styles.checkboxContainer, agreedToTerms && styles.checkboxContainerChecked]} 
            onPress={() => { setAgreedToTerms(!agreedToTerms); setError(null); }}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
              {agreedToTerms && <Text style={styles.checkboxTick}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              I agree to the{" "}
              <Text style={styles.link} onPress={() => router.push("/terms-of-service")}>Terms of Service</Text>
              {" "}and{" "}
              <Text style={styles.link} onPress={() => router.push("/privacy-policy")}>Privacy Policy</Text> *
            </Text>
          </TouchableOpacity>

          <Button
            mode="contained"
            onPress={handleSignup}
            loading={isLoading}
            disabled={isLoading}
            style={styles.submitButton}
            buttonColor="#6366F1"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>

          <View style={styles.signInPrompt}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
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
  helperText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 4,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
    marginTop: 8,
    padding: 16,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
  },
  checkboxContainerChecked: {
    borderColor: "#6366F1",
    backgroundColor: "#F5F3FF",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#9CA3AF",
    borderRadius: 6,
    marginRight: 12,
    marginTop: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  checkboxChecked: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
  },
  checkboxTick: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  link: {
    color: "#6366F1",
    fontWeight: "600",
  },
  submitButton: {
    paddingVertical: 6,
    marginTop: 8,
    borderRadius: 25,
  },
  signInPrompt: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  signInText: {
    color: "#6B7280",
    fontSize: 14,
  },
  signInLink: {
    color: "#6366F1",
    fontSize: 14,
    fontWeight: "600",
  },
});