# Enatebet Monorepo Migration Guide

## 📦 What You're Getting

Converting your single React Native app into a production-ready monorepo with:

- ✅ **apps/web** - Next.js 15 with App Router
- ✅ **apps/mobile** - Your existing React Native Expo app
- ✅ **packages/shared** - Common types, validation, utilities
- ✅ **packages/firebase** - Shared Firebase config & converters
- ✅ **packages/ui** - Shared UI components (future)
- ✅ **Turborepo** - Fast build system
- ✅ **60%+ code sharing** between web and mobile

---

## 🚀 Migration Steps (30 minutes)

### Step 1: Backup Your Project (2 minutes)

```bash
cd ~/Desktop
tar -czf enatebet-backup-$(date +%Y%m%d-%H%M%S).tar.gz enatebet
echo "✅ Backup created"
```

### Step 2: Run Migration Script (1 minute)

```bash
cd ~/Desktop/enatebet

# Make script executable
chmod +x migrate-to-monorepo.sh

# Run migration
./migrate-to-monorepo.sh
```

This will:
- Delete `archive/` and `app_backup/` folders
- Create monorepo structure
- Move mobile code to `apps/mobile/`
- Keep Firebase Functions at root

### Step 3: Download Generated Files from Claude

I've created all these files for you. Download them and place in the correct locations:

#### Root Files
```bash
~/Desktop/enatebet/
├── package.json          # ← Replace with Claude's version
├── turbo.json           # ← New file
└── migrate-to-monorepo.sh  # ← New file (already created above)
```

#### Packages - Shared
```bash
~/Desktop/enatebet/packages/shared/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts
    ├── types/
    │   └── domain.ts
    └── utils/
        ├── validation.ts
        └── format.ts
```

#### Packages - Firebase
```bash
~/Desktop/enatebet/packages/firebase/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts
    └── converters.ts
```

#### Apps - Web
```bash
~/Desktop/enatebet/apps/web/
├── package.json
├── next.config.js
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── src/
    └── app/
        ├── layout.tsx
        ├── page.tsx
        └── globals.css
```

### Step 4: Install Dependencies (5 minutes)

```bash
cd ~/Desktop/enatebet

# Install Turborepo globally
npm install -g turbo

# Install all workspace dependencies
npm install

# This will install:
# - Root monorepo dependencies
# - packages/shared dependencies
# - packages/firebase dependencies  
# - apps/mobile dependencies
# - apps/web dependencies
```

### Step 5: Update Environment Variables (2 minutes)

Create `.env.local` files for each app:

**`apps/web/.env.local`**
```env
# Copy from your existing Firebase project
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Stripe (when you add payments)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

**`apps/mobile/.env`** (if not exists)
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Step 6: Build Shared Packages (2 minutes)

```bash
cd ~/Desktop/enatebet

# Build shared packages first (required by apps)
npm run build --filter=@enatebet/shared
npm run build --filter=@enatebet/firebase
```

### Step 7: Test Mobile App (5 minutes)

```bash
# Test mobile dev server
npm run dev:mobile

# Or directly:
cd apps/mobile
npm run start
```

Should work exactly as before!

### Step 8: Test Web App (5 minutes)

```bash
# Test web dev server
npm run dev:web

# Or directly:
cd apps/web
npm run dev
```

Visit http://localhost:3000 - you should see the welcome page using shared utilities!

### Step 9: Update Mobile Imports (10 minutes)

Update your mobile app to use shared packages:

**`apps/mobile/src/services/auth.service.ts`**

```typescript
// OLD
import { User } from '../types/domain';

// NEW
import { User, userLoginSchema } from '@enatebet/shared';
```

**`apps/mobile/src/components/ListingCard.tsx`**

```typescript
// OLD
import { formatCurrency } from '../utils/format';

// NEW
import { formatCurrency, formatDate } from '@enatebet/shared';
```

Do this gradually - no need to update everything at once.

---

## 📁 Final Structure

```
enatebet/
├── apps/
│   ├── mobile/              # React Native Expo (your existing app)
│   │   ├── src/
│   │   ├── android/
│   │   ├── ios/
│   │   ├── App.tsx
│   │   └── package.json
│   │
│   └── web/                 # Next.js App Router (NEW)
│       ├── src/
│       │   └── app/
│       ├── next.config.js
│       └── package.json
│
├── packages/
│   ├── shared/              # Types, validation, utilities
│   │   ├── src/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   └── package.json
│   │
│   ├── firebase/            # Firebase config & converters
│   │   ├── src/
│   │   └── package.json
│   │
│   └── ui/                  # Shared components (future)
│       └── package.json
│
├── functions/               # Firebase Cloud Functions (unchanged)
│   ├── src/
│   └── package.json
│
├── firebase.json            # Firebase config (unchanged)
├── firestore.rules         # Firestore security (unchanged)
├── storage.rules           # Storage security (unchanged)
├── package.json            # Root workspace config
├── turbo.json              # Turborepo config
└── .gitignore
```

---

## 🛠️ Common Commands

```bash
# Development
npm run dev              # Start all apps
npm run dev:web          # Web only
npm run dev:mobile       # Mobile only

# Building
npm run build            # Build everything
npm run build:web        # Web only
npm run build:mobile     # Mobile only

# Testing & Quality
npm run lint             # Lint all packages
npm run typecheck        # Type check all packages
npm run test             # Run all tests

# Clean
npm run clean            # Clean all build artifacts
```

---

## 🔥 Firebase Deployment (Unchanged)

```bash
# Deploy Functions
firebase deploy --only functions

# Deploy Firestore Rules
firebase deploy --only firestore:rules

# Deploy Storage Rules
firebase deploy --only storage

# Deploy Everything
firebase deploy
```

---

## 🚢 Production Deployment

### Web (Vercel - Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd apps/web
vercel

# Set environment variables in Vercel dashboard
```

### Mobile (EAS Build)

```bash
cd apps/mobile

# Development build
eas build --platform all --profile development

# Production build
eas build --platform all --profile production

# Submit to stores
eas submit --platform all
```

---

## ⚠️ Troubleshooting

### "Cannot find module '@enatebet/shared'"

```bash
# Build shared packages first
cd ~/Desktop/enatebet
npm run build --filter=@enatebet/shared
```

### "Type error: Cannot find type definitions"

```bash
# Rebuild TypeScript declarations
cd packages/shared
npm run build
```

### Mobile app won't start

```bash
cd apps/mobile

# Clear Metro cache
npm run start -- --clear

# Reinstall pods (iOS)
cd ios && pod install && cd ..

# Clean Android
cd android && ./gradlew clean && cd ..
```

### Web app build fails

```bash
cd apps/web

# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

---

## 📚 Next Steps

1. **Authentication**: Build login/signup screens in both apps using shared types
2. **Listing Pages**: Create property listing pages (web & mobile)
3. **Booking Flow**: Implement date selection, guest info, payment
4. **Real-time Features**: Chat, notifications using Firebase
5. **Payments**: Stripe integration for web, Stripe SDK for mobile
6. **Testing**: Add Jest/Playwright tests
7. **CI/CD**: GitHub Actions for automated testing & deployment

---

## 🎯 Benefits of This Monorepo

- ✅ **60%+ Code Reuse**: Types, validation, utilities, Firebase logic
- ✅ **Type Safety**: Shared TypeScript types across platforms
- ✅ **Faster Development**: Change once, use everywhere
- ✅ **Consistent UX**: Same validation rules, formatting
- ✅ **Single Deploy**: Update Firebase Functions once
- ✅ **Better Testing**: Test shared logic once
- ✅ **Scalable**: Easy to add admin dashboard, API, etc.

---

## ❓ Need Help?

If you encounter issues:

1. Check this guide first
2. Verify all files are in correct locations
3. Ensure `npm install` completed successfully
4. Check that shared packages are built (`packages/*/dist` exists)
5. Ask me specific questions with error messages

---

**Ready to migrate? Start with Step 1!** 🚀
