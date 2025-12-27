# Enatbet i18n Setup

## Step 1: Install Dependencies (Run in Terminal)

```bash
cd ~/Desktop/enatbet/apps/mobile
pnpm add i18n-js@4
npx expo install expo-localization @react-native-async-storage/async-storage
```

## Step 2: Add expo-localization to app.config.ts

Add this to your `plugins` array in `apps/mobile/app.config.ts`:

```ts
plugins: [
  "expo-localization",
  // ... other plugins
],
```

## Step 3: Create Directories

```bash
cd ~/Desktop/enatbet
mkdir -p packages/locales/translations
mkdir -p apps/mobile/src/i18n
mkdir -p apps/mobile/src/components
```

## Step 4: Copy Files

1. Copy all `.json` files from `translations/` folder to:
   `~/Desktop/enatbet/packages/locales/translations/`

2. Copy files from `mobile-src/i18n/` to:
   `~/Desktop/enatbet/apps/mobile/src/i18n/`

3. Copy `LanguageSelector.tsx` to:
   `~/Desktop/enatbet/apps/mobile/src/components/`

## Step 5: Update _layout.tsx

In `apps/mobile/app/_layout.tsx`, wrap your app with LanguageProvider:

```tsx
import { LanguageProvider } from "../src/i18n/LanguageProvider";

export default function RootLayout() {
  return (
    <LanguageProvider>
      <Stack />
    </LanguageProvider>
  );
}
```

## Step 6: Add Globe Button to Home Screen

In your Home screen (`index.tsx`):

```tsx
import { useState } from 'react';
import { LanguageSelector, LanguageButton } from '../src/components/LanguageSelector';
import { useLanguage } from '../src/i18n/LanguageProvider';

export default function HomeScreen() {
  const { t } = useLanguage();
  const [showLangPicker, setShowLangPicker] = useState(false);

  return (
    <>
      {/* Add globe button in header area */}
      <LanguageButton onPress={() => setShowLangPicker(true)} />
      
      {/* Use translations */}
      <Text>{t('home.becomeHost')}</Text>
      
      {/* Add language selector at bottom */}
      <LanguageSelector 
        visible={showLangPicker} 
        onClose={() => setShowLangPicker(false)} 
      />
    </>
  );
}
```

## Step 7: Clear Cache and Restart

```bash
cd ~/Desktop/enatbet/apps/mobile
rm -rf .expo node_modules/.cache
npx expo start --clear
```

## Translation Usage

Replace hardcoded strings with `t()` function:

```tsx
// Before
<Text>Become a Host</Text>

// After
<Text>{t('home.becomeHost')}</Text>

// With variables
<Text>{t('home.welcomeBack', { name: 'Bini' })}</Text>
```

## Supported Languages

- 🇺🇸 English (en)
- 🇪🇹 አማርኛ Amharic (am)
- 🇪🇷 ትግርኛ Tigrinya (ti)
- 🇪🇹 Afaan Oromo (om)
- 🇫🇷 Français French (fr)
- 🇸🇦 العربية Arabic (ar)
