import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  RefreshControl,
} from "react-native";
import { Text, Card, Divider, ActivityIndicator } from "react-native-paper";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import { getListingReviews, getListingReviewSummary } from "@enatbet/firebase";
import type { Review, ReviewSummary } from "@enatbet/shared";

type ViewReviewsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ViewReviews">;
  route: RouteProp<RootStackParamList, "ViewReviews">;
};

const StarDisplay: React.FC<{ rating: number; size?: number }> = ({
  rating,
  size = 16,
}) => {
  return (
    <View style={styles.starDisplay}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Text key={star} style={[styles.starIcon, { fontSize: size }]}>
          {star <= rating ? "★" : "☆"}
        </Text>
      ))}
    </View>
  );
};

const RatingSummaryBar: React.FC<{ label: string; rating: number }> = ({
  label,
  rating,
}) => {
  const percentage = (rating / 5) * 100;
  return (
    <View style={styles.ratingBar}>
      <Text style={styles.ratingBarLabel}>{label}</Text>
      <View style={styles.ratingBarTrack}>
        <View style={[styles.ratingBarFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.ratingBarValue}>{rating.toFixed(1)}</Text>
    </View>
  );
};

const ReviewCard: React.FC<{ review: Review }> = ({ review }) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  return (
    <Card style={styles.reviewCard}>
      <Card.Content>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewerInfo}>
            <View style={styles.reviewerAvatar}>
              <Text style={styles.reviewerInitial}>G</Text>
            </View>
            <View>
              <Text style={styles.reviewerName}>Guest</Text>
              <Text style={styles.reviewDate}>{formatDate(review.createdAt)}</Text>
            </View>
          </View>
          <StarDisplay rating={review.rating} />
        </View>

        <Text style={styles.reviewComment}>{review.comment}</Text>

        {/* Category Ratings */}
        <View style={styles.categoryRatings}>
          <View style={styles.categoryRatingItem}>
            <Text style={styles.categoryLabel}>Cleanliness</Text>
            <Text style={styles.categoryValue}>{review.cleanliness}</Text>
          </View>
          <View style={styles.categoryRatingItem}>
            <Text style={styles.categoryLabel}>Accuracy</Text>
            <Text style={styles.categoryValue}>{review.accuracy}</Text>
          </View>
          <View style={styles.categoryRatingItem}>
            <Text style={styles.categoryLabel}>Communication</Text>
            <Text style={styles.categoryValue}>{review.communication}</Text>
          </View>
          <View style={styles.categoryRatingItem}>
            <Text style={styles.categoryLabel}>Location</Text>
            <Text style={styles.categoryValue}>{review.location}</Text>
          </View>
          <View style={styles.categoryRatingItem}>
            <Text style={styles.categoryLabel}>Value</Text>
            <Text style={styles.categoryValue}>{review.value}</Text>
          </View>
        </View>

        {/* Host Response */}
        {review.response && (
          <View style={styles.hostResponse}>
            <Text style={styles.hostResponseLabel}>Host Response:</Text>
            <Text style={styles.hostResponseText}>{review.response.text}</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

export const ViewReviewsScreen: React.FC<ViewReviewsScreenProps> = ({
  navigation,
  route,
}) => {
  const { listingId, listingTitle } = route.params;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [reviewsData, summaryData] = await Promise.all([
        getListingReviews(listingId),
        getListingReviewSummary(listingId),
      ]);
      setReviews(reviewsData);
      setSummary(summaryData);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load reviews");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [listingId]);

  const renderHeader = () => {
    if (!summary) return null;

    return (
      <View style={styles.summaryContainer}>
        {/* Overall Rating */}
        <View style={styles.overallRating}>
          <Text style={styles.overallRatingValue}>
            {summary.averageRating.toFixed(1)}
          </Text>
          <StarDisplay rating={Math.round(summary.averageRating)} size={24} />
          <Text style={styles.totalReviews}>
            {summary.totalReviews} {summary.totalReviews === 1 ? "review" : "reviews"}
          </Text>
        </View>

        <Divider style={styles.divider} />

        {/* Category Breakdown */}
        <View style={styles.ratingsBreakdown}>
          <RatingSummaryBar label="Cleanliness" rating={summary.cleanliness} />
          <RatingSummaryBar label="Accuracy" rating={summary.accuracy} />
          <RatingSummaryBar label="Communication" rating={summary.communication} />
          <RatingSummaryBar label="Location" rating={summary.location} />
          <RatingSummaryBar label="Value" rating={summary.value} />
        </View>

        <Divider style={styles.divider} />
        
        <Text style={styles.reviewsTitle}>All Reviews</Text>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📝</Text>
      <Text style={styles.emptyTitle}>No Reviews Yet</Text>
      <Text style={styles.emptyText}>
        Be the first to review this property!
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading reviews...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ReviewCard review={item} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadReviews(true)}
            colors={["#6366F1"]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F9FAFB",
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    color: "#DC2626",
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 24,
  },
  summaryContainer: {
    backgroundColor: "#fff",
    padding: 20,
    marginBottom: 12,
  },
  overallRating: {
    alignItems: "center",
    paddingVertical: 16,
  },
  overallRatingValue: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#111827",
  },
  starDisplay: {
    flexDirection: "row",
    marginVertical: 8,
  },
  starIcon: {
    color: "#F59E0B",
  },
  totalReviews: {
    color: "#6B7280",
    fontSize: 14,
  },
  divider: {
    marginVertical: 16,
  },
  ratingsBreakdown: {
    gap: 12,
  },
  ratingBar: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingBarLabel: {
    width: 100,
    fontSize: 14,
    color: "#4B5563",
  },
  ratingBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginHorizontal: 12,
  },
  ratingBarFill: {
    height: "100%",
    backgroundColor: "#6366F1",
    borderRadius: 4,
  },
  ratingBarValue: {
    width: 30,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  reviewCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  reviewerInitial: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  reviewDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  reviewComment: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
    marginBottom: 16,
  },
  categoryRatings: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryRatingItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginRight: 4,
  },
  categoryValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  hostResponse: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#F0F9FF",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#6366F1",
  },
  hostResponseLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6366F1",
    marginBottom: 4,
  },
  hostResponseText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 48,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
});

export default ViewReviewsScreen;
