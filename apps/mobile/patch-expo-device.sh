#!/bin/bash

FILE="../../node_modules/expo-device/ios/UIDevice.swift"

if [ -f "$FILE" ]; then
  echo "Patching expo-device..."
  # Add the import at the top
  sed -i '' '1s/^/import Foundation\nimport UIKit\n/' "$FILE"
  # Replace the problematic line
  sed -i '' 's/return TARGET_OS_SIMULATOR != 0/#if targetEnvironment(simulator)\n    return true\n    #else\n    return false\n    #endif/' "$FILE"
  echo "✅ Patched!"
else
  echo "File not found"
fi
