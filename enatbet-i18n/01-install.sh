#!/bin/bash
# ============================================================
# STEP 1: Run these commands one by one in terminal
# ============================================================

# Navigate to your mobile app
cd ~/Desktop/enatbet/apps/mobile

# Install dependencies with pnpm (not npm!)
pnpm add i18n-js@4
pnpm add @react-native-async-storage/async-storage

# Install expo packages
npx expo install expo-localization

# Create directories
mkdir -p src/i18n
mkdir -p src/components

# Navigate to project root and create locales
cd ~/Desktop/enatbet
mkdir -p packages/locales/translations

echo "✅ Step 1 complete! Now download and copy the translation files."
