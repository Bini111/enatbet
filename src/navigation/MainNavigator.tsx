// src/navigation/MainNavigator.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { useTheme } from 'react-native-paper';

// Screens
import BookingScreen from '../screens/guest/BookingScreen';
import HomeScreen from '../screens/guest/HomeScreen';
import ListingDetailScreen from '../screens/guest/ListingDetailScreen';
import PaymentScreen from '../screens/guest/PaymentScreen';
import SearchScreen from '../screens/guest/SearchScreen';
import CalendarScreen from '../screens/host/CalendarScreen';
import CreateListingScreen from '../screens/host/CreateListingScreen';
import DashboardScreen from '../screens/host/DashboardScreen';
import ChatScreen from '../screens/messaging/ChatScreen';
import InboxScreen from '../screens/messaging/InboxScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

export type HomeStackParamList = {
  HomeMain: undefined;
  ListingDetail: { listingId: string };
  Booking: { listingId: string; checkIn: string; checkOut: string; guests: number };
  Payment: { bookingId: string };
};

export type SearchStackParamList = {
  SearchMain: undefined;
  ListingDetail: { listingId: string };
};

export type InboxStackParamList = {
  InboxMain: undefined;
  Chat: { conversationId: string; otherUserId: string };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  HostDashboard: undefined;
  CreateListing: { listingId?: string };
  Calendar: { listingId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Inbox: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const SearchStack = createStackNavigator<SearchStackParamList>();
const InboxStack = createStackNavigator<InboxStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

// Home Stack Navigator
const HomeStackNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="HomeMain" component={HomeScreen} />
    <HomeStack.Screen name="ListingDetail" component={ListingDetailScreen} />
    <HomeStack.Screen name="Booking" component={BookingScreen} />
    <HomeStack.Screen name="Payment" component={PaymentScreen} />
  </HomeStack.Navigator>
);

// Search Stack Navigator
const SearchStackNavigator = () => (
  <SearchStack.Navigator screenOptions={{ headerShown: false }}>
    <SearchStack.Screen name="SearchMain" component={SearchScreen} />
    <SearchStack.Screen name="ListingDetail" component={ListingDetailScreen} />
  </SearchStack.Navigator>
);

// Inbox Stack Navigator
const InboxStackNavigator = () => (
  <InboxStack.Navigator screenOptions={{ headerShown: false }}>
    <InboxStack.Screen name="InboxMain" component={InboxScreen} />
    <InboxStack.Screen name="Chat" component={ChatScreen} />
  </InboxStack.Navigator>
);

// Profile Stack Navigator
const ProfileStackNavigator = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
    <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    <ProfileStack.Screen name="HostDashboard" component={DashboardScreen} />
    <ProfileStack.Screen name="CreateListing" component={CreateListingScreen} />
    <ProfileStack.Screen name="Calendar" component={CalendarScreen} />
  </ProfileStack.Navigator>
);

export const MainNavigator: React.FC = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingTop: 5,
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="magnify" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchStackNavigator}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="map-search" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Inbox"
        component={InboxStackNavigator}
        options={{
          tabBarLabel: 'Inbox',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="message-text" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-circle" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
