import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AppNavigator from './src/navigation/AppNavigator';
import { lightTheme } from './src/config/theme';
import { useAuthStore } from './src/store/authStore';
import { LoadingScreen } from './src/components/common/LoadingScreen';

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const { initializeAuth, isLoading } = useAuthStore();

  useEffect(() => {
    async function prepare() {
      try {
        await initializeAuth();
      } catch (e) {
        console.warn('Error initializing auth:', e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  if (!appIsReady || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={lightTheme}>
          <AppNavigator />
          <StatusBar style="auto" />
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
