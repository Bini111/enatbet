#!/bin/bash

# Deploy Web App to Vercel
# Usage: ./scripts/deploy-web.sh [production|preview]

set -e

ENVIRONMENT=${1:-production}

echo "▲ Deploying web app to Vercel ($ENVIRONMENT)..."

# Navigate to web app directory
cd apps/web

# Run pre-deployment checks
echo "🔍 Running pre-deployment checks..."

# Type check
echo "  - Type checking..."
pnpm typecheck

# Lint
echo "  - Linting..."
pnpm lint || echo "⚠️  Linting warnings found (continuing...)"

# Build test
echo "  - Testing build..."
pnpm build

echo "✅ Pre-deployment checks passed"

# Deploy based on environment
if [ "$ENVIRONMENT" = "production" ]; then
  echo "🚀 Deploying to production..."
  vercel --prod
elif [ "$ENVIRONMENT" = "preview" ]; then
  echo "🚀 Deploying preview..."
  vercel
else
  echo "❌ Invalid environment: $ENVIRONMENT"
  echo "Usage: ./scripts/deploy-web.sh [production|preview]"
  exit 1
fi

echo "✅ Deployment complete!"
echo "📊 Check deployment status: https://vercel.com/dashboard"

cd ../..
