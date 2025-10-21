import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

/**
 * Sentry Configuration
 * 
 * Initializes error tracking and performance monitoring.
 * Errors are automatically sent to Sentry dashboard.
 */

const SENTRY_DSN = Constants.expoConfig?.extra?.EXPO_PUBLIC_SENTRY_DSN;
const APP_ENV = Constants.expoConfig?.extra?.EXPO_PUBLIC_APP_ENV || 'development';
const APP_VERSION = Constants.expoConfig?.version || '1.0.0';

export const initializeSentry = () => {
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not configured. Error tracking disabled.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: APP_ENV,
    release: `enatbet-app@${APP_VERSION}`,
    dist: Constants.expoConfig?.ios?.buildNumber || Constants.expoConfig?.android?.versionCode?.toString(),
    
    // Enable automatic session tracking
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 10000,
    
    // Enable native crashes
    enableNative: true,
    enableNativeCrashHandling: true,
    
    // Performance monitoring
    tracesSampleRate: APP_ENV === 'production' ? 0.2 : 1.0,
    
    // Don't send errors in development
    enabled: APP_ENV !== 'development',
    
    // Integrations
    integrations: [
      new Sentry.ReactNativeTracing({
        tracingOrigins: ['localhost', 'enatbet.app', /^\//],
        routingInstrumentation: Sentry.routingInstrumentation,
      }),
    ],
    
    // Before send hook - filter out sensitive data
    beforeSend(event, hint) {
      // Remove sensitive data
      if (event.request) {
        delete event.request.cookies;
        if (event.request.headers) {
          delete event.request.headers.Authorization;
          delete event.request.headers.Cookie;
        }
      }
      
      // Don't send errors from development
      if (APP_ENV === 'development') {
        console.log('Sentry Event (not sent in dev):', event);
        return null;
      }
      
      return event;
    },
  });
};

// Helper function to log errors
export const logError = (error: Error, context?: Record<string, any>) => {
  console.error('Error:', error);
  
  if (APP_ENV !== 'development') {
    Sentry.captureException(error, {
      extra: context,
    });
  }
};

// Helper function to log messages
export const logMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  if (APP_ENV !== 'development') {
    Sentry.captureMessage(message, level);
  }
};