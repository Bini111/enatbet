#!/bin/bash

FILE="../../node_modules/expo-device/ios/UIDevice.swift"

if [ -f "$FILE" ]; then
  echo "Patching expo-device for Xcode 16..."
  
  # Replace the problematic line with proper Swift targetEnvironment check
  sed -i '' '188s/.*/    #if targetEnvironment(simulator)/' "$FILE"
  sed -i '' '189a\
    return true\
    #else\
    return false\
    #endif
' "$FILE"
  
  echo "✅ Patched!"
else
  echo "❌ File not found: $FILE"
fi
