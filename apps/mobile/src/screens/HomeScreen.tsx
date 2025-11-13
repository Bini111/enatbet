import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#EC4899', '#8B5CF6']}
        style={styles.heroSection}
      >
        <Text style={styles.emoji}>🇪🇹 🏠 🇪🇷</Text>
        <Text style={styles.title}>ENATBET</Text>
        <Text style={styles.slogan}>"Book a home, not just a room"</Text>
        <Text style={styles.subtitle}>
          Connecting Ethiopian & Eritrean diaspora communities worldwide
        </Text>
        
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Start Exploring</Text>
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.featuresSection}>
        <Text style={styles.featuresTitle}>Why Choose Enatbet?</Text>
        
        <View style={styles.featureCard}>
          <Text style={styles.featureEmoji}>🏡</Text>
          <Text style={styles.featureTitle}>Community Homes</Text>
          <Text style={styles.featureText}>
            Stay with Ethiopian & Eritrean families worldwide
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureEmoji}>☕</Text>
          <Text style={styles.featureTitle}>Cultural Experience</Text>
          <Text style={styles.featureText}>
            Enjoy coffee ceremonies and traditional hospitality
          </Text>
        </View>

        <View style={styles.featureCard}>
          <Text style={styles.featureEmoji}>🤝</Text>
          <Text style={styles.featureTitle}>Trusted Network</Text>
          <Text style={styles.featureText}>
            Book with confidence within our community
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  heroSection: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    letterSpacing: 2,
  },
  slogan: {
    fontSize: 24,
    color: '#fff',
    fontStyle: 'italic',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#fff',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  buttonText: {
    color: '#EC4899',
    fontSize: 18,
    fontWeight: 'bold',
  },
  featuresSection: {
    padding: 20,
  },
  featuresTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 30,
  },
  featureCard: {
    backgroundColor: '#f9fafb',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  featureEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
