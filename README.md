# EnatBet - Ethiopian/Eritrean Diaspora Accommodation App

<div align="center">
  <img src="src/assets/images/logo.png" alt="EnatBet Logo" width="200"/>
  
  [![React Native](https://img.shields.io/badge/React%20Native-0.76.1-blue.svg)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-SDK%2052-000.svg)](https://expo.dev/)
  [![Firebase](https://img.shields.io/badge/Firebase-10.7.1-orange.svg)](https://firebase.google.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
</div>

## 📱 Overview

EnatBet is a production-ready mobile application that connects the Ethiopian and Eritrean diaspora community worldwide through trusted accommodation sharing. Built as an Airbnb-style platform with cultural relevance at its core, EnatBet enables community members to host properties and book accommodations globally.

### Key Features

- 🏠 **Host & Guest Modes** - Switch between hosting your space and booking accommodations
- 🌍 **Global Reach** - Connect with diaspora communities worldwide
- 🔐 **Community Verification** - Trust-based system with identity verification
- 💳 **Secure Payments** - Stripe integration with multi-currency support
- 💬 **Real-time Messaging** - Chat with translation support (Amharic, Tigrinya, English)
- ⭐ **Reviews & Ratings** - Build trust through community feedback
- 🎉 **Cultural Events** - Discover community events and resources
- 📱 **Multi-platform** - iOS and Android support via React Native

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Expo CLI (`npm install -g expo-cli`)
- Firebase account with Blaze plan
- Stripe account
- Google Cloud account (for Maps API)
- iOS Simulator (Mac only) or Android Studio
- Physical device with Expo Go app (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/enatbet-app.git
   cd enatbet-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your API keys:
   - Firebase configuration
   - Google Maps API keys
   - Stripe keys
   - SendGrid API key

4. **Configure Firebase**
   - Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password, Google, Apple, Phone)
   - Enable Firestore Database
   - Enable Storage
   - Enable Cloud Functions (requires Blaze plan)
   - Copy your Firebase config to `.env`

5. **Deploy Firestore Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

6. **Deploy Cloud Functions**
   ```bash
   cd functions
   npm install
   npm run deploy
   cd ..
   ```

7. **Start the development server**
   ```bash
   npx expo start
   ```

8. **Run on device/simulator**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app for physical device

## 🏗️ Project Structure

```
enatbet-app/
├── App.tsx                    # Root component
├── app.json                   # Expo configuration
├── package.json               # Dependencies
├── tsconfig.json             # TypeScript config
├── babel.config.js           # Babel configuration
├── .env                      # Environment variables (create from .env.example)
├── firestore.rules           # Firestore security rules
├── storage.rules             # Storage security rules
├── functions/                # Firebase Cloud Functions
│   ├── src/
│   │   └── index.ts         # Cloud Functions implementation
│   └── package.json
└── src/
    ├── assets/              # Images, fonts, icons
    ├── components/          # Reusable components
    │   ├── common/         # Button, Input, Card, etc.
    │   ├── listing/        # ListingCard, ImageGallery, etc.
    │   ├── booking/        # BookingWidget, DatePicker, etc.
    │   └── search/         # SearchBar, FilterModal, etc.
    ├── config/             # Configuration files
    │   ├── firebase.ts     # Firebase setup
    │   ├── theme.ts        # App theme
    │   └── i18n.ts        # Internationalization
    ├── contexts/           # React contexts
    ├── hooks/              # Custom hooks
    ├── navigation/         # Navigation structure
    ├── screens/            # App screens
    │   ├── auth/          # Login, SignUp, Verification
    │   ├── guest/         # Home, Search, Booking
    │   ├── host/          # Dashboard, CreateListing
    │   ├── profile/       # Profile, Settings
    │   └── messaging/     # Inbox, Chat
    ├── services/           # API services
    ├── store/              # Zustand stores
    ├── types/              # TypeScript types
    └── utils/              # Utility functions
```

## 🔧 Configuration

### Firebase Configuration

1. **Authentication Setup**
   - Enable Email/Password authentication
   - Configure Google Sign-In
   - Set up Apple Sign-In (iOS only)
   - Enable Phone authentication with reCAPTCHA

2. **Firestore Indexes**
   Create composite indexes for:
   - `listings`: `status`, `createdAt`
   - `bookings`: `guestId`, `status`, `checkIn`
   - `reviews`: `listingId`, `createdAt`

3. **Storage Rules**
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /profile-images/{userId}/{fileName} {
         allow read: if true;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
       match /listing-images/{listingId}/{fileName} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

### Google Maps Setup

1. Enable APIs in Google Cloud Console:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Places API
   - Geocoding API

2. Restrict API keys:
   - iOS: Bundle ID restriction
   - Android: Package name + SHA-1 fingerprint

### Stripe Configuration

1. Set up Stripe account at [dashboard.stripe.com](https://dashboard.stripe.com)
2. Create webhook endpoint for payment events
3. Configure webhook to point to your Cloud Function URL
4. Add webhook secret to environment variables

## 📱 Features Implementation

### Authentication Flow
- Email/password registration with verification
- Social login (Google, Apple)
- Phone number verification
- Community verification system
- Profile completion wizard

### Listing Management
- Multi-step listing creation
- Photo upload (min 5, max 20)
- Amenities selection (standard + cultural)
- Availability calendar
- Pricing configuration
- Instant book option

### Booking System
- Date selection with availability check
- Guest count selector
- Price calculation with fees
- Stripe payment integration
- Booking confirmation
- Cancellation with refund

### Messaging
- Real-time chat using Firestore
- Image sharing
- Translation support (Amharic ↔ English ↔ Tigrinya)
- Push notifications
- Unread message badges

### Review System
- Post-stay reviews only
- Mutual review system (host ↔ guest)
- Rating categories
- Superhost badge calculation
- Review display on profiles

### Community Features
- Cultural events feed
- Ethiopian/Eritrean restaurants map
- Churches and community centers
- Emergency contacts
- Multi-language support

## 🌍 Internationalization

The app supports three languages:
- 🇬🇧 English (default)
- 🇪🇹 Amharic (አማርኛ)
- 🇪🇷 Tigrinya (ትግርኛ)

Language files are located in `src/assets/locales/`

## 💰 Monetization

### Fee Structure
- **Host Service Fee**: 3% of booking subtotal
- **Guest Service Fee**: 14% of booking subtotal
- **Payment Processing**: 2.9% + $0.30 (Stripe)

### Supported Currencies
- USD (US Dollar)
- EUR (Euro)
- ETB (Ethiopian Birr)

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests (Detox)
```bash
npm run test:e2e
```

### Manual Testing Checklist
- [ ] Authentication flows
- [ ] Listing creation and editing
- [ ] Search and filters
- [ ] Booking process
- [ ] Payment flow
- [ ] Messaging
- [ ] Reviews
- [ ] Push notifications
- [ ] Offline mode
- [ ] Different screen sizes

## 📦 Building for Production

### iOS Build
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

### Android Build
```bash
# Build for Android
eas build --platform android

# Submit to Google Play
eas submit --platform android
```

### Web Build (Optional)
```bash
npx expo export:web
```

## 🚀 Deployment

### App Store Submission (iOS)
1. Create app in App Store Connect
2. Upload build via EAS or Xcode
3. Fill out app information
4. Submit for review
5. Monitor review status

### Google Play Submission (Android)
1. Create app in Google Play Console
2. Upload AAB file
3. Complete store listing
4. Fill content rating questionnaire
5. Submit for review

### Firebase Deployment
```bash
# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

## 📊 Analytics & Monitoring

### Firebase Analytics
- User engagement metrics
- Screen views
- Custom events (booking_created, listing_viewed, etc.)
- Conversion tracking

### Crashlytics
```bash
# Add Crashlytics
expo install expo-firebase-crashlytics
```

### Performance Monitoring
- App startup time
- Screen rendering performance
- Network request latency
- JavaScript bridge performance

## 🔒 Security Best Practices

1. **API Keys**: Never commit API keys to version control
2. **Authentication**: Implement proper session management
3. **Data Validation**: Validate all inputs client and server-side
4. **Encryption**: Use HTTPS for all network requests
5. **Permissions**: Request only necessary permissions
6. **Code Obfuscation**: Enable ProGuard (Android) and Swift obfuscation (iOS)
7. **Security Rules**: Regularly audit Firestore and Storage rules
8. **Dependencies**: Keep all dependencies updated

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Code Style
- Follow TypeScript best practices
- Use ESLint and Prettier
- Write meaningful commit messages
- Add tests for new features
- Update documentation

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.enatbet.app](https://docs.enatbet.app)
- **Issues**: [GitHub Issues](https://github.com/yourusername/enatbet-app/issues)
- **Email**: support@enatbet.app
- **Community**: [Discord Server](https://discord.gg/enatbet)

## 🙏 Acknowledgments

- Ethiopian and Eritrean diaspora communities worldwide
- React Native and Expo teams
- Firebase team
- All contributors and testers

## 📅 Development Timeline

### Phase 1: MVP (Weeks 1-6) ✅
- Authentication system
- Listing creation and search
- Booking flow
- Payment integration
- Basic messaging

### Phase 2: Enhancements (Weeks 7-10) 🚧
- Push notifications
- Internationalization
- Community features
- Admin panel
- Advanced search filters

### Phase 3: Launch (Weeks 11-12) 📱
- Testing and bug fixes
- Performance optimization
- App store submissions
- Marketing preparation
- Launch campaign

## 🎯 Future Roadmap

- [ ] Video tours for listings
- [ ] Virtual viewing appointments
- [ ] Group bookings
- [ ] Split payments
- [ ] Loyalty program
- [ ] AI-powered recommendations
- [ ] Voice search
- [ ] Augmented reality features
- [ ] Blockchain-based reviews
- [ ] Carbon offset program

---

<div align="center">
  Made with ❤️ for the Ethiopian & Eritrean Diaspora Community
  
  **© 2024 EnatBet. All rights reserved.**
</div>