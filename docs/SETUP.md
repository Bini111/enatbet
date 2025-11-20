# Environment Setup Guide

## Quick Start

1. **Copy environment template:**
```bash
   cp .env.example .env.local
```

2. **Generate internal secret:**
```bash
   openssl rand -base64 32
```
   Paste output into `.env.local` as `INTERNAL_API_SECRET`

3. **Get Stripe keys:** https://dashboard.stripe.com/apikeys
4. **Get Firebase credentials:** Firebase Console → Project Settings
5. **Never commit `.env.local`** (already in `.gitignore`)

---

## Required Environment Variables

### Stripe
- `STRIPE_SECRET_KEY` - sk_test_... (test) or sk_live_... (prod)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - pk_test_... or pk_live_...
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Same as web publishable key
- `STRIPE_WEBHOOK_SECRET` - whsec_... (from webhook setup below)
- `STRIPE_API_VERSION` - 2025-10-29.clover
- `EXPO_PUBLIC_STRIPE_API_VERSION` - 2025-10-29.clover

### Firebase Admin (server-only)
- `FIREBASE_SERVICE_ACCOUNT_KEY` - One-line JSON (see below)

### Firebase Web Client
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Firebase Mobile Client
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID_IOS`
- `EXPO_PUBLIC_FIREBASE_APP_ID_ANDROID`

### Business Config
- `PLATFORM_FEE_PERCENTAGE` - 0.15 (15%)
- `TAX_RATE` - 0.10 (10%)
- `MIN_BOOKING_AMOUNT_MAJOR` - 10 ($10 minimum)

### App URLs
- `NEXT_PUBLIC_APP_URL` - http://localhost:3000 (dev) or https://yourdomain.com (prod)
- `EXPO_PUBLIC_API_URL` - http://192.168.x.x:3000 (LAN for mobile dev)

### Mobile Deep Links (Optional)
- `ENATBET_APP_SCHEME` - enatbet (for native payment redirects)
- **Note:** Requires iOS Associated Domains / Android intent filters

---

## Stripe Webhook Setup (Development)
```bash
# 1. Login to Stripe CLI
stripe login

# 2. Forward webhook events to local server
stripe listen --forward-to http://localhost:3000/api/stripe/webhook

# 3. Copy the signing secret (whsec_***)
# Add to .env.local:
echo "STRIPE_WEBHOOK_SECRET=whsec_xxx" >> .env.local
```

**Production:** Add webhook endpoint in Stripe Dashboard → Webhooks with events: `payment_intent.succeeded`, `payment_intent.payment_failed`

---

## Firebase Admin Key (One-line JSON)

If you have `service-account.json`:
```bash
# macOS/Linux
jq -c . service-account.json | pbcopy

# Or manually: remove all newlines and paste as:
# FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

---

## Mobile Development Setup

### Find your LAN IP:
```bash
# macOS
ipconfig getifaddr en0

# Linux
hostname -I | awk '{print $1}'

# Windows
ipconfig | findstr IPv4
```

### Update .env.local:
```bash
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000
```

### Build Development Client (Required for Stripe)

**Expo Go does not support `@stripe/stripe-react-native`. You must build a development client:**
```bash
cd apps/mobile

# iOS (requires Xcode)
npx expo run:ios

# Android (requires Android Studio)
npx expo run:android
```

First build takes 5-10 minutes. Subsequent runs are faster.

---

## Stripe Connect (Host Onboarding)

For hosts to receive payouts:
1. Complete Stripe Connect onboarding flow
2. Store account ID in Firestore:
```
   users/{hostId}.stripeConnectAccountId = acct_***
```

---

## Testing with cURL

Get Firebase ID token from your app, then:
```bash
ID_TOKEN="<your_firebase_id_token>"

# Test create-payment endpoint
curl -X POST http://localhost:3000/api/stripe/create-payment \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId":"test-booking-1",
    "listingId":"test-listing-1",
    "pricePerNight":{"amount":15000,"currency":"USD"},
    "nights":2,
    "cleaningFee":{"amount":2000,"currency":"USD"}
  }'

# Test ephemeral-key endpoint
curl -X POST http://localhost:3000/api/stripe/ephemeral-key \
  -H "Authorization: Bearer $ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"apiVersion":"2025-10-29.clover"}'
```

---

## Development Workflow
```bash
# 1. Install dependencies
pnpm install

# 2. Start dev servers (Terminal 1)
pnpm dev

# 3. Start Stripe webhook listener (Terminal 2)
stripe listen --forward-to http://localhost:3000/api/stripe/webhook

# 4. Run mobile dev client (Terminal 3)
cd apps/mobile
npx expo run:ios    # or run:android
```

---

## Production Deployment

### Vercel (Web)
1. Connect GitHub repo
2. Add all environment variables in Settings → Environment Variables
3. Set `STRIPE_WEBHOOK_SECRET` to production webhook secret
4. Deploy: `vercel`

### Expo EAS (Mobile)
```bash
# Store secrets
eas secret:create --name STRIPE_SECRET_KEY --value sk_live_...
eas secret:create --name FIREBASE_SERVICE_ACCOUNT_KEY --value '{"type":...}'

# Build
eas build --platform all

# Submit to stores
eas submit --platform all
```

### CI/CD Environment Variables
- GitHub Actions: Settings → Secrets and Variables
- GitLab CI: Settings → CI/CD → Variables
- Use same keys as `.env.local`

---

## Environment Validation

The app validates required environment variables at startup. Missing variables throw descriptive errors.

## Troubleshooting

**"STRIPE_WEBHOOK_SECRET missing":**
- Run `stripe listen` and copy the signing secret

**"Firebase service account invalid":**
- Ensure JSON is on one line with escaped quotes

**Mobile can't reach API:**
- Use LAN IP, not localhost
- Ensure both devices on same network
- Check firewall allows port 3000

**"Amount too small" error:**
- Check `MIN_BOOKING_AMOUNT_MAJOR` setting
- Verify currency minimums (varies by country)

**Stripe PaymentSheet not loading:**
- Expo Go doesn't support Stripe
- Build development client: `npx expo run:ios`

---

## Security Best Practices

- Rotate `INTERNAL_API_SECRET` quarterly
- Run `pnpm audit` monthly
- Never commit `.env.local`
- Use Vercel/EAS secret managers for production
- Enable Stripe webhook signature verification
