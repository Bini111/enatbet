# Operational Runbook

This runbook contains operational procedures for managing the Enatebet platform in production.

## Table of Contents

1. [Incident Response](#incident-response)
2. [Common Operations](#common-operations)
3. [Monitoring](#monitoring)
4. [Backup and Recovery](#backup-and-recovery)
5. [Scaling](#scaling)
6. [Troubleshooting Guide](#troubleshooting-guide)

---

## Incident Response

### Severity Levels

| Level | Description | Response Time | Example |
|-------|-------------|---------------|---------|
| P0 | Critical - Service down | Immediate | Complete outage, payment system down |
| P1 | High - Major feature broken | < 1 hour | Booking creation failing, login broken |
| P2 | Medium - Minor feature issue | < 4 hours | Search not working, images not loading |
| P3 | Low - Cosmetic or minor bug | < 24 hours | UI glitch, typo |

### P0 Incident Response

1. **Acknowledge**
   - Acknowledge the incident in your monitoring tool
   - Notify the team in emergency channel

2. **Assess**
   - Check Vercel status dashboard
   - Check Firebase status
   - Review recent deployments
   - Check error logs

3. **Mitigate**
   - Rollback if recent deployment caused issue
   - Enable maintenance mode if needed
   - Scale resources if capacity issue

4. **Resolve**
   - Fix the root cause
   - Deploy fix
   - Verify resolution

5. **Post-Mortem**
   - Document incident
   - Identify root cause
   - Create action items

### Emergency Contacts

```
On-Call Engineer: [Phone/Email]
Firebase Support: firebase.google.com/support
Vercel Support: vercel.com/support
Stripe Support: support.stripe.com
```

---

## Common Operations

### Deploying Updates

#### Web App

```bash
# 1. Test locally
pnpm dev

# 2. Run type checking
pnpm typecheck

# 3. Run linter
pnpm lint

# 4. Deploy to Vercel
pnpm run deploy:web

# 5. Verify deployment
# - Check Vercel deployment logs
# - Test critical flows
# - Monitor error rates
```

#### Mobile App (OTA Update)

```bash
# 1. Test on simulator/device
cd apps/mobile
expo start

# 2. Publish update
eas update --branch production --message "Description of changes"

# 3. Verify
# - Check EAS dashboard
# - Test on physical device
# - Monitor crash reports
```

### Database Operations

#### Querying Data

```javascript
// Get user by ID
const userRef = db.collection('users').doc(userId);
const userDoc = await userRef.get();
const userData = userDoc.data();

// Query bookings for a listing
const bookingsQuery = db.collection('bookings')
  .where('listingId', '==', listingId)
  .where('status', '==', 'confirmed')
  .orderBy('checkIn', 'desc')
  .limit(10);

const bookingsSnapshot = await bookingsQuery.get();
const bookings = bookingsSnapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));
```

#### Updating Data

```javascript
// Update booking status
await db.collection('bookings').doc(bookingId).update({
  status: 'cancelled',
  'cancellation.cancelledAt': new Date(),
  'cancellation.cancelledBy': 'admin',
  'cancellation.reason': 'Refund requested',
  updatedAt: new Date()
});
```

#### Bulk Operations

```bash
# Export data
gcloud firestore export gs://your-bucket/exports/$(date +%Y%m%d)

# Import data
gcloud firestore import gs://your-bucket/exports/20250114

# Delete collection (careful!)
firebase firestore:delete --recursive /path/to/collection
```

### User Management

#### Verify User

```javascript
// In Firebase Console or via Admin SDK
import { getAuth } from 'firebase-admin/auth';

await getAuth().updateUser(uid, {
  emailVerified: true
});
```

#### Disable User

```javascript
await getAuth().updateUser(uid, {
  disabled: true
});

// Also update Firestore
await db.collection('users').doc(uid).update({
  status: 'suspended',
  updatedAt: new Date()
});
```

#### Delete User

```javascript
// 1. Mark as deleted in Firestore
await db.collection('users').doc(uid).update({
  status: 'deleted',
  deletedAt: new Date()
});

// 2. Anonymize data (GDPR compliance)
await db.collection('users').doc(uid).update({
  email: `deleted-${uid}@enatebet.com`,
  displayName: 'Deleted User',
  phoneNumber: null,
  photoURL: null
});

// 3. Delete from Auth (optional)
await getAuth().deleteUser(uid);
```

### Payment Operations

#### Refund a Booking

```javascript
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 1. Get booking
const booking = await db.collection('bookings').doc(bookingId).get();
const { payment } = booking.data();

// 2. Process refund
const refund = await stripe.refunds.create({
  payment_intent: payment.stripePaymentIntentId,
  amount: 10000, // Amount in cents
  reason: 'requested_by_customer'
});

// 3. Update booking
await db.collection('bookings').doc(bookingId).update({
  'payment.refundAmount': 100,
  'payment.refundedAt': new Date(),
  'payment.status': 'refunded',
  status: 'refunded'
});
```

#### Check Payment Status

```bash
# Using Stripe CLI
stripe payment_intents retrieve pi_xyz

# Or check Stripe Dashboard
# https://dashboard.stripe.com/payments
```

### Listing Operations

#### Feature a Listing

```javascript
await db.collection('listings').doc(listingId).update({
  featured: true,
  'stats.views': admin.firestore.FieldValue.increment(0) // Touch to update
});
```

#### Suspend a Listing

```javascript
await db.collection('listings').doc(listingId).update({
  status: 'suspended',
  suspendedAt: new Date(),
  suspensionReason: 'Policy violation',
  updatedAt: new Date()
});
```

---

## Monitoring

### Key Metrics

#### Application Health

- **Response Time**: P95 < 500ms
- **Error Rate**: < 1%
- **Availability**: > 99.9%

#### Business Metrics

- **Booking Conversion Rate**: Target > 5%
- **Average Booking Value**: Track trends
- **New Listings per Week**: Growth indicator
- **Active Users**: Daily/Monthly active users

### Monitoring Tools

#### Vercel Analytics

```
URL: https://vercel.com/dashboard/analytics
Metrics: Page views, unique visitors, performance
```

#### Firebase Console

```
URL: https://console.firebase.google.com
Sections:
- Firestore usage and metrics
- Authentication logs
- Storage usage
- Performance monitoring
```

#### Stripe Dashboard

```
URL: https://dashboard.stripe.com
Monitors: Payments, failed charges, disputes
```

### Alerts Configuration

Set up alerts for:

- Error rate > 5% for 5 minutes
- Response time P95 > 1000ms for 10 minutes
- Payment failure rate > 10% for 5 minutes
- Firestore usage > 80% of quota
- Storage usage > 80% of quota

### Log Locations

```bash
# Vercel logs
vercel logs [deployment-url]

# Firebase logs (requires setup)
gcloud logging read "resource.type=cloud_function"

# Local logs
tail -f apps/web/.next/server.log
```

---

## Backup and Recovery

### Automated Backups

#### Firestore

```bash
# Check backup schedule
gcloud firestore backups schedules list

# View backups
gcloud firestore backups list

# Backup retention: 4 weeks
```

#### Firebase Storage

- Files replicated automatically
- Enable versioning in Firebase Console
- Configure lifecycle rules for old files

### Manual Backup

```bash
# Firestore export
gcloud firestore export \
  --collection-ids='users,listings,bookings,reviews' \
  gs://your-backup-bucket/manual-backup-$(date +%Y%m%d-%H%M%S)

# Download backup locally (optional)
gsutil -m cp -r gs://your-backup-bucket/manual-backup-* ./backups/
```

### Restore Procedures

#### Full Database Restore

```bash
# WARNING: This will overwrite existing data!

# 1. Confirm backup location
gsutil ls gs://your-backup-bucket/

# 2. Import backup
gcloud firestore import gs://your-backup-bucket/backups/20250114

# 3. Verify data
# Check critical collections in Firebase Console
```

#### Partial Restore

```bash
# Restore specific collection
gcloud firestore import \
  --collection-ids='listings' \
  gs://your-backup-bucket/backups/20250114
```

#### Point-in-Time Recovery

```bash
# Restore to specific time
gcloud firestore import \
  --async \
  gs://your-backup-bucket/backups/20250114T120000
```

---

## Scaling

### Auto-Scaling

- **Vercel**: Automatically scales web app
- **Firebase**: Automatically scales Firestore and Storage

### Manual Scaling

#### Increase Firestore Limits

1. Go to Firebase Console
2. Navigate to Firestore → Usage
3. Upgrade to higher tier if needed

#### Optimize Queries

```javascript
// BAD: Full collection scan
const allListings = await db.collection('listings').get();

// GOOD: Indexed query with limits
const listings = await db.collection('listings')
  .where('status', '==', 'active')
  .where('city', '==', 'Addis Ababa')
  .orderBy('createdAt', 'desc')
  .limit(20)
  .get();
```

#### Add Caching

```typescript
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Cache listing data
const cacheKey = `listing:${listingId}`;
let listing = await redis.get(cacheKey);

if (!listing) {
  listing = await db.collection('listings').doc(listingId).get();
  await redis.set(cacheKey, listing, { ex: 3600 }); // 1 hour TTL
}
```

---

## Troubleshooting Guide

### Web App Not Loading

**Symptoms**: Blank page, 500 errors

**Diagnosis**:
```bash
# Check Vercel deployment status
vercel inspect [deployment-url]

# Check recent deployments
vercel list

# View logs
vercel logs [deployment-url] --follow
```

**Solutions**:
1. Rollback to previous deployment
2. Check environment variables
3. Verify Firebase connection
4. Check for JavaScript errors in browser console

### Bookings Not Creating

**Symptoms**: Booking form submits but nothing happens

**Diagnosis**:
```bash
# Check API logs
vercel logs --filter="/api/bookings"

# Check Firestore rules
firebase deploy --only firestore:rules --dry-run

# Test payment intent creation
stripe payment_intents create --amount=1000 --currency=usd
```

**Solutions**:
1. Verify Stripe keys are correct
2. Check Firestore security rules
3. Verify user is authenticated
4. Check for validation errors

### Payment Failures

**Symptoms**: Users can't complete payment

**Diagnosis**:
```bash
# Check Stripe dashboard for failed payments
stripe charges list --limit=10

# Check webhook deliveries
stripe events list --limit=10
```

**Solutions**:
1. Verify Stripe webhook is configured
2. Check webhook secret matches
3. Verify payment intent creation
4. Check for 3D Secure issues

### Images Not Loading

**Symptoms**: Broken images on listings

**Diagnosis**:
```bash
# Check Firebase Storage rules
firebase deploy --only storage:rules --dry-run

# Verify file exists
gsutil ls gs://your-bucket/listings/
```

**Solutions**:
1. Check Storage security rules
2. Verify file was uploaded
3. Check CORS configuration
4. Verify URL format

### High Error Rates

**Symptoms**: Spike in errors in logs

**Diagnosis**:
```bash
# Analyze error logs
vercel logs --since=1h | grep "ERROR"

# Check Firebase quota
# Visit: https://console.firebase.google.com/project/_/usage
```

**Solutions**:
1. Identify common error patterns
2. Check for quota limits
3. Verify external service status
4. Review recent deployments

### Slow Performance

**Symptoms**: Pages loading slowly

**Diagnosis**:
```bash
# Check Vercel analytics
# URL: https://vercel.com/dashboard/analytics

# Profile slow queries
# Use Firestore console to identify slow queries
```

**Solutions**:
1. Add missing Firestore indexes
2. Implement caching
3. Optimize images
4. Review bundle size

---

## Maintenance Windows

### Scheduled Maintenance

- **Time**: Tuesdays, 2:00 AM - 4:00 AM UTC
- **Frequency**: Monthly (first Tuesday)
- **Notification**: 48 hours advance notice to users

### Maintenance Checklist

- [ ] Announce maintenance window
- [ ] Deploy updates to staging
- [ ] Test all critical flows
- [ ] Deploy to production
- [ ] Monitor for errors
- [ ] Verify all services operational
- [ ] Send completion notification

---

## Useful Commands

### Firebase

```bash
# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
firebase deploy --only firestore:indexes

# Start emulators
firebase emulators:start

# View Firestore data
firebase firestore:get users/[userId]
```

### Vercel

```bash
# List deployments
vercel list

# View logs
vercel logs

# Rollback
vercel rollback

# Environment variables
vercel env ls
vercel env add [NAME]
```

### Stripe

```bash
# List recent payments
stripe charges list --limit=10

# Refund payment
stripe refunds create --charge=ch_xyz --amount=5000

# Test webhook
stripe trigger payment_intent.succeeded
```

---

## On-Call Procedures

### On-Call Rotation

- **Duration**: 1 week per person
- **Handoff**: Mondays at 9:00 AM
- **Escalation**: After 30 minutes, escalate to next person

### On-Call Responsibilities

1. Respond to alerts within 15 minutes
2. Investigate and resolve incidents
3. Document all incidents
4. Update runbook with new procedures
5. Hand off any ongoing issues

### Alert Response

1. **Acknowledge**: Acknowledge alert immediately
2. **Assess**: Gather information about the issue
3. **Act**: Take action to resolve or mitigate
4. **Communicate**: Update stakeholders
5. **Document**: Record actions taken

---

## Change Management

### Pre-Deployment Checklist

- [ ] Code reviewed and approved
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Rollback plan prepared
- [ ] Stakeholders notified (if major change)

### Deployment Process

1. Merge PR to main branch
2. Automated CI/CD deploys to staging
3. Test on staging
4. Manual approval for production
5. Deploy to production
6. Monitor for issues

### Post-Deployment

- Verify deployment successful
- Monitor error rates for 30 minutes
- Check key metrics
- Update status page if needed

---

## Contact Information

### Team

- **Engineering Lead**: [Name/Contact]
- **DevOps**: [Name/Contact]
- **Product Manager**: [Name/Contact]

### External Support

- **Firebase**: firebase.google.com/support
- **Vercel**: vercel.com/support
- **Stripe**: support.stripe.com
- **Expo**: expo.dev/support
