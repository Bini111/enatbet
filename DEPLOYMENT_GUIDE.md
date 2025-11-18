# 🚀 Enatbet Production Deployment Guide

**Last Updated:** November 17, 2025  
**Target:** iOS App Store & Google Play Store

---

## 📋 Prerequisites Checklist

### ✅ Before You Start:
- [ ] Apple Developer Account ($99/year) - https://developer.apple.com
- [ ] Google Play Console Account ($25 one-time) - https://play.google.com/console
- [ ] Domain verified: enatbet.app
- [ ] Firebase project in production mode
- [ ] Stripe account in live mode with Connect enabled
- [ ] All real environment variables filled in `.env.local`
- [ ] Privacy Policy & Terms of Service live at:
  - https://enatbet.app/privacy-policy.html
  - https://enatbet.app/terms-of-service.html

---

## 🎯 PHASE 1: Environment Setup (30 mins)

### Step 1.1: Get Your EAS Project ID
```bash
cd apps/mobile
eas init
# Save the project ID shown
```

### Step 1.2: Update Environment Variables
```bash
# Edit .env.local in project root
nano .env.local

# Add these (replace with real values):
EXPO_PUBLIC_EAS_PROJECT_ID=<your-eas-project-id>
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...  # LIVE key, not test
EXPO_PUBLIC_FIREBASE_API_KEY=<real-firebase-key>
# ... (fill all Firebase values from Firebase Console)
```

### Step 1.3: Update app.config.ts
```bash
# Verify all placeholders are replaced:
cat apps/mobile/app.config.ts | grep "your-"
# Should return NO results
```

### Step 1.4: Update eas.json
```bash
# Edit apps/mobile/eas.json
nano apps/mobile/eas.json

# Replace these:
"appleId": "your-real-email@icloud.com"
"ascAppId": "1234567890"  # Get from App Store Connect
"appleTeamId": "AB12CD3EF4"  # Get from developer.apple.com
```

---

## 🍎 PHASE 2: iOS App Store Submission (2-3 hours)

### Step 2.1: App Store Connect Setup
1. Go to https://appstoreconnect.apple.com
2. Click **"My Apps"** → **"+"** → **"New App"**
3. Fill in:
   - **Platform:** iOS
   - **Name:** Enatbet
   - **Primary Language:** English
   - **Bundle ID:** `app.enatbet.mobile` (must match app.config.ts)
   - **SKU:** `app-enatbet-mobile`
4. Click **"Create"**
5. Save the **App Store Connect ID** (10-digit number)

### Step 2.2: Configure iOS Credentials
```bash
cd apps/mobile

# EAS will guide you through certificate setup
eas credentials

# Choose:
# > iOS > Production > All
# Follow prompts to create/reuse certificates
```

### Step 2.3: Build Production iOS App
```bash
# Update version if needed
nano app.config.ts
# Change: version: "1.0.0" to "1.0.1" if rebuilding

# Build for production
eas build --platform ios --profile production

# Wait 15-20 minutes for build to complete
# Build URL will be shown - download .ipa file
```

### Step 2.4: Upload to App Store Connect
```bash
# Submit directly via EAS
eas submit --platform ios --latest --profile production

# Or download .ipa and upload via Transporter app:
# https://apps.apple.com/us/app/transporter/id1450874784
```

### Step 2.5: Complete App Store Listing
1. Go back to App Store Connect
2. Fill in **App Information:**
   - **Category:** Travel or Lifestyle
   - **Content Rights:** Check if you own all rights
3. Add **App Privacy** (required):
   - Click **"App Privacy"** → **"Get Started"**
   - Answer questions based on Privacy Policy:
     - **Collect Data:** Yes (name, email, location, payment)
     - **Track Users:** No
     - **Link to Privacy Policy:** https://enatbet.app/privacy-policy.html
4. Add **Screenshots** (required):
   - **6.5" iPhone:** 1290 x 2796 (3 required)
   - **5.5" iPhone:** 1242 x 2208 (for older devices)
   - Use app to take screenshots or design in Figma/Sketch
5. Fill in **Description:**
```
   Enatbet - Find Your Home Away From Home
   
   Discover unique properties for rent from verified hosts in the Ethiopian and Eritrean diaspora community worldwide.
   
   Features:
   • Browse thousands of verified properties
   • Instant booking with secure payments
   • Real-time messaging with hosts
   • Reviews and ratings
   • 24/7 customer support
   
   Whether you're traveling for business or leisure, Enatbet connects you with welcoming hosts and comfortable stays.
```
6. Add **Keywords:** property rental, travel, accommodation, booking, vacation rental
7. Add **Support URL:** https://enatbet.app
8. Add **Marketing URL:** https://enatbet.app
9. Upload **App Icon:** 1024x1024 PNG (from assets/icon.png)

### Step 2.6: Prepare for Review
1. **Age Rating:**
   - Alcohol/Tobacco: None
   - Contests: None
   - Gambling: None
   - Horror/Fear: None
   - Mature/Suggestive: Infrequent/Mild
   - Medical/Treatment: None
   - Profanity/Crude Humor: None
   - Sexual Content: None
   - Violence: None
   - **Result:** 12+ or 17+
2. **Review Information:**
   - **Sign-In Required:** Yes
   - **Demo Account:** Provide test credentials
```
     Email: testuser@enatbet.app
     Password: TestPassword123!
```
   - **Notes for Reviewer:**
```
     Test account provided above. To test booking:
     1. Browse listings
     2. Select any property
     3. Choose dates and book
     4. Use Stripe test card: 4242 4242 4242 4242
```
3. **Export Compliance:**
   - Uses Encryption: Yes (HTTPS)
   - Export Compliance: Your app uses standard encryption

### Step 2.7: Submit for Review
1. Click **"Add for Review"**
2. Select **"Submit to App Review"**
3. Review typically takes **24-48 hours**
4. You'll receive email updates

---

## 🤖 PHASE 3: Google Play Store Submission (2-3 hours)

### Step 3.1: Google Play Console Setup
1. Go to https://play.google.com/console
2. Click **"Create app"**
3. Fill in:
   - **App name:** Enatbet
   - **Default language:** English (United States)
   - **App or game:** App
   - **Free or paid:** Free
4. Accept declarations and click **"Create app"**

### Step 3.2: Configure Android Credentials
```bash
cd apps/mobile

# Create service account for Play Store API:
# 1. Go to Google Cloud Console
# 2. Create service account
# 3. Grant "Service Account User" role
# 4. Download JSON key
# 5. Save as google-play-service-account.json

# Upload to EAS
eas credentials

# Choose:
# > Android > Production
# Upload service account JSON when prompted
```

### Step 3.3: Build Production Android App
```bash
# Build for production (AAB format for Play Store)
eas build --platform android --profile production

# Wait 15-20 minutes for build to complete
```

### Step 3.4: Set Up App Content
1. **App Access:**
   - All functionality available without restrictions? No
   - Requires login? Yes
   - Provide demo credentials (same as iOS)

2. **Ads:**
   - Contains ads? No

3. **Content Rating:**
   - Complete questionnaire (similar to iOS age rating)
   - Result: Everyone, Mature 17+, or Adults only 18+

4. **Target Audience:**
   - Age groups: 18 and over
   - Appeals to children? No

5. **News App:**
   - Is this a news app? No

6. **COVID-19 Contact Tracing:**
   - Related to COVID-19? No

7. **Data Safety:**
   - Click **"Data safety"** → **"Start"**
   - Does your app collect or share data? Yes
   - Answer based on Privacy Policy:
     - **Location:** Approximate (for nearby properties)
     - **Personal Info:** Name, email, phone
     - **Financial Info:** Payment info (via Stripe)
     - **Photos:** Optional (profile, property photos)
   - Data handling:
     - Encrypted in transit? Yes
     - Users can request deletion? Yes
   - Privacy Policy URL: https://enatbet.app/privacy-policy.html

### Step 3.5: Create Store Listing
1. **Main Store Listing:**
   - **App name:** Enatbet
   - **Short description (80 chars):**
```
     Find and book unique properties from verified hosts worldwide.
```
   - **Full description (4000 chars):**
```
     Enatbet - Your Home Away From Home
     
     Discover and book unique properties from verified hosts in the Ethiopian and Eritrean diaspora community worldwide.
     
     WHY ENATBET?
     • Browse thousands of verified listings
     • Secure payments with Stripe
     • Instant booking confirmation
     • Real-time messaging with hosts
     • Verified host identities
     • 24/7 customer support
     • Read genuine reviews from travelers
     
     FEATURES:
     🏠 Property Search: Find apartments, houses, and unique stays
     📍 Location-Based: Discover nearby properties
     💳 Secure Payments: Powered by Stripe
     💬 Direct Messaging: Chat with hosts instantly
     ⭐ Reviews & Ratings: Make informed decisions
     📱 Easy Booking: Reserve in just a few taps
     
     ABOUT ENATBET:
     Enatbet connects travelers with welcoming hosts, creating meaningful cultural exchanges and comfortable stays. Whether you're visiting for business, vacation, or visiting family, find your perfect home away from home.
     
     SUPPORT:
     Need help? Contact us at support@enatbet.app
     
     By using Enatbet, you agree to our Terms of Service and Privacy Policy available at enatbet.app.
```
   - **App icon:** 512x512 PNG (32-bit with alpha)
   - **Feature graphic:** 1024x500 (required for store listing)
   - **Screenshots:** 
     - Phone: 16:9 or 9:16 ratio (minimum 2, maximum 8)
     - 7" Tablet: Optional
     - 10" Tablet: Optional

2. **Contact Details:**
   - Email: support@enatbet.app
   - Phone: +1-XXX-XXX-XXXX (optional)
   - Website: https://enatbet.app

3. **Store Settings:**
   - **App category:** Travel & Local
   - **Tags:** property rental, booking, travel, accommodation

### Step 3.6: Release Configuration
1. **Production Release:**
   - Click **"Production"** → **"Create new release"**
   - Upload AAB file from EAS build
   - **Release name:** 1.0.0 (or current version)
   - **Release notes:**
```
     Initial release of Enatbet!
     
     • Browse and book unique properties
     • Secure payments with Stripe
     • Real-time messaging with hosts
     • Reviews and ratings
     • 24/7 support
```

2. **Countries/Regions:**
   - Select countries where you want to distribute
   - Start with: United States, Canada, United Kingdom, Ethiopia, Eritrea

3. **Review and Rollout:**
   - Click **"Review release"**
   - Check all information
   - Click **"Start rollout to Production"**

### Step 3.7: Submit for Review
- Google Play review typically takes **1-3 days**
- Less strict than Apple (usually faster approval)
- Monitor status in Play Console

---

## 🌐 PHASE 4: Web Deployment (30 mins)

### Step 4.1: Deploy to Vercel
```bash
cd apps/web

# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Follow prompts:
# > Link to existing project? No
# > Project name: enatbet-web
# > Directory: ./
```

### Step 4.2: Configure Vercel Environment Variables
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add all from `.env.local`:
```
   NEXT_PUBLIC_FIREBASE_API_KEY
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   ... (all NEXT_PUBLIC_* variables)
   FIREBASE_SERVICE_ACCOUNT_KEY
   STRIPE_SECRET_KEY
   STRIPE_WEBHOOK_SECRET
```

### Step 4.3: Configure Domain
1. In Vercel: Settings → Domains
2. Add: `enatbet.app`
3. Follow DNS configuration instructions
4. Wait for SSL certificate (automatic, ~5 mins)

### Step 4.4: Test Production Web
```bash
# Visit your site
open https://enatbet.app

# Test key features:
# 1. Sign up / Login
# 2. Browse listings
# 3. Make test booking (use Stripe test card in production with test mode flag)
```

---

## 📱 PHASE 5: TestFlight & Internal Testing (1 week)

### iOS TestFlight
```bash
# After App Store Connect approval, enable TestFlight
# 1. Go to App Store Connect → TestFlight
# 2. Add internal testers (up to 100)
# 3. Share TestFlight link
# 4. Collect feedback for 1 week
```

### Android Internal Testing
```bash
# In Play Console → Testing → Internal testing
# 1. Create internal test track
# 2. Add testers (email list)
# 3. Share opt-in link
# 4. Collect feedback for 1 week
```

### Beta Testing Checklist
- [ ] Auth (signup/login) works
- [ ] Browse listings loads correctly
- [ ] Booking flow completes end-to-end
- [ ] Stripe payment processes (test mode if using test build)
- [ ] Host dashboard shows correct data
- [ ] Push notifications work (if enabled)
- [ ] Images upload correctly
- [ ] Messaging works between users
- [ ] No crashes or major bugs

---

## 🐛 PHASE 6: Bug Fixes & Updates (Ongoing)

### If App is Rejected:
1. Read rejection reason carefully
2. Common issues:
   - **Demo account not working:** Verify test credentials
   - **Missing functionality:** Complete unfinished features
   - **Privacy Policy incomplete:** Update Privacy Policy page
   - **Crashes:** Fix and resubmit
3. Fix issues and resubmit:
```bash
# Increment version
# Update app.config.ts: version: "1.0.1"

# Rebuild
eas build --platform ios --profile production
eas submit --platform ios --latest

# Resubmit with notes addressing reviewer concerns
```

### Pushing Updates:
```bash
# For minor updates (no native code changes):
eas update --branch production --message "Bug fixes"

# For major updates:
# 1. Increment version in app.config.ts
# 2. Rebuild: eas build --platform all --profile production
# 3. Submit new version to stores
```

---

## ✅ PHASE 7: Post-Launch (Week 1)

### Day 1: Monitor
- [ ] Check error tracking (Sentry/Firebase Crashlytics)
- [ ] Monitor server logs for API errors
- [ ] Watch for user feedback in reviews

### Week 1: Optimize
- [ ] Respond to all reviews (positive and negative)
- [ ] Fix critical bugs with hotfix updates
- [ ] Monitor conversion rates (signups → bookings)
- [ ] Check payment success rates in Stripe

### Marketing:
- [ ] Submit to ProductHunt
- [ ] Post on social media (Twitter, LinkedIn, Instagram)
- [ ] Reach out to diaspora communities
- [ ] Consider paid ads (Google, Facebook, Instagram)

---

## 📞 Support Contacts

### If You Get Stuck:

**Apple Issues:**
- App Store Connect Support: https://developer.apple.com/contact/
- Phone: 1-800-633-2152 (Developer Support)

**Google Issues:**
- Play Console Help: https://support.google.com/googleplay/android-developer
- Email: googleplaydev-support@google.com

**EAS Build Issues:**
```bash
# Check build logs
eas build:list

# Get help
npx expo-doctor
```

**Firebase Issues:**
- Firebase Console: https://console.firebase.google.com
- Support: firebase.google.com/support

**Stripe Issues:**
- Stripe Dashboard: https://dashboard.stripe.com
- Support: https://support.stripe.com

---

## 🎉 CONGRATULATIONS!

Once approved, your apps will be live on:
- 🍎 App Store: https://apps.apple.com/app/enatbet/[your-app-id]
- 🤖 Play Store: https://play.google.com/store/apps/details?id=app.enatbet.mobile

**Average Timeline:**
- iOS: 24-48 hours review
- Android: 1-3 days review
- **Total Time to Launch:** 1-2 weeks from start

---

## 📚 Additional Resources

- [Expo EAS Docs](https://docs.expo.dev/eas/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policies](https://play.google.com/about/developer-content-policy/)
- [Stripe Connect Docs](https://stripe.com/docs/connect)
- [Firebase Production Checklist](https://firebase.google.com/support/guides/launch-checklist)

---

**Good luck with your launch!** 🚀
