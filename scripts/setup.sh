#!/bin/bash

# Enatebet Platform Setup Script
# This script sets up the development environment

set -e

echo "🚀 Setting up Enatebet development environment..."

# Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "❌ Node.js 20 or higher is required. Current version: $(node -v)"
  exit 1
fi
echo "✅ Node.js version: $(node -v)"

# Check pnpm
echo "📦 Checking pnpm..."
if ! command -v pnpm &> /dev/null; then
  echo "⚠️  pnpm not found. Installing..."
  npm install -g pnpm@8
fi
echo "✅ pnpm version: $(pnpm -v)"

# Install dependencies
echo "📥 Installing dependencies..."
pnpm install

# Setup environment files
echo "🔧 Setting up environment files..."
if [ ! -f .env.local ]; then
  echo "📝 Creating .env.local from .env.example..."
  cp .env.example .env.local
  echo "⚠️  Please update .env.local with your actual values"
else
  echo "✅ .env.local already exists"
fi

# Setup Firebase
echo "🔥 Checking Firebase CLI..."
if ! command -v firebase &> /dev/null; then
  echo "⚠️  Firebase CLI not found. Installing..."
  npm install -g firebase-tools
fi
echo "✅ Firebase CLI version: $(firebase --version)"

# Setup Vercel (optional)
echo "▲ Checking Vercel CLI..."
if ! command -v vercel &> /dev/null; then
  echo "⚠️  Vercel CLI not found. Installing..."
  npm install -g vercel
fi
echo "✅ Vercel CLI installed"

# Setup EAS (optional)
echo "📱 Checking EAS CLI..."
if ! command -v eas &> /dev/null; then
  echo "⚠️  EAS CLI not found. Installing..."
  npm install -g eas-cli
fi
echo "✅ EAS CLI installed"

# Build packages
echo "🏗️  Building packages..."
pnpm run build --filter=@enatbet/shared
pnpm run build --filter=@enatbet/ui
pnpm run build --filter=@enatbet/firebase

# Type checking
echo "🔍 Running type check..."
pnpm run typecheck

# Summary
echo ""
echo "✨ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Update .env.local with your Firebase and Stripe credentials"
echo "  2. Start Firebase emulators: firebase emulators:start"
echo "  3. Start development server: pnpm dev"
echo "  4. Visit http://localhost:3000"
echo ""
echo "📚 Documentation:"
echo "  - Architecture: docs/ARCHITECTURE.md"
echo "  - API Docs: docs/API.md"
echo "  - Deployment: docs/DEPLOYMENT.md"
echo "  - Runbook: docs/RUNBOOK.md"
echo ""
