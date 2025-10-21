// App.tsx
// MUST be first or iOS can crash on gesture usage.
import 'react-native-gesture-handler';

import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import * as Linking from 'expo-linking';
import { I18nextProvider } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';

import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/config/theme';
import i18n from './src/config/i18n';
import { useAuthStore } from './src/store/authStore';
import { LoadingScreen } from './src/components/common/LoadingScreen';
import { ErrorBoundary } from './src/components/common/ErrorBoundary';
import { NotificationProvider } from './src/contexts/NotificationProvider';
import { analytics } from './src/utils/analytics';

// --- Sentry (added) ---
import * as Sentry from 'sentry-expo';
import Constants from 'expo-constants';

// React Navigation instrumentation for Sentry performance traces
const routingInstrumentation = new Sentry.Native.ReactNavigationInstrumentation();

Sentry.init({
  dsn: Constants.expoConfig?.extra?.sentryDsn,
  enableInExpoDevelopment: true,
  debug: false,
  tracesSampleRate: 0.15,
  enableAutoSessionTracking: true,
  release: Constants.expoConfig?.version,
  environment:
    (Constants.expoConfig as any)?.extra?.appEnv ??
    (Constants.expoGo ? 'development' : 'production'),
  integrations: [
    new Sentry.Native.ReactNativeTracing({
      routingInstrumentation,
    }),
  ],
});

Sentry.setTag('app.version', Constants.expoConfig?.version ?? 'unknown');
Sentry.setTag('eas.projectId', (Constants.expoConfig as any)?.extra?.eas?.projectId ?? 'n/a');
// --- end Sentry ---

// Turn on native screen stacks for perf
enableScreens(true);

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {});

// Quiet the common navigation serialization warning in dev
LogBox.ignoreLogs(['Non-serializable values were found in the navigation state']);

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const { initializeAuth } = useAuthStore();
  const navigationRef = useNavigationContainerRef();

  useEffect(() => {
    async function prepare() {
      try {
        // Load fonts (paper uses MDI by default)
        await Font.loadAsync({
          MaterialCommunityIcons: require('react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf'),
        });

        // Initialize authentication
        await initializeAuth();

        // Artificial delay to verify splash/boot pipeline
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn('Error loading app resources:', e);
        Sentry.captureException(e);
      } finally {
        setAppIsReady(true);
        // Hide here is fine; we also hide on layout to avoid flicker.
        await SplashScreen.hideAsync().catch(() => {});
      }
    }
    prepare();
  }, [initializeAuth]);

  // One-time Sentry smoke ping
  useEffect(() => {
    if (appIsReady) Sentry.captureMessage('enatbet iOS simulator smoke ✅');
  }, [appIsReady]);

  // Initialize analytics and navigation tracking
  useEffect(() => {
    if (!appIsReady) return;

    analytics.initialize();
    const unsubscribeNavigation = analytics.withNavigationTracking(navigationRef);
    return () => unsubscribeNavigation && unsubscribeNavigation();
  }, [appIsReady, navigationRef]);

  // Hide splash after first layout to prevent white flash
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      try {
        await SplashScreen.hideAsync();
      } catch {}
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return <LoadingScreen />;
  }

  // Minimal deep-linking prefix; extends automatically if you define scheme in app config
  const prefix = Linking.createURL('/');
  const linking = { prefixes: [prefix] };

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <I18nextProvider i18n={i18n}>
          <PaperProvider theme={theme}>
            <SafeAreaProvider>
              <NotificationProvider>
                <NavigationContainer
                  ref={navigationRef}
                  linking={linking}
                  onReady={() => {
                    // @ts-ignore ref generic mismatch is safe
                    routingInstrumentation.registerNavigationContainer(navigationRef);
                  }}
                  onStateChange={(state) => {
                    routingInstrumentation.onStateChange(state);
                  }}
                >
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
