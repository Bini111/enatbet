import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { LoadingScreen } from '../components/common/LoadingScreen';
import { RootStackParamList } from '../types';

// Import individual screens that are accessed from multiple navigators
import ListingDetailScreen from '../screens/guest/ListingDetailScreen';
import BookingScreen from '../screens/guest/BookingScreen';
import PaymentScreen from '../screens/guest/PaymentScreen';
import ChatScreen from '../screens/messaging/ChatScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import CreateListingScreen from '../screens/host/CreateListingScreen';
import EditListingScreen from '../screens/host/EditListingScreen';
import LeaveReviewScreen from '../screens/profile/LeaveReviewScreen';
import PhoneVerificationScreen from '../screens/auth/PhoneVerificationScreen';
import CommunityVerificationScreen from '../screens/auth/CommunityVerificationScreen';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        presentation: 'card',
        animationEnabled: true,
      }}
    >
      {!isAuthenticated ? (
        // Auth Stack
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        // Main App Stack
        <>
          <Stack.Screen name="Main" component={MainNavigator} />
          
          {/* Shared Screens accessible from anywhere */}
          <Stack.Screen 
            name="ListingDetail" 
            component={ListingDetailScreen}
            options={{
              headerShown: true,
              headerTitle: '',
              headerTransparent: true,
            }}
          />
          
          <Stack.Screen 
            name="Booking" 
            component={BookingScreen}
            options={{
              headerShown: true,
              headerTitle: 'Request to Book',
              presentation: 'modal',
            }}
          />
          
          <Stack.Screen 
            name="Payment" 
            component={PaymentScreen}
            options={{
              headerShown: true,
              headerTitle: 'Payment',
              presentation: 'modal',
            }}
          />
          
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen}
            options={{
              headerShown: true,
              headerTitle: 'Messages',
            }}
          />
          
          <Stack.Screen 
            name="EditProfile" 
            component={EditProfileScreen}
            options={{
              headerShown: true,
              headerTitle: 'Edit Profile',
              presentation: 'modal',
            }}
          />
          
          <Stack.Screen 
            name="CreateListing" 
            component={CreateListingScreen}
            options={{
              headerShown: true,
              headerTitle: 'Create Listing',
              presentation: 'modal',
            }}
          />
          
          <Stack.Screen 
            name="EditListing" 
            component={EditListingScreen}
            options={{
              headerShown: true,
              headerTitle: 'Edit Listing',
              presentation: 'modal',
            }}
          />
          
          <Stack.Screen 
            name="LeaveReview" 
            component={LeaveReviewScreen}
            options={{
              headerShown: true,
              headerTitle: 'Leave Review',
              presentation: 'modal',
            }}
          />
          
          <Stack.Screen 
            name="PhoneVerification" 
            component={PhoneVerificationScreen}
            options={{
              headerShown: true,
              headerTitle: 'Verify Phone',
              presentation: 'modal',
            }}
          />
          
          <Stack.Screen 
            name="CommunityVerification" 
            component={CommunityVerificationScreen}
            options={{
              headerShown: true,
              headerTitle: 'Community Verification',
              presentation: 'modal',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;