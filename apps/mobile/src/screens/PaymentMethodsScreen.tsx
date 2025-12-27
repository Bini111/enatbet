import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useAuthStore } from "../store/authStore";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface PaymentMethod {
  id: string;
  type: "card" | "bank";
  brand?: string;
  last4: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
}

export default function PaymentMethodsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setStripeCustomerId(data.stripeCustomerId || null);
        
        // Fetch payment methods from Stripe via your backend
        // For now, showing placeholder data structure
        if (data.paymentMethods) {
          setPaymentMethods(data.paymentMethods);
        }
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = () => {
    Alert.alert(
      "Add Payment Method",
      "This will redirect you to add a new payment method via Stripe.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Continue", 
          onPress: () => {
            // TODO: Implement Stripe payment method addition
            Alert.alert("Coming Soon", "Payment method addition will be available soon.");
          }
        },
      ]
    );
  };

  const handleSetDefault = (methodId: string) => {
    Alert.alert(
      "Set as Default",
      "Make this your default payment method?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Set Default",
          onPress: async () => {
            try {
              const updated = paymentMethods.map(pm => ({
                ...pm,
                isDefault: pm.id === methodId,
              }));
              setPaymentMethods(updated);
              
              if (user?.uid) {
                await updateDoc(doc(db, "users", user.uid), {
                  paymentMethods: updated,
                });
              }
            } catch (error) {
              console.error("Error setting default:", error);
              Alert.alert("Error", "Failed to update default payment method.");
            }
          },
        },
      ]
    );
  };

  const handleRemovePaymentMethod = (methodId: string) => {
    Alert.alert(
      "Remove Payment Method",
      "Are you sure you want to remove this payment method?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const updated = paymentMethods.filter(pm => pm.id !== methodId);
              setPaymentMethods(updated);
              
              if (user?.uid) {
                await updateDoc(doc(db, "users", user.uid), {
                  paymentMethods: updated,
                });
              }
            } catch (error) {
              console.error("Error removing payment method:", error);
              Alert.alert("Error", "Failed to remove payment method.");
            }
          },
        },
      ]
    );
  };

  const getCardIcon = (brand?: string): string => {
    switch (brand?.toLowerCase()) {
      case "visa":
        return "card";
      case "mastercard":
        return "card";
      case "amex":
        return "card";
      default:
        return "card-outline";
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["bottom"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={24} color="#10B981" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Secure Payments</Text>
            <Text style={styles.infoText}>
              All payments are processed securely through Stripe. We never store your full card details.
            </Text>
          </View>
        </View>

        {/* Payment Methods List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Payment Methods</Text>

          {paymentMethods.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="card-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateTitle}>No payment methods</Text>
              <Text style={styles.emptyStateText}>
                Add a payment method to book properties
              </Text>
            </View>
          ) : (
            <View style={styles.methodsList}>
              {paymentMethods.map((method) => (
                <View key={method.id} style={styles.methodCard}>
                  <View style={styles.methodIcon}>
                    <Ionicons
                      name={getCardIcon(method.brand) as any}
                      size={24}
                      color="#6366F1"
                    />
                  </View>
                  <View style={styles.methodInfo}>
                    <View style={styles.methodHeader}>
                      <Text style={styles.methodBrand}>
                        {method.brand || "Card"} •••• {method.last4}
                      </Text>
                      {method.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </View>
                    {method.expMonth && method.expYear && (
                      <Text style={styles.methodExpiry}>
                        Expires {method.expMonth}/{method.expYear}
                      </Text>
                    )}
                  </View>
                  <View style={styles.methodActions}>
                    {!method.isDefault && (
                      <TouchableOpacity
                        style={styles.actionIcon}
                        onPress={() => handleSetDefault(method.id)}
                      >
                        <Ionicons name="star-outline" size={20} color="#6B7280" />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.actionIcon}
                      onPress={() => handleRemovePaymentMethod(method.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Add Payment Method Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddPaymentMethod}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={24} color="#6366F1" />
            <Text style={styles.addButtonText}>Add Payment Method</Text>
          </TouchableOpacity>
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpText}>
            If you're having trouble with payments, please contact our support team.
          </Text>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => navigation.navigate("Contact")}
          >
            <Text style={styles.helpButtonText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  headerSpacer: {
    width: 32,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  // Info Card
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#ECFDF5",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#065F46",
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: "#047857",
    lineHeight: 18,
  },
  // Section
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 12,
  },
  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
  },
  emptyStateTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  // Methods List
  methodsList: {
    gap: 12,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  methodBrand: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },
  defaultBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#16A34A",
  },
  methodExpiry: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  methodActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionIcon: {
    padding: 8,
  },
  // Add Button
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 2,
    borderColor: "#6366F1",
    borderStyle: "dashed",
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6366F1",
  },
  // Help Section
  helpSection: {
    marginTop: 32,
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
  },
  helpButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  helpButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6366F1",
  },
});