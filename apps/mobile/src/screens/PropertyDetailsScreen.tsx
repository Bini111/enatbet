import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Button, Chip, Divider } from 'react-native-paper';
import { usePropertyStore } from '../store/propertyStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';

type PropertyDetailsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PropertyDetails'>;
  route: RouteProp<RootStackParamList, 'PropertyDetails'>;
};

export const PropertyDetailsScreen: React.FC<PropertyDetailsScreenProps> = ({ navigation, route }) => {
  const { propertyId } = route.params;
  const { getPropertyById } = usePropertyStore();
  const property = getPropertyById(propertyId);

  if (!property) {
    return (
      <View style={styles.container}>
        <Text>Property not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image 
        source={{ uri: property.images[0] || 'https://via.placeholder.com/400x300' }}
        style={styles.image}
      />

      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          {property.title}
        </Text>

        <Text variant="bodyLarge" style={styles.location}>
          {property.location.address}, {property.location.city}, {property.location.country}
        </Text>

        <View style={styles.specs}>
          <Chip icon="bed" style={styles.chip}>{property.bedrooms} Bedrooms</Chip>
          <Chip icon="shower" style={styles.chip}>{property.bathrooms} Bathrooms</Chip>
          <Chip icon="account-group" style={styles.chip}>Up to {property.maxGuests} guests</Chip>
        </View>

        <Divider style={styles.divider} />

        <Text variant="titleLarge" style={styles.sectionTitle}>
          Description
        </Text>
        <Text variant="bodyMedium" style={styles.description}>
          {property.description}
        </Text>

        <Divider style={styles.divider} />

        <Text variant="titleLarge" style={styles.sectionTitle}>
          Amenities
        </Text>
        <View style={styles.amenities}>
          {property.amenities.map((amenity, index) => (
            <Chip key={index} style={styles.amenityChip}>
              {amenity}
            </Chip>
          ))}
        </View>

        <Divider style={styles.divider} />

        <View style={styles.priceSection}>
          <View>
            <Text variant="headlineSmall" style={styles.price}>
              ${property.pricePerNight}
            </Text>
            <Text variant="bodyMedium">per night</Text>
          </View>
          
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('Booking', { propertyId: property.id })}
            style={styles.bookButton}
          >
            Reserve
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 16,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  location: {
    color: '#717171',
    marginBottom: 16,
  },
  specs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    lineHeight: 24,
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  price: {
    fontWeight: 'bold',
  },
  bookButton: {
    paddingHorizontal: 24,
  },
});
