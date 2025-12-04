import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import HomeScreen from "../screens/HomeScreen";
import { SearchScreen } from "../screens/SearchScreen";
import { PropertyDetailsScreen } from "../screens/PropertyDetailsScreen";
import { BookingScreen } from "../screens/BookingScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { SignUpScreen } from "../screens/SignUpScreen";
import { FavoritesScreen } from "../screens/FavoritesScreen";
import { MessagesScreen } from "../screens/MessagesScreen";
import { ChatScreen } from "../screens/ChatScreen";
import { MyBookingsScreen } from "../screens/MyBookingsScreen";
import AboutScreen from "../screens/AboutScreen";
import PrivacyPolicyScreen from "../screens/PrivacyPolicyScreen";
import TermsOfServiceScreen from "../screens/TermsOfServiceScreen";
import { ForgotPasswordScreen } from "../screens/ForgotPasswordScreen";
import { BecomeAHostScreen } from "../screens/BecomeAHostScreen";
import { ContactScreen } from "../screens/ContactScreen";
import { ResourcesScreen } from "../screens/ResourcesScreen";

import { RootStackParamList, TabParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#6366F1",
        tabBarInactiveTintColor: "#717171",
      }}
    >
      <Tab.Screen
        name="Explore"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarLabel: "Properties",
          tabBarIcon: ({ color, size }) => (
            <Icon name="magnify" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={MyBookingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="MainTabs">
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen
          name="PropertyDetails"
          component={PropertyDetailsScreen}
          options={{ title: "Property Details" }}
        />
        <Stack.Screen name="Booking" component={BookingScreen} />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{ title: "Chat" }}
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ title: "Sign In" }}
        />
        <Stack.Screen 
          name="SignUp" 
          component={SignUpScreen}
          options={{ title: "Create Account" }}
        />
        <Stack.Screen 
          name="ForgotPassword" 
          component={ForgotPasswordScreen}
          options={{ title: "Reset Password" }}
        />
        <Stack.Screen 
          name="BecomeAHost" 
          component={BecomeAHostScreen}
          options={{ title: "Become a Host" }}
        />
        <Stack.Screen 
          name="Contact" 
          component={ContactScreen}
          options={{ title: "Contact Us" }}
        />
        <Stack.Screen 
          name="Resources" 
          component={ResourcesScreen}
          options={{ title: "Resources & Help" }}
        />
        <Stack.Screen 
          name="About" 
          component={AboutScreen}
          options={{ title: "About Us" }}
        />
        <Stack.Screen 
          name="PrivacyPolicy" 
          component={PrivacyPolicyScreen}
          options={{ title: "Privacy Policy" }}
        />
        <Stack.Screen 
          name="TermsOfService" 
          component={TermsOfServiceScreen}
          options={{ title: "Terms of Service" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
