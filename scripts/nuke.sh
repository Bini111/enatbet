#!/bin/bash
set -e
echo "NUCLEAR CLEAN - Complete cache purge"

# Stop Metro / Expo / Watchman
watchman shutdown-server 2>/dev/null || true
pkill -f metro 2>/dev/null || true
pkill -f expo 2>/dev/null || true

# Clear Watchman watches
watchman watch-del-all 2>/dev/null || true

# Clear Metro / React Native caches
rm -rf "$TMPDIR/metro-cache" "$TMPDIR/metro-*"
rm -rf "$TMPDIR/haste-map-*"
rm -rf "$TMPDIR/react-native-packager-cache-*"
rm -rf "$TMPDIR/react-*"

# Clear Expo cache
rm -rf .expo

# Clear project caches
rm -rf node_modules/.cache

# iOS clean (for mobile app)
rm -rf apps/mobile/ios/Pods apps/mobile/ios/Podfile.lock apps/mobile/ios/build
rm -rf ~/Library/Developer/Xcode/DerivedData/*
rm -rf ~/Library/Caches/CocoaPods

# Android clean (for mobile app)
rm -rf apps/mobile/android/app/build apps/mobile/android/build apps/mobile/android/.gradle
cd apps/mobile/android && ./gradlew clean 2>/dev/null || true
cd ../../..

# Remove all node_modules in monorepo
find . -name "node_modules" -type d -prune -exec rm -rf {} + 2>/dev/null || true

# Reinstall deps at root
pnpm install

# Regenerate native projects for mobile
cd apps/mobile
npx expo prebuild --clean

# Reinstall iOS pods
cd ios && pod install --repo-update && cd ../..

echo "CLEAN COMPLETE. Next: cd apps/mobile && npx expo start --clear"
