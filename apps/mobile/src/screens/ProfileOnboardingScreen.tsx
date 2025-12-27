import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { doc, updateDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { db, auth, storage } from "../../lib/firebase";
import { useAuthStore } from "../store/authStore";

type Step = "welcome" | "photo" | "info" | "done";

export default function ProfileOnboardingScreen() {
  const navigation = useNavigation();
  const { user, refreshUser } = useAuthStore();
  const [step, setStep] = useState<Step>("welcome");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      await uploadPhoto(result.assets[0].uri);
    }
  };

  const uploadPhoto = async (uri: string) => {
    if (!auth.currentUser) return;

    setUploadingPhoto(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `profile-photos/${auth.currentUser.uid}.jpg`;
      const storageRef = ref(storage, filename);

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);
      setPhotoUrl(downloadURL);

      // Update Auth profile
      await updateProfile(auth.currentUser, { photoURL: downloadURL });

      // Update Firestore
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        photoURL: downloadURL,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error uploading photo:", error);
      Alert.alert("Error", "Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveInfo = async () => {
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      const updates: any = {
        updatedAt: Timestamp.now(),
        onboardingCompleted: true,
      };

      if (phone) updates.phone = phone;
      if (dateOfBirth) updates.dateOfBirth = dateOfBirth;

      await updateDoc(doc(db, "users", auth.currentUser.uid), updates);
      await refreshUser();
      setStep("done");
    } catch (error) {
      console.error("Error saving info:", error);
      Alert.alert("Error", "Failed to save information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: "MainTabs" as never }],
    });
  };

  const handleSkip = () => {
    if (step === "photo") {
      setStep("info");
    } else if (step === "info") {
      handleComplete();
    }
  };

  const renderWelcome = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Text style={styles.welcomeEmoji}>🏠</Text>
      </View>
      <Text style={styles.title}>Welcome to Enatbet!</Text>
      <Text style={styles.subtitle}>
        Let's set up your profile so hosts and guests can get to know you better.
      </Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => setStep("photo")}
      >
        <Text style={styles.primaryButtonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPhoto = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepIndicator}>Step 1 of 2</Text>
      <Text style={styles.title}>Add a Profile Photo</Text>
      <Text style={styles.subtitle}>
        Hosts and guests like to know who they're connecting with.
      </Text>

      <TouchableOpacity style={styles.photoContainer} onPress={pickImage}>
        {uploadingPhoto ? (
          <ActivityIndicator size="large" color="#D4A373" />
        ) : photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Ionicons name="camera" size={40} color="#D4A373" />
            <Text style={styles.photoPlaceholderText}>Tap to add photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.primaryButton, !photoUrl && styles.primaryButtonDisabled]}
        onPress={() => setStep("info")}
        disabled={uploadingPhoto}
      >
        <Text style={styles.primaryButtonText}>
          {photoUrl ? "Continue" : "Add Photo"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipButtonText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );

  const renderInfo = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.stepContainer}>
        <Text style={styles.stepIndicator}>Step 2 of 2</Text>
        <Text style={styles.title}>Personal Information</Text>
        <Text style={styles.subtitle}>
          This helps us verify your identity and personalize your experience.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+1 (555) 123-4567"
            keyboardType="phone-pad"
            autoComplete="tel"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Date of Birth</Text>
          <TextInput
            style={styles.input}
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            placeholder="MM/DD/YYYY"
            keyboardType="numbers-and-punctuation"
          />
          <Text style={styles.inputHint}>
            You must be 18+ to book or host on Enatbet
          </Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleSaveInfo}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Continue</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  const renderDone = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ionicons name="checkmark-circle" size={80} color="#10B981" />
      </View>
      <Text style={styles.title}>You're All Set!</Text>
      <Text style={styles.subtitle}>
        Start exploring unique homes in the Ethiopian & Eritrean diaspora community.
      </Text>
      <TouchableOpacity style={styles.primaryButton} onPress={handleComplete}>
        <Text style={styles.primaryButtonText}>Explore Homes</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {step === "welcome" && renderWelcome()}
      {step === "photo" && renderPhoto()}
      {step === "info" && renderInfo()}
      {step === "done" && renderDone()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  stepIndicator: {
    fontSize: 14,
    color: "#D4A373",
    fontWeight: "600",
    marginBottom: 16,
  },
  iconContainer: {
    marginBottom: 24,
  },
  welcomeEmoji: {
    fontSize: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  photoContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    overflow: "hidden",
    marginBottom: 32,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#FDF8F3",
    borderWidth: 3,
    borderColor: "#D4A373",
    borderStyle: "dashed",
    borderRadius: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: "#D4A373",
    marginTop: 8,
  },
  inputGroup: {
    width: "100%",
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1F2937",
  },
  inputHint: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 6,
  },
  primaryButton: {
    backgroundColor: "#D4A373",
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
  },
  primaryButtonDisabled: {
    backgroundColor: "#E5E7EB",
  },
  primaryButtonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "600",
  },
  skipButton: {
    marginTop: 16,
    padding: 12,
  },
  skipButtonText: {
    color: "#6B7280",
    fontSize: 15,
  },
});
