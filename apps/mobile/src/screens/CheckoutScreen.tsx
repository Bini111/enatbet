import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useStripePayment } from '../hooks/usePayment';
import PaymentSheet from '../components/PaymentSheet';
import { useAuthStore } from '@/store/authStore';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SERVICE_FEE_RATE } from '@enatbet/config';

export default function CheckoutScreen() {
  const { listingId, checkIn, checkOut, guests, title, nightlyPrice } = useLocalSearchParams();
  const { user } = useAuthStore();
  const router = useRouter();
  const { initializePayment, loading, error } = useStripePayment();
  const [paymentReady, setPaymentReady] = useState(false);

  const nights = Math.ceil(
    (new Date(checkOut as string).getTime() - new Date(checkIn as string).getTime()) / 
    (1000 * 60 * 60 * 24)
  );
  
  const subtotal = Number(nightlyPrice) * nights;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  const total = subtotal + serviceFee;

  useEffect(() => {
    if (!user) {
      Alert.alert('Authentication required', 'Please sign in to continue');
      router.push('/auth/signin');
      return;
    }

    initializePayment({
      amount: total,
      bookingDetails: {
        listingId: listingId as string,
        checkIn: checkIn as string,
        checkOut: checkOut as string,
        guests: guests as string,
      }
    }).then(() => setPaymentReady(true));
  }, []);

  if (!paymentReady || loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Preparing payment...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Confirm and Pay</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Booking Details</Text>
        <Text>{title}</Text>
        <Text>Check-in: {checkIn}</Text>
        <Text>Check-out: {checkOut}</Text>
        <Text>Guests: {guests}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Price Breakdown</Text>
        <View style={styles.priceRow}>
          <Text>${(subtotal / 100).toFixed(2)} x {nights} nights</Text>
          <Text>${(subtotal / 100).toFixed(2)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text>Service fee</Text>
          <Text>${(serviceFee / 100).toFixed(2)}</Text>
        </View>
        <View style={[styles.priceRow, styles.totalRow]}>
          <Text style={styles.totalText}>Total</Text>
          <Text style={styles.totalText}>${(total / 100).toFixed(2)}</Text>
        </View>
      </View>

      <PaymentSheet 
        onSuccess={() => router.push('/bookings')}
        onError={(error) => Alert.alert('Payment failed', error.message)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
    marginTop: 10,
  },
  totalText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
