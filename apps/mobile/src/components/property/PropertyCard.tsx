import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { Property } from '../../types';

interface PropertyCardProps {
  property: Property;
  onPress: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.card}>
        <Card.Cover 
          source={{ uri: property.images[0] || 'https://via.placeholder.com/400x300' }} 
          style={styles.image}
        />
        <Card.Content style={styles.content}>
          <View style={styles.header}>
            <Text variant="titleMedium" numberOfLines={1}>
              {property.title}
            </Text>
            {property.rating && (
              <View style={styles.rating}>
                <Text variant="bodySmall">⭐ {property.rating.toFixed(1)}</Text>
              </View>
            )}
          </View>
          
          <Text variant="bodyMedium" style={styles.location}>
            {property.location.city}, {property.location.country}
          </Text>
          
          <View style={styles.details}>
            <Text variant="bodySmall">{property.bedrooms} bed · {property.bathrooms} bath</Text>
          </View>
          
          <View style={styles.footer}>
            <Text variant="titleMedium" style={styles.price}>
              ${property.pricePerNight}
            </Text>
            <Text variant="bodySmall"> / night</Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  image: {
    height: 200,
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    color: '#717171',
    marginBottom: 8,
  },
  details: {
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontWeight: 'bold',
  },
});
