import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translations - adjust paths based on your project structure
import en from '../../../packages/locales/translations/en.json';
import am from '../../../packages/locales/translations/am.json';
import ti from '../../../packages/locales/translations/ti.json';
import om from '../../../packages/locales/translations/om.json';
import fr from '../../../packages/locales/translations/fr.json';
import ar from '../../../packages/locales/translations/ar.json';

// Supported languages
export const LANGUAGES = {
  en: { name: 'English', nativeName: 'English', flag: '🇺🇸' },
  am: { name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹' },
  ti: { name: 'Tigrinya', nativeName: 'ትግርኛ', flag: '🇪🇷' },
  om: { name: 'Afaan Oromo', nativeName: 'Afaan Oromo', flag: '🇪🇹' },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  ar: { name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
} as const;

export type LanguageCode = keyof typeof LANGUAGES;

const LANGUAGE_KEY = '@enatbet_language';

// Initialize i18n
const i18n = new I18n({
  en,
  am,
  ti,
  om,
  fr,
  ar,
});

// Set default locale
i18n.defaultLocale = 'en';
i18n.enableFallback = true;

// Get device language
const getDeviceLanguage = (): LanguageCode => {
  const deviceLang = Localization.locale.split('-')[0];
  if (deviceLang in LANGUAGES) {
    return deviceLang as LanguageCode;
  }
  return 'en';
};

// Initialize language (call on app start)
export const initializeLanguage = async (): Promise<LanguageCode> => {
  try {
    // Check AsyncStorage first
    const storedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
    
    if (storedLang && storedLang in LANGUAGES) {
      i18n.locale = storedLang;
      return storedLang as LanguageCode;
    }
    
    // Fall back to device language
    const deviceLang = getDeviceLanguage();
    i18n.locale = deviceLang;
    await AsyncStorage.setItem(LANGUAGE_KEY, deviceLang);
    return deviceLang;
  } catch (error) {
    console.error('Error initializing language:', error);
    i18n.locale = 'en';
    return 'en';
  }
};

// Change language
export const setLanguage = async (lang: LanguageCode): Promise<void> => {
  try {
    i18n.locale = lang;
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  } catch (error) {
    console.error('Error setting language:', error);
  }
};

// Get current language
export const getCurrentLanguage = (): LanguageCode => {
  return i18n.locale as LanguageCode;
};

// Check if current language is RTL
export const isRTL = (): boolean => {
  return i18n.locale === 'ar';
};

// Translation function
export const t = (key: string, options?: object): string => {
  return i18n.t(key, options);
};

export default i18n;
