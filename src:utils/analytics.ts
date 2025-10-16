// src/utils/analytics.ts
import { NavigationContainerRef } from '@react-navigation/native';
import { featureFlags } from './featureFlags';

export interface AnalyticsEvent {
  name: string;
  params?: Record<string, any>;
}

class AnalyticsService {
  private isEnabled: boolean = false;
  private eventBuffer: AnalyticsEvent[] = [];
  private currentRouteName: string | undefined;

  initialize() {
    // In Expo Go, just log to console
    if (!featureFlags.isNativeEnabled) {
      this.isEnabled = true;
      console.log('[Analytics] Initialized in preview mode (console only)');
      this.flushBuffer();
      return;
    }

    // In production, initialize real analytics (Firebase, etc.)
    // TODO: Add Firebase Analytics initialization when native build
    this.isEnabled = true;
    this.flushBuffer();
  }

  private flushBuffer() {
    if (this.eventBuffer.length > 0) {
      console.log(`[Analytics] Flushing ${this.eventBuffer.length} buffered events`);
      this.eventBuffer.forEach(({ name, params }) => {
        this.trackEvent(name, params);
      });
      this.eventBuffer = [];
    }
  }

  trackEvent(name: string, params?: Record<string, any>) {
    if (!this.isEnabled) {
      // Buffer events until initialized
      this.eventBuffer.push({ name, params });
      return;
    }

    if (!featureFlags.isNativeEnabled) {
      console.log(`[Analytics] Event: ${name}`, params);
      return;
    }

    // TODO: Send to real analytics service
    // Example: analytics().logEvent(name, params);
  }

  trackScreen(screenName: string) {
    if (this.currentRouteName === screenName) return;
    
    this.currentRouteName = screenName;
    this.trackEvent('screen_view', { screen_name: screenName });
  }

  setUserId(userId: string) {
    if (!this.isEnabled) return;
    
    if (!featureFlags.isNativeEnabled) {
      console.log(`[Analytics] User ID set: ${userId}`);
      return;
    }

    // TODO: Set user ID in real analytics
  }

  setUserProperties(properties: Record<string, any>) {
    if (!this.isEnabled) return;
    
    if (!featureFlags.isNativeEnabled) {
      console.log('[Analytics] User properties:', properties);
      return;
    }

    // TODO: Set user properties in real analytics
  }

  /**
   * Navigation tracking helper
   * Usage in App.tsx:
   * 
   * const navigationRef = useNavigationContainerRef();
   * 
   * useEffect(() => {
   *   analytics.initialize();
   *   return analytics.withNavigationTracking(navigationRef);
   * }, []);
   */
  withNavigationTracking(navigationRef: NavigationContainerRef<any>): () => void {
    const unsubscribe = navigationRef.addListener('state', () => {
      const currentRoute = navigationRef.getCurrentRoute();
      if (currentRoute?.name) {
        this.trackScreen(currentRoute.name);
      }
    });

    // Track initial screen
    const initialRoute = navigationRef.getCurrentRoute();
    if (initialRoute?.name) {
      this.trackScreen(initialRoute.name);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }
}

export const analytics = new AnalyticsService();
export default analytics;