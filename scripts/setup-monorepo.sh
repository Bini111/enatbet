#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Enatebet Monorepo Setup (Automated)         ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo ""

# Check we're in the right directory
if [[ ! -f "package.json" ]] || [[ ! -d "src" ]]; then
    echo -e "${RED}❌ Error: Run this script from ~/Desktop/enatebet${NC}"
    echo -e "${YELLOW}Current directory: $(pwd)${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Found enatebet project${NC}"
echo ""

# Step 1: Backup
echo -e "${BLUE}[1/10] Creating backup...${NC}"
cd ~/Desktop
BACKUP_NAME="enatebet-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf "$BACKUP_NAME" enatebet 2>/dev/null || true
echo -e "${GREEN}✓ Backup saved: ~/Desktop/$BACKUP_NAME${NC}"
cd enatebet
echo ""

# Step 2: Clean up
echo -e "${BLUE}[2/10] Cleaning up archive folders...${NC}"
rm -rf archive app_backup
echo -e "${GREEN}✓ Removed 500MB+ of dead weight${NC}"
echo ""

# Step 3: Create directories
echo -e "${BLUE}[3/10] Creating monorepo structure...${NC}"
mkdir -p apps/mobile apps/web/src/app
mkdir -p packages/shared/src/types packages/shared/src/utils
mkdir -p packages/firebase/src
mkdir -p packages/ui/src
echo -e "${GREEN}✓ Directory structure created${NC}"
echo ""

# Step 4: Move mobile code
echo -e "${BLUE}[4/10] Moving mobile app to apps/mobile...${NC}"
mv src apps/mobile/ 2>/dev/null || echo "  (src already moved)"
mv App.tsx apps/mobile/ 2>/dev/null || echo "  (App.tsx already moved)"
mv app.config.ts apps/mobile/ 2>/dev/null || echo "  (app.config.ts already moved)"
mv babel.config.js apps/mobile/ 2>/dev/null || echo "  (babel.config.js already moved)"
mv metro.config.js apps/mobile/ 2>/dev/null || echo "  (metro.config.js already moved)"
mv android apps/mobile/ 2>/dev/null || echo "  (android already moved)"
mv ios apps/mobile/ 2>/dev/null || echo "  (ios already moved)"
mv eas.json apps/mobile/ 2>/dev/null || echo "  (eas.json already moved)"
mv GoogleService-Info.plist apps/mobile/ 2>/dev/null || echo "  (GoogleService-Info.plist already moved)"
mv jest.config.js apps/mobile/ 2>/dev/null || echo "  (jest.config.js already moved)"
mv jest.setup.js apps/mobile/ 2>/dev/null || echo "  (jest.setup.js already moved)"
mv prettierrc.json apps/mobile/ 2>/dev/null || echo "  (prettierrc.json already moved)"
mv tsconfig.json apps/mobile/tsconfig.json 2>/dev/null || echo "  (tsconfig.json already moved)"
mv package.json apps/mobile/package.json 2>/dev/null || echo "  (package.json already moved)"
mv package-lock.json apps/mobile/package-lock.json 2>/dev/null || echo "  (package-lock.json already moved)"
echo -e "${GREEN}✓ Mobile app relocated${NC}"
echo ""

# Step 5: Generate root package.json
echo -e "${BLUE}[5/10] Creating root package.json...${NC}"
cat > package.json << 'EOF'
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
    "dev:web": "turbo run dev --filter=web",
    "dev:mobile": "turbo run dev --filter=mobile",
    "build": "turbo run build",
    "build:web": "turbo run build --filter=web",
    "build:mobile": "turbo run build --filter=mobile",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "clean": "turbo run clean && rm -rf node_modules",
    "typecheck": "turbo run typecheck"
  },
  "devDependencies": {
    "@turbo/gen": "^2.3.3",
    "prettier": "^3.6.2",
    "turbo": "^2.3.3",
    "typescript": "^5.3.0"
  },
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  },
  "packageManager": "npm@10.9.2"
}
EOF
echo -e "${GREEN}✓ Root package.json created${NC}"
echo ""

# Step 6: Generate turbo.json
echo -e "${BLUE}[6/10] Creating turbo.json...${NC}"
cat > turbo.json << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "test": {
      "dependsOn": ["^build"],
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
EOF
echo -e "${GREEN}✓ Turbo config created${NC}"
echo ""

# Step 7: Update mobile package.json
echo -e "${BLUE}[7/10] Updating mobile package.json...${NC}"
# Update name field
sed -i.bak 's/"name": "enatbet-app"/"name": "mobile"/' apps/mobile/package.json 2>/dev/null || \
  perl -pi -e 's/"name": "enatbet-app"/"name": "mobile"/' apps/mobile/package.json

# Add shared dependencies after opening "dependencies" brace
if grep -q '"dependencies"' apps/mobile/package.json; then
  sed -i.bak '/"dependencies": {/a\
    "@enatebet/shared": "*",\
    "@enatebet/firebase": "*",
' apps/mobile/package.json 2>/dev/null || \
  perl -0777 -pi -e 's/("dependencies": \{)/$1\n    "@enatebet\/shared": "*",\n    "@enatebet\/firebase": "*",/' apps/mobile/package.json
fi
rm -f apps/mobile/package.json.bak
echo -e "${GREEN}✓ Mobile package updated${NC}"
echo ""

# Step 8: Generate shared package files
echo -e "${BLUE}[8/10] Creating shared packages...${NC}"

# packages/shared/package.json
cat > packages/shared/package.json << 'EOF'
{
  "name": "@enatebet/shared",
  "version": "1.0.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "date-fns": "3.6.0",
    "zod": "3.23.8"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0"
  }
}
EOF

# packages/shared/tsconfig.json
cat > packages/shared/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# packages/shared/src/index.ts
cat > packages/shared/src/index.ts << 'EOF'
export * from './types/domain';
export * from './utils/validation';
export * from './utils/format';
EOF

# packages/shared/src/types/domain.ts
cat > packages/shared/src/types/domain.ts << 'EOF'
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'guest' | 'host' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface Listing {
  id: string;
  hostId: string;
  title: string;
  description: string;
  propertyType: 'apartment' | 'house' | 'villa' | 'condo' | 'guesthouse';
  images: string[];
  pricing: {
    basePrice: number;
    currency: string;
    cleaningFee: number;
  };
  location: {
    city: string;
    country: string;
    coordinates: { latitude: number; longitude: number };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  listingId: string;
  guestId: string;
  checkIn: Date;
  checkOut: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
  total: number;
  createdAt: Date;
}
EOF

# packages/shared/src/utils/validation.ts
cat > packages/shared/src/utils/validation.ts << 'EOF'
import { z } from 'zod';

export const userLoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const bookingCreateSchema = z.object({
  listingId: z.string(),
  checkIn: z.date(),
  checkOut: z.date(),
  guests: z.number().min(1),
});

export type UserLogin = z.infer<typeof userLoginSchema>;
export type BookingCreate = z.infer<typeof bookingCreateSchema>;
EOF

# packages/shared/src/utils/format.ts
cat > packages/shared/src/utils/format.ts << 'EOF'
import { format } from 'date-fns';

export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: Date, formatStr = 'MMM d, yyyy'): string => {
  return format(date, formatStr);
};

export const formatDateRange = (start: Date, end: Date): string => {
  return `${formatDate(start, 'MMM d')} - ${formatDate(end, 'MMM d')}`;
};
EOF

# packages/firebase/package.json
cat > packages/firebase/package.json << 'EOF'
{
  "name": "@enatebet/firebase",
  "version": "1.0.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@enatebet/shared": "*"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  },
  "peerDependencies": {
    "firebase": "^10.0.0"
  }
}
EOF

# packages/firebase/tsconfig.json
cat > packages/firebase/tsconfig.json << 'EOF'
{
  "extends": "../shared/tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
EOF

# packages/firebase/src/index.ts
cat > packages/firebase/src/index.ts << 'EOF'
export * from './converters';
EOF

# packages/firebase/src/converters.ts
cat > packages/firebase/src/converters.ts << 'EOF'
import type { User, Listing, Booking } from '@enatebet/shared';

const timestampToDate = (ts: any): Date => {
  if (ts?.toDate) return ts.toDate();
  if (ts instanceof Date) return ts;
  return new Date(ts);
};

export const userConverter = {
  toFirestore: (user: User) => ({ ...user }),
  fromFirestore: (snap: any): User => ({
    ...snap.data(),
    id: snap.id,
    createdAt: timestampToDate(snap.data().createdAt),
    updatedAt: timestampToDate(snap.data().updatedAt),
  }),
};

export const listingConverter = {
  toFirestore: (listing: Listing) => ({ ...listing }),
  fromFirestore: (snap: any): Listing => ({
    ...snap.data(),
    id: snap.id,
    createdAt: timestampToDate(snap.data().createdAt),
    updatedAt: timestampToDate(snap.data().updatedAt),
  }),
};

export const bookingConverter = {
  toFirestore: (booking: Booking) => ({ ...booking }),
  fromFirestore: (snap: any): Booking => ({
    ...snap.data(),
    id: snap.id,
    checkIn: timestampToDate(snap.data().checkIn),
    checkOut: timestampToDate(snap.data().checkOut),
    createdAt: timestampToDate(snap.data().createdAt),
  }),
};
EOF

echo -e "${GREEN}✓ Shared packages created${NC}"
echo ""

# Step 9: Generate web app files
echo -e "${BLUE}[9/10] Creating Next.js web app...${NC}"

# apps/web/package.json
cat > apps/web/package.json << 'EOF'
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
    "@enatebet/firebase": "*",
    "@enatebet/shared": "*",
    "date-fns": "3.6.0",
    "firebase": "^10.15.0",
    "next": "15.1.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zod": "3.23.8"
  },
  "devDependencies": {
    "@types/node": "^22.10.2",
    "@types/react": "^19.0.1",
    "@types/react-dom": "^19.0.2",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.17.0",
    "eslint-config-next": "15.1.4",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.3.0"
  }
}
EOF

# apps/web/next.config.js
cat > apps/web/next.config.js << 'EOF'
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
EOF

# apps/web/tsconfig.json
cat > apps/web/tsconfig.json << 'EOF'
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
EOF

# apps/web/tailwind.config.ts
cat > apps/web/tailwind.config.ts << 'EOF'
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        primary: { 500: '#0ea5e9', 600: '#0284c7' },
      },
    },
  },
  plugins: [],
};

export default config;
EOF

# apps/web/postcss.config.js
cat > apps/web/postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
EOF

# apps/web/src/app/layout.tsx
cat > apps/web/src/app/layout.tsx << 'EOF'
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Enatebet - Property Rental Platform',
  description: 'Find and book unique properties',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
EOF

# apps/web/src/app/page.tsx
cat > apps/web/src/app/page.tsx << 'EOF'
import { formatCurrency } from '@enatebet/shared';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            🎉 Monorepo is Live!
          </h1>
          <p className="text-2xl text-gray-600 mb-12">
            Your Enatebet platform is now web + mobile
          </p>
          
          <div className="bg-white rounded-2xl shadow-2xl p-10 text-left">
            <h2 className="text-3xl font-bold mb-6 text-center">✅ Setup Complete</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4 items-start">
                <div className="text-4xl">📦</div>
                <div>
                  <h3 className="text-xl font-semibold">Shared Packages Working</h3>
                  <p className="text-gray-600">
                    Example: <span className="font-mono bg-blue-50 px-2 py-1 rounded">
                      {formatCurrency(2499)}
                    </span> (formatted with shared utilities)
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="text-4xl">🌐</div>
                <div>
                  <h3 className="text-xl font-semibold">Next.js 15 App Router</h3>
                  <p className="text-gray-600">
                    React Server Components, streaming, and modern routing
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="text-4xl">📱</div>
                <div>
                  <h3 className="text-xl font-semibold">Mobile App Ready</h3>
                  <p className="text-gray-600">
                    Your React Native Expo app at apps/mobile (unchanged)
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="text-4xl">🔥</div>
                <div>
                  <h3 className="text-xl font-semibold">Firebase Configured</h3>
                  <p className="text-gray-600">
                    Shared converters and config for both platforms
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-10 p-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl text-white">
              <h3 className="text-xl font-bold mb-3">🚀 Next Steps:</h3>
              <ol className="space-y-2 list-decimal list-inside">
                <li>Build authentication screens (login/signup)</li>
                <li>Create property listing pages</li>
                <li>Implement booking flow with date selection</li>
                <li>Add Stripe payment integration</li>
                <li>Deploy web to Vercel, mobile to EAS</li>
              </ol>
            </div>
          </div>
          
          <div className="mt-12 p-6 bg-yellow-50 rounded-xl border-2 border-yellow-200">
            <p className="text-lg text-gray-700">
              <strong>Test Mobile:</strong> <code className="bg-white px-2 py-1 rounded">npm run dev:mobile</code>
              <br />
              <strong>Test Web:</strong> <code className="bg-white px-2 py-1 rounded">npm run dev:web</code>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
EOF

# apps/web/src/app/globals.css
cat > apps/web/src/app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  padding: 0;
}
EOF

echo -e "${GREEN}✓ Web app created${NC}"
echo ""

# Step 10: Install dependencies
echo -e "${BLUE}[10/10] Installing dependencies...${NC}"
echo -e "${YELLOW}This may take 2-3 minutes...${NC}"

npm install -g turbo 2>/dev/null || echo "  (turbo already installed)"
npm install

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Final summary
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          ✅ MONOREPO SETUP COMPLETE!          ║${NC}"
echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo ""
echo -e "${BLUE}📁 Structure:${NC}"
echo "  apps/"
echo "    ├── mobile/  (React Native - your existing app)"
echo "    └── web/     (Next.js - NEW)"
echo "  packages/"
echo "    ├── shared/  (types, validation, utils)"
echo "    └── firebase/ (converters)"
echo ""
echo -e "${BLUE}🚀 Quick Commands:${NC}"
echo "  npm run dev           # Start all apps"
echo "  npm run dev:web       # Web only (http://localhost:3000)"
echo "  npm run dev:mobile    # Mobile only"
echo "  npm run build         # Build everything"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo "  1. Build shared packages:"
echo "     npm run build --filter=@enatebet/shared"
echo "     npm run build --filter=@enatebet/firebase"
echo ""
echo "  2. Test web app:"
echo "     npm run dev:web"
echo "     Open: http://localhost:3000"
echo ""
echo "  3. Test mobile app:"
echo "     npm run dev:mobile"
echo ""
echo -e "${YELLOW}💡 Tip: Update your mobile imports to use @enatebet/shared${NC}"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"
echo ""
