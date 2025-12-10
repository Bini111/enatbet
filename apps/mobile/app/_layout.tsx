import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { StripeProvider } from '@stripe/stripe-react-native';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import '../lib/firebase';

// Brand colors
const BRAND_PRIMARY = '#667eea';
const BRAND_SECONDARY = '#764ba2';
const BRAND_HEADER = { backgroundColor: BRAND_PRIMARY };
const BRAND_TINT = '#fff';

// Custom Paper theme with brand colors
const customTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: BRAND_PRIMARY,
    secondary: BRAND_SECONDARY,
    primaryContainer: '#e0e7ff',
    secondaryContainer: '#f3e8ff',
  },
};

// Prevent splash screen from auto-hiding
// Wrapped in try/catch as it can reject if called multiple times
try {
  SplashScreen.preventAutoHideAsync();
} catch (e) {
  console.warn('[Layout] SplashScreen.preventAutoHideAsync error:', e);
}

// Validate Stripe key - fail loudly in development
const stripePublishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (__DEV__ && !stripePublishableKey) {
  console.warn(
    '[Layout] EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set. ' +
    'Stripe payments will not work. Add it to your .env file.'
  );
}

export default function RootLayout(): JSX.Element {
  return (
    <StripeProvider
      publishableKey={stripePublishableKey || ''}
      merchantIdentifier="merchant.com.enatbet.app"
      urlScheme="enatbet"
    >
      <AuthProvider>
        <PaperProvider theme={customTheme}>
          <RootNavigator />
        </PaperProvider>
      </AuthProvider>
    </StripeProvider>
  );
}

function RootNavigator(): JSX.Element | null {
  const { isInitializing } = useAuth();

  useEffect(() => {
    const hideSplash = async () => {
      if (!isInitializing) {
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.warn('[Layout] SplashScreen.hideAsync error:', e);
        }
      }
    };
    hideSplash();
  }, [isInitializing]);

  // Show loading indicator while auth initializes
  // The native splash screen covers this, but this prevents flash of empty content
  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BRAND_PRIMARY} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack>
        {/* Main tabs */}
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }} 
        />
        
        {/* Auth modals */}
        <Stack.Screen 
          name="login" 
          options={{ 
            title: 'Sign In', 
            presentation: 'modal',
            headerStyle: BRAND_HEADER,
            headerTintColor: BRAND_TINT,
          }} 
        />
        <Stack.Screen 
          name="signup" 
          options={{ 
            title: 'Create Account', 
            presentation: 'modal',
            headerStyle: BRAND_HEADER,
            headerTintColor: BRAND_TINT,
          }} 
        />
        <Stack.Screen 
          name="forgot-password" 
          options={{ 
            title: 'Reset Password', 
            presentation: 'modal',
            headerStyle: BRAND_HEADER,
            headerTintColor: BRAND_TINT,
          }} 
        />

        {/* Property screens */}
        <Stack.Screen 
          name="property/[id]" 
          options={{ 
            title: 'Property',
            headerStyle: BRAND_HEADER,
            headerTintColor: BRAND_TINT,
          }} 
        />

        {/* Booking flow */}
        <Stack.Screen 
          name="booking/[id]" 
          options={{ 
            title: 'Book Property',
            presentation: 'modal',
            headerStyle: BRAND_HEADER,
            headerTintColor: BRAND_TINT,
          }} 
        />

        {/* Info pages */}
        <Stack.Screen 
          name="become-a-host" 
          options={{ 
            title: 'Become a Host',
            headerStyle: BRAND_HEADER,
            headerTintColor: BRAND_TINT,
          }} 
        />
        <Stack.Screen 
          name="contact" 
          options={{ 
            title: 'Contact Us',
            headerStyle: BRAND_HEADER,
            headerTintColor: BRAND_TINT,
          }} 
        />
        <Stack.Screen 
          name="resources" 
          options={{ 
            title: 'Resources & Help',
            headerStyle: BRAND_HEADER,
            headerTintColor: BRAND_TINT,
          }} 
        />
        <Stack.Screen 
          name="terms-of-service" 
          options={{ 
            title: 'Terms of Service',
            headerStyle: BRAND_HEADER,
            headerTintColor: BRAND_TINT,
          }} 
        />
        <Stack.Screen 
          name="privacy-policy" 
          options={{ 
            title: 'Privacy Policy',
            headerStyle: BRAND_HEADER,
            headerTintColor: BRAND_TINT,
          }} 
        />

        {/* 404 handler */}
        <Stack.Screen 
          name="+not-found" 
          options={{ title: 'Not Found' }} 
        />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
});
