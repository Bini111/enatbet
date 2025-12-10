import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";

const COLORS = {
  primary: '#667eea',
  text: '#1a1a1a',
  textMuted: '#666',
  textLight: '#333',
  border: '#ddd',
  error: '#dc2626',
  background: '#fff',
  disabled: '#9ca3af',
};

export default function Signup() {
  const router = useRouter();
  const { signUp } = useAuth();
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    terms: "",
  });

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSignup = async () => {
    setErrors({ fullName: "", email: "", password: "", terms: "" });

    const newErrors = { fullName: "", email: "", password: "", terms: "" };
    
    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Invalid email format";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!agreedToTerms) {
      newErrors.terms = "You must agree to the Terms and Privacy Policy";
    }

    if (newErrors.fullName || newErrors.email || newErrors.password || newErrors.terms) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, fullName);
      Alert.alert(
        "Welcome to Enatbet! 🎉",
        "Your account has been created successfully.",
        [{ text: "Continue", onPress: () => router.replace("/(tabs)") }]
      );
    } catch (error: any) {
      Alert.alert("Signup Failed", error.message || "Please try again");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = fullName.trim() && email && password.length >= 6 && agreedToTerms;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the Enatbet community</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={[styles.input, errors.fullName && styles.inputError]}
              placeholder="John Doe"
              placeholderTextColor={COLORS.disabled}
              value={fullName}
              onChangeText={setFullName}
              autoComplete="name"
            />
            {errors.fullName ? (
              <Text style={styles.errorText}>{errors.fullName}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="your@email.com"
              placeholderTextColor={COLORS.disabled}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="At least 6 characters"
              placeholderTextColor={COLORS.disabled}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password-new"
            />
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}
          </View>

          {/* Terms and Privacy Checkbox */}
          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                {agreedToTerms && (
                  <Ionicons name="checkmark" size={16} color={COLORS.background} />
                )}
              </View>
              <Text style={styles.termsText}>
                I agree to the{" "}
              </Text>
            </TouchableOpacity>
            <View style={styles.termsLinks}>
              <TouchableOpacity onPress={() => router.push("/terms-of-service")}>
                <Text style={styles.termsLink}>Terms of Service</Text>
              </TouchableOpacity>
              <Text style={styles.termsText}> and </Text>
              <TouchableOpacity onPress={() => router.push("/privacy-policy")}>
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
            {errors.terms ? (
              <Text style={styles.errorText}>{errors.terms}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              (!isFormValid || loading) && styles.buttonDisabled,
            ]}
            onPress={handleSignup}
            disabled={!isFormValid || loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Creating Account..." : "Sign Up"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.linkText}>
              Already have an account?{" "}
              <Text style={styles.linkHighlight}>Sign In</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.back()}
          >
            <Text style={styles.linkText}>← Back to Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, justifyContent: "center", padding: 24 },
  header: { marginBottom: 32, alignItems: "center" },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: COLORS.textMuted },
  form: { gap: 16 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: "600", color: COLORS.textLight },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: COLORS.background,
    color: COLORS.text,
  },
  inputError: { borderColor: COLORS.error },
  errorText: { fontSize: 14, color: COLORS.error, marginTop: 4 },
  termsContainer: { 
    marginTop: 8,
    marginBottom: 8,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  termsText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  termsLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: 34,
    marginTop: 2,
  },
  termsLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    alignItems: "center",
  },
  buttonDisabled: { backgroundColor: COLORS.disabled },
  buttonText: { color: COLORS.background, fontSize: 18, fontWeight: "600" },
  linkButton: { alignItems: "center", marginTop: 16 },
  linkText: { color: COLORS.textMuted, fontSize: 16 },
  linkHighlight: { color: COLORS.primary, fontWeight: "600" },
});
