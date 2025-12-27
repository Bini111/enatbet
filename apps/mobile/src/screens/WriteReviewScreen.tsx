import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import { useAuthStore } from "../store/authStore";
import { createReview } from "@enatbet/firebase";

type WriteReviewScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "WriteReview">;
  route: RouteProp<RootStackParamList, "WriteReview">;
};

interface RatingCategory {
  key: string;
  label: string;
  value: number;
}

const StarRating: React.FC<{
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: number;
}> = ({ rating, onRatingChange, size = 32 }) => {
  return (
    <View style={styles.starContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => onRatingChange(star)}
          activeOpacity={0.7}
        >
          <Text style={[styles.star, { fontSize: size }]}>
            {star <= rating ? "★" : "☆"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export const WriteReviewScreen: React.FC<WriteReviewScreenProps> = ({
  navigation,
  route,
}) => {
  const { bookingId, listingId, listingTitle } = route.params;
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comment, setComment] = useState("");
  const [ratings, setRatings] = useState<RatingCategory[]>([
    { key: "overall", label: "Overall Rating", value: 0 },
    { key: "cleanliness", label: "Cleanliness", value: 0 },
    { key: "accuracy", label: "Accuracy", value: 0 },
    { key: "communication", label: "Communication", value: 0 },
    { key: "location", label: "Location", value: 0 },
    { key: "value", label: "Value", value: 0 },
  ]);

  const updateRating = (key: string, value: number) => {
    setRatings((prev) =>
      prev.map((r) => (r.key === key ? { ...r, value } : r))
    );
  };

  const getRating = (key: string): number => {
    return ratings.find((r) => r.key === key)?.value || 0;
  };

  const validateReview = (): boolean => {
    const overallRating = getRating("overall");
    if (overallRating === 0) {
      Alert.alert("Rating Required", "Please provide an overall rating.");
      return false;
    }

    const allRated = ratings.every((r) => r.value > 0);
    if (!allRated) {
      Alert.alert(
        "Ratings Required",
        "Please rate all categories before submitting."
      );
      return false;
    }

    if (comment.trim().length < 10) {
      Alert.alert(
        "Review Required",
        "Please write at least 10 characters in your review."
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Sign In Required", "Please sign in to leave a review.");
      return;
    }

    if (!validateReview()) return;

    setIsSubmitting(true);
    try {
      await createReview({
        listingId,
        bookingId,
        rating: getRating("overall"),
        comment: comment.trim(),
        cleanliness: getRating("cleanliness"),
        accuracy: getRating("accuracy"),
        communication: getRating("communication"),
        location: getRating("location"),
        value: getRating("value"),
      });

      Alert.alert(
        "Review Submitted! 🎉",
        "Thank you for sharing your experience. Your review helps our community!",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.error("Review submission error:", error);
      Alert.alert(
        "Submission Failed",
        error.message || "Failed to submit review. Please try again."
      );
    } finally {
      setIsSubmitting(false);
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
          <Text style={styles.headerTitle}>Write a Review</Text>
          <Text style={styles.listingTitle}>{listingTitle}</Text>
        </View>

        {/* Overall Rating */}
        <View style={styles.overallSection}>
          <Text style={styles.overallLabel}>Overall Rating</Text>
          <StarRating
            rating={getRating("overall")}
            onRatingChange={(value) => updateRating("overall", value)}
            size={40}
          />
          <Text style={styles.ratingHint}>
            {getRating("overall") === 0
              ? "Tap to rate"
              : getRating("overall") === 5
              ? "Excellent!"
              : getRating("overall") >= 4
              ? "Great!"
              : getRating("overall") >= 3
              ? "Good"
              : getRating("overall") >= 2
              ? "Fair"
              : "Poor"}
          </Text>
        </View>

        {/* Category Ratings */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Rate Your Experience</Text>
          {ratings
            .filter((r) => r.key !== "overall")
            .map((category) => (
              <View key={category.key} style={styles.categoryRow}>
                <Text style={styles.categoryLabel}>{category.label}</Text>
                <StarRating
                  rating={category.value}
                  onRatingChange={(value) => updateRating(category.key, value)}
                  size={24}
                />
              </View>
            ))}
        </View>

        {/* Review Text */}
        <View style={styles.reviewSection}>
          <Text style={styles.sectionTitle}>Your Review</Text>
          <Text style={styles.reviewHint}>
            Share your experience to help other guests and the host
          </Text>
          <TextInput
            value={comment}
            onChangeText={setComment}
            mode="outlined"
            multiline
            numberOfLines={6}
            placeholder="What did you like about your stay? Was the property as described? How was communication with the host?"
            style={styles.reviewInput}
            maxLength={1000}
          />
          <Text style={styles.charCount}>{comment.length}/1000</Text>
        </View>

        {/* Guidelines */}
        <View style={styles.guidelinesSection}>
          <Text style={styles.guidelinesTitle}>Review Guidelines</Text>
          <Text style={styles.guidelineItem}>✓ Be honest and fair</Text>
          <Text style={styles.guidelineItem}>✓ Focus on your experience</Text>
          <Text style={styles.guidelineItem}>✓ Be respectful</Text>
          <Text style={styles.guidelineItem}>✓ Avoid personal information</Text>
        </View>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.submitButton}
            buttonColor="#6366F1"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>

          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
            textColor="#6B7280"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: "#6366F1",
    padding: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  listingTitle: {
    fontSize: 14,
    color: "#E0E7FF",
    textAlign: "center",
  },
  overallSection: {
    backgroundColor: "#fff",
    padding: 24,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  overallLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  starContainer: {
    flexDirection: "row",
    gap: 8,
  },
  star: {
    color: "#F59E0B",
  },
  ratingHint: {
    marginTop: 8,
    fontSize: 14,
    color: "#6B7280",
  },
  categoriesSection: {
    backgroundColor: "#fff",
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  categoryLabel: {
    fontSize: 14,
    color: "#4B5563",
  },
  reviewSection: {
    backgroundColor: "#fff",
    padding: 16,
    marginTop: 12,
  },
  reviewHint: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  reviewInput: {
    backgroundColor: "#fff",
    minHeight: 120,
  },
  charCount: {
    textAlign: "right",
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 4,
  },
  guidelinesSection: {
    padding: 16,
    backgroundColor: "#F0FDF4",
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#166534",
    marginBottom: 8,
  },
  guidelineItem: {
    fontSize: 13,
    color: "#166534",
    marginBottom: 4,
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
  },
  submitButton: {
    paddingVertical: 6,
  },
  cancelButton: {
    paddingVertical: 6,
    borderColor: "#D1D5DB",
  },
});

export default WriteReviewScreen;
