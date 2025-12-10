import { ExpoConfig, ConfigContext } from '@expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Enatbet',
  slug: 'enatbet',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#667eea',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.enatbet.app',
    infoPlist: {
      NSLocationWhenInUseUsageDescription: 'Enatbet uses your location to show nearby properties.',
      NSCameraUsageDescription: 'Enatbet uses your camera to take property photos.',
      NSPhotoLibraryUsageDescription: 'Enatbet accesses your photos to upload property images.',
    },
  },
  android: {
    package: 'com.enatbet.app',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#667eea',
    },
    permissions: [
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'CAMERA',
      'READ_EXTERNAL_STORAGE',
    ],
  },
  extra: {
    eas: {
      projectId: '87162e09-bfe2-4db8-9c63-5eb65022b209',
    },
  },
  updates: {
    url: 'https://u.expo.dev/87162e09-bfe2-4db8-9c63-5eb65022b209',
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
});
