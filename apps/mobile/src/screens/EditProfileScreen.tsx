import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile, sendEmailVerification } from "firebase/auth";
import { db, auth, storage } from "../../lib/firebase";
import { useAuthStore } from "../store/authStore";

interface ProfileData {
  displayName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  bio: string;
  location: string;
  photoURL: string;
  languages: string[];
  instagramHandle: string;
  twitterHandle: string;
  website: string;
  isVerified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  idVerified: boolean;
}

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { refreshUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [sendingVerification, setSendingVerification] = useState(false);

  const [profile, setProfile] = useState<ProfileData>({
    displayName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    bio: "",
    location: "",
    photoURL: "",
    languages: [],
    instagramHandle: "",
    twitterHandle: "",
    website: "",
    isVerified: false,
    emailVerified: false,
    phoneVerified: false,
    idVerified: false,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setProfile({
          displayName: data.displayName || user.displayName || "",
          email: data.email || user.email || "",
          phone: data.phone || "",
          dateOfBirth: data.dateOfBirth || "",
          bio: data.bio || "",
          location: data.location || "",
          photoURL: data.photoURL || user.photoURL || "",
          languages: data.languages || [],
          instagramHandle: data.instagramHandle || "",
          twitterHandle: data.twitterHandle || "",
          website: data.website || "",
          isVerified: data.isVerified || false,
          emailVerified: user.emailVerified || false,
          phoneVerified: data.phoneVerified || false,
          idVerified: data.idVerified || false,
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadPhoto(result.assets[0].uri);
    }
  };

  const uploadPhoto = async (uri: string) => {
    const user = auth.currentUser;
    if (!user) return;

    setUploadingPhoto(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `profile-photos/${user.uid}.jpg`;
      const storageRef = ref(storage, filename);

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      await updateProfile(user, { photoURL: downloadURL });
      setProfile((prev) => ({ ...prev, photoURL: downloadURL }));

      Alert.alert("Success", "Profile photo updated!");
    } catch (error) {
      console.error("Error uploading photo:", error);
      Alert.alert("Error", "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    if (!profile.displayName.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    setSaving(true);
    try {
      // Update Auth profile
      await updateProfile(user, {
        displayName: profile.displayName,
        photoURL: profile.photoURL,
      });

      // Update Firestore
      await updateDoc(doc(db, "users", user.uid), {
        displayName: profile.displayName,
        phone: profile.phone,
        dateOfBirth: profile.dateOfBirth,
        bio: profile.bio,
        location: profile.location,
        photoURL: profile.photoURL,
        languages: profile.languages,
        instagramHandle: profile.instagramHandle,
        twitterHandle: profile.twitterHandle,
        website: profile.website,
        updatedAt: Timestamp.now(),
      });

      await refreshUser();
      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSendEmailVerification = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setSendingVerification(true);
    try {
      await sendEmailVerification(user);
      Alert.alert(
        "Verification Email Sent",
        "Please check your inbox and click the verification link."
      );
    } catch (error: any) {
      console.error("Error sending verification:", error);
      if (error.code === "auth/too-many-requests") {
        Alert.alert("Error", "Too many requests. Please try again later.");
      } else {
        Alert.alert("Error", "Failed to send verification email");
      }
    } finally {
      setSendingVerification(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getVerificationStatus = () => {
    const verified = [];
    if (profile.emailVerified) verified.push("Email");
    if (profile.phoneVerified) verified.push("Phone");
    if (profile.idVerified) verified.push("ID");
    return verified;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4A373" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color="#D4A373" />
            ) : (
              <Text style={styles.saveButton}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Photo */}
          <View style={styles.photoSection}>
            <TouchableOpacity onPress={pickImage} disabled={uploadingPhoto}>
              {uploadingPhoto ? (
                <View style={styles.photoPlaceholder}>
                  <ActivityIndicator size="large" color="#D4A373" />
                </View>
              ) : profile.photoURL ? (
                <Image source={{ uri: profile.photoURL }} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoInitials}>
                    {getInitials(profile.displayName || "U")}
                  </Text>
                </View>
              )}
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={18} color="#FFF" />
              </View>
            </TouchableOpacity>
            <Text style={styles.photoHint}>Tap to change photo</Text>
          </View>

          {/* Verification Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Verification</Text>
            <View style={styles.verificationCard}>
              {profile.isVerified ? (
                <View style={styles.verifiedStatus}>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  <View style={styles.verifiedInfo}>
                    <Text style={styles.verifiedTitle}>Verified Profile</Text>
                    <Text style={styles.verifiedSubtitle}>
                      {getVerificationStatus().join(", ")} verified
                    </Text>
                  </View>
                </View>
              ) : (
                <>
                  <Text style={styles.verificationTitle}>
                    Get Verified
                  </Text>
                  <Text style={styles.verificationSubtitle}>
                    Verified profiles build trust with hosts and guests
                  </Text>

                  {/* Email Verification */}
                  <View style={styles.verificationItem}>
                    <View style={styles.verificationLeft}>
                      <Ionicons
                        name={profile.emailVerified ? "checkmark-circle" : "mail-outline"}
                        size={24}
                        color={profile.emailVerified ? "#10B981" : "#6B7280"}
                      />
                      <View>
                        <Text style={styles.verificationItemTitle}>Email</Text>
                        <Text style={styles.verificationItemStatus}>
                          {profile.emailVerified ? "Verified" : "Not verified"}
                        </Text>
                      </View>
                    </View>
                    {!profile.emailVerified && (
                      <TouchableOpacity
                        style={styles.verifyButton}
                        onPress={handleSendEmailVerification}
                        disabled={sendingVerification}
                      >
                        {sendingVerification ? (
                          <ActivityIndicator size="small" color="#D4A373" />
                        ) : (
                          <Text style={styles.verifyButtonText}>Verify</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Phone Verification */}
                  <View style={styles.verificationItem}>
                    <View style={styles.verificationLeft}>
                      <Ionicons
                        name={profile.phoneVerified ? "checkmark-circle" : "call-outline"}
                        size={24}
                        color={profile.phoneVerified ? "#10B981" : "#6B7280"}
                      />
                      <View>
                        <Text style={styles.verificationItemTitle}>Phone</Text>
                        <Text style={styles.verificationItemStatus}>
                          {profile.phoneVerified ? "Verified" : "Not verified"}
                        </Text>
                      </View>
                    </View>
                    {!profile.phoneVerified && (
                      <TouchableOpacity
                        style={styles.verifyButton}
                        onPress={() => Alert.alert("Coming Soon", "Phone verification will be available soon.")}
                      >
                        <Text style={styles.verifyButtonText}>Verify</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* ID Verification */}
                  <View style={styles.verificationItem}>
                    <View style={styles.verificationLeft}>
                      <Ionicons
                        name={profile.idVerified ? "checkmark-circle" : "id-card-outline"}
                        size={24}
                        color={profile.idVerified ? "#10B981" : "#6B7280"}
                      />
                      <View>
                        <Text style={styles.verificationItemTitle}>Government ID</Text>
                        <Text style={styles.verificationItemStatus}>
                          {profile.idVerified ? "Verified" : "Not verified"}
                        </Text>
                      </View>
                    </View>
                    {!profile.idVerified && (
                      <TouchableOpacity
                        style={styles.verifyButton}
                        onPress={() => Alert.alert("Coming Soon", "ID verification will be available soon.")}
                      >
                        <Text style={styles.verifyButtonText}>Verify</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Info</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={profile.displayName}
                onChangeText={(text) =>
                  setProfile((prev) => ({ ...prev, displayName: text }))
                }
                placeholder="Enter your name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={profile.email}
                editable={false}
              />
              <Text style={styles.inputHint}>Email cannot be changed</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone</Text>
              <TextInput
                style={styles.input}
                value={profile.phone}
                onChangeText={(text) =>
                  setProfile((prev) => ({ ...prev, phone: text }))
                }
                placeholder="+1 (555) 123-4567"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date of Birth</Text>
              <TextInput
                style={styles.input}
                value={profile.dateOfBirth}
                onChangeText={(text) =>
                  setProfile((prev) => ({ ...prev, dateOfBirth: text }))
                }
                placeholder="MM/DD/YYYY"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.input}
                value={profile.location}
                onChangeText={(text) =>
                  setProfile((prev) => ({ ...prev, location: text }))
                }
                placeholder="City, Country"
              />
            </View>
          </View>

          {/* About */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={profile.bio}
                onChangeText={(text) =>
                  setProfile((prev) => ({ ...prev, bio: text }))
                }
                placeholder="Tell hosts and guests about yourself..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.charCount}>{profile.bio.length}/500</Text>
            </View>
          </View>

          {/* Social Links */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Social Links</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Instagram</Text>
              <View style={styles.socialInput}>
                <Text style={styles.socialPrefix}>@</Text>
                <TextInput
                  style={styles.socialTextInput}
                  value={profile.instagramHandle}
                  onChangeText={(text) =>
                    setProfile((prev) => ({ ...prev, instagramHandle: text }))
                  }
                  placeholder="username"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Twitter / X</Text>
              <View style={styles.socialInput}>
                <Text style={styles.socialPrefix}>@</Text>
                <TextInput
                  style={styles.socialTextInput}
                  value={profile.twitterHandle}
                  onChangeText={(text) =>
                    setProfile((prev) => ({ ...prev, twitterHandle: text }))
                  }
                  placeholder="username"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Website</Text>
              <TextInput
                style={styles.input}
                value={profile.website}
                onChangeText={(text) =>
                  setProfile((prev) => ({ ...prev, website: text }))
                }
                placeholder="https://yourwebsite.com"
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#D4A373",
  },
  photoSection: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#FFF",
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#D4A373",
    alignItems: "center",
    justifyContent: "center",
  },
  photoInitials: {
    fontSize: 40,
    fontWeight: "600",
    color: "#FFF",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#1F2937",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFF",
  },
  photoHint: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 12,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginLeft: 16,
    marginBottom: 8,
  },
  verificationCard: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
  },
  verifiedStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  verifiedInfo: {
    flex: 1,
  },
  verifiedTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10B981",
  },
  verifiedSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  verificationSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 16,
  },
  verificationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  verificationLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  verificationItemTitle: {
    fontSize: 15,
    color: "#1F2937",
  },
  verificationItemStatus: {
    fontSize: 13,
    color: "#6B7280",
  },
  verifyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D4A373",
  },
  verifyButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#D4A373",
  },
  inputGroup: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  inputLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 6,
  },
  input: {
    fontSize: 16,
    color: "#1F2937",
    padding: 0,
  },
  inputDisabled: {
    color: "#9CA3AF",
  },
  inputHint: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "right",
    marginTop: 4,
  },
  socialInput: {
    flexDirection: "row",
    alignItems: "center",
  },
  socialPrefix: {
    fontSize: 16,
    color: "#6B7280",
    marginRight: 4,
  },
  socialTextInput: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
    padding: 0,
  },
});
