#!/bin/bash

# Deploy Mobile App with EAS
# Usage: ./scripts/deploy-mobile.sh [ios|android|both] [build|submit|update]

set -e

PLATFORM=${1:-both}
ACTION=${2:-build}

echo "📱 Deploying mobile app..."
echo "Platform: $PLATFORM"
echo "Action: $ACTION"

# Navigate to mobile app directory
cd apps/mobile

# Run pre-deployment checks
echo "🔍 Running pre-deployment checks..."

# Type check
echo "  - Type checking..."
pnpm typecheck

echo "✅ Pre-deployment checks passed"

# Perform action based on parameters
case $ACTION in
  build)
    echo "🏗️  Building app..."
    if [ "$PLATFORM" = "both" ]; then
      eas build --platform all --profile production --non-interactive
    else
      eas build --platform $PLATFORM --profile production --non-interactive
    fi
    ;;

  submit)
    echo "📤 Submitting app to store..."
    if [ "$PLATFORM" = "both" ]; then
      eas submit --platform all --non-interactive
    else
      eas submit --platform $PLATFORM --non-interactive
    fi
    ;;

  update)
    echo "🔄 Publishing OTA update..."
    eas update --branch production --message "Update from $(date +%Y-%m-%d)"
    ;;

  *)
    echo "❌ Invalid action: $ACTION"
    echo "Usage: ./scripts/deploy-mobile.sh [ios|android|both] [build|submit|update]"
    exit 1
    ;;
esac

echo "✅ Mobile deployment complete!"
echo "📊 Check build status: https://expo.dev"

cd ../..
