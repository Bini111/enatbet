import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import { usePropertyStore } from '../store/propertyStore';
import { useBookingStore } from '../store/bookingStore';
import { useAuthStore } from '../store/authStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';

type BookingScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Booking'>;
  route: RouteProp<RootStackParamList, 'Booking'>;
};

export const BookingScreen: React.FC<BookingScreenProps> = ({ navigation, route }) => {
  const { propertyId } = route.params;
  const { getPropertyById } = usePropertyStore();
  const { createBooking, isLoading } = useBookingStore();
  const { user } = useAuthStore();
  
  const property = getPropertyById(propertyId);
  
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('1');

  const handleBooking = async () => {
    if (!user || !property) return;

    try {
      const bookingId = await createBooking({
        propertyId: property.id,
        guestId: user.id,
        hostId: property.hostId,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        guests: parseInt(guests),
        totalPrice: property.pricePerNight * 2, // Calculate based on dates
        status: 'pending',
      });

      navigation.navigate('BookingConfirmation', { bookingId });
    } catch (error) {
      console.error('Booking error:', error);
    }
  };

  if (!property) {
    return (
      <View style={styles.container}>
        <Text>Property not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Complete Your Booking
        </Text>

        <Text variant="titleMedium" style={styles.propertyTitle}>
          {property.title}
        </Text>

        <TextInput
          label="Check-in Date (YYYY-MM-DD)"
          value={checkIn}
          onChangeText={setCheckIn}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Check-out Date (YYYY-MM-DD)"
          value={checkOut}
          onChangeText={setCheckOut}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Number of Guests"
          value={guests}
          onChangeText={setGuests}
          mode="outlined"
          keyboardType="number-pad"
          style={styles.input}
        />

        <View style={styles.priceSection}>
          <Text variant="bodyLarge">Total Price:</Text>
          <Text variant="headlineSmall" style={styles.price}>
            ${property.pricePerNight * 2}
          </Text>
        </View>

        <Button
          mode="contained"
          onPress={handleBooking}
          loading={isLoading}
          disabled={!checkIn || !checkOut || !guests || isLoading}
          style={styles.button}
        >
          Confirm Booking
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 16,
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  propertyTitle: {
    marginBottom: 24,
    color: '#717171',
  },
  input: {
    marginBottom: 16,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 24,
    padding: 16,
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
  },
  price: {
    fontWeight: 'bold',
    color: '#FF385C',
  },
  button: {
    marginTop: 16,
  },
});
