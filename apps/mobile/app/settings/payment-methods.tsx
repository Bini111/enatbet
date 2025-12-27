import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Text } from "react-native-paper";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { getFunctions, httpsCallable } from "firebase/functions";

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

const CARD_ICONS: { [key: string]: string } = {
  visa: "card",
  mastercard: "card",
  amex: "card",
  discover: "card",
  default: "card-outline",
};

export default function PaymentMethodsScreen() {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const functions = getFunctions();

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    if (!user) return;
    
    try {
      const getPaymentMethodsFn = httpsCallable(functions, "getPaymentMethods");
      const result = await getPaymentMethodsFn({ userId: user.uid });
      setPaymentMethods((result.data as any).paymentMethods || []);
    } catch (error) {
      console.error("Error loading payment methods:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCard = async () => {
    if (!user) return;
    
    setIsAdding(true);
    try {
      const createSetupIntentFn = httpsCallable(functions, "createSetupIntent");
      const result = await createSetupIntentFn({ userId: user.uid });
      
      // In a real app, you'd use Stripe SDK to collect card details
      // For now, show instructions
      Alert.alert(
        "Add Payment Method",
        "This feature requires Stripe Elements integration. The backend is ready - implement the Stripe card input UI to complete this feature.",
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error creating setup intent:", error);
      Alert.alert("Error", "Failed to start card setup");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteCard = async (paymentMethodId: string) => {
    Alert.alert(
      "Remove Card",
      "Are you sure you want to remove this payment method?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const deletePaymentMethodFn = httpsCallable(
                functions,
                "deletePaymentMethod"
              );
              await deletePaymentMethodFn({ paymentMethodId });
              setPaymentMethods((prev) =>
                prev.filter((pm) => pm.id !== paymentMethodId)
              );
              Alert.alert("Success", "Payment method removed");
            } catch (error) {
              console.error("Error deleting payment method:", error);
              Alert.alert("Error", "Failed to remove payment method");
            }
          },
        },
      ]
    );
  };

  const formatCardBrand = (brand: string) => {
    return brand.charAt(0).toUpperCase() + brand.slice(1);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Payment Methods",
          headerBackTitle: "Settings",
        }}
      />
      <View style={styles.container}>
        <ScrollView style={styles.scrollView}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#667eea" />
            </View>
          ) : paymentMethods.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="card-outline" size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>No payment methods</Text>
              <Text style={styles.emptySubtitle}>
                Add a card to make booking faster and easier
              </Text>
            </View>
          ) : (
            <View style={styles.cardsList}>
              {paymentMethods.map((pm) => (
                <View key={pm.id} style={styles.cardItem}>
                  <View style={styles.cardLeft}>
                    <View style={styles.cardIconContainer}>
                      <Ionicons
                        name={CARD_ICONS[pm.brand] || CARD_ICONS.default}
                        size={24}
                        color="#667eea"
                      />
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardBrand}>
                        {formatCardBrand(pm.brand)} •••• {pm.last4}
                      </Text>
                      <Text style={styles.cardExpiry}>
                        Expires {pm.expMonth}/{pm.expYear}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteCard(pm.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Add Card Button */}
          <TouchableOpacity
            style={styles.addCardButton}
            onPress={handleAddCard}
            disabled={isAdding}
          >
            <Ionicons name="add-circle-outline" size={24} color="#667eea" />
            <Text style={styles.addCardText}>
              {isAdding ? "Setting up..." : "Add Payment Method"}
            </Text>
          </TouchableOpacity>

          {/* Info Text */}
          <View style={styles.infoContainer}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#999" />
            <Text style={styles.infoText}>
              Your payment information is encrypted and securely stored by Stripe
            </Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    color: "#1a1a1a",
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  cardsList: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
  },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#f0f3ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  cardInfo: {},
  cardBrand: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  cardExpiry: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  addCardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#667eea",
    borderStyle: "dashed",
    gap: 8,
  },
  addCardText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#667eea",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    paddingHorizontal: 8,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#999",
    lineHeight: 18,
  },
});
