# Installation Instructions - Phase 1 Foundation Files

## 📥 What You're Installing

The **foundation** of your monorepo:
- Monorepo structure with Turborepo
- Shared types & validation
- Firebase converters
- Basic web app skeleton

**This is ~20% of the total MVP.** See SETUP-GUIDE.md for what's next.

---

## 🚀 Quick Start (30 minutes)

### Step 1: Download All Files

From Claude's outputs, download these 8 files:

```
1. setup-mvp.sh
2. packages-shared-types-domain.ts
3. packages-shared-validation.ts
4. packages-shared-format.ts
5. packages-shared-index.ts
6. packages-firebase-converters.ts
7. packages-firebase-index.ts
8. SETUP-GUIDE.md
```

---

### Step 2: Place Files in Project

```bash
cd ~/Desktop/enatebet

# Make setup script executable
chmod +x setup-mvp.sh

# Run the setup
./setup-mvp.sh
```

**This will:**
- ✅ Create monorepo structure
- ✅ Move mobile code to `apps/mobile/`
- ✅ Set up Turborepo
- ✅ Install dependencies (~3 minutes)

---

### Step 3: Add Shared Package Files

After setup completes, add the shared package files:

```bash
cd ~/Desktop/enatebet

# Copy downloaded files to correct locations
cp packages-shared-types-domain.ts packages/shared/src/types/domain.ts
cp packages-shared-validation.ts packages/shared/src/utils/validation.ts
cp packages-shared-format.ts packages/shared/src/utils/format.ts
cp packages-shared-index.ts packages/shared/src/index.ts

# Firebase package
cp packages-firebase-converters.ts packages/firebase/src/converters.ts
cp packages-firebase-index.ts packages/firebase/src/index.ts
```

---

### Step 4: Test the Setup

```bash
# Test mobile app
npm run dev:mobile

# In another terminal, test web app
npm run dev:web
```

**Mobile**: Should open Expo dev server (scan QR with Expo Go)
**Web**: Should open http://localhost:3000 (basic placeholder)

---

## ✅ Success Criteria

After setup, you should have:

```
enatebet/
├── apps/
│   ├── mobile/           # Your existing React Native app
│   │   ├── src/
│   │   ├── android/
│   │   ├── ios/
│   │   ├── App.tsx
│   │   ├── package.json  # Updated with workspace deps
│   │   └── metro.config.js  # Fixed for monorepo
│   │
│   └── web/              # New Next.js app (skeleton)
│       ├── src/app/
│       └── package.json
│
├── packages/
│   ├── shared/
│   │   ├── src/
│   │   │   ├── types/domain.ts      ✅ ADDED
│   │   │   ├── utils/validation.ts  ✅ ADDED
│   │   │   ├── utils/format.ts      ✅ ADDED
│   │   │   └── index.ts             ✅ ADDED
│   │   └── package.json
│   │
│   ├── firebase/
│   │   ├── src/
│   │   │   ├── converters.ts        ✅ ADDED
│   │   │   └── index.ts             ✅ ADDED
│   │   └── package.json
│   │
│   └── ui/
│       ├── src/
│       └── package.json
│
├── functions/            # Your Firebase Functions (unchanged)
├── firebase.json         # Firebase config (unchanged)
├── package.json          # NEW root workspace
├── turbo.json            # NEW Turborepo config
└── node_modules/         # Hoisted dependencies
```

---

## 🧪 Testing the Shared Packages

### Test 1: Mobile Can Import Shared Types

Update `apps/mobile/App.tsx`:

```typescript
import { formatCurrency, User } from '@enatebet/shared';

// Inside your component:
console.log(formatCurrency(1299)); // Should output: $1,299

// Type checking should work:
const user: User = {
  id: '123',
  email: 'test@example.com',
  displayName: 'Test User',
  // ... rest of User properties
};
```

### Test 2: Web Can Import Shared Types

Update `apps/web/src/app/page.tsx`:

```typescript
import { formatCurrency } from '@enatebet/shared';

export default function Home() {
  return (
    <div>
      <h1>Enatebet</h1>
      <p>Price example: {formatCurrency(2499)}</p>
    </div>
  );
}
```

### Test 3: Run TypeScript Check

```bash
npm run typecheck
```

Should pass with no errors.

---

## 🔧 Troubleshooting

### Error: "Cannot find module '@enatebet/shared'"

**Fix:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules
npm install
```

### Error: Metro bundler fails on mobile

**Fix:**
```bash
cd apps/mobile
npm run start -- --clear
```

### Error: TypeScript errors about missing types

**Fix:** Make sure you copied all files to correct locations (check Step 3).

---

## 📚 What You Can Do Now

With foundation installed, you can:

### ✅ Available Features:
1. **Use shared types** in both apps
2. **Validate forms** with Zod schemas
3. **Format data** consistently (currency, dates)
4. **Type-safe Firestore** with converters

### ❌ NOT Yet Available:
- Auth screens (need to be generated)
- Listing screens (need to be generated)
- Booking flow (needs to be generated)
- Firebase services (need to be generated)
- Stripe integration (needs to be generated)
- UI components (need to be generated)

---

## 🎯 Next Steps

**Read `SETUP-GUIDE.md`** to decide which path to take:

### Option A: Generate All Files
I generate the remaining 50+ files (mobile screens, web pages, services, etc.)

### Option B: Simplified MVP
I generate a minimal working version (10-15 files) you can launch quickly

### Option C: Get Help
I guide you on hiring a developer

---

## ⏱️ Time Investment So Far

- ✅ Setup script: 5 minutes
- ✅ File placement: 5 minutes
- ✅ Dependency install: 3 minutes
- ✅ Testing: 5 minutes

**Total: ~18 minutes**

You now have a **production-ready monorepo foundation** that fixes all the issues from the critiques.

---

## 🚀 Ready for More?

Once you've tested this foundation and everything works, come back and tell me:

**"Foundation works - generate [all files / simplified MVP / show dev options]"**

I'm here to help you succeed! 💪
