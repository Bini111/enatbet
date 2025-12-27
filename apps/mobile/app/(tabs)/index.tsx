import React, { useState, useEffect, useCallback, memo } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Share,
  Platform,
  Alert,
  Linking,
  Modal,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from "react-native-reanimated";

// Constants
const UNIVERSAL_LINK = "https://enatbet.app/download";

// ============ ANIMATED COMPONENTS ============

// Memoized Animated Letter Component
const AnimatedLetter = memo(({ letter, index }: { letter: string; index: number }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);

  useEffect(() => {
    const delay = index * 80;
    opacity.value = withDelay(delay, withTiming(1, { duration: 350, easing: Easing.out(Easing.ease) }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 14, stiffness: 120 }));
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.Text 
      style={[styles.heroTitleLetter, animatedStyle]} 
      accessibilityLabel={letter}
    >
      {letter}
    </Animated.Text>
  );
});

// Memoized Typewriter Text Component
const TypewriterText = memo(({ text, delay = 800 }: { text: string; delay?: number }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let isMounted = true;
    const timeout = setTimeout(() => {
      let currentIndex = 0;
      const timer = setInterval(() => {
        if (!isMounted) return;
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(timer);
        }
      }, 45);
      return () => clearInterval(timer);
    }, delay);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [text, delay]);

  return (
    <Text style={styles.heroTagline} accessibilityLabel={text}>
      {displayedText}
      {displayedText.length < text.length && <Text style={styles.cursor}>|</Text>}
    </Text>
  );
});

// Memoized Feature Card Component
const FeatureCard = memo(({ emoji, title, description, delay }: { 
  emoji: string; 
  title: string; 
  description: string;
  delay: number;
}) => (
  <Animated.View 
    entering={FadeInDown.delay(delay).duration(450).springify()}
    style={styles.cardCompact}
  >
    <Text style={styles.cardEmojiSmall}>{emoji}</Text>
    <Text style={styles.cardTitleSmall}>{title}</Text>
    <Text style={styles.cardTextSmall}>{description}</Text>
  </Animated.View>
));

// ============ MAIN COMPONENT ============

export default function HomeScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [animationsReady, setAnimationsReady] = useState(false);

  // Logo animation values
  const logoScale = useSharedValue(0.4);
  const logoOpacity = useSharedValue(0);
  const logoPulse = useSharedValue(1);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    // Delayed animation start for smoother load
    const animTimer = setTimeout(() => setAnimationsReady(true), 150);

    // Logo entrance animation
    logoOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    logoScale.value = withSpring(1, { damping: 12, stiffness: 140 });

    // Continuous gentle pulse
    const pulseTimer = setTimeout(() => {
      logoPulse.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    }, 600);

    return () => {
      unsubscribe();
      clearTimeout(animTimer);
      clearTimeout(pulseTimer);
    };
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value * logoPulse.value }],
  }));

  // Haptic feedback helper
  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // ============ SHARE HANDLERS ============
  
  const handleSystemShare = useCallback(async () => {
    const message = `🇪🇹🇪🇷 Join Enatbet - the home rental app for Ethiopian & Eritrean diaspora!\n\n"Book a home, not just a room!"\n\nDownload now: ${UNIVERSAL_LINK}`;

    try {
      triggerHaptic();
      const result = await Share.share({
        message,
        title: "Join Enatbet",
        url: Platform.OS === "ios" ? UNIVERSAL_LINK : undefined,
      });
      
      if (result.action === Share.sharedAction) {
        Alert.alert("Thanks! 🎉", "Thanks for sharing Enatbet with your community!");
      }
    } catch (error) {
      console.error("Share error:", error);
      Alert.alert("Share Failed", "Please try again later.");
    }
  }, [triggerHaptic]);

  const shareViaSMS = useCallback(() => {
    triggerHaptic();
    const message = `Join Enatbet! 🇪🇹🇪🇷 The home rental app for our diaspora community. Download: ${UNIVERSAL_LINK}`;
    const url = Platform.OS === "ios" 
      ? `sms:&body=${encodeURIComponent(message)}`
      : `sms:?body=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => Alert.alert("Error", "Unable to open SMS app"));
  }, [triggerHaptic]);

  const shareViaEmail = useCallback(() => {
    triggerHaptic();
    const subject = "Join Enatbet - Home Rentals for Our Community";
    const body = `Hey!\n\nI wanted to share this app with you - Enatbet is a home rental platform designed for Ethiopian & Eritrean diaspora worldwide.\n\n"Book a home, not just a room!"\n\nDownload it here: ${UNIVERSAL_LINK}\n\n🇪🇹🇪🇷`;
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    Linking.openURL(url).catch(() => Alert.alert("Error", "Unable to open email app"));
  }, [triggerHaptic]);

  const shareViaWhatsApp = useCallback(() => {
    triggerHaptic();
    const message = `🇪🇹🇪🇷 Join Enatbet!\n\nThe home rental app for Ethiopian & Eritrean diaspora.\n\n"Book a home, not just a room!"\n\nDownload: ${UNIVERSAL_LINK}`;
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => Alert.alert("WhatsApp Not Found", "Please install WhatsApp to share."));
  }, [triggerHaptic]);

  const shareViaTelegram = useCallback(() => {
    triggerHaptic();
    const message = `🇪🇹🇪🇷 Join Enatbet! Home rental app for our diaspora. Download: ${UNIVERSAL_LINK}`;
    const url = `tg://msg?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => Alert.alert("Telegram Not Found", "Please install Telegram to share."));
  }, [triggerHaptic]);

  const copyLink = useCallback(() => {
    triggerHaptic();
    Alert.alert("Share Link", UNIVERSAL_LINK, [
      { text: "OK" },
      { text: "Open Link", onPress: () => Linking.openURL(UNIVERSAL_LINK) },
    ]);
  }, [triggerHaptic]);

  // ============ MENU HANDLERS ============

  const handleMenuOption = useCallback((option: string) => {
    setMenuVisible(false);
    triggerHaptic();
    
    switch (option) {
      case "host":
        router.push("/become-a-host");
        break;
      case "browse":
        router.push("/explore");
        break;
      case "invite":
        setTimeout(() => setShareModalVisible(true), 200);
        break;
    }
  }, [router, triggerHaptic]);

  const handleSignIn = useCallback(() => {
    triggerHaptic();
    router.push("/login");
  }, [router, triggerHaptic]);

  const handleSignUp = useCallback(() => {
    triggerHaptic();
    router.push("/signup");
  }, [router, triggerHaptic]);

  const titleLetters = "ENATBET".split("");

  // ============ RENDER ============

  return (
    <View style={styles.container}>
      
      {/* ============ 3-DOT MENU BUTTON (TOP RIGHT) ============ */}
      <Animated.View entering={ZoomIn.delay(200).duration(400)} style={styles.menuButtonWrapper}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => {
            triggerHaptic();
            setMenuVisible(true);
          }}
          activeOpacity={0.8}
          accessibilityLabel="Open menu"
          accessibilityRole="button"
        >
          <Text style={styles.menuDots}>•••</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* ============ BOTTOM SHEET MENU ============ */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable 
          style={styles.menuOverlay} 
          onPress={() => setMenuVisible(false)}
        >
          <Animated.View 
            entering={FadeInUp.duration(250)} 
            style={styles.menuBottomSheet}
          >
            <View style={styles.menuHandle} />
            
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => handleMenuOption("host")}
              accessibilityLabel="Become a Host"
              accessibilityRole="button"
            >
              <Text style={styles.menuItemIcon}>🏠</Text>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemText}>Become a Host</Text>
                <Text style={styles.menuItemSubtext}>Share your home & earn income</Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.menuDivider} />
            
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => handleMenuOption("browse")}
              accessibilityLabel="Browse Properties"
              accessibilityRole="button"
            >
              <Text style={styles.menuItemIcon}>🔍</Text>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemText}>Browse Properties</Text>
                <Text style={styles.menuItemSubtext}>Find your perfect stay</Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.menuDivider} />
            
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => handleMenuOption("invite")}
              accessibilityLabel="Invite Friends"
              accessibilityRole="button"
            >
              <Text style={styles.menuItemIcon}>📨</Text>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemText}>Invite Friends</Text>
                <Text style={styles.menuItemSubtext}>Share with family & community</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuCloseButton}
              onPress={() => setMenuVisible(false)}
            >
              <Text style={styles.menuCloseText}>Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* ============ SHARE BOTTOM SHEET ============ */}
      <Modal
        visible={shareModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setShareModalVisible(false)}
      >
        <View style={styles.shareModalOverlay}>
          <Pressable 
            style={styles.shareModalBackdrop}
            onPress={() => setShareModalVisible(false)}
          />
          <Animated.View 
            entering={FadeInUp.duration(250)} 
            style={styles.shareModalContent}
          >
            <View style={styles.shareModalHandle} />
            
            <View style={styles.shareModalHeader}>
              <Text style={styles.shareModalTitle}>Invite Friends</Text>
              <TouchableOpacity 
                onPress={() => setShareModalVisible(false)}
                style={styles.shareModalClose}
                accessibilityLabel="Close share modal"
              >
                <Text style={styles.shareModalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.shareModalSubtitle}>
              Share Enatbet with family & friends 🇪🇹🇪🇷
            </Text>

            <View style={styles.shareOptions}>
              <TouchableOpacity 
                style={styles.shareOption}
                onPress={() => { setShareModalVisible(false); handleSystemShare(); }}
                accessibilityLabel="Share via system"
              >
                <View style={[styles.shareIconCircle, { backgroundColor: "#667eea" }]}>
                  <Text style={styles.shareIcon}>📤</Text>
                </View>
                <Text style={styles.shareOptionText}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.shareOption}
                onPress={() => { setShareModalVisible(false); shareViaSMS(); }}
                accessibilityLabel="Share via SMS"
              >
                <View style={[styles.shareIconCircle, { backgroundColor: "#34C759" }]}>
                  <Text style={styles.shareIcon}>💬</Text>
                </View>
                <Text style={styles.shareOptionText}>SMS</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.shareOption}
                onPress={() => { setShareModalVisible(false); shareViaEmail(); }}
                accessibilityLabel="Share via Email"
              >
                <View style={[styles.shareIconCircle, { backgroundColor: "#FF9500" }]}>
                  <Text style={styles.shareIcon}>📧</Text>
                </View>
                <Text style={styles.shareOptionText}>Email</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.shareOption}
                onPress={() => { setShareModalVisible(false); shareViaWhatsApp(); }}
                accessibilityLabel="Share via WhatsApp"
              >
                <View style={[styles.shareIconCircle, { backgroundColor: "#25D366" }]}>
                  <Text style={styles.shareIcon}>📱</Text>
                </View>
                <Text style={styles.shareOptionText}>WhatsApp</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.shareOptions}>
              <TouchableOpacity 
                style={styles.shareOption}
                onPress={() => { setShareModalVisible(false); shareViaTelegram(); }}
                accessibilityLabel="Share via Telegram"
              >
                <View style={[styles.shareIconCircle, { backgroundColor: "#0088cc" }]}>
                  <Text style={styles.shareIcon}>✈️</Text>
                </View>
                <Text style={styles.shareOptionText}>Telegram</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.shareOption}
                onPress={() => { setShareModalVisible(false); copyLink(); }}
                accessibilityLabel="Copy link"
              >
                <View style={[styles.shareIconCircle, { backgroundColor: "#8E8E93" }]}>
                  <Text style={styles.shareIcon}>🔗</Text>
                </View>
                <Text style={styles.shareOptionText}>Copy Link</Text>
              </TouchableOpacity>

              <View style={styles.shareOptionPlaceholder} />
              <View style={styles.shareOptionPlaceholder} />
            </View>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setShareModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* ============ MAIN CONTENT ============ */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={["#ec4899", "#7c3aed"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          {/* Animated Logo */}
          <Animated.View style={logoAnimatedStyle}>
            <Image 
              source={require("../../assets/logo.png")} 
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="Enatbet Logo"
            />
          </Animated.View>

          {/* Letter-by-letter Title */}
          <View style={styles.titleContainer}>
            {animationsReady && titleLetters.map((letter, index) => (
              <AnimatedLetter key={index} letter={letter} index={index} />
            ))}
          </View>

          {/* Typewriter Tagline */}
          {animationsReady && (
            <TypewriterText text={'"Book a home, not just a room!"'} delay={900} />
          )}

          {/* Subtitle */}
          <Animated.Text 
            entering={FadeInUp.delay(2200).duration(600)}
            style={styles.heroSubtitle}
            accessibilityLabel="Connecting Ethiopian and Eritrean diaspora worldwide"
          >
            Connecting Ethiopian & Eritrean diaspora worldwide 🌍
          </Animated.Text>
        </LinearGradient>

        {/* Why Choose Section */}
        <View style={styles.section}>
          <Animated.Text 
            entering={FadeInDown.delay(2500).duration(500)}
            style={styles.sectionTitle}
          >
            Why Choose Enatbet?
          </Animated.Text>
          
          <View style={styles.cardsRow}>
            <FeatureCard 
              emoji="🏡" 
              title="Community" 
              description="Stay with families" 
              delay={2700}
            />
            <FeatureCard 
              emoji="☕" 
              title="Culture" 
              description="Traditional hospitality" 
              delay={2900}
            />
            <FeatureCard 
              emoji="🤝" 
              title="Trust" 
              description="Book with confidence" 
              delay={3100}
            />
          </View>
        </View>

        {/* Auth Section */}
        {!user ? (
          <Animated.View 
            entering={FadeInDown.delay(3300).duration(500)}
            style={styles.authSection}
          >
            <TouchableOpacity
              style={styles.signInButton}
              activeOpacity={0.8}
              onPress={handleSignIn}
              accessibilityLabel="Sign In"
              accessibilityRole="button"
            >
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.createAccountButton}
              activeOpacity={0.8}
              onPress={handleSignUp}
              accessibilityLabel="Create Account"
              accessibilityRole="button"
            >
              <Text style={styles.createAccountButtonText}>Create Account</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Animated.View 
            entering={FadeInDown.delay(3300).duration(500)}
            style={styles.greetingSection}
          >
            <Text style={styles.greetingText}>
              Welcome back, {user.displayName?.split(" ")[0] || "Friend"}! 👋
            </Text>
            {!user.emailVerified && (
              <View style={styles.verifyBanner}>
                <Text style={styles.verifyText}>
                  ⚠️ Please verify your email to access all features
                </Text>
              </View>
            )}
          </Animated.View>
        )}

        {/* Footer */}
        <Animated.View 
          entering={FadeInUp.delay(3500).duration(500)}
          style={styles.footer}
        >
          <Image 
            source={require("../../assets/logo.png")} 
            style={styles.footerLogo}
            resizeMode="contain"
          />
          <Text style={styles.footerText}>🇪🇹 Enatbet 🇪🇷</Text>
          <Text style={styles.footerTagline}>Home away from home</Text>
          <Text style={styles.footerVersion}>v1.0.0</Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ============ STYLES ============

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  
  // 3-Dot Menu Button (Top Right)
  menuButtonWrapper: {
    position: "absolute",
    top: Platform.OS === "ios" ? 54 : 34,
    right: 16,
    zIndex: 100,
  },
  menuButton: {
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  menuDots: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
    letterSpacing: 1,
  },
  
  // Bottom Sheet Menu
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  menuBottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    paddingHorizontal: 20,
  },
  menuHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  menuItemIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 17,
    color: "#111827",
    fontWeight: "600",
  },
  menuItemSubtext: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 4,
  },
  menuCloseButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
  },
  menuCloseText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  
  // Share Modal
  shareModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  shareModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  shareModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    paddingHorizontal: 20,
  },
  shareModalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  shareModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  shareModalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  shareModalClose: {
    padding: 8,
  },
  shareModalCloseText: {
    fontSize: 24,
    color: "#9CA3AF",
  },
  shareModalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
  },
  shareOptions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  shareOption: {
    alignItems: "center",
    width: 72,
  },
  shareOptionPlaceholder: {
    width: 72,
  },
  shareIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  shareIcon: {
    fontSize: 26,
  },
  shareOptionText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
  },
  cancelButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  
  // Hero Section
  hero: {
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 32,
    alignItems: "center",
  },
  logo: {
    width: 95,
    height: 95,
    marginBottom: 14,
    borderRadius: 20,
  },
  titleContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  heroTitleLetter: {
    fontSize: 34,
    fontWeight: "900",
    color: "#ffffff",
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  heroTagline: {
    fontSize: 15,
    fontWeight: "600",
    color: "#f9fafb",
    textAlign: "center",
    marginBottom: 8,
    minHeight: 22,
  },
  cursor: {
    color: "#ffffff",
    opacity: 0.7,
  },
  heroSubtitle: {
    fontSize: 13,
    color: "#e5e7eb",
    textAlign: "center",
    maxWidth: 300,
  },
  
  // Section
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
    color: "#111827",
  },
  
  // Cards
  cardsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardCompact: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    marginHorizontal: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardEmojiSmall: {
    fontSize: 24,
    marginBottom: 6,
  },
  cardTitleSmall: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 3,
    color: "#111827",
    textAlign: "center",
  },
  cardTextSmall: {
    fontSize: 11,
    color: "#6b7280",
    textAlign: "center",
  },
  
  // Auth Section
  authSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  signInButton: {
    backgroundColor: "#667eea",
    paddingVertical: 14,
    borderRadius: 28,
    marginBottom: 10,
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  signInButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  createAccountButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#667eea",
    paddingVertical: 14,
    borderRadius: 28,
  },
  createAccountButtonText: {
    color: "#667eea",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  
  // Greeting Section
  greetingSection: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  greetingText: {
    fontSize: 19,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
  },
  verifyBanner: {
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  verifyText: {
    fontSize: 13,
    color: "#92400E",
    textAlign: "center",
  },
  
  // Footer
  footer: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 24,
    backgroundColor: "#f3f4f6",
  },
  footerLogo: {
    width: 44,
    height: 44,
    marginBottom: 8,
    borderRadius: 10,
  },
  footerText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 2,
  },
  footerTagline: {
    fontSize: 12,
    color: "#6b7280",
    fontStyle: "italic",
  },
  footerVersion: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 4,
  },
});