import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.flags}>🇪🇹 🏠 🇪🇷</Text>
        <Text style={styles.title}>ENATBET</Text>
        <Text style={styles.tagline}>"Book a home, not just a room"</Text>
        <Text style={styles.subtitle}>
          Connecting Ethiopian & Eritrean diaspora{'\n'}communities worldwide
        </Text>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/properties')}
        >
          <Text style={styles.buttonText}>Start Exploring</Text>
        </TouchableOpacity>
      </View>

      {/* Why Choose Enatbet Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why Choose Enatbet?</Text>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🏡</Text>
          <Text style={styles.featureTitle}>Community Homes</Text>
          <Text style={styles.featureText}>
            Stay with Ethiopian & Eritrean families worldwide
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>☕</Text>
          <Text style={styles.featureTitle}>Cultural Experience</Text>
          <Text style={styles.featureText}>
            Enjoy coffee ceremonies and traditional hospitality
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureIcon}>🤝</Text>
          <Text style={styles.featureTitle}>Trusted Network</Text>
          <Text style={styles.featureText}>
            Verified hosts from our community
          </Text>
        </View>
      </View>

      {/* Auth Buttons */}
      <View style={styles.authSection}>
        <TouchableOpacity 
          style={[styles.button, styles.primaryButton]}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]}
          onPress={() => router.push('/signup')}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  hero: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundColor: '#667eea', // Fallback for React Native
  },
  flags: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#fff',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    marginTop: 24,
    minWidth: 200,
  },
  buttonText: {
    color: '#667eea',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  featureCard: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  featureIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  authSection: {
    padding: 24,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#667eea',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  secondaryButtonText: {
    color: '#667eea',
  },
});
