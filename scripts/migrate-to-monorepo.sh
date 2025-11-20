#!/bin/bash
set -e

echo "🚀 Starting Enatebet Monorepo Migration..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get current directory
CURRENT_DIR=$(pwd)
echo "📍 Working directory: $CURRENT_DIR"
echo ""

# Step 1: Clean up archive folders
echo -e "${BLUE}Step 1: Cleaning up archive folders...${NC}"
rm -rf archive app_backup
echo -e "${GREEN}✅ Removed archive folders${NC}"
echo ""

# Step 2: Create monorepo structure
echo -e "${BLUE}Step 2: Creating monorepo structure...${NC}"
mkdir -p apps/mobile apps/web/src/app apps/web/src/components apps/web/src/lib apps/web/src/hooks
mkdir -p packages/shared/src/types packages/shared/src/utils
mkdir -p packages/firebase/src
mkdir -p packages/ui/src
echo -e "${GREEN}✅ Created directory structure${NC}"
echo ""

# Step 3: Move existing mobile code
echo -e "${BLUE}Step 3: Moving existing mobile app to apps/mobile...${NC}"

# Move mobile-specific files
mv src apps/mobile/ 2>/dev/null || true
mv App.tsx apps/mobile/ 2>/dev/null || true
mv app.config.ts apps/mobile/ 2>/dev/null || true
mv babel.config.js apps/mobile/ 2>/dev/null || true
mv metro.config.js apps/mobile/ 2>/dev/null || true
mv tsconfig.json apps/mobile/ 2>/dev/null || true
mv android apps/mobile/ 2>/dev/null || true
mv ios apps/mobile/ 2>/dev/null || true
mv eas.json apps/mobile/ 2>/dev/null || true
mv GoogleService-Info.plist apps/mobile/ 2>/dev/null || true
mv jest.config.js apps/mobile/ 2>/dev/null || true
mv jest.setup.js apps/mobile/ 2>/dev/null || true
mv prettierrc.json apps/mobile/ 2>/dev/null || true

echo -e "${GREEN}✅ Moved mobile app files${NC}"
echo ""

# Step 4: Create mobile package.json (update workspace reference)
echo -e "${BLUE}Step 4: Updating mobile package.json...${NC}"
mv package.json apps/mobile/package.json 2>/dev/null || true
mv package-lock.json apps/mobile/package-lock.json 2>/dev/null || true

# Update mobile package.json name
sed -i.bak 's/"name": "enatbet-app"/"name": "mobile"/' apps/mobile/package.json 2>/dev/null || \
  perl -pi -e 's/"name": "enatbet-app"/"name": "mobile"/' apps/mobile/package.json 2>/dev/null || true

# Add shared package dependency
if grep -q '"dependencies"' apps/mobile/package.json; then
  sed -i.bak '/"dependencies": {/a\
    "@enatebet/shared": "*",\
    "@enatebet/firebase": "*",
' apps/mobile/package.json 2>/dev/null || \
  perl -0777 -pi -e 's/("dependencies": \{)/$1\n    "@enatebet\/shared": "*",\n    "@enatebet\/firebase": "*",/' apps/mobile/package.json 2>/dev/null || true
fi

rm -f apps/mobile/package.json.bak 2>/dev/null || true

echo -e "${GREEN}✅ Updated mobile package.json${NC}"
echo ""

# Step 5: Keep Firebase Functions at root
echo -e "${BLUE}Step 5: Firebase Functions remain at root...${NC}"
# functions/ folder stays at root for Firebase deployment
echo -e "${GREEN}✅ Firebase Functions at root${NC}"
echo ""

# Step 6: Keep Firebase config files at root
echo -e "${BLUE}Step 6: Firebase config files remain at root...${NC}"
# firebase.json, firestore.rules, storage.rules, etc. stay at root
echo -e "${GREEN}✅ Firebase config at root${NC}"
echo ""

echo ""
echo -e "${GREEN}✅ Migration structure complete!${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Download all generated files from Claude"
echo "2. Copy them to your ~/Desktop/enatebet directory"
echo "3. Run: npm install"
echo "4. Run: npm run dev"
echo ""
echo -e "${BLUE}Generated files to copy:${NC}"
echo "  - package.json (root)"
echo "  - turbo.json (root)"
echo "  - packages/shared/* (all files)"
echo "  - packages/firebase/* (all files)"
echo "  - apps/web/* (all files)"
echo ""
