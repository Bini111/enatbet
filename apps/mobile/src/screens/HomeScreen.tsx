import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  imageUrl?: string;
  bedrooms: number;
  bathrooms: number;
}

interface HomeScreenProps {
  navigation?: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  async function loadProperties() {
    try {
      const mockProperties: Property[] = [
        {
          id: '1',
          title: 'Modern Apartment in Addis Ababa',
          location: 'Bole, Addis Ababa',
          price: 15000,
          bedrooms: 2,
          bathrooms: 2,
        },
        {
          id: '2',
          title: 'Luxury Villa with Garden',
          location: 'Old Airport, Addis Ababa',
          price: 35000,
          bedrooms: 4,
          bathrooms: 3,
        },
      ];
      
      setProperties(mockProperties);
    } catch (error) {
      console.error('Failed to load properties:', error);
    } finally {
      setLoading(false);
    }
  }

  function handlePropertyPress(property: Property) {
    console.log('Property selected:', property.id);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.heroContent}>
            <View style={styles.titleContainer}>
              <Text style={styles.flag}>🇪🇹</Text>
              <Text style={styles.title}>ENATBET</Text>
              <Text style={styles.flag}>🇪🇷</Text>
            </View>
            <Text style={styles.tagline}>
              "Book a home, not just a room"
            </Text>
            <Text style={styles.subtitle}>
              Connecting Ethiopian & Eritrean diaspora communities worldwide
            </Text>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Why Choose Enatbet?</Text>
          
          <View style={styles.featuresGrid}>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🏡</Text>
              <Text style={styles.featureTitle}>Community Homes</Text>
              <Text style={styles.featureDescription}>
                Stay with Ethiopian & Eritrean families worldwide
              </Text>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>☕</Text>
              <Text style={styles.featureTitle}>Cultural Experience</Text>
              <Text style={styles.featureDescription}>
                Enjoy coffee ceremonies and traditional hospitality
              </Text>
            </View>

            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🤝</Text>
              <Text style={styles.featureTitle}>Trusted Network</Text>
              <Text style={styles.featureDescription}>
                Book with confidence within our community
              </Text>
            </View>
          </View>
        </View>

        {/* Properties Section */}
        <View style={styles.propertiesSection}>
          <Text style={styles.sectionTitle}>Featured Properties</Text>
          <Text style={styles.propertiesCount}>
            {properties.length} properties available
          </Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#ec4899" />
              <Text style={styles.loadingText}>Loading properties...</Text>
            </View>
          ) : properties.length > 0 ? (
            properties.map((property) => (
              <TouchableOpacity
                key={property.id}
                style={styles.propertyCard}
                onPress={() => handlePropertyPress(property)}
                activeOpacity={0.7}
              >
                {property.imageUrl && (
                  <Image
                    source={{ uri: property.imageUrl }}
                    style={styles.propertyImage}
                    resizeMode="cover"
                  />
                )}
                
                <View style={styles.propertyContent}>
                  <Text style={styles.propertyTitle}>{property.title}</Text>
                  <Text style={styles.propertyLocation}>{property.location}</Text>
                  
                  <View style={styles.propertyDetails}>
                    <Text style={styles.propertySpec}>
                      🛏️ {property.bedrooms} bed
                    </Text>
                    <Text style={styles.propertySpec}>
                      🚿 {property.bathrooms} bath
                    </Text>
                  </View>
                  
                  <Text style={styles.propertyPrice}>
                    {property.price.toLocaleString()} ETB/month
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No properties available at the moment
              </Text>
            </View>
          )}
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>
            Ready to Find Your Home Away From Home?
          </Text>
          <Text style={styles.ctaSubtitle}>
            Join thousands in our global Ethiopian & Eritrean community
          </Text>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Find More Homes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>List Your Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  hero: {
    backgroundColor: '#a855f7',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  heroContent: {
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  flag: {
    fontSize: 40,
  },
  title: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tagline: {
    fontSize: 22,
    fontWeight: '600',
    color: '#ffffff',
    fontStyle: 'italic',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#ffffff',
    opacity: 0.9,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  featuresSection: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
  },
  featuresGrid: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 32,
    color: '#1f2937',
  },
  featureCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  featureIcon: {
    fontSize: 42,
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1f2937',
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  propertiesSection: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#f9fafb',
  },
  propertiesCount: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  propertyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  propertyImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#e5e7eb',
  },
  propertyContent: {
    padding: 16,
  },
  propertyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
  },
  propertyLocation: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  propertyDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  propertySpec: {
    fontSize: 14,
    color: '#6b7280',
  },
  propertyPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ec4899',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9ca3af',
    textAlign: 'center',
  },
  ctaSection: {
    backgroundColor: '#fef3c7',
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#1f2937',
  },
  ctaSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#ec4899',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: width - 40,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#1f2937',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: width - 40,
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
});