#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Enatebet Production MVP Setup                 ║${NC}"
echo -e "${BLUE}║   Phase 1: Mobile-First Booking Platform        ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════╝${NC}"
echo ""

# Verify we're in the right directory
if [[ ! -f "package.json" ]]; then
    echo -e "${RED}❌ Error: Run this from ~/Desktop/enatebet${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Found enatebet project${NC}"
echo ""

# Create backup
echo -e "${BLUE}[1/12] Creating backup...${NC}"
cd ~/Desktop
BACKUP_NAME="enatebet-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf "$BACKUP_NAME" enatebet 2>/dev/null || true
echo -e "${GREEN}✓ Backup: ~/Desktop/$BACKUP_NAME${NC}"
cd enatebet
echo ""

# Clean up old artifacts
echo -e "${BLUE}[2/12] Cleaning workspace...${NC}"
rm -rf archive app_backup node_modules .expo 2>/dev/null || true
echo -e "${GREEN}✓ Cleaned${NC}"
echo ""

# Create monorepo structure
echo -e "${BLUE}[3/12] Creating monorepo structure...${NC}"
mkdir -p apps/mobile apps/web/src
mkdir -p packages/shared/src/{types,utils,schemas}
mkdir -p packages/firebase/src/{services,config}
mkdir -p packages/ui/src/{components,screens,navigation}
echo -e "${GREEN}✓ Structure created${NC}"
echo ""

# Move mobile app
echo -e "${BLUE}[4/12] Relocating mobile app...${NC}"
# Move source and config
mv src apps/mobile/ 2>/dev/null || echo "  (src already moved)"
mv App.tsx apps/mobile/ 2>/dev/null || echo "  (App.tsx already moved)"
mv app.config.ts apps/mobile/ 2>/dev/null || echo "  (app.config.ts already moved)"
mv babel.config.js apps/mobile/ 2>/dev/null || echo "  (babel.config.js already moved)"

# Move native projects (iOS/Android)
mv ios apps/mobile/ 2>/dev/null || echo "  (ios already moved)"
mv android apps/mobile/ 2>/dev/null || echo "  (android already moved)"

# Move configs
mv eas.json apps/mobile/ 2>/dev/null || echo "  (eas.json already moved)"
mv metro.config.js apps/mobile/ 2>/dev/null || echo "  (metro.config.js already moved)"
mv GoogleService-Info.plist apps/mobile/ 2>/dev/null || echo "  (GoogleService-Info.plist already moved)"
mv jest.config.js apps/mobile/ 2>/dev/null || echo "  (jest.config.js already moved)"
mv jest.setup.js apps/mobile/ 2>/dev/null || echo "  (jest.setup.js already moved)"

# Move package files
mv package.json apps/mobile/package.json 2>/dev/null || echo "  (package.json already moved)"
rm -f apps/mobile/package-lock.json 2>/dev/null || true
mv tsconfig.json apps/mobile/tsconfig.json 2>/dev/null || echo "  (tsconfig.json already moved)"

echo -e "${GREEN}✓ Mobile app relocated to apps/mobile/${NC}"
echo ""

# Generate root package.json
echo -e "${BLUE}[5/12] Creating root workspace...${NC}"
cat > package.json << 'EOF'
{
  "name": "enatebet",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "dev:mobile": "turbo run dev --filter=mobile",
    "dev:web": "turbo run dev --filter=web",
    "build": "turbo run build",
    "build:shared": "turbo run build --filter=@enatebet/shared --filter=@enatebet/firebase --filter=@enatebet/ui",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "clean": "turbo run clean && rm -rf node_modules",
    "typecheck": "turbo run typecheck"
  },
  "devDependencies": {
    "turbo": "^2.3.3",
    "typescript": "^5.3.0",
    "prettier": "^3.6.2"
  },
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  }
}
EOF
echo -e "${GREEN}✓ Root package.json created${NC}"
echo ""

# Generate turbo.json
echo -e "${BLUE}[6/12] Configuring Turborepo...${NC}"
cat > turbo.json << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local", "**/.env"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"],
      "env": ["EXPO_PUBLIC_*", "NEXT_PUBLIC_*"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "test": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "clean": {
      "cache": false
    }
  }
}
EOF
echo -e "${GREEN}✓ Turbo configured${NC}"
echo ""

# Update mobile package.json for monorepo
echo -e "${BLUE}[7/12] Updating mobile package.json...${NC}"
# Change name to 'mobile'
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' 's/"name": "enatbet-app"/"name": "mobile"/' apps/mobile/package.json
else
  sed -i 's/"name": "enatbet-app"/"name": "mobile"/' apps/mobile/package.json
fi

# Add workspace dependencies
cat > /tmp/mobile-deps.json << 'EOF'
    "@enatebet/shared": "*",
    "@enatebet/firebase": "*",
    "@enatebet/ui": "*",
EOF

# Insert dependencies (portable way)
awk '/^  "dependencies": \{/ { print; system("cat /tmp/mobile-deps.json"); next }1' \
  apps/mobile/package.json > /tmp/package.tmp && \
  mv /tmp/package.tmp apps/mobile/package.json

rm /tmp/mobile-deps.json
echo -e "${GREEN}✓ Mobile package updated${NC}"
echo ""

# Fix Metro config for monorepo
echo -e "${BLUE}[8/12] Fixing Metro config for monorepo...${NC}"
cat > apps/mobile/metro.config.js << 'EOF'
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Support monorepo structure
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Enable symlinks for workspace packages
config.resolver.disableHierarchicalLookup = false;

// Support workspace packages
config.resolver.extraNodeModules = {
  '@enatebet/shared': path.resolve(workspaceRoot, 'packages/shared/src'),
  '@enatebet/firebase': path.resolve(workspaceRoot, 'packages/firebase/src'),
  '@enatebet/ui': path.resolve(workspaceRoot, 'packages/ui/src'),
};

// Support SVG
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

module.exports = config;
EOF
echo -e "${GREEN}✓ Metro config fixed${NC}"
echo ""

# Install Turbo globally
echo -e "${BLUE}[9/12] Installing Turbo...${NC}"
npm install -g turbo 2>/dev/null || echo "  (turbo already installed)"
echo -e "${GREEN}✓ Turbo ready${NC}"
echo ""

# Install root dependencies
echo -e "${BLUE}[10/12] Installing root dependencies...${NC}"
npm install --legacy-peer-deps
echo -e "${GREEN}✓ Root dependencies installed${NC}"
echo ""

# Create .gitignore
echo -e "${BLUE}[11/12] Creating .gitignore...${NC}"
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp/
.pnp.js

# Testing
coverage/
.nyc_output/

# Production builds
dist/
build/
.next/
.expo/
.turbo/

# Environment variables
.env
.env.local
.env*.local
*.env

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Mobile
ios/Pods/
ios/build/
android/app/build/
android/.gradle/
*.jks
*.keystore

# Temporary
*.tmp
.cache/
EOF
echo -e "${GREEN}✓ .gitignore created${NC}"
echo ""

# Final summary
echo -e "${BLUE}[12/12] Setup complete!${NC}"
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          ✅ MONOREPO READY FOR DEVELOPMENT      ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📁 Structure:${NC}"
echo "  apps/"
echo "    ├── mobile/  (React Native Expo)"
echo "    └── web/     (Next.js)"
echo "  packages/"
echo "    ├── shared/  (types, schemas, utils)"
echo "    ├── firebase/ (auth, firestore, storage)"
echo "    └── ui/      (shared components)"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "  1. I'll generate all feature files (auth, listings, bookings)"
echo "  2. Set up your .env files with Firebase & Stripe keys"
echo "  3. Build shared packages: npm run build:shared"
echo "  4. Start development:"
echo "     - Mobile: npm run dev:mobile"
echo "     - Web: npm run dev:web"
echo ""
echo -e "${GREEN}Ready to add features! 🚀${NC}"
echo ""
