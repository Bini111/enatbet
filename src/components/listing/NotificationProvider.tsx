// src/contexts/NotificationProvider.tsx
import * as Notifications from 'expo-notifications';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useUIStore } from '../store/uiStore';
import { featureFlags } from '../utils/featureFlags';

interface NotificationContextType {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  requestPermission: () => Promise<boolean>;
  scheduleNotification: (title: string, body: string, data?: any) => Promise<void>;
  navigateFromNotification: (data: any) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const { addToast } = useUIStore();

  useEffect(() => {
    if (!featureFlags.usePushNotifications) {
      console.log('[Notifications] Running in preview mode - using mock notifications');
      return;
    }

    registerForPushNotificationsAsync()
      .then(token => {
        if (token) {
          setExpoPushToken(token);
          console.log('[Notifications] Push token:', token);
        }
      })
      .catch(error => {
        console.error('[Notifications] Failed to get push token:', error);
      });

    // Notification received while app is foregrounded
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
      console.log('[Notifications] Received:', notification);
    });

    // Notification tapped/opened
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('[Notifications] Response:', response);
      // Handle navigation based on notification data
      // External handler can be wired via navigateFromNotification
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!featureFlags.usePushNotifications) {
      addToast({
        message: 'Push notifications enabled (mock mode)',
        type: 'info',
      });
      return true;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        addToast({
          message: 'Permission to receive notifications was denied',
          type: 'error',
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('[Notifications] Permission request failed:', error);
      return false;
    }
  };

  const scheduleNotification = async (title: string, body: string, data?: any): Promise<void> => {
    if (!featureFlags.usePushNotifications) {
      console.log('[Mock Notification]', { title, body, data });
      addToast({
        message: `${title}: ${body}`,
        type: 'info',
        duration: 4000,
      });
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('[Notifications] Failed to schedule notification:', error);
    }
  };

  /**
   * Navigation callback for deep linking from notifications
   * App root should wire this to actual navigation logic
   */
  const navigateFromNotification = (data: any): void => {
    // No-op implementation - app root can override this via context
    console.log('[Notifications] Navigate from notification:', data);
    // TODO: Wire to navigation in App.tsx
  };

  const value: NotificationContextType = {
    expoPushToken,
    notification,
    requestPermission,
    scheduleNotification,
    navigateFromNotification,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[Notifications] Permission not granted');
      return null;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  } catch (error) {
    console.error('[Notifications] Error during registration:', error);
    return null;
  }
}
