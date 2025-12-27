import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Linking,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "../../lib/firebase";

type RouteParams = {
  TripDetails: {
    bookingId: string;
  };
};

interface Booking {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPhoto: string;
  listingAddress: string;
  hostId: string;
  hostName: string;
  hostPhoto: string;
  hostPhone?: string;
  guestId: string;
  guestName: string;
  guestCount: number;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  pricePerNight: number;
  cleaningFee: number;
  serviceFee: number;
  totalPrice: number;
  currency: "USD" | "ETB";
  status: "pending" | "confirmed" | "active" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "refunded";
  paymentMethod: string;
  specialRequests?: string;
  confirmationCode: string;
  createdAt: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}

export default function TripDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, "TripDetails">>();
  const { bookingId } = route.params;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const bookingDoc = await getDoc(doc(db, "bookings", bookingId));

      if (bookingDoc.exists()) {
        const data = bookingDoc.data();
        setBooking({
          id: bookingDoc.id,
          listingId: data.listingId,
          listingTitle: data.listingTitle || "Property",
          listingPhoto: data.listingPhoto || "",
          listingAddress: data.listingAddress || "",
          hostId: data.hostId,
          hostName: data.hostName || "Host",
          hostPhoto: data.hostPhoto || "",
          hostPhone: data.hostPhone,
          guestId: data.guestId,
          guestName: data.guestName || "Guest",
          guestCount: data.guestCount || 1,
          checkIn: data.checkIn?.toDate() || new Date(),
          checkOut: data.checkOut?.toDate() || new Date(),
          nights: data.nights || 1,
          pricePerNight: data.pricePerNight || 0,
          cleaningFee: data.cleaningFee || 0,
          serviceFee: data.serviceFee || 0,
          totalPrice: data.totalPrice || 0,
          currency: data.currency || "USD",
          status: data.status || "pending",
          paymentStatus: data.paymentStatus || "pending",
          paymentMethod: data.paymentMethod || "Card",
          specialRequests: data.specialRequests,
          confirmationCode: data.confirmationCode || bookingDoc.id.slice(0, 8).toUpperCase(),
          createdAt: data.createdAt?.toDate() || new Date(),
          cancelledAt: data.cancelledAt?.toDate(),
          cancellationReason: data.cancellationReason,
        });
      } else {
        Alert.alert("Error", "Booking not found");
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
      Alert.alert("Error", "Failed to load booking details");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date, includeDay: boolean = true) => {
    const options: Intl.DateTimeFormatOptions = includeDay
      ? { weekday: "short", month: "short", day: "numeric", year: "numeric" }
      : { month: "short", day: "numeric", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatCurrency = (amount: number) => {
    if (booking?.currency === "ETB") {
      return `${amount.toLocaleString()} ETB`;
    }
    return `$${amount.toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
      case "active":
        return "#10B981";
      case "pending":
        return "#F59E0B";
      case "completed":
        return "#6B7280";
      case "cancelled":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmed";
      case "active":
        return "Currently Active";
      case "pending":
        return "Pending Confirmation";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Paid";
      case "pending":
        return "Payment Pending";
      case "refunded":
        return "Refunded";
      default:
        return status;
    }
  };

  const canCancel = () => {
    if (!booking) return false;
    if (booking.status === "cancelled" || booking.status === "completed") return false;
    // Can cancel up to 24 hours before check-in
    const now = new Date();
    const checkIn = new Date(booking.checkIn);
    const hoursUntilCheckIn = (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilCheckIn > 24;
  };

  const canReview = () => {
    if (!booking) return false;
    return booking.status === "completed";
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel Booking",
      "Are you sure you want to cancel this booking? Cancellation fees may apply based on the cancellation policy.",
      [
        { text: "Keep Booking", style: "cancel" },
        {
          text: "Cancel Booking",
          style: "destructive",
          onPress: () => confirmCancellation(),
        },
      ]
    );
  };

  const confirmCancellation = async () => {
    setCancelling(true);
    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: "cancelled",
        cancelledAt: serverTimestamp(),
        cancellationReason: "Cancelled by guest",
        updatedAt: serverTimestamp(),
      });

      Alert.alert(
        "Booking Cancelled",
        "Your booking has been cancelled. Any applicable refund will be processed within 5-10 business days.",
        [{ text: "OK", onPress: () => fetchBooking() }]
      );
    } catch (error) {
      console.error("Error cancelling booking:", error);
      Alert.alert("Error", "Failed to cancel booking. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  const handleContactHost = () => {
    if (!booking) return;

    Alert.alert("Contact Host", "How would you like to contact the host?", [
      {
        text: "Message",
        onPress: () =>
          navigation.navigate("Chat" as never, {
            recipientId: booking.hostId,
            recipientName: booking.hostName,
            bookingId: booking.id,
          } as never),
      },
      {
        text: "Call",
        onPress: () => {
          if (booking.hostPhone) {
            Linking.openURL(`tel:${booking.hostPhone}`);
          } else {
            Alert.alert("Phone Unavailable", "Host phone number is not available. Please use the message option.");
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleShare = async () => {
    if (!booking) return;

    try {
      await Share.share({
        message: `Check out my upcoming trip to ${booking.listingTitle}!\n\nDates: ${formatDate(booking.checkIn, false)} - ${formatDate(booking.checkOut, false)}\nLocation: ${booking.listingAddress}\n\nBooked on Enatbet - Homes for the Diaspora`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleGetDirections = () => {
    if (!booking?.listingAddress) return;

    const address = encodeURIComponent(booking.listingAddress);
    const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
    Linking.openURL(url);
  };

  const handleWriteReview = () => {
    if (!booking) return;
    navigation.navigate("WriteReview" as never, {
      bookingId: booking.id,
      listingId: booking.listingId,
      hostId: booking.hostId,
    } as never);
  };

  const handleViewListing = () => {
    if (!booking) return;
    navigation.navigate("PropertyDetails" as never, {
      listingId: booking.listingId,
    } as never);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4A373" />
          <Text style={styles.loadingText}>Loading booking details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Booking not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Details</Text>
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        <View
          style={[
            styles.statusBanner,
            { backgroundColor: `${getStatusColor(booking.status)}15` },
          ]}
        >
          <Ionicons
            name={
              booking.status === "confirmed" || booking.status === "active"
                ? "checkmark-circle"
                : booking.status === "cancelled"
                ? "close-circle"
                : "time"
            }
            size={24}
            color={getStatusColor(booking.status)}
          />
          <View style={styles.statusInfo}>
            <Text
              style={[styles.statusText, { color: getStatusColor(booking.status) }]}
            >
              {getStatusLabel(booking.status)}
            </Text>
            <Text style={styles.confirmationCode}>
              Confirmation: {booking.confirmationCode}
            </Text>
          </View>
        </View>

        {/* Property Card */}
        <TouchableOpacity style={styles.propertyCard} onPress={handleViewListing}>
          <Image
            source={{
              uri: booking.listingPhoto || "https://via.placeholder.com/300x200",
            }}
            style={styles.propertyImage}
          />
          <View style={styles.propertyInfo}>
            <Text style={styles.propertyTitle} numberOfLines={2}>
              {booking.listingTitle}
            </Text>
            <View style={styles.propertyLocation}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.propertyAddress} numberOfLines={1}>
                {booking.listingAddress || "Address provided after booking"}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#CCC" />
        </TouchableOpacity>

        {/* Dates Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dates</Text>
          <View style={styles.datesRow}>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Check-in</Text>
              <Text style={styles.dateValue}>{formatDate(booking.checkIn)}</Text>
              <Text style={styles.dateTime}>After 3:00 PM</Text>
            </View>
            <View style={styles.dateDivider}>
              <Ionicons name="arrow-forward" size={20} color="#CCC" />
              <Text style={styles.nightsCount}>{booking.nights} nights</Text>
            </View>
            <View style={styles.dateItem}>
              <Text style={styles.dateLabel}>Check-out</Text>
              <Text style={styles.dateValue}>{formatDate(booking.checkOut)}</Text>
              <Text style={styles.dateTime}>Before 11:00 AM</Text>
            </View>
          </View>
        </View>

        {/* Guests Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guests</Text>
          <View style={styles.guestsRow}>
            <Ionicons name="people-outline" size={22} color="#666" />
            <Text style={styles.guestsText}>
              {booking.guestCount} {booking.guestCount === 1 ? "guest" : "guests"}
            </Text>
          </View>
          {booking.specialRequests && (
            <View style={styles.specialRequests}>
              <Text style={styles.specialRequestsLabel}>Special Requests:</Text>
              <Text style={styles.specialRequestsText}>
                {booking.specialRequests}
              </Text>
            </View>
          )}
        </View>

        {/* Host Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Host</Text>
          <View style={styles.hostCard}>
            <Image
              source={{
                uri: booking.hostPhoto || "https://via.placeholder.com/100",
              }}
              style={styles.hostPhoto}
            />
            <View style={styles.hostInfo}>
              <Text style={styles.hostName}>{booking.hostName}</Text>
              <Text style={styles.hostLabel}>Host</Text>
            </View>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={handleContactHost}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#D4A373" />
              <Text style={styles.contactButtonText}>Contact</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Payment</Text>
            <View
              style={[
                styles.paymentBadge,
                {
                  backgroundColor:
                    booking.paymentStatus === "paid" ? "#10B98115" : "#F59E0B15",
                },
              ]}
            >
              <Text
                style={[
                  styles.paymentBadgeText,
                  {
                    color:
                      booking.paymentStatus === "paid" ? "#10B981" : "#F59E0B",
                  },
                ]}
              >
                {getPaymentStatusLabel(booking.paymentStatus)}
              </Text>
            </View>
          </View>

          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                {formatCurrency(booking.pricePerNight)} × {booking.nights} nights
              </Text>
              <Text style={styles.priceValue}>
                {formatCurrency(booking.pricePerNight * booking.nights)}
              </Text>
            </View>
            {booking.cleaningFee > 0 && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Cleaning fee</Text>
                <Text style={styles.priceValue}>
                  {formatCurrency(booking.cleaningFee)}
                </Text>
              </View>
            )}
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service fee</Text>
              <Text style={styles.priceValue}>
                {formatCurrency(booking.serviceFee)}
              </Text>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                {formatCurrency(booking.totalPrice)}
              </Text>
            </View>
          </View>

          <View style={styles.paymentMethod}>
            <Ionicons name="card-outline" size={20} color="#666" />
            <Text style={styles.paymentMethodText}>{booking.paymentMethod}</Text>
          </View>
        </View>

        {/* Address Section (only show if confirmed) */}
        {(booking.status === "confirmed" || booking.status === "active") && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address</Text>
            <View style={styles.addressCard}>
              <Text style={styles.addressText}>{booking.listingAddress}</Text>
              <TouchableOpacity
                style={styles.directionsButton}
                onPress={handleGetDirections}
              >
                <Ionicons name="navigate-outline" size={20} color="#FFF" />
                <Text style={styles.directionsButtonText}>Get Directions</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Cancellation Info */}
        {booking.status === "cancelled" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cancellation Details</Text>
            <View style={styles.cancellationCard}>
              <Text style={styles.cancellationDate}>
                Cancelled on {formatDate(booking.cancelledAt || new Date())}
              </Text>
              {booking.cancellationReason && (
                <Text style={styles.cancellationReason}>
                  Reason: {booking.cancellationReason}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          {canReview() && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleWriteReview}
            >
              <Ionicons name="star-outline" size={22} color="#D4A373" />
              <Text style={styles.actionButtonText}>Write a Review</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.actionButton} onPress={handleViewListing}>
            <Ionicons name="home-outline" size={22} color="#D4A373" />
            <Text style={styles.actionButtonText}>View Listing</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              Linking.openURL("mailto:support@enatbet.app?subject=Help with Booking " + booking.confirmationCode)
            }
          >
            <Ionicons name="help-circle-outline" size={22} color="#D4A373" />
            <Text style={styles.actionButtonText}>Get Help</Text>
          </TouchableOpacity>

          {canCancel() && (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <>
                  <Ionicons name="close-circle-outline" size={22} color="#EF4444" />
                  <Text style={[styles.actionButtonText, styles.cancelButtonText]}>
                    Cancel Booking
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Booking Info Footer */}
        <View style={styles.bookingFooter}>
          <Text style={styles.bookingFooterText}>
            Booked on {formatDate(booking.createdAt)}
          </Text>
          <Text style={styles.bookingFooterText}>
            Booking ID: {booking.id}
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#EF4444",
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
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    margin: 16,
    borderRadius: 12,
    gap: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
  },
  confirmationCode: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  propertyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  propertyImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  propertyLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  propertyAddress: {
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
  },
  section: {
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  datesRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateItem: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  dateValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 4,
  },
  dateTime: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 2,
  },
  dateDivider: {
    alignItems: "center",
    paddingHorizontal: 12,
  },
  nightsCount: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  guestsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  guestsText: {
    fontSize: 15,
    color: "#1F2937",
  },
  specialRequests: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  specialRequestsLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
  },
  specialRequestsText: {
    fontSize: 14,
    color: "#1F2937",
  },
  hostCard: {
    flexDirection: "row",
    alignItems: "center",
  },
  hostPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  hostInfo: {
    flex: 1,
    marginLeft: 12,
  },
  hostName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  hostLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D4A373",
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#D4A373",
  },
  paymentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  paymentBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  priceBreakdown: {
    gap: 12,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priceLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  priceValue: {
    fontSize: 14,
    color: "#1F2937",
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  paymentMethodText: {
    fontSize: 14,
    color: "#6B7280",
  },
  addressCard: {
    gap: 12,
  },
  addressText: {
    fontSize: 15,
    color: "#1F2937",
    lineHeight: 22,
  },
  directionsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#D4A373",
    paddingVertical: 12,
    borderRadius: 10,
  },
  directionsButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFF",
  },
  cancellationCard: {
    backgroundColor: "#FEF2F2",
    padding: 14,
    borderRadius: 10,
  },
  cancellationDate: {
    fontSize: 14,
    color: "#991B1B",
    fontWeight: "500",
  },
  cancellationReason: {
    fontSize: 14,
    color: "#991B1B",
    marginTop: 4,
  },
  actionsSection: {
    marginHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1F2937",
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#FEE2E2",
    backgroundColor: "#FEF2F2",
  },
  cancelButtonText: {
    color: "#EF4444",
  },
  bookingFooter: {
    alignItems: "center",
    marginTop: 24,
    gap: 4,
  },
  bookingFooterText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
});
