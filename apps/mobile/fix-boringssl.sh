#!/bin/bash
echo "Fixing BoringSSL-GRPC..."

# Find and fix the xcconfig file
XCCONFIG_PATH="ios/Pods/Target Support Files/BoringSSL-GRPC/BoringSSL-GRPC.xcconfig"

if [ -f "$XCCONFIG_PATH" ]; then
  # Remove -G flag from OTHER_CFLAGS and OTHER_CPLUSPLUSFLAGS
  sed -i '' 's/-G//g' "$XCCONFIG_PATH"
  echo "✅ Fixed BoringSSL-GRPC.xcconfig"
else
  echo "⚠️  BoringSSL-GRPC.xcconfig not found"
fi

# Also fix the debug and release xcconfigs
for config in Debug Release; do
  XCCONFIG_PATH="ios/Pods/Target Support Files/BoringSSL-GRPC/BoringSSL-GRPC.$config.xcconfig"
  if [ -f "$XCCONFIG_PATH" ]; then
    sed -i '' 's/-G//g' "$XCCONFIG_PATH"
    echo "✅ Fixed BoringSSL-GRPC.$config.xcconfig"
  fi
done

echo "Done!"
