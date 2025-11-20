#!/bin/bash

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "Checking Enatbet monorepo structure..."
echo "======================================="

# Critical files to check
FILES=(
  "package.json"
  "pnpm-workspace.yaml"
  "turbo.json"
  "tsconfig.json"
  ".env.example"
  "firebase.json"
  "firestore.rules"
  "firestore.indexes.json"
  "storage.rules"
  
  # Web app files
  "apps/web/package.json"
  "apps/web/tsconfig.json"
  "apps/web/next.config.js"
  "apps/web/tailwind.config.js"
  "apps/web/src/app/layout.tsx"
  "apps/web/src/app/page.tsx"
  
  # Mobile app files
  "apps/mobile/package.json"
  "apps/mobile/tsconfig.json"
  "apps/mobile/app.json"
  "apps/mobile/eas.json"
  "apps/mobile/metro.config.js"
  "apps/mobile/babel.config.js"
  "apps/mobile/App.tsx"
  
  # Shared packages
  "packages/shared/package.json"
  "packages/shared/tsconfig.json"
  "packages/ui/package.json"
  "packages/firebase/package.json"
)

MISSING=0
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file"
  else
    echo -e "${RED}✗${NC} $file - MISSING"
    MISSING=$((MISSING + 1))
  fi
done

echo ""
if [ $MISSING -eq 0 ]; then
  echo -e "${GREEN}All critical files present!${NC}"
else
  echo -e "${RED}Missing $MISSING critical files${NC}"
fi
