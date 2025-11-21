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

import { RootStackParamList, TabParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: "#FF385C",
        tabBarInactiveTintColor: "#717171",
      }}
    >
      <Tab.Screen
        name="Explore"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="magnify" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="heart-outline" size={size} color={color} />
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
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="message-outline" size={size} color={color} />
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
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}