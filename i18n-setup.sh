#!/bin/bash

# ============================================================
# ENATBET i18n SETUP SCRIPT
# Paste this entire script into your terminal
# Run from your enatbet root directory: ~/Desktop/enatbet
# ============================================================

echo "🌍 Setting up Enatbet i18n (Multi-language support)..."

# Navigate to project root/Users/dre/Desktop/setup-firestore-config.ts
cd ~/Desktop/enatbet

# ============================================================
# STEP 1: Install dependencies
# ============================================================
echo "📦 Installing dependencies..."

# Mobile dependencies
cd apps/mobile
npx expo install expo-localization @react-native-async-storage/async-storage
npm install i18n-js@4 --save

# Web dependencies  
cd ../web
npm install next-i18next react-i18next i18next --save

cd ../..

# ============================================================
# STEP 2: Create shared locales directory structure
# ============================================================
echo "📁 Creating translation files..."

mkdir -p packages/locales/translations

# ============================================================
# STEP 3: Create English translations (en.json)
# ============================================================
cat > packages/locales/translations/en.json << 'EOF_JSON'
{
  "common": {
    "appName": "Enatbet",
    "tagline": "Book a home, not just a room!",
    "subtitle": "Connecting Ethiopian & Eritrean diaspora worldwide",
    "loading": "Loading...",
    "error": "Error",
    "success": "Success",
    "cancel": "Cancel",
    "confirm": "Confirm",
    "save": "Save",
    "delete": "Delete",
    "edit": "Edit",
    "back": "Back",
    "next": "Next",
    "submit": "Submit",
    "done": "Done",
    "skip": "Skip",
    "yes": "Yes",
    "no": "No",
    "ok": "OK",
    "close": "Close",
    "search": "Search",
    "filter": "Filter",
    "sort": "Sort",
    "retry": "Retry",
    "seeAll": "See All",
    "learnMore": "Learn More"
  },
  "languages": {
    "title": "Language",
    "select": "Select Language",
    "en": "English",
    "am": "አማርኛ (Amharic)",
    "ti": "ትግርኛ (Tigrinya)",
    "om": "Afaan Oromo",
    "fr": "Français (French)",
    "ar": "العربية (Arabic)"
  },
  "home": {
    "welcome": "Welcome",
    "welcomeBack": "Welcome back, {{name}}!",
    "whyChoose": "Why Choose Enatbet?",
    "community": "Community",
    "communityDesc": "Stay with families",
    "culture": "Culture",
    "cultureDesc": "Traditional hospitality",
    "trust": "Trust",
    "trustDesc": "Book with confidence",
    "getStarted": "Get Started",
    "becomeHost": "Become a Host",
    "becomeHostDesc": "Share your home & earn income",
    "inviteFriends": "Invite Your Friends",
    "inviteFriendsDesc": "Share Enatbet with family & friends",
    "browseProperties": "Browse Properties",
    "browsePropertiesDesc": "Find your perfect stay",
    "homeAwayFromHome": "Home away from home"
  },
  "auth": {
    "signIn": "Sign In",
    "signUp": "Create Account",
    "signOut": "Sign Out",
    "email": "Email",
    "password": "Password",
    "confirmPassword": "Confirm Password",
    "fullName": "Full Name",
    "phone": "Phone Number",
    "forgotPassword": "Forgot Password?",
    "resetPassword": "Reset Password",
    "noAccount": "Don't have an account?",
    "haveAccount": "Already have an account?",
    "termsAgree": "I agree to the Terms of Service and Privacy Policy",
    "verifyEmail": "Verify Your Email",
    "verifyEmailSent": "We've sent a verification link to:",
    "verifyEmailInstructions": "Please click the link in the email to verify your account.",
    "resendVerification": "Resend Verification",
    "emailNotVerified": "Email not verified",
    "passwordHint": "Min 8 characters, 1 uppercase, 1 number",
    "signingIn": "Signing In...",
    "creatingAccount": "Creating Account..."
  },
  "host": {
    "title": "Become a Host",
    "subtitle": "Share your home with the diaspora community",
    "progress": "Application Progress",
    "step": "Step {{current}} of {{total}}",
    "steps": {
      "personalInfo": "Personal Info",
      "contactDetails": "Contact Details",
      "dateOfBirth": "Date of Birth",
      "propertyLocation": "Property Location",
      "propertyDetails": "Property Details",
      "photosAmenities": "Photos & Amenities",
      "reviewSubmit": "Review & Submit"
    },
    "personalInfoTitle": "Personal Information",
    "personalInfoSubtitle": "Let's start with your basic info",
    "contactTitle": "Contact Details",
    "contactSubtitle": "How can guests reach you?",
    "dobTitle": "Date of Birth",
    "dobSubtitle": "You must be 18+ to become a host",
    "dobSelect": "Tap to select your birthday",
    "ageDisplay": "You are {{age}} years old",
    "locationTitle": "Property Location",
    "locationSubtitle": "Where is your property located?",
    "detailsTitle": "Property Details",
    "detailsSubtitle": "Tell us about your property",
    "photosTitle": "Photos & Amenities",
    "photosSubtitle": "Upload at least {{min}} photos",
    "reviewTitle": "Review & Submit",
    "reviewSubtitle": "Almost there! Review your application",
    "gender": "Gender",
    "selectGender": "Select Gender",
    "male": "Male",
    "female": "Female",
    "other": "Other",
    "preferNotToSay": "Prefer not to say",
    "country": "Country",
    "selectCountry": "Select Country",
    "city": "City",
    "enterCity": "Enter your city",
    "address": "Street Address",
    "addressOptional": "Street Address (Optional)",
    "propertyType": "Property Type",
    "selectPropertyType": "Select Property Type",
    "bedrooms": "Bedrooms",
    "bathrooms": "Bathrooms",
    "maxGuests": "Max Guests",
    "pricePerNight": "Price Per Night ($)",
    "description": "Description",
    "descriptionPlaceholder": "Describe your property, amenities, nearby attractions...",
    "descriptionMin": "min {{count}} chars",
    "characters": "{{count}} / {{min}} characters",
    "addPhotos": "Add Photos",
    "photosRequired": "{{count}} more photo(s) required",
    "cover": "COVER",
    "amenities": "Amenities",
    "submitApplication": "Submit Application",
    "uploading": "Uploading...",
    "submitting": "Submitting...",
    "successTitle": "You're Now a Host!",
    "successMessage": "Your host application has been automatically approved. You can now start listing your property!",
    "goToDashboard": "Go to Dashboard",
    "mustBe18": "You must be 18 or older to become a host"
  },
  "amenities": {
    "wifi": "Wi-Fi",
    "kitchen": "Kitchen",
    "shower": "Shower",
    "bedroom": "Bedroom",
    "livingRoom": "Living Room",
    "parking": "Parking",
    "ac": "Air Conditioning",
    "heating": "Heating",
    "washer": "Washer",
    "tv": "TV",
    "workspace": "Workspace",
    "pool": "Pool",
    "coffeeCeremony": "Coffee Ceremony Set",
    "injeraMitad": "Injera Mitad"
  },
  "profile": {
    "title": "Profile",
    "guest": "Guest",
    "host": "Host",
    "account": "Account",
    "myBookings": "My Bookings",
    "myBookingsDesc": "View your reservations",
    "myProperties": "My Properties",
    "myPropertiesDesc": "Manage your listings",
    "addProperty": "Add New Property",
    "addPropertyDesc": "List another property",
    "hosting": "Hosting",
    "helpSupport": "Help & Support",
    "resources": "Resources",
    "resourcesDesc": "Guides, FAQs, and contact support",
    "settings": "Settings",
    "language": "Language",
    "notifications": "Notifications",
    "privacy": "Privacy",
    "termsOfService": "Terms of Service",
    "privacyPolicy": "Privacy Policy",
    "version": "Version",
    "signOutConfirm": "Are you sure you want to sign out?"
  },
  "share": {
    "inviteMessage": "Join Enatbet - the home rental app for Ethiopian & Eritrean diaspora!",
    "downloadNow": "Download now:",
    "sms": "SMS",
    "email": "Email",
    "whatsapp": "WhatsApp",
    "telegram": "Telegram",
    "more": "More",
    "copyLink": "Copy Link",
    "shareError": "Failed to share. Please try again."
  },
  "errors": {
    "required": "This field is required",
    "invalidEmail": "Please enter a valid email",
    "invalidPhone": "Please enter a valid phone number",
    "passwordTooShort": "Password must be at least 8 characters",
    "passwordsNoMatch": "Passwords do not match",
    "networkError": "Network error. Please check your connection.",
    "genericError": "Something went wrong. Please try again.",
    "emailInUse": "This email is already registered",
    "invalidCredentials": "Invalid email or password",
    "tooManyAttempts": "Too many attempts. Please try again later."
  },
  "validation": {
    "enterFullName": "Please enter your full name",
    "enterEmail": "Please enter your email",
    "enterPhone": "Please enter your phone number",
    "selectDob": "Please select your date of birth",
    "selectGender": "Please select your gender",
    "selectCountry": "Please select a country",
    "enterCity": "Please enter a city",
    "selectPropertyType": "Please select a property type",
    "descriptionTooShort": "Description must be at least {{min}} characters",
    "minPhotos": "Please upload at least {{min}} photos",
    "agreeToTerms": "Please agree to the Terms of Service"
  }
}
EOF_JSON

# ============================================================
# STEP 4: Create Amharic translations (am.json)
# ============================================================
cat > packages/locales/translations/am.json << 'EOF_JSON'
{
  "common": {
    "appName": "እናትቤት",
    "tagline": "ቤት ይቅረቡ፣ ክፍል ብቻ አይደለም!",
    "subtitle": "የኢትዮጵያ እና ኤርትራ ዳያስፖራዎችን በዓለም ዙሪያ ያገናኛል",
    "loading": "በመጫን ላይ...",
    "error": "ስህተት",
    "success": "ተሳክቷል",
    "cancel": "ሰርዝ",
    "confirm": "አረጋግጥ",
    "save": "አስቀምጥ",
    "delete": "ሰርዝ",
    "edit": "አርትዕ",
    "back": "ተመለስ",
    "next": "ቀጣይ",
    "submit": "አስገባ",
    "done": "ተጠናቋል",
    "skip": "ዝለል",
    "yes": "አዎ",
    "no": "አይ",
    "ok": "እሺ",
    "close": "ዝጋ",
    "search": "ፈልግ",
    "filter": "አጣራ",
    "sort": "ደርድር",
    "retry": "እንደገና ሞክር",
    "seeAll": "ሁሉንም ይመልከቱ",
    "learnMore": "ተጨማሪ ይወቁ"
  },
  "languages": {
    "title": "ቋንቋ",
    "select": "ቋንቋ ይምረጡ",
    "en": "English",
    "am": "አማርኛ",
    "ti": "ትግርኛ",
    "om": "Afaan Oromo",
    "fr": "Français",
    "ar": "العربية"
  },
  "home": {
    "welcome": "እንኳን ደህና መጡ",
    "welcomeBack": "እንኳን ደህና መጡ፣ {{name}}!",
    "whyChoose": "ለምን እናትቤትን ይምረጡ?",
    "community": "ማህበረሰብ",
    "communityDesc": "ከቤተሰቦች ጋር ይቆዩ",
    "culture": "ባህል",
    "cultureDesc": "ባህላዊ እንግዳ ተቀባይነት",
    "trust": "እምነት",
    "trustDesc": "በልበ ሙሉነት ያስይዙ",
    "getStarted": "ይጀምሩ",
    "becomeHost": "አስተናጋጅ ይሁኑ",
    "becomeHostDesc": "ቤትዎን ያጋሩ እና ገቢ ያግኙ",
    "inviteFriends": "ጓደኞችዎን ይጋብዙ",
    "inviteFriendsDesc": "እናትቤትን ከቤተሰብ እና ጓደኞች ጋር ያጋሩ",
    "browseProperties": "ንብረቶችን ይመልከቱ",
    "browsePropertiesDesc": "ፍጹም ማረፊያዎን ያግኙ",
    "homeAwayFromHome": "ቤት ከቤት ርቀው"
  },
  "auth": {
    "signIn": "ግባ",
    "signUp": "መለያ ፍጠር",
    "signOut": "ውጣ",
    "email": "ኢሜይል",
    "password": "የይለፍ ቃል",
    "confirmPassword": "የይለፍ ቃል አረጋግጥ",
    "fullName": "ሙሉ ስም",
    "phone": "ስልክ ቁጥር",
    "forgotPassword": "የይለፍ ቃል ረሱ?",
    "resetPassword": "የይለፍ ቃል ዳግም አስጀምር",
    "noAccount": "መለያ የለዎትም?",
    "haveAccount": "መለያ አለዎት?",
    "termsAgree": "የአገልግሎት ውሎች እና የግላዊነት ፖሊሲን እስማማለሁ",
    "verifyEmail": "ኢሜይልዎን ያረጋግጡ",
    "verifyEmailSent": "የማረጋገጫ ማገናኛ ልከናል ወደ:",
    "verifyEmailInstructions": "መለያዎን ለማረጋገጥ በኢሜይሉ ውስጥ ያለውን ማገናኛ ይጫኑ።",
    "resendVerification": "ማረጋገጫ እንደገና ላክ",
    "emailNotVerified": "ኢሜይል አልተረጋገጠም",
    "passwordHint": "ቢያንስ 8 ቁምፊዎች፣ 1 አቢይ ፊደል፣ 1 ቁጥር",
    "signingIn": "በመግባት ላይ...",
    "creatingAccount": "መለያ በመፍጠር ላይ..."
  },
  "host": {
    "title": "አስተናጋጅ ይሁኑ",
    "subtitle": "ቤትዎን ከዳያስፖራ ማህበረሰብ ጋር ያጋሩ",
    "progress": "የማመልከቻ ሂደት",
    "step": "ደረጃ {{current}} ከ {{total}}",
    "steps": {
      "personalInfo": "የግል መረጃ",
      "contactDetails": "የመገኛ ዝርዝር",
      "dateOfBirth": "የልደት ቀን",
      "propertyLocation": "የንብረት አካባቢ",
      "propertyDetails": "የንብረት ዝርዝሮች",
      "photosAmenities": "ፎቶዎች እና መገልገያዎች",
      "reviewSubmit": "ይመልከቱ እና ያስገቡ"
    },
    "personalInfoTitle": "የግል መረጃ",
    "personalInfoSubtitle": "በመሰረታዊ መረጃዎ እንጀምር",
    "contactTitle": "የመገኛ ዝርዝር",
    "contactSubtitle": "እንግዶች እንዴት ሊያገኙዎት ይችላሉ?",
    "dobTitle": "የልደት ቀን",
    "dobSubtitle": "አስተናጋጅ ለመሆን 18+ መሆን አለብዎት",
    "dobSelect": "የልደት ቀንዎን ለመምረጥ ይጫኑ",
    "ageDisplay": "እድሜዎ {{age}} ዓመት ነው",
    "locationTitle": "የንብረት አካባቢ",
    "locationSubtitle": "ንብረትዎ የት ነው?",
    "detailsTitle": "የንብረት ዝርዝሮች",
    "detailsSubtitle": "ስለ ንብረትዎ ይንገሩን",
    "photosTitle": "ፎቶዎች እና መገልገያዎች",
    "photosSubtitle": "ቢያንስ {{min}} ፎቶዎች ይጫኑ",
    "reviewTitle": "ይመልከቱ እና ያስገቡ",
    "reviewSubtitle": "ጨርሰዋል! ማመልከቻዎን ይመልከቱ",
    "gender": "ጾታ",
    "selectGender": "ጾታ ይምረጡ",
    "male": "ወንድ",
    "female": "ሴት",
    "other": "ሌላ",
    "preferNotToSay": "አልመርጥም",
    "country": "አገር",
    "selectCountry": "አገር ይምረጡ",
    "city": "ከተማ",
    "enterCity": "ከተማዎን ያስገቡ",
    "address": "የጎዳና አድራሻ",
    "addressOptional": "የጎዳና አድራሻ (አማራጭ)",
    "propertyType": "የንብረት ዓይነት",
    "selectPropertyType": "የንብረት ዓይነት ይምረጡ",
    "bedrooms": "መኝታ ክፍሎች",
    "bathrooms": "መታጠቢያ ቤቶች",
    "maxGuests": "ከፍተኛ እንግዶች",
    "pricePerNight": "በሌሊት ዋጋ ($)",
    "description": "መግለጫ",
    "descriptionPlaceholder": "ንብረትዎን፣ መገልገያዎችን፣ አቅራቢያ ያሉ መስህቦችን ይግለጹ...",
    "descriptionMin": "ቢያንስ {{count}} ቁምፊዎች",
    "characters": "{{count}} / {{min}} ቁምፊዎች",
    "addPhotos": "ፎቶዎች ያክሉ",
    "photosRequired": "{{count}} ተጨማሪ ፎቶ(ዎች) ያስፈልጋሉ",
    "cover": "ሽፋን",
    "amenities": "መገልገያዎች",
    "submitApplication": "ማመልከቻ አስገባ",
    "uploading": "በመጫን ላይ...",
    "submitting": "በማስገባት ላይ...",
    "successTitle": "አሁን አስተናጋጅ ነዎት!",
    "successMessage": "የአስተናጋጅ ማመልከቻዎ በራስ-ሰር ጸድቋል። አሁን ንብረትዎን መዘርዘር ይችላሉ!",
    "goToDashboard": "ወደ ዳሽቦርድ ይሂዱ",
    "mustBe18": "አስተናጋጅ ለመሆን 18 ዓመት ወይም ከዚያ በላይ መሆን አለብዎት"
  },
  "amenities": {
    "wifi": "ዋይፋይ",
    "kitchen": "ወጥ ቤት",
    "shower": "ሻወር",
    "bedroom": "መኝታ ክፍል",
    "livingRoom": "ሳሎን",
    "parking": "ማቆሚያ",
    "ac": "አየር ማቀዝቀዣ",
    "heating": "ማሞቂያ",
    "washer": "ማጠቢያ",
    "tv": "ቴሌቪዥን",
    "workspace": "የስራ ቦታ",
    "pool": "መዋኛ",
    "coffeeCeremony": "የቡና ስነ-ስርዓት መሳሪያ",
    "injeraMitad": "የእንጀራ ምጣድ"
  },
  "profile": {
    "title": "መገለጫ",
    "guest": "እንግዳ",
    "host": "አስተናጋጅ",
    "account": "መለያ",
    "myBookings": "ቦታ ማስያዞቼ",
    "myBookingsDesc": "ቦታ ማስያዞችዎን ይመልከቱ",
    "myProperties": "ንብረቶቼ",
    "myPropertiesDesc": "ዝርዝሮችዎን ያስተዳድሩ",
    "addProperty": "አዲስ ንብረት ያክሉ",
    "addPropertyDesc": "ሌላ ንብረት ይዘርዝሩ",
    "hosting": "ማስተናገድ",
    "helpSupport": "እርዳታ እና ድጋፍ",
    "resources": "ግብዓቶች",
    "resourcesDesc": "መመሪያዎች፣ ጥያቄዎች እና እኛን ያግኙ",
    "settings": "ቅንብሮች",
    "language": "ቋንቋ",
    "notifications": "ማሳወቂያዎች",
    "privacy": "ግላዊነት",
    "termsOfService": "የአገልግሎት ውሎች",
    "privacyPolicy": "የግላዊነት ፖሊሲ",
    "version": "ስሪት",
    "signOutConfirm": "መውጣት እንደሚፈልጉ እርግጠኛ ነዎት?"
  },
  "share": {
    "inviteMessage": "እናትቤትን ይቀላቀሉ - የኢትዮጵያ እና ኤርትራ ዳያስፖራ የቤት ኪራይ መተግበሪያ!",
    "downloadNow": "አሁን ያውርዱ:",
    "sms": "ኤስኤምኤስ",
    "email": "ኢሜይል",
    "whatsapp": "ዋትስአፕ",
    "telegram": "ቴሌግራም",
    "more": "ተጨማሪ",
    "copyLink": "ማገናኛ ቅዳ",
    "shareError": "ማጋራት አልተሳካም። እባክዎ እንደገና ይሞክሩ።"
  },
  "errors": {
    "required": "ይህ መስክ ያስፈልጋል",
    "invalidEmail": "እባክዎ ትክክለኛ ኢሜይል ያስገቡ",
    "invalidPhone": "እባክዎ ትክክለኛ ስልክ ቁጥር ያስገቡ",
    "passwordTooShort": "የይለፍ ቃል ቢያንስ 8 ቁምፊዎች መሆን አለበት",
    "passwordsNoMatch": "የይለፍ ቃሎች አይዛመዱም",
    "networkError": "የአውታረ መረብ ስህተት። እባክዎ ግንኙነትዎን ይፈትሹ።",
    "genericError": "የሆነ ችግር ተፈጥሯል። እባክዎ እንደገና ይሞክሩ።",
    "emailInUse": "ይህ ኢሜይል አስቀድሞ ተመዝግቧል",
    "invalidCredentials": "ልክ ያልሆነ ኢሜይል ወይም የይለፍ ቃል",
    "tooManyAttempts": "ብዙ ሙከራዎች። እባክዎ ቆይተው ይሞክሩ።"
  },
  "validation": {
    "enterFullName": "እባክዎ ሙሉ ስምዎን ያስገቡ",
    "enterEmail": "እባክዎ ኢሜይልዎን ያስገቡ",
    "enterPhone": "እባክዎ ስልክ ቁጥርዎን ያስገቡ",
    "selectDob": "እባክዎ የልደት ቀንዎን ይምረጡ",
    "selectGender": "እባክዎ ጾታዎን ይምረጡ",
    "selectCountry": "እባክዎ አገር ይምረጡ",
    "enterCity": "እባክዎ ከተማ ያስገቡ",
    "selectPropertyType": "እባክዎ የንብረት ዓይነት ይምረጡ",
    "descriptionTooShort": "መግለጫ ቢያንስ {{min}} ቁምፊዎች መሆን አለበት",
    "minPhotos": "እባክዎ ቢያንስ {{min}} ፎቶዎች ይጫኑ",
    "agreeToTerms": "እባክዎ የአገልግሎት ውሎችን ይስማሙ"
  }
}
EOF_JSON

# ============================================================
# STEP 5+: Remaining files (ti/om/fr/ar + TS/TSX + web config)
# ============================================================

echo "STOP: Your script is too large for a single paste reliably in chat."
echo "Action: paste the rest in the next message and I will output PART 2 as a terminal-paste block."
