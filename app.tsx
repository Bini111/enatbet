// App.tsx
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { I18nextProvider } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/config/theme';
import i18n from './src/config/i18n';
import { useAuthStore } from './src/store/authStore';
import { LoadingScreen } from './src/components/common/LoadingScreen';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { NotificationProvider } from './src/contexts/NotificationProvider';
import { analytics } from './src/utils/analytics';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const { initializeAuth } = useAuthStore();
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts
        await Font.loadAsync({
          'MaterialCommunityIcons': require('react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf'),
        });

        // Initialize authentication
        await initializeAuth();

        // Artificially delay for two seconds to show splash screen
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn('Error loading app resources:', e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  // Initialize analytics and navigation tracking
  useEffect(() => {
    if (!appIsReady) return;

    // Initialize analytics
    analytics.initialize();

    // Set up navigation tracking
    const unsubscribeNavigation = analytics.withNavigationTracking(navigationRef);

    // Cleanup on unmount
    return () => {
      if (unsubscribeNavigation) {
        unsubscribeNavigation();
      }
    };
  }, [appIsReady, navigationRef]);

  if (!appIsReady) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <I18nextProvider i18n={i18n}>
          <PaperProvider theme={theme}>
            <SafeAreaProvider>
              <NotificationProvider>
                <NavigationContainer ref={navigationRef}>
                  <StatusBar style="auto" />
                  <AppNavigator />
                </NavigationContainer>
              </NotificationProvider>
            </SafeAreaProvider>
          </PaperProvider>
        </I18nextProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}