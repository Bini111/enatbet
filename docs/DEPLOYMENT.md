# Deployment Guide

This guide covers deploying the Enatebet platform to production environments.

## Prerequisites

Before deploying, ensure you have:

1. **Accounts**
   - Firebase project (with Blaze plan)
   - Vercel account
   - Stripe account
   - Expo account (EAS)
   - Upstash Redis account

2. **Tools Installed**
   - Node.js 20+
   - pnpm 8+
   - Firebase CLI: `npm install -g firebase-tools`
   - Vercel CLI: `npm install -g vercel`
   - EAS CLI: `npm install -g eas-cli`

3. **Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Fill in all required values
   - Never commit `.env.local` to git

---

## Initial Setup

### 1. Firebase Setup

```bash
# Login to Firebase
firebase login

# Initialize Firebase (if not done)
firebase init

# Select:
# - Firestore
# - Storage
# - Hosting (optional)
# - Emulators (for development)

# Deploy Firestore rules and indexes
firebase deploy --only firestore:rules,firestore:indexes,storage:rules
```

#### Create Service Account

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file securely
4. Extract values for `.env.local`:
   - `FIREBASE_PRIVATE_KEY`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PROJECT_ID`

### 2. Stripe Setup

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Get your keys from Stripe Dashboard
# Add to .env.local:
# - NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# - STRIPE_SECRET_KEY

# Test webhook locally
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

#### Configure Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

### 3. Upstash Redis Setup

1. Go to [Upstash Console](https://console.upstash.com)
2. Create a new Redis database
3. Copy REST URL and token to:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

---

## Web App Deployment (Vercel)

### One-Time Setup

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project
cd apps/web
vercel link
```

### Deploy to Production

```bash
# Build and deploy
pnpm run deploy:web

# Or manually:
cd apps/web
vercel --prod
```

### Environment Variables

Add environment variables in Vercel Dashboard:

1. Go to Project → Settings → Environment Variables
2. Add all variables from `.env.example`
3. Set different values for Production, Preview, and Development

### Custom Domain

1. Vercel Dashboard → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Enable HTTPS (automatic with Vercel)

### Cron Jobs

Configure cron jobs in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-bookings",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/cleanup-storage",
      "schedule": "0 2 * * *"
    }
  ]
}
```

---

## Mobile App Deployment (EAS)

### One-Time Setup

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure EAS
cd apps/mobile
eas build:configure
```

### iOS Deployment

#### Prerequisites
- Apple Developer account ($99/year)
- App Store Connect access

```bash
# Build for iOS
pnpm run deploy:mobile:ios

# Or manually:
cd apps/mobile
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios
```

#### App Store Setup

1. Create app in App Store Connect
2. Fill in app information
3. Upload screenshots and metadata
4. Submit for review

### Android Deployment

#### Prerequisites
- Google Play Developer account ($25 one-time)

```bash
# Build for Android
pnpm run deploy:mobile:android

# Or manually:
cd apps/mobile
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android
```

#### Google Play Setup

1. Create app in Google Play Console
2. Complete store listing
3. Upload screenshots and metadata
4. Create production release

### Over-The-Air (OTA) Updates

For quick updates without app store review:

```bash
# Publish OTA update
cd apps/mobile
eas update --branch production --message "Bug fixes and improvements"
```

**Note:** OTA updates only work for JavaScript changes, not native code.

---

## Database Deployment

### Firestore

```bash
# Deploy rules and indexes
firebase deploy --only firestore:rules,firestore:indexes

# Deploy storage rules
firebase deploy --only storage:rules
```

### Backups

#### Automatic Backups

```bash
# Schedule weekly backups
gcloud firestore backups schedules create \
  --database='(default)' \
  --recurrence=weekly \
  --retention=4w
```

#### Manual Backup

```bash
# Export Firestore data
gcloud firestore export gs://your-bucket/backups/$(date +%Y%m%d)

# Import Firestore data
gcloud firestore import gs://your-bucket/backups/20250114
```

---

## Monitoring and Logging

### Vercel Analytics

Enabled automatically. View in Vercel Dashboard.

### Firebase Console

- Monitor Firestore usage
- Check Authentication logs
- Review Storage metrics

### Sentry (Recommended)

```bash
# Install Sentry
pnpm add -w @sentry/nextjs @sentry/react-native

# Configure in apps/web/sentry.config.js
# and apps/mobile/app.json
```

Add to `.env.local`:
```
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-auth-token
```

---

## Performance Optimization

### Web App

1. **Image Optimization**
   ```typescript
   // Use next/image
   import Image from 'next/image';

   <Image
     src="/path/to/image.jpg"
     width={800}
     height={600}
     alt="Description"
   />
   ```

2. **Code Splitting**
   ```typescript
   // Dynamic imports
   const Map = dynamic(() => import('@/components/Map'), {
     ssr: false,
     loading: () => <LoadingSpinner />
   });
   ```

3. **Caching**
   - Configure `Cache-Control` headers
   - Use Vercel Edge Network
   - Implement Redis caching

### Mobile App

1. **Bundle Size**
   ```bash
   # Analyze bundle
   cd apps/mobile
   npx expo-analyze
   ```

2. **Image Optimization**
   - Use WebP format
   - Compress images
   - Lazy load images

3. **Native Optimization**
   ```bash
   # Enable Hermes engine (Android)
   # Already configured in app.json
   ```

---

## Security Checklist

### Pre-Deployment

- [ ] All environment variables set correctly
- [ ] Firestore rules tested and deployed
- [ ] Storage rules tested and deployed
- [ ] API keys restricted by domain/app
- [ ] Stripe webhooks configured with secrets
- [ ] HTTPS enforced
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (N/A for Firestore)
- [ ] XSS protection enabled
- [ ] CSRF protection configured
- [ ] Dependency audit: `pnpm audit`

### Post-Deployment

- [ ] Test all critical flows
- [ ] Verify payment processing
- [ ] Check error tracking
- [ ] Monitor performance
- [ ] Review security logs
- [ ] Test backup restoration
- [ ] Verify cron jobs running
- [ ] Check email delivery
- [ ] Test mobile app store listings

---

## CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test

  deploy-web:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm build --filter=@enatbet/web
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Rollback Procedures

### Web App

```bash
# Revert to previous deployment
vercel rollback

# Or redeploy a specific deployment
vercel --prod [deployment-url]
```

### Mobile App

```bash
# Revert OTA update
eas update --branch production --message "Rollback" --republish
```

### Database

```bash
# Restore from backup
gcloud firestore import gs://your-bucket/backups/20250114
```

---

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache
   pnpm clean
   rm -rf node_modules
   pnpm install
   ```

2. **Environment Variables Not Loading**
   - Check Vercel Dashboard
   - Verify `.env.local` locally
   - Restart development server

3. **Firebase Permission Errors**
   - Review Firestore rules
   - Check user authentication
   - Verify service account permissions

4. **Payment Failures**
   - Check Stripe Dashboard logs
   - Verify webhook signature
   - Review API error logs

---

## Support and Maintenance

### Regular Maintenance

- **Weekly**: Review error logs
- **Monthly**: Update dependencies
- **Quarterly**: Security audit
- **Annually**: Review and update documentation

### Getting Help

- Firebase Support: [firebase.google.com/support](https://firebase.google.com/support)
- Vercel Support: [vercel.com/support](https://vercel.com/support)
- Stripe Support: [support.stripe.com](https://support.stripe.com)

---

## Post-Deployment Checklist

- [ ] Web app accessible at production URL
- [ ] Mobile app submitted to app stores
- [ ] All environment variables configured
- [ ] Monitoring and logging active
- [ ] Backups scheduled
- [ ] Cron jobs running
- [ ] Email notifications working
- [ ] Payment flow tested
- [ ] Error tracking configured
- [ ] Performance metrics baseline established
- [ ] Security scan completed
- [ ] Documentation updated
- [ ] Team notified
