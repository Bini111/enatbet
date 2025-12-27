import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  initializeLanguage,
  setLanguage as setI18nLanguage,
  LANGUAGES,
  LanguageCode,
  t as translate,
} from './index';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  t: (key: string, options?: object) => string;
  isLoading: boolean;
  isRTL: boolean;
  languages: typeof LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [isLoading, setIsLoading] = useState(true);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const init = async () => {
      const lang = await initializeLanguage();
      setLanguageState(lang);
      setIsLoading(false);
    };
    init();
  }, []);

  const setLanguage = async (newLang: LanguageCode) => {
    await setI18nLanguage(newLang);
    setLanguageState(newLang);
    // Force re-render to update all translations
    forceUpdate(n => n + 1);
  };

  // Translation function that updates when language changes
  const t = (key: string, options?: object): string => {
    return translate(key, options);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isLoading,
        isRTL: language === 'ar',
        languages: LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export default LanguageProvider;
