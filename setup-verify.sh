#!/bin/bash

set -e

echo "🚀 Enatbet Monorepo Setup & Verification"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node version
echo "📋 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}❌ Node.js 20+ required. Current: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js version OK: $(node -v)${NC}"

# Verify workspace packages
echo ""
echo "🔍 Verifying workspace packages..."
PACKAGES=("@enatbet/shared" "@enatbet/firebase" "@enatbet/ui" "@enatbet/web" "@enatbet/mobile")
for pkg in "${PACKAGES[@]}"; do
    if pnpm list "$pkg" --depth 0 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $pkg${NC}"
    else
        echo -e "${RED}❌ $pkg not found${NC}"
    fi
done

# Check critical files
echo ""
echo "📄 Checking critical configuration files..."
FILES=(
    "pnpm-workspace.yaml"
    "turbo.json"
    "apps/web/next.config.js"
    "apps/mobile/metro.config.js"
    "apps/mobile/babel.config.js"
    "firestore.rules"
    "storage.rules"
    "firestore.indexes.json"
    ".env.example"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file missing${NC}"
    fi
done

# Check for .env.local
echo ""
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local exists${NC}"
else
    echo -e "${YELLOW}⚠️  .env.local not found${NC}"
    echo -e "${YELLOW}   Run: cp .env.example .env.local${NC}"
    echo -e "${YELLOW}   Then fill in your Firebase and Stripe credentials${NC}"
fi

echo ""
echo "========================================"
echo -e "${GREEN}✅ Setup verification complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env.local: cp .env.example .env.local"
echo "2. Fill in your Firebase and Stripe credentials in .env.local"
echo "3. Start development:"
echo "   - Web only:    pnpm --filter @enatbet/web dev"
echo "   - Mobile only: pnpm --filter @enatbet/mobile dev"
echo "   - Both:        pnpm dev"
echo ""
