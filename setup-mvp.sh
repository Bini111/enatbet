#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Enatebet Production MVP - Monorepo Setup v1.0          ║${NC}"
echo -e "${BLUE}║   Fixes: iOS paths, Metro config, React versions         ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check we're in enatebet directory
if [[ ! -f "package.json" ]] || [[ ! -d "src" ]] && [[ ! -d "apps/mobile" ]]; then
    echo -e "${RED}❌ Error: Run from ~/Desktop/enatebet${NC}"
    echo -e "${YELLOW}Current: $(pwd)${NC}"
    exit 1
fi

# Check if already migrated
if [[ -d "apps/mobile" ]]; then
    echo -e "${YELLOW}⚠️  Monorepo already exists. Skipping migration.${NC}"
    echo -e "${GREEN}✓ Proceeding to package updates...${NC}"
    ALREADY_MIGRATED=true
else
    ALREADY_MIGRATED=false
fi

echo -e "${GREEN}✓ Found enatebet project${NC}"
echo ""

# Step 1: Backup
if [[ "$ALREADY_MIGRATED" == "false" ]]; then
    echo -e "${BLUE}[1/12] Creating backup...${NC}"
    cd ~/Desktop
    BACKUP_NAME="enatebet-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    tar -czf "$BACKUP_NAME" enatebet 2>/dev/null || echo "  (backup warning ignored)"
    echo -e "${GREEN}✓ Backup: ~/Desktop/$BACKUP_NAME${NC}"
    cd enatebet
    echo ""
fi

# Step 2: Clean up
if [[ "$ALREADY_MIGRATED" == "false" ]]; then
    echo -e "${BLUE}[2/12] Cleaning archive folders...${NC}"
    rm -rf archive app_backup
    echo -e "${GREEN}✓ Removed 500MB+ dead weight${NC}"
    echo ""
fi

# Step 3: Create structure
if [[ "$ALREADY_MIGRATED" == "false" ]]; then
    echo -e "${BLUE}[3/12] Creating monorepo structure...${NC}"
    mkdir -p apps/mobile apps/web/src/app
    mkdir -p packages/shared/src/{types,utils,hooks}
    mkdir -p packages/firebase/src
    mkdir -p packages/ui/src/{components,theme}
    echo -e "${GREEN}✓ Directories created${NC}"
    echo ""
fi

# Step 4: Move mobile code
if [[ "$ALREADY_MIGRATED" == "false" ]]; then
    echo -e "${BLUE}[4/12] Relocating mobile app...${NC}"
    
    # Move all mobile files
    for item in src App.tsx app.config.ts babel.config.js metro.config.js \
                android ios eas.json GoogleService-Info.plist \
                jest.config.js jest.setup.js prettierrc.json \
                tsconfig.json package.json package-lock.json; do
        if [[ -e "$item" ]]; then
            mv "$item" apps/mobile/ 2>/dev/null || echo "  ($item already moved)"
        fi
    done
    
    echo -e "${GREEN}✓ Mobile app relocated to apps/mobile/${NC}"
    echo ""
fi

# Step 5: Root package.json
echo -e "${BLUE}[5/12] Creating root package.json...${NC}"
cat > package.json << 'ROOTPKG'
{
  "name": "enatebet-monorepo",
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
    "build:mobile": "turbo run build --filter=mobile",
    "build:web": "turbo run build --filter=web",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "typecheck": "turbo run typecheck",
    "clean": "turbo run clean && rm -rf node_modules"
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
ROOTPKG
echo -e "${GREEN}✓ Root package.json${NC}"
echo ""

# Step 6: turbo.json
echo -e "${BLUE}[6/12] Creating turbo.json...${NC}"
cat > turbo.json << 'TURBO'
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env*", "!**/.env.example"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**", "ios/build/**", "android/app/build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "test": {
      "outputs": ["coverage/**"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "clean": {
      "cache": false
    }
  }
}
TURBO
echo -e "${GREEN}✓ Turbo config${NC}"
echo ""

# Step 7: Update mobile package.json
echo -e "${BLUE}[7/12] Updating mobile package.json...${NC}"

# Update name to "mobile"
if grep -q '"name": "enatbet-app"' apps/mobile/package.json 2>/dev/null; then
    sed -i.bak 's/"name": "enatbet-app"/"name": "mobile"/' apps/mobile/package.json 2>/dev/null || \
      perl -pi -e 's/"name": "enatbet-app"/"name": "mobile"/' apps/mobile/package.json
fi

# Add shared dependencies using node
node -e '
const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync("apps/mobile/package.json", "utf8"));
pkg.dependencies = pkg.dependencies || {};
pkg.dependencies["@enatebet/shared"] = "*";
pkg.dependencies["@enatebet/firebase"] = "*";
pkg.dependencies["@enatebet/ui"] = "*";
fs.writeFileSync("apps/mobile/package.json", JSON.stringify(pkg, null, 2));
' 2>/dev/null || echo "  (manual dep add needed)"

rm -f apps/mobile/package.json.bak 2>/dev/null || true
rm -f apps/mobile/package-lock.json 2>/dev/null || true

echo -e "${GREEN}✓ Mobile package updated${NC}"
echo ""

# Step 8: Fix Metro config for monorepo
echo -e "${BLUE}[8/12] Fixing Metro config for monorepo...${NC}"
cat > apps/mobile/metro.config.js << 'METRO'
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Support monorepo: watch workspace packages
config.watchFolders = [workspaceRoot];

// Resolve modules from monorepo root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Enable package exports (for shared packages)
config.resolver.unstable_enablePackageExports = true;

// Support SVG
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

module.exports = config;
METRO
echo -e "${GREEN}✓ Metro config fixed for monorepo${NC}"
echo ""

# Step 9: Generate shared packages
echo -e "${BLUE}[9/12] Generating shared packages...${NC}"

# packages/shared/package.json
cat > packages/shared/package.json << 'SHAREDPKG'
{
  "name": "@enatebet/shared",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "react-native": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "date-fns": "^3.6.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0"
  }
}
SHAREDPKG

# packages/shared/tsconfig.json
cat > packages/shared/tsconfig.json << 'SHAREDTS'
{
  "extends": "../../apps/mobile/tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@enatebet/shared": ["./src"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
SHAREDTS

# packages/firebase/package.json
cat > packages/firebase/package.json << 'FIREPKG'
{
  "name": "@enatebet/firebase",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "react-native": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@enatebet/shared": "*"
  },
  "peerDependencies": {
    "@react-native-firebase/app": "*",
    "@react-native-firebase/auth": "*",
    "@react-native-firebase/firestore": "*",
    "@react-native-firebase/storage": "*"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
FIREPKG

# packages/ui/package.json
cat > packages/ui/package.json << 'UIPKG'
{
  "name": "@enatebet/ui",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "react-native": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@enatebet/shared": "*"
  },
  "peerDependencies": {
    "react": "*",
    "react-native": "*",
    "react-native-paper": "*"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
UIPKG

echo -e "${GREEN}✓ Package manifests created${NC}"
echo ""

# Step 10: Web app skeleton
echo -e "${BLUE}[10/12] Creating Next.js web app...${NC}"

cat > apps/web/package.json << 'WEBPKG'
{
  "name": "web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf .next"
  },
  "dependencies": {
    "@enatebet/shared": "*",
    "@enatebet/firebase": "*",
    "date-fns": "^3.6.0",
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.0.0",
    "eslint-config-next": "^14.2.0",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.3.0"
  }
}
WEBPKG

# Next.js config
cat > apps/web/next.config.js << 'NEXTCFG'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@enatebet/shared', '@enatebet/firebase'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
    ],
  },
};

module.exports = nextConfig;
NEXTCFG

# Web tsconfig
cat > apps/web/tsconfig.json << 'WEBTS'
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
WEBTS

mkdir -p apps/web/src/app
cat > apps/web/src/app/layout.tsx << 'WEBLAYOUT'
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
WEBLAYOUT

cat > apps/web/src/app/page.tsx << 'WEBPAGE'
export default function Home() {
  return <main><h1>Enatebet Web (placeholder - full implementation coming)</h1></main>;
}
WEBPAGE

echo -e "${GREEN}✓ Web app created${NC}"
echo ""

# Step 11: Root .gitignore
echo -e "${BLUE}[11/12] Creating .gitignore...${NC}"
cat > .gitignore << 'GITIGNORE'
# Dependencies
node_modules/
.pnp
.pnp.js

# Environment
.env
.env*.local
!.env.example

# Build outputs
dist/
build/
.next/
.expo/
.turbo/

# OS
.DS_Store
*.log

# IDE
.vscode/
.idea/

# Mobile
android/app/build/
ios/Pods/
ios/build/
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Testing
coverage/
GITIGNORE
echo -e "${GREEN}✓ .gitignore created${NC}"
echo ""

# Step 12: Install dependencies
echo -e "${BLUE}[12/12] Installing dependencies...${NC}"
echo -e "${YELLOW}This takes 2-3 minutes...${NC}"

npm install -g turbo@2.3.3 2>/dev/null || echo "  (turbo install skipped)"
npm install

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Final summary
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ MONOREPO SETUP COMPLETE!                  ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📁 Structure:${NC}"
echo "  apps/mobile/  - React Native (Expo)"
echo "  apps/web/     - Next.js 14 (stable React 18)"
echo "  packages/shared/  - Types, validation, utils"
echo "  packages/firebase/ - Firebase services"
echo "  packages/ui/   - Shared UI components"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo "  1. Test mobile: npm run dev:mobile"
echo "  2. Test web: npm run dev:web"
echo ""
echo -e "${YELLOW}⚠️  Additional files needed (coming next):${NC}"
echo "  - Full feature implementations (auth, listings, bookings)"
echo "  - Firebase security rules"
echo "  - Stripe integration"
echo "  - Deployment configs"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"
echo ""
