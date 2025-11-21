#!/bin/bash
set -e

echo "🔧 Aggressively fixing BoringSSL-GRPC..."

# Wait for pods to be installed
if [ ! -d "ios/Pods" ]; then
  echo "❌ Error: ios/Pods not found. Run 'pod install' first."
  exit 1
fi

# Fix all xcconfig files
find ios/Pods/Target\ Support\ Files/BoringSSL-GRPC -name "*.xcconfig" | while read file; do
  echo "Fixing: $file"
  # Remove all -G flags and -GCC_WARN_INHIBIT_ALL_WARNINGS
  sed -i '' 's/-G[[:space:]]//g' "$file"
  sed -i '' 's/-GCC_WARN_INHIBIT_ALL_WARNINGS//g' "$file"
done

# Fix the podspec's compiler flags in the generated project
PBXPROJ="ios/Pods/Pods.xcodeproj/project.pbxproj"
if [ -f "$PBXPROJ" ]; then
  echo "Fixing project.pbxproj..."
  sed -i '' 's/-G[[:space:]]//g' "$PBXPROJ"
  sed -i '' 's/-GCC_WARN_INHIBIT_ALL_WARNINGS//g' "$PBXPROJ"
fi

echo "✅ BoringSSL-GRPC fixed!"
