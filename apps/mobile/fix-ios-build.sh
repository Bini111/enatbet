#!/bin/bash
set -e

echo "🔧 Fixing BoringSSL-GRPC xcconfig files..."

find ios/Pods/Target\ Support\ Files/BoringSSL-GRPC -name "*.xcconfig" 2>/dev/null | while read file; do
  if [ -f "$file" ]; then
    echo "Patching: $file"
    sed -i '' 's/-G //g' "$file"
    sed -i '' 's/-G$//g' "$file"
    sed -i '' 's/-GCC_WARN_INHIBIT_ALL_WARNINGS//g' "$file"
  fi
done

echo "✅ xcconfig files fixed!"
