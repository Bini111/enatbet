# Enatebet Platform Architecture

## Overview

Enatebet is a property booking platform built as a modern monorepo using pnpm workspaces and Turbo. The platform enables property owners to list their spaces and travelers to book accommodations across Ethiopia.

## Technology Stack

### Frontend
- **Web**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Mobile**: React Native (Expo), TypeScript

### Backend
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
- **Payments**: Stripe
- **Caching/Rate Limiting**: Upstash Redis

### Infrastructure
- **Hosting**: Vercel (Web), EAS (Mobile)
- **Monorepo**: pnpm workspaces, Turbo
- **CI/CD**: GitHub Actions (planned)

## Project Structure

```
enatbet/
├── apps/
│   ├── web/              # Next.js web application
│   └── mobile/           # React Native mobile app
├── packages/
│   ├── shared/           # Shared types, utils, constants
│   ├── ui/               # Shared UI components
│   └── firebase/         # Firebase utilities
├── docs/                 # Documentation
└── scripts/              # Utility scripts
```

## Architecture Patterns

### Monorepo Organization

The project uses a monorepo structure to maximize code sharing between web and mobile apps:

1. **Shared Package** (`@enatbet/shared`)
   - Type definitions
   - Utility functions (money, date, validation)
   - Constants and configuration
   - Business logic helpers

2. **UI Package** (`@enatbet/ui`)
   - Shared React components
   - Design system primitives
   - Platform-agnostic styling patterns

3. **Firebase Package** (`@enatbet/firebase`)
   - Firebase configuration
   - Firestore services (auth, listings, bookings)
   - Storage utilities

### Data Flow

```
User Action
    ↓
UI Component (apps/web or apps/mobile)
    ↓
Firebase Service (@enatbet/firebase)
    ↓
Firestore/Storage
    ↓
Security Rules Validation
    ↓
Response to Client
```

### Key Architectural Decisions

1. **Firebase-First Approach**
   - Real-time updates via Firestore listeners
   - Offline support through Firestore caching
   - Scalable security through Firestore rules
   - Automatic scaling without server management

2. **Type Safety**
   - Strict TypeScript across all packages
   - Shared type definitions in `@enatbet/shared`
   - Zod schemas for runtime validation

3. **Code Sharing Strategy**
   - Business logic in shared packages
   - Platform-specific UI in app directories
   - Utility functions reused across platforms

4. **Security Layers**
   - Client-side: Input validation with Zod
   - Network: Firebase Security Rules
   - Server-side: API route validation (Next.js)
   - Payment: Stripe webhook signature verification

## Data Model

### Core Entities

1. **User**
   - Authentication via Firebase Auth
   - Profile data in Firestore
   - Roles: guest, host, both, admin
   - Verification status and documents

2. **Listing**
   - Property details and amenities
   - Pricing and availability
   - Images stored in Firebase Storage
   - Geolocation data for search

3. **Booking**
   - Date ranges and guest information
   - Payment integration with Stripe
   - Status workflow: pending → confirmed → checked_in → checked_out
   - Cancellation policies and refunds

4. **Review**
   - Post-booking reviews
   - Multi-dimensional ratings
   - Response mechanism for hosts

## API Architecture

### Next.js API Routes

Located in `apps/web/src/app/api/`:

1. **Stripe Endpoints**
   - `/api/stripe/create-payment` - Create payment intent
   - `/api/stripe/webhook` - Handle Stripe webhooks
   - `/api/stripe/ephemeral-key` - Generate ephemeral keys

2. **Cron Jobs**
   - `/api/cron/cleanup-bookings` - Expire old pending bookings
   - `/api/cron/cleanup-storage` - Remove orphaned files

3. **Listing Endpoints**
   - `/api/listings` - CRUD operations
   - `/api/listings/[id]` - Individual listing operations

### Firebase Functions (Future)

Planned for complex server-side operations:
- Email notifications
- Advanced search indexing
- Automated payouts
- Analytics aggregation

## Security Architecture

### Authentication
- Firebase Auth handles user sessions
- JWT tokens for API authentication
- Refresh token rotation
- Multi-factor authentication support

### Authorization
- Firestore Security Rules enforce permissions
- Role-based access control (RBAC)
- Resource-level permissions

### Data Protection
- HTTPS only (enforced)
- Environment variables for secrets
- API keys restricted by domain
- PII encrypted at rest

### Payment Security
- Stripe handles PCI compliance
- Webhook signature verification
- Idempotency keys for operations
- Server-side payment confirmation

## Performance Optimizations

### Web App
- Next.js App Router with Server Components
- Image optimization with next/image
- Route-level code splitting
- Static page generation where possible

### Mobile App
- Expo optimization compiler
- Image caching
- Lazy loading of components
- Optimized bundle size

### Database
- Firestore composite indexes
- Query result caching
- Efficient data pagination
- Denormalized data for reads

## Scalability Considerations

### Horizontal Scaling
- Stateless Next.js API routes
- Vercel automatic scaling
- Firebase auto-scaling

### Data Scaling
- Firestore sharding strategies
- Storage CDN for images
- Redis for rate limiting

### Cost Optimization
- Firestore query optimization
- Image compression and WebP
- Efficient storage rules
- CDN caching

## Monitoring and Observability

### Logging
- Structured logging in API routes
- Firebase Console for Firestore operations
- Vercel Analytics for web performance

### Error Tracking
- Sentry integration (recommended)
- Firebase Crashlytics for mobile
- Custom error boundaries

### Metrics
- Booking conversion rates
- Search performance
- Payment success rates
- User engagement metrics

## Development Workflow

### Local Development
1. Install dependencies: `pnpm install`
2. Set up environment: Copy `.env.example` to `.env.local`
3. Start Firebase emulators: `firebase emulators:start`
4. Start development: `pnpm dev`

### Code Quality
- TypeScript strict mode
- ESLint for linting
- Prettier for formatting
- Pre-commit hooks (recommended)

### Testing Strategy
- Unit tests for utilities
- Integration tests for API routes
- E2E tests for critical flows
- Manual QA for UI/UX

## Deployment Architecture

### Web App (Vercel)
- Production: `main` branch auto-deploy
- Preview: PR deployments
- Edge functions for API routes
- Global CDN

### Mobile App (EAS)
- iOS: App Store
- Android: Google Play Store
- OTA updates via Expo

### Database (Firebase)
- Production Firestore instance
- Separate dev/staging environments
- Automated backups
- Point-in-time recovery

## Future Enhancements

1. **Messaging System**
   - Real-time chat between hosts and guests
   - Firestore-based conversation storage

2. **Advanced Search**
   - Algolia or Elasticsearch integration
   - Faceted search and filters
   - Geospatial queries

3. **Analytics Dashboard**
   - Host earnings reports
   - Occupancy analytics
   - User behavior tracking

4. **Internationalization**
   - Multi-language support (Amharic, English, more)
   - Multi-currency pricing
   - Localized content

5. **Progressive Web App**
   - Offline functionality
   - Push notifications
   - Add to home screen

## Compliance and Legal

- GDPR compliance for EU users
- Data export capabilities
- Right to be forgotten implementation
- Terms of service and privacy policy

## Disaster Recovery

### Backups
- Daily Firestore backups
- Image storage replication
- Database export scripts

### Recovery Procedures
- Point-in-time restore
- Failover strategies
- Incident response plan
