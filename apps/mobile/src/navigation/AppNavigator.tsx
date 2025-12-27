import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";

// Auth Screens
import LoginScreen from "../screens/LoginScreen";
import SignUpScreen from "../screens/SignUpScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import ProfileOnboardingScreen from "../screens/ProfileOnboardingScreen";

// Main Tab Screens
import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import MyBookingsScreen from "../screens/MyBookingsScreen";
import MessagesScreen from "../screens/MessagesScreen";
import ProfileScreen from "../screens/ProfileScreen";

// Property Screens
import PropertyDetailsScreen from "../screens/PropertyDetailsScreen";
import BookingScreen from "../screens/BookingScreen";
import BookingConfirmationScreen from "../screens/BookingConfirmationScreen";
import CheckoutScreen from "../screens/CheckoutScreen";

// Profile & Settings Screens
import EditProfileScreen from "../screens/EditProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import PaymentMethodsScreen from "../screens/PaymentMethodsScreen";

// Communication Screens
import ChatScreen from "../screens/ChatScreen";
import ContactScreen from "../screens/ContactScreen";

// Review Screens
import WriteReviewScreen from "../screens/WriteReviewScreen";
import ViewReviewsScreen from "../screens/ViewReviewsScreen";

// Host Management Screens
import HostDashboardScreen from "../screens/HostDashboardScreen";
import ManageListingsScreen from "../screens/ManageListingsScreen";
import CreateListingStep1Screen from "../screens/CreateListingStep1Screen";
import CreateListingStep2Screen from "../screens/CreateListingStep2Screen";
import CreateListingStep3Screen from "../screens/CreateListingStep3Screen";
import CreateListingStep4Screen from "../screens/CreateListingStep4Screen";
import CreateListingStep5Screen from "../screens/CreateListingStep5Screen";
import EditListingScreen from "../screens/EditListingScreen";
import HostCalendarScreen from "../screens/HostCalendarScreen";
import EarningsScreen from "../screens/EarningsScreen";
import PayoutSettingsScreen from "../screens/PayoutSettingsScreen";

// Admin Screen
import AdminDashboardScreen from "../screens/AdminDashboardScreen";

// Search & Filters
import FiltersScreen from "../screens/FiltersScreen";

// Trip Details
import TripDetailsScreen from "../screens/TripDetailsScreen";

// Favorites
import FavoritesScreen from "../screens/FavoritesScreen";

// Legal Screens
import TermsOfServiceScreen from "../screens/TermsOfServiceScreen";
import PrivacyPolicyScreen from "../screens/PrivacyPolicyScreen";
import HostAgreementScreen from "../screens/HostAgreementScreen";
import CancellationPolicyScreen from "../screens/CancellationPolicyScreen";
import AboutScreen from "../screens/AboutScreen";
import ResourcesScreen from "../screens/ResourcesScreen";

export type RootStackParamList = {
  // Auth
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ProfileOnboarding: undefined;

  // Main Tabs
  MainTabs: undefined;
  HostTabs: undefined;

  // Property
  PropertyDetails: { listingId: string };
  Booking: { listingId: string; checkIn?: string; checkOut?: string; guests?: number };
  BookingConfirmation: { bookingId: string };
  Checkout: { bookingId: string };

  // Profile & Settings
  EditProfile: undefined;
  Settings: undefined;
  Notifications: undefined;
  PaymentMethods: undefined;

  // Communication
  Messages: undefined;
  Chat: { conversationId: string; recipientId?: string; recipientName?: string; bookingId?: string };
  Contact: undefined;

  // Reviews
  WriteReview: { bookingId: string; listingId: string; hostId: string };
  ViewReviews: { listingId: string };

  // Favorites
  Favorites: undefined;

  // Host Management - Listing creation goes directly here (no BecomeAHost gate)
  HostDashboard: undefined;
  ManageListings: undefined;
  CreateListingStep1: { listingData?: any };
  CreateListingStep2: { listingData: any };
  CreateListingStep3: { listingData: any };
  CreateListingStep4: { listingData: any };
  CreateListingStep5: { listingData: any };
  EditListing: { listingId: string };
  HostCalendar: { listingId?: string };
  HostBookings: undefined;
  Earnings: undefined;
  PayoutSettings: undefined;

  // Admin
  AdminDashboard: undefined;

  // Search & Filters
  Search: { location?: string; filters?: any };
  Filters: { currentFilters?: any; onApply?: (filters: any) => void };

  // Trip Details
  TripDetails: { bookingId: string };

  // Legal
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
  HostAgreement: undefined;
  CancellationPolicy: undefined;
  About: undefined;
  Resources: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Guest Bottom Tabs - 4 tabs: Explore, Bookings, Messages, Profile
function GuestTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#6366F1",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E5E7EB",
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          switch (route.name) {
            case "Explore":
              iconName = focused ? "search" : "search-outline";
              break;
            case "Bookings":
              iconName = focused ? "calendar" : "calendar-outline";
              break;
            case "Messages":
              iconName = focused ? "chatbubbles" : "chatbubbles-outline";
              break;
            case "Profile":
              iconName = focused ? "person" : "person-outline";
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Explore" 
        component={HomeScreen}
        options={{ tabBarLabel: "Explore" }}
      />
      <Tab.Screen 
        name="Bookings" 
        component={MyBookingsScreen}
        options={{ tabBarLabel: "Bookings" }}
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesScreen}
        options={{ tabBarLabel: "Messages" }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: "Profile" }}
      />
    </Tab.Navigator>
  );
}

// Host Bottom Tabs - 5 tabs for hosting mode
function HostTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#D4A373",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E5E7EB",
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";

          switch (route.name) {
            case "Dashboard":
              iconName = focused ? "grid" : "grid-outline";
              break;
            case "Listings":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Calendar":
              iconName = focused ? "calendar" : "calendar-outline";
              break;
            case "HostMessages":
              iconName = focused ? "chatbubbles" : "chatbubbles-outline";
              break;
            case "HostProfile":
              iconName = focused ? "person" : "person-outline";
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={HostDashboardScreen}
        options={{ tabBarLabel: "Dashboard" }}
      />
      <Tab.Screen
        name="Listings"
        component={ManageListingsScreen}
        options={{ tabBarLabel: "Listings" }}
      />
      <Tab.Screen
        name="Calendar"
        component={HostCalendarScreen}
        options={{ tabBarLabel: "Calendar" }}
        initialParams={{ listingId: undefined }}
      />
      <Tab.Screen
        name="HostMessages"
        component={MessagesScreen}
        options={{ tabBarLabel: "Messages" }}
      />
      <Tab.Screen
        name="HostProfile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profile" }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setNeedsOnboarding(!userData.onboardingCompleted);
          } else {
            setNeedsOnboarding(true);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setNeedsOnboarding(false);
      }

      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4A373" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#F9F9F9" },
        }}
      >
        {/* Onboarding for new users */}
        {user && needsOnboarding ? (
          <Stack.Screen
            name="ProfileOnboarding"
            component={ProfileOnboardingScreen}
            options={{ gestureEnabled: false }}
          />
        ) : (
          <>
            {/* Main App */}
            <Stack.Screen name="MainTabs" component={GuestTabs} />
            <Stack.Screen name="HostTabs" component={HostTabs} />

            {/* Auth Screens */}
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUpScreen}
              options={{ animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{ animation: "slide_from_right" }}
            />

            {/* Property Screens */}
            <Stack.Screen
              name="PropertyDetails"
              component={PropertyDetailsScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="Booking"
              component={BookingScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="BookingConfirmation"
              component={BookingConfirmationScreen}
              options={{ animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="Checkout"
              component={CheckoutScreen}
              options={{ animation: "slide_from_right" }}
            />

            {/* Search */}
            <Stack.Screen
              name="Search"
              component={SearchScreen}
              options={{ animation: "slide_from_right" }}
            />

            {/* Trip Details */}
            <Stack.Screen
              name="TripDetails"
              component={TripDetailsScreen}
              options={{ animation: "slide_from_right" }}
            />

            {/* Favorites */}
            <Stack.Screen
              name="Favorites"
              component={FavoritesScreen}
              options={{ animation: "slide_from_right" }}
            />

            {/* Profile & Settings */}
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="PaymentMethods"
              component={PaymentMethodsScreen}
              options={{ animation: "slide_from_right" }}
            />

            {/* Communication */}
            <Stack.Screen
              name="Messages"
              component={MessagesScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="Contact"
              component={ContactScreen}
              options={{ animation: "slide_from_bottom" }}
            />

            {/* Reviews */}
            <Stack.Screen
              name="WriteReview"
              component={WriteReviewScreen}
              options={{ animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="ViewReviews"
              component={ViewReviewsScreen}
              options={{ animation: "slide_from_right" }}
            />

            {/* Host Management - Direct listing creation (no BecomeAHost gate) */}
            <Stack.Screen
              name="HostDashboard"
              component={HostDashboardScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="ManageListings"
              component={ManageListingsScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="CreateListingStep1"
              component={CreateListingStep1Screen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="CreateListingStep2"
              component={CreateListingStep2Screen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="CreateListingStep3"
              component={CreateListingStep3Screen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="CreateListingStep4"
              component={CreateListingStep4Screen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="CreateListingStep5"
              component={CreateListingStep5Screen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="EditListing"
              component={EditListingScreen}
              options={{ animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="HostCalendar"
              component={HostCalendarScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="Earnings"
              component={EarningsScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="PayoutSettings"
              component={PayoutSettingsScreen}
              options={{ animation: "slide_from_right" }}
            />

            {/* Admin */}
            <Stack.Screen
              name="AdminDashboard"
              component={AdminDashboardScreen}
              options={{ animation: "slide_from_right" }}
            />

            {/* Filters */}
            <Stack.Screen
              name="Filters"
              component={FiltersScreen}
              options={{
                animation: "slide_from_bottom",
                presentation: "modal",
              }}
            />

            {/* Legal */}
            <Stack.Screen
              name="TermsOfService"
              component={TermsOfServiceScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="PrivacyPolicy"
              component={PrivacyPolicyScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="HostAgreement"
              component={HostAgreementScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="CancellationPolicy"
              component={CancellationPolicyScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="About"
              component={AboutScreen}
              options={{ animation: "slide_from_right" }}
            />
            <Stack.Screen
              name="Resources"
              component={ResourcesScreen}
              options={{ animation: "slide_from_right" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
  },
});