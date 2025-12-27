import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { Text } from "react-native-paper";
import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { getFunctions, httpsCallable } from "firebase/functions";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../lib/firebase";

export default function VerificationScreen() {
  const { user, userData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"info" | "payment" | "selfie" | "pending">(
    userData?.isVerified ? "pending" : "info"
  );
  const [sessionId, setSessionId] = useState<string | null>(null);
  const functions = getFunctions();

  const isVerified = userData?.isVerified === true;

  const handleStartVerification = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const createSessionFn = httpsCallable(functions, "createVerificationSession");
      const result = await createSessionFn({ userId: user.uid });
      const data = result.data as any;

      setSessionId(data.sessionId);
      // In production, use Stripe SDK to handle payment
      Alert.alert(
        "Payment Required",
        "Verification costs $5 one-time. This feature requires Stripe payment integration.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Simulate Payment",
            onPress: () => simulatePayment(data.sessionId),
          },
        ]
      );
    } catch (error) {
      console.error("Error starting verification:", error);
      Alert.alert("Error", "Failed to start verification");
    } finally {
      setIsLoading(false);
    }
  };

  const simulatePayment = async (sid: string) => {
    try {
      const confirmFn = httpsCallable(functions, "confirmVerificationPayment");
      await confirmFn({ sessionId: sid, paymentIntentId: "pi_simulated" });
      setStep("selfie");
    } catch (error) {
      console.error("Payment confirmation error:", error);
      Alert.alert("Error", "Payment failed");
    }
  };

  const handleTakeSelfie = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Camera access is required for verification");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0] && user) {
      setIsLoading(true);
      try {
        const response = await fetch(result.assets[0].uri);
        const blob = await response.blob();

        const filename = `verification_${Date.now()}.jpg`;
        const storageRef = ref(storage, `users/${user.uid}/verification/${filename}`);
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);

        // Submit for verification
        const processFn = httpsCallable(functions, "processVerification");
        await processFn({ sessionId, selfieUrl: downloadURL });

        setStep("pending");
        Alert.alert(
          "Submitted!",
          "Your verification is being processed. This usually takes a few minutes."
        );
      } catch (error) {
        console.error("Selfie upload error:", error);
        Alert.alert("Error", "Failed to upload selfie");
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isVerified) {
    return (
      <>
        <Stack.Screen
          options={{
            headerShown: true,
            title: "Verification",
            headerBackTitle: "Settings",
          }}
        />
        <View style={styles.container}>
          <View style={styles.verifiedContainer}>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={80} color="#667eea" />
            </View>
            <Text style={styles.verifiedTitle}>You're Verified!</Text>
            <Text style={styles.verifiedSubtitle}>
              Your identity has been confirmed. You now have a blue checkmark on your profile.
            </Text>

            <View style={styles.benefitsCard}>
              <Text style={styles.benefitsTitle}>Verification Benefits</Text>
              <View style={styles.benefitItem}>
                <Ionicons name="shield-checkmark" size={20} color="#667eea" />
                <Text style={styles.benefitText}>
                  Blue checkmark on your profile
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="star" size={20} color="#667eea" />
                <Text style={styles.benefitText}>
                  Higher trust with hosts and guests
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="flash" size={20} color="#667eea" />
                <Text style={styles.benefitText}>
                  Priority support
                </Text>
              </View>
            </View>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Verification",
          headerBackTitle: "Settings",
        }}
      />
      <ScrollView style={styles.container}>
        {step === "info" && (
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark" size={64} color="#667eea" />
            </View>

            <Text style={styles.title}>Get Verified</Text>
            <Text style={styles.subtitle}>
              Verify your identity to build trust with hosts and guests. One-time $5 fee.
            </Text>

            <View style={styles.benefitsCard}>
              <Text style={styles.benefitsTitle}>What you'll get</Text>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.benefitText}>Blue checkmark badge</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.benefitText}>Increased booking acceptance</Text>
              </View>
              <View style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                <Text style={styles.benefitText}>Priority customer support</Text>
              </View>
            </View>

            <View style={styles.processCard}>
              <Text style={styles.processTitle}>How it works</Text>
              <View style={styles.processStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>Pay one-time $5 verification fee</Text>
              </View>
              <View style={styles.processStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>Take a selfie for identity confirmation</Text>
              </View>
              <View style={styles.processStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>Get verified in minutes</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartVerification}
              disabled={isLoading}
            >
              <Text style={styles.startButtonText}>
                {isLoading ? "Starting..." : "Start Verification - $5"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {step === "selfie" && (
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="camera" size={64} color="#667eea" />
            </View>

            <Text style={styles.title}>Take a Selfie</Text>
            <Text style={styles.subtitle}>
              Take a clear photo of your face. Make sure you're in good lighting.
            </Text>

            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>Tips for a good photo</Text>
              <Text style={styles.tipItem}>• Face the camera directly</Text>
              <Text style={styles.tipItem}>• Use good lighting</Text>
              <Text style={styles.tipItem}>• Remove sunglasses or hats</Text>
              <Text style={styles.tipItem}>• Keep a neutral expression</Text>
            </View>

            <TouchableOpacity
              style={styles.startButton}
              onPress={handleTakeSelfie}
              disabled={isLoading}
            >
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={styles.startButtonText}>
                {isLoading ? "Processing..." : "Take Selfie"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {step === "pending" && (
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name="hourglass" size={64} color="#ff9800" />
            </View>

            <Text style={styles.title}>Verification Pending</Text>
            <Text style={styles.subtitle}>
              Your verification is being processed. This usually takes a few minutes.
            </Text>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.back()}
            >
              <Text style={styles.secondaryButtonText}>Back to Settings</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  content: {
    padding: 24,
    alignItems: "center",
  },
  iconContainer: {
    marginTop: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
  benefitsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  benefitText: {
    fontSize: 15,
    color: "#333",
  },
  processCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    marginBottom: 32,
  },
  processTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 16,
  },
  processStep: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  stepText: {
    fontSize: 15,
    color: "#333",
    flex: 1,
  },
  tipsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    marginBottom: 32,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  tipItem: {
    fontSize: 15,
    color: "#666",
    marginBottom: 8,
  },
  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#667eea",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: "100%",
    gap: 8,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  secondaryButtonText: {
    color: "#667eea",
    fontSize: 16,
    fontWeight: "600",
  },
  verifiedContainer: {
    flex: 1,
    alignItems: "center",
    padding: 24,
  },
  verifiedBadge: {
    marginTop: 40,
    marginBottom: 24,
  },
  verifiedTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  verifiedSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
  },
});
