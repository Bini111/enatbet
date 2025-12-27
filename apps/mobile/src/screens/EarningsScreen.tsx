import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db, auth } from "../../lib/firebase";

interface Earning {
  id: string;
  bookingId: string;
  listingTitle: string;
  guestName: string;
  checkIn: Date;
  checkOut: Date;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  currency: "USD" | "ETB";
  status: "pending" | "available" | "paid";
  paidAt?: Date;
  createdAt: Date;
}

interface Payout {
  id: string;
  amount: number;
  currency: "USD" | "ETB";
  method: "stripe" | "telebirr" | "bank";
  accountInfo: string;
  status: "pending" | "processing" | "completed" | "failed";
  requestedAt: Date;
  completedAt?: Date;
}

interface PayoutSettings {
  preferredMethod: "stripe" | "telebirr" | "bank";
  stripeAccountId?: string;
  telebirrPhone?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
}

const PLATFORM_FEE_PERCENT = 10; // 10% commission

export default function EarningsScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<"earnings" | "payouts">("earnings");
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [payoutSettings, setPayoutSettings] = useState<PayoutSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requestingPayout, setRequestingPayout] = useState(false);

  // Summary stats
  const [stats, setStats] = useState({
    totalEarnings: 0,
    availableBalance: 0,
    pendingBalance: 0,
    paidOut: 0,
    currency: "USD" as "USD" | "ETB",
  });

  const fetchData = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Fetch earnings from bookings
      const earningsQuery = query(
        collection(db, "earnings"),
        where("hostId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const earningsSnap = await getDocs(earningsQuery);
      const earningsData = earningsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        checkIn: doc.data().checkIn?.toDate(),
        checkOut: doc.data().checkOut?.toDate(),
        paidAt: doc.data().paidAt?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Earning[];
      setEarnings(earningsData);

      // Fetch payouts
      const payoutsQuery = query(
        collection(db, "payouts"),
        where("hostId", "==", user.uid),
        orderBy("requestedAt", "desc")
      );
      const payoutsSnap = await getDocs(payoutsQuery);
      const payoutsData = payoutsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        requestedAt: doc.data().requestedAt?.toDate(),
        completedAt: doc.data().completedAt?.toDate(),
      })) as Payout[];
      setPayouts(payoutsData);

      // Fetch payout settings
      const settingsDoc = await getDoc(doc(db, "users", user.uid));
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setPayoutSettings(data.payoutSettings || null);
        
        // Determine currency preference
        const currency = data.payoutSettings?.preferredMethod === "telebirr" ? "ETB" : "USD";
        
        // Calculate stats
        const total = earningsData.reduce((sum, e) => sum + e.netAmount, 0);
        const available = earningsData
          .filter((e) => e.status === "available")
          .reduce((sum, e) => sum + e.netAmount, 0);
        const pending = earningsData
          .filter((e) => e.status === "pending")
          .reduce((sum, e) => sum + e.netAmount, 0);
        const paid = earningsData
          .filter((e) => e.status === "paid")
          .reduce((sum, e) => sum + e.netAmount, 0);

        setStats({
          totalEarnings: total,
          availableBalance: available,
          pendingBalance: pending,
          paidOut: paid,
          currency,
        });
      }
    } catch (error) {
      console.error("Error fetching earnings:", error);
      Alert.alert("Error", "Failed to load earnings data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatCurrency = (amount: number, currency: "USD" | "ETB") => {
    if (currency === "ETB") {
      return `${amount.toLocaleString()} ETB`;
    }
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
      case "completed":
        return "#10B981";
      case "pending":
      case "processing":
        return "#F59E0B";
      case "paid":
        return "#6B7280";
      case "failed":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "available":
        return "Available";
      case "pending":
        return "Pending";
      case "paid":
        return "Paid Out";
      case "processing":
        return "Processing";
      case "completed":
        return "Completed";
      case "failed":
        return "Failed";
      default:
        return status;
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "stripe":
        return "Bank (Stripe)";
      case "telebirr":
        return "TeleBirr";
      case "bank":
        return "Bank Transfer";
      default:
        return method;
    }
  };

  const handleRequestPayout = async () => {
    if (!payoutSettings) {
      Alert.alert(
        "Setup Required",
        "Please set up your payout method in Settings first.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Go to Settings",
            onPress: () => navigation.navigate("Settings" as never),
          },
        ]
      );
      return;
    }

    if (stats.availableBalance < 10) {
      Alert.alert(
        "Minimum Not Met",
        `Minimum payout amount is ${stats.currency === "ETB" ? "500 ETB" : "$10"}. Your available balance is ${formatCurrency(stats.availableBalance, stats.currency)}.`
      );
      return;
    }

    Alert.alert(
      "Request Payout",
      `Request payout of ${formatCurrency(stats.availableBalance, stats.currency)} via ${getMethodLabel(payoutSettings.preferredMethod)}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Request",
          onPress: async () => {
            setRequestingPayout(true);
            try {
              const user = auth.currentUser;
              if (!user) return;

              const accountInfo =
                payoutSettings.preferredMethod === "telebirr"
                  ? payoutSettings.telebirrPhone
                  : payoutSettings.preferredMethod === "stripe"
                  ? payoutSettings.stripeAccountId
                  : `${payoutSettings.bankName} - ${payoutSettings.bankAccountNumber}`;

              await addDoc(collection(db, "payouts"), {
                hostId: user.uid,
                amount: stats.availableBalance,
                currency: stats.currency,
                method: payoutSettings.preferredMethod,
                accountInfo,
                status: "pending",
                requestedAt: serverTimestamp(),
              });

              Alert.alert(
                "Payout Requested",
                "Your payout request has been submitted. It will be processed within 3-5 business days."
              );
              fetchData();
            } catch (error) {
              console.error("Error requesting payout:", error);
              Alert.alert("Error", "Failed to request payout. Please try again.");
            } finally {
              setRequestingPayout(false);
            }
          },
        },
      ]
    );
  };

  const renderEarningItem = (earning: Earning) => (
    <View key={earning.id} style={styles.earningItem}>
      <View style={styles.earningHeader}>
        <Text style={styles.listingTitle} numberOfLines={1}>
          {earning.listingTitle}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor(earning.status)}20` },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(earning.status) }]}
          >
            {getStatusLabel(earning.status)}
          </Text>
        </View>
      </View>

      <Text style={styles.guestName}>Guest: {earning.guestName}</Text>
      <Text style={styles.dates}>
        {formatDate(earning.checkIn)} - {formatDate(earning.checkOut)}
      </Text>

      <View style={styles.earningBreakdown}>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Gross</Text>
          <Text style={styles.breakdownValue}>
            {formatCurrency(earning.grossAmount, earning.currency)}
          </Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>
            Platform Fee ({PLATFORM_FEE_PERCENT}%)
          </Text>
          <Text style={[styles.breakdownValue, { color: "#EF4444" }]}>
            -{formatCurrency(earning.platformFee, earning.currency)}
          </Text>
        </View>
        <View style={[styles.breakdownRow, styles.netRow]}>
          <Text style={styles.netLabel}>Your Earnings</Text>
          <Text style={styles.netValue}>
            {formatCurrency(earning.netAmount, earning.currency)}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderPayoutItem = (payout: Payout) => (
    <View key={payout.id} style={styles.payoutItem}>
      <View style={styles.payoutHeader}>
        <View style={styles.payoutAmount}>
          <Text style={styles.payoutValue}>
            {formatCurrency(payout.amount, payout.currency)}
          </Text>
          <Text style={styles.payoutMethod}>{getMethodLabel(payout.method)}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${getStatusColor(payout.status)}20` },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(payout.status) }]}
          >
            {getStatusLabel(payout.status)}
          </Text>
        </View>
      </View>

      <Text style={styles.payoutAccount}>{payout.accountInfo}</Text>
      <Text style={styles.payoutDate}>
        Requested: {formatDate(payout.requestedAt)}
        {payout.completedAt && ` • Completed: ${formatDate(payout.completedAt)}`}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4A373" />
          <Text style={styles.loadingText}>Loading earnings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(stats.availableBalance, stats.currency)}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatCurrency(stats.pendingBalance, stats.currency)}
              </Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatCurrency(stats.totalEarnings, stats.currency)}
              </Text>
              <Text style={styles.statLabel}>Total Earned</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatCurrency(stats.paidOut, stats.currency)}
              </Text>
              <Text style={styles.statLabel}>Paid Out</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.payoutButton,
              stats.availableBalance < 10 && styles.payoutButtonDisabled,
            ]}
            onPress={handleRequestPayout}
            disabled={requestingPayout || stats.availableBalance < 10}
          >
            {requestingPayout ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Ionicons name="wallet-outline" size={20} color="#FFF" />
                <Text style={styles.payoutButtonText}>Request Payout</Text>
              </>
            )}
          </TouchableOpacity>

          {!payoutSettings && (
            <TouchableOpacity
              style={styles.setupLink}
              onPress={() => navigation.navigate("Settings" as never)}
            >
              <Ionicons name="settings-outline" size={16} color="#D4A373" />
              <Text style={styles.setupLinkText}>Set up payout method</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "earnings" && styles.activeTab]}
            onPress={() => setActiveTab("earnings")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "earnings" && styles.activeTabText,
              ]}
            >
              Earnings ({earnings.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "payouts" && styles.activeTab]}
            onPress={() => setActiveTab("payouts")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "payouts" && styles.activeTabText,
              ]}
            >
              Payouts ({payouts.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeTab === "earnings" ? (
            earnings.length > 0 ? (
              earnings.map(renderEarningItem)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="cash-outline" size={48} color="#CCC" />
                <Text style={styles.emptyTitle}>No earnings yet</Text>
                <Text style={styles.emptyText}>
                  Once guests book your listings, your earnings will appear here.
                </Text>
              </View>
            )
          ) : payouts.length > 0 ? (
            payouts.map(renderPayoutItem)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="wallet-outline" size={48} color="#CCC" />
              <Text style={styles.emptyTitle}>No payouts yet</Text>
              <Text style={styles.emptyText}>
                Request a payout when you have available earnings.
              </Text>
            </View>
          )}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How Payouts Work</Text>
          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={20} color="#6B7280" />
            <Text style={styles.infoText}>
              Earnings become available 24 hours after guest check-in
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="cash-outline" size={20} color="#6B7280" />
            <Text style={styles.infoText}>
              Minimum payout: $10 USD or 500 ETB
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={20} color="#6B7280" />
            <Text style={styles.infoText}>
              Payouts are processed within 3-5 business days
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="card-outline" size={20} color="#6B7280" />
            <Text style={styles.infoText}>
              Platform fee: {PLATFORM_FEE_PERCENT}% per booking
            </Text>
          </View>
        </View>
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
  balanceCard: {
    backgroundColor: "#1F2937",
    margin: 16,
    borderRadius: 16,
    padding: 24,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "700",
    color: "#FFF",
    textAlign: "center",
    marginTop: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#374151",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#374151",
  },
  payoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D4A373",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  payoutButtonDisabled: {
    backgroundColor: "#6B7280",
  },
  payoutButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  setupLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    gap: 6,
  },
  setupLinkText: {
    color: "#D4A373",
    fontSize: 14,
  },
  tabs: {
    flexDirection: "row",
    marginHorizontal: 16,
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "#FFF",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
  },
  activeTabText: {
    color: "#1F2937",
  },
  content: {
    padding: 16,
  },
  earningItem: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  earningHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  listingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  guestName: {
    fontSize: 14,
    color: "#6B7280",
  },
  dates: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 4,
  },
  earningBreakdown: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  breakdownValue: {
    fontSize: 14,
    color: "#1F2937",
  },
  netRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    marginBottom: 0,
  },
  netLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  netValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#10B981",
  },
  payoutItem: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  payoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  payoutAmount: {
    flex: 1,
  },
  payoutValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
  },
  payoutMethod: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  payoutAccount: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 12,
  },
  payoutDate: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 4,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 32,
  },
  infoSection: {
    margin: 16,
    marginTop: 8,
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
  },
});
