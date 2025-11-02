import React, { useState } from 'react';
import { View, Button, Alert } from 'react-native';
import { CardField } from '@stripe/stripe-react-native';
import { usePayment } from '@/hooks/usePayment';
import { auth } from '@/lib/firebase';

export function CheckoutScreen({ route, navigation }: any) {
  const { bookingRequest } = route.params;
  const { createPaymentIntent, processPayment, loading } = usePayment();
  const [cardDetails, setCardDetails] = useState<any>(null);

  const handlePayment = async () => {
    try {
      const { clientSecret, bookingId } = await createPaymentIntent(bookingRequest);
      await processPayment(clientSecret, {
        email: auth.currentUser?.email || 'guest@example.com',
        name: auth.currentUser?.displayName || undefined,
      });
      navigation.replace('BookingConfirmation', { bookingId });
    } catch (e: any) {
      Alert.alert('Payment Failed', e.message);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <CardField
        postalCodeEnabled
        onCardChange={(details) => setCardDetails(details)}
        style={{ height: 50, marginVertical: 12 }}
      />
      <Button
        title={loading ? 'Processing…' : 'Pay Now'}
        onPress={handlePayment}
        disabled={!cardDetails?.complete || loading}
      />
    </View>
  );
}
