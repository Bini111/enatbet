#!/bin/bash
set -e

echo "🧹 Nuclear clean..."
rm -rf ios/Pods ios/Podfile.lock ios/build
rm -rf ~/Library/Developer/Xcode/DerivedData
rm -rf node_modules/.cache

echo "📦 Installing pods..."
cd ios
pod install --repo-update
cd ..

echo "🔧 Patching xcconfig files..."
find ios/Pods/Target\ Support\ Files/BoringSSL-GRPC -name "*.xcconfig" 2>/dev/null | while read file; do
  sed -i '' 's/-G //g' "$file"
  sed -i '' 's/-G$//g' "$file"
  sed -i '' 's/-GCC_WARN_INHIBIT_ALL_WARNINGS//g' "$file"
done

echo "🔧 Patching gRPC-Core basic_seq.h..."
GRPC_FILE="ios/Pods/gRPC-Core/src/core/lib/promise/detail/basic_seq.h"
if [ -f "$GRPC_FILE" ]; then
  sed -i '' 's/Traits::template CallSeqFactory(/Traits::template CallSeqFactory<>(/g' "$GRPC_FILE"
fi

echo "✅ All fixes applied!"
