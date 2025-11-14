# Enatebet

> Ethiopian Property Booking Platform - A modern, full-stack monorepo built with Next.js, React Native, Firebase, and Stripe.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![React Native](https://img.shields.io/badge/React_Native-0.73-61DAFB.svg)](https://reactnative.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-10-FFCA28.svg)](https://firebase.google.com/)
[![pnpm](https://img.shields.io/badge/pnpm-8-F69220.svg)](https://pnpm.io/)

## 🌟 Features

- 🏠 **Property Listings** - Browse and search accommodations across Ethiopia
- 📅 **Smart Booking** - Real-time availability and instant booking
- 💳 **Secure Payments** - Stripe integration with ETB support
- 👥 **Dual Roles** - Host and guest functionalities
- ⭐ **Reviews & Ratings** - Multi-dimensional review system
- 📱 **Cross-Platform** - Native iOS/Android apps + responsive web
- 🔒 **Security First** - Firebase Auth, Firestore security rules
- 🌍 **Internationalization** - English and Amharic support
- 💰 **Multi-Currency** - ETB, USD, EUR, GBP support

## 📁 Project Structure

```
enatbet/
├── apps/
│   ├── web/              # Next.js web application
│   └── mobile/           # React Native (Expo) mobile app
├── packages/
│   ├── shared/           # Shared types, utils, constants
│   ├── ui/               # Shared UI components
│   └── firebase/         # Firebase utilities and services
├── docs/                 # Comprehensive documentation
│   ├── ARCHITECTURE.md   # System architecture
│   ├── API.md            # API documentation
│   ├── DEPLOYMENT.md     # Deployment guide
│   └── RUNBOOK.md        # Operations runbook
├── scripts/              # Utility scripts
│   ├── setup.sh          # Development setup
│   ├── deploy-web.sh     # Web deployment
│   ├── deploy-mobile.sh  # Mobile deployment
│   └── backup-db.sh      # Database backup
├── package.json          # Root package with workspace scripts
├── turbo.json            # Turbo build configuration
└── pnpm-workspace.yaml   # pnpm workspace definition
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **pnpm** 8+ (`npm install -g pnpm`)
- **Firebase CLI** (`npm install -g firebase-tools`)
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/enatbet.git
cd enatbet

# Run setup script (recommended)
./scripts/setup.sh

# Or manual setup:
pnpm install
cp .env.example .env.local
# Edit .env.local with your credentials
```

### Development

```bash
# Start all apps in development mode
pnpm dev

# Or start specific apps:
pnpm dev:web       # Web app at http://localhost:3000
pnpm dev:mobile    # Mobile app with Expo

# Start Firebase emulators (recommended for local dev)
firebase emulators:start
```

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm build --filter=@enatbet/web
pnpm build --filter=@enatbet/mobile
```

## 🏗️ Tech Stack

### Frontend

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Web** | Next.js 14 (App Router) | Server-side rendering, routing |
| **Mobile** | React Native + Expo | Cross-platform mobile apps |
| **UI** | Tailwind CSS | Styling |
| **State** | Zustand | State management |
| **Forms** | Zod | Validation |

### Backend

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Database** | Firebase Firestore | NoSQL database |
| **Auth** | Firebase Auth | Authentication |
| **Storage** | Firebase Storage | File storage |
| **Payments** | Stripe | Payment processing |
| **Caching** | Upstash Redis | Rate limiting, caching |

### Infrastructure

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Hosting** | Vercel | Web app hosting |
| **Mobile Builds** | EAS | iOS/Android builds |
| **Monorepo** | pnpm + Turbo | Workspace management |
| **CI/CD** | GitHub Actions | Automated testing/deployment |

## 📦 Packages

### `@enatbet/shared`

Shared business logic and utilities used across all applications.

```typescript
import {
  User,
  Listing,
  Booking,
  formatMoney,
  validateEmail,
  calculateNights,
} from '@enatbet/shared';
```

**Contents:**
- Type definitions (User, Listing, Booking, Payment, etc.)
- Utility functions (money, date, validation)
- Constants (currencies, error codes, etc.)
- Validation schemas (Zod)

### `@enatbet/ui`

Shared React components for web and mobile.

```typescript
import { Button, Input, Card } from '@enatbet/ui';
```

**Contents:**
- Button, Input, Card components
- Consistent design system
- Platform-agnostic styling

### `@enatbet/firebase`

Firebase utilities and service layer.

```typescript
import { auth, db, storage } from '@enatbet/firebase';
import { createListing, getBookings } from '@enatbet/firebase';
```

**Contents:**
- Firebase configuration
- Firestore CRUD services
- Authentication helpers
- Storage utilities

## 🔧 Available Scripts

### Root Scripts

```bash
pnpm dev              # Start all apps in dev mode
pnpm build            # Build all packages
pnpm lint             # Lint all packages
pnpm typecheck        # Type check all packages
pnpm test             # Run all tests
pnpm clean            # Clean all build artifacts

# Deployment
pnpm deploy:web       # Deploy web app to Vercel
pnpm deploy:mobile:ios     # Build iOS app
pnpm deploy:mobile:android # Build Android app
pnpm deploy:rules     # Deploy Firestore rules
```

### Web App Scripts

```bash
cd apps/web
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Lint code
pnpm typecheck        # Type check
```

### Mobile App Scripts

```bash
cd apps/mobile
pnpm start            # Start Expo dev server
pnpm ios              # Run on iOS simulator
pnpm android          # Run on Android emulator
pnpm build:ios        # Build iOS app with EAS
pnpm build:android    # Build Android app with EAS
```

## 🔐 Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

### Required Variables

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

See `.env.example` for complete list of variables.

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm test --filter=@enatbet/shared

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

## 📖 Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Architecture](docs/ARCHITECTURE.md)** - System design and architecture
- **[API Documentation](docs/API.md)** - REST API reference
- **[Deployment Guide](docs/DEPLOYMENT.md)** - How to deploy to production
- **[Runbook](docs/RUNBOOK.md)** - Operational procedures

## 🚢 Deployment

### Web App (Vercel)

```bash
# Deploy to production
pnpm deploy:web

# Or using Vercel CLI
cd apps/web
vercel --prod
```

### Mobile App (EAS)

```bash
# Build for iOS
pnpm deploy:mobile:ios

# Build for Android
pnpm deploy:mobile:android

# OTA Update
cd apps/mobile
eas update --branch production
```

### Database (Firebase)

```bash
# Deploy Firestore rules and indexes
pnpm deploy:rules

# Or using Firebase CLI
firebase deploy --only firestore:rules,firestore:indexes,storage:rules
```

See [Deployment Guide](docs/DEPLOYMENT.md) for detailed instructions.

## 🏛️ Architecture

### High-Level Overview

```
┌─────────────────┐         ┌─────────────────┐
│   Web App       │         │   Mobile App    │
│   (Next.js)     │         │  (React Native) │
└────────┬────────┘         └────────┬────────┘
         │                           │
         └───────────┬───────────────┘
                     │
         ┌───────────▼────────────┐
         │   Shared Packages      │
         │  (types, utils, ui)    │
         └───────────┬────────────┘
                     │
         ┌───────────▼────────────┐
         │      Firebase          │
         │  (Firestore, Auth,     │
         │   Storage)             │
         └────────────────────────┘
```

### Data Flow

1. **User Interaction** → UI Component
2. **UI Component** → Firebase Service
3. **Firebase Service** → Firestore/Storage
4. **Security Rules** → Validate Request
5. **Response** → Update UI

See [Architecture Documentation](docs/ARCHITECTURE.md) for details.

## 🤝 Contributing

### Development Workflow

1. **Create a branch** from `main`
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes** and test locally
   ```bash
   pnpm dev
   pnpm typecheck
   pnpm lint
   ```

3. **Commit changes** with clear messages
   ```bash
   git commit -m "feat: add booking cancellation"
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature
   ```

### Code Style

- **TypeScript** strict mode enabled
- **ESLint** for linting
- **Prettier** for formatting
- **Conventional Commits** for commit messages

### Commit Message Format

```
type(scope): subject

types: feat, fix, docs, style, refactor, test, chore
scope: web, mobile, shared, ui, firebase
```

Examples:
- `feat(web): add property search filters`
- `fix(mobile): resolve payment confirmation bug`
- `docs: update deployment guide`

## 🐛 Troubleshooting

### Common Issues

**Build failures:**
```bash
# Clear cache and reinstall
pnpm clean
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Type errors:**
```bash
# Rebuild shared packages
pnpm build --filter=@enatbet/shared
pnpm build --filter=@enatbet/ui
```

**Firebase connection issues:**
```bash
# Check environment variables
# Verify Firebase credentials in .env.local
# Start Firebase emulators for local development
firebase emulators:start
```

See [Runbook](docs/RUNBOOK.md) for more troubleshooting guides.

## 📊 Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Bundle Size**: < 200KB (gzipped)

## 🔒 Security

- ✅ HTTPS only
- ✅ Firebase Security Rules
- ✅ Environment variables for secrets
- ✅ API keys restricted by domain
- ✅ Stripe webhook signature verification
- ✅ Input validation with Zod
- ✅ XSS protection
- ✅ CSRF protection

Run security audit:
```bash
pnpm audit
```

## 📈 Monitoring

- **Application**: Vercel Analytics
- **Database**: Firebase Console
- **Payments**: Stripe Dashboard
- **Errors**: Sentry (recommended)
- **Logs**: Vercel Logs, Firebase Logs

## 📄 License

This project is proprietary and confidential.

## 👥 Team

- **Engineering Lead**: [Name]
- **Product Manager**: [Name]
- **Design**: [Name]

## 🙏 Acknowledgments

- Firebase for backend infrastructure
- Vercel for hosting and deployment
- Stripe for payment processing
- Expo for mobile app development
- Open source community

## 📞 Support

For questions or issues:

1. Check [Documentation](docs/)
2. Search existing [Issues](https://github.com/your-org/enatbet/issues)
3. Create a new issue if needed
4. Contact team via [email/slack]

---

**Built with ❤️ in Ethiopia** 🇪🇹

For detailed information, see the [Documentation](docs/) directory.
