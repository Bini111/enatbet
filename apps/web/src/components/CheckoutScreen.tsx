// apps/mobile/src/screens/CheckoutScreen.tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStripe } from '@stripe/stripe-react-native';
import { auth } from '@/config/firebase';
import { SERVICE_FEE_RATE } from '@enatbet/config';

type Params = {
  listingId?: string;
  checkIn?: string;    // 'YYYY-MM-DD'
  checkOut?: string;   // 'YYYY-MM-DD'
  guests?: string;     // numeric string
  title?: string;
  nightlyPrice?: string; // minor units (e.g., cents)
};

const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000';

function toDay(dateStr: string) {
  // Normalize to local midnight to avoid TZ drift.
  return new Date(`${dateStr}T00:00:00`);
}

function safeInteger(n: unknown, fallback = 0) {
  const v = Number(n);
  return Number.isFinite(v) ? Math.trunc(v) : fallback;
}

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Params>();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [initializing, setInitializing] = useState(true);
  const [presenting, setPresenting] = useState(false);
  const [ready, setReady] = useState(false);

  // ---- Validate and derive booking amounts ----
  const booking = useMemo(() => {
    const listingId = params.listingId ?? '';
    const checkIn = params.checkIn ?? '';
    const checkOut = params.checkOut ?? '';
    const guests = safeInteger(params.guests ?? '1', 1);

    // nightlyPrice expected in minor units (cents). If dollars were passed by mistake, multiply before calling API.
    const nightlyPrice = safeInteger(params.nightlyPrice ?? '0', 0);

    // Basic param checks
    const start = checkIn ? toDay(checkIn) : null;
    const end = checkOut ? toDay(checkOut) : null;
    const now = toDay(new Date().toISOString().slice(0, 10));

    const valid =
      !!listingId &&
      !!start &&
      !!end &&
      end.getTime() > start.getTime() &&
      start.getTime() > now.getTime() &&
      nightlyPrice > 0 &&
      guests >= 1;

    const nights = valid
      ? Math.max(1, Math.round((end!.getTime() - start!.getTime()) / 86_400_000))
      : 0;

    const subtotal = nights * nightlyPrice; // minor units
    const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE); // minor units
    const total = subtotal + serviceFee; // minor units

    return {
      valid,
      listingId,
      checkIn,
      checkOut,
      guests,
      title: params.title ?? '',
      nightlyPrice,
      nights,
      subtotal,
      serviceFee,
      total,
    };
  }, [params]);

  // ---- Initialize PaymentSheet (server must create PaymentIntent) ----
  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        if (!booking.valid) {
          Alert.alert('Invalid booking', 'Please review your dates and price.');
          router.back();
          return;
        }

        const idToken = await auth.currentUser?.getIdToken?.();
        const idempotencyKey = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

        // Your backend should:
        // 1) Create a PaymentIntent for `booking.total` minor units
        // 2) Return { paymentIntentClientSecret: string }
        const resp = await fetch(`${API_BASE}/api/payments/create-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
            'Idempotency-Key': idempotencyKey,
          },
          body: JSON.stringify({
            amount: booking.total, // minor units
            currency: 'usd',       // set to your currency
            metadata: {
              listingId: booking.listingId,
              checkIn: booking.checkIn,
              checkOut: booking.checkOut,
              guests: String(booking.guests),
              platform: 'mobile',
            },
            // mode: 'payment' // if your backend expects it
          }),
        });

        if (!resp.ok) {
          const e = await resp.json().catch(() => ({}));
          throw new Error(e.message || `Failed to create PaymentIntent (${resp.status})`);
        }

        const data = await resp.json();
        const clientSecret: string =
          data.paymentIntentClientSecret || data.clientSecret || data.piClientSecret;

        if (!clientSecret || typeof clientSecret !== 'string') {
          throw new Error('Missing PaymentIntent client secret from server response.');
        }

        const { error } = await initPaymentSheet({
          // Customer fields are optional if you only need a one-off payment
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: 'EnatBet',
          allowsDelayedPaymentMethods: false,
          defaultBillingDetails: {
            name: auth.currentUser?.displayName ?? undefined,
            email: auth.currentUser?.email ?? undefined,
          },
          returnURL: 'enatbet://stripe-redirect',
        });

        if (error) throw new Error(error.message);

        if (mounted) setReady(true);
      } catch (err: any) {
        Alert.alert('Payment init failed', err?.message || 'Unknown error');
        router.back();
      } finally {
        if (mounted) setInitializing(false);
      }
    }

    bootstrap();
    return () => {
      mounted = false;
    };
  }, [booking, initPaymentSheet, router]);

  const onPay = useCallback(async () => {
    try {
      setPresenting(true);
      const { error } = await presentPaymentSheet();
      if (error) throw new Error(error.message);

      // Optionally confirm booking on your backend here.

      Alert.alert('Success', 'Payment confirmed.');
      router.replace('/bookings');
    } catch (err: any) {
      Alert.alert('Payment failed', err?.message || 'Please try again.');
    } finally {
      setPresenting(false);
    }
  }, [presentPaymentSheet, router]);

  if (initializing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.muted}>Preparing payment…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Confirm and Pay</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Booking</Text>
        {!!booking.title && <Text>{booking.title}</Text>}
        <Text>Check-in: {booking.checkIn}</Text>
        <Text>Check-out: {booking.checkOut}</Text>
        <Text>Guests: {booking.guests}</Text>
        <Text>Nights: {booking.nights}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Price</Text>
        <Row label={`$${(booking.nightlyPrice / 100).toFixed(0)} × ${booking.nights} night${booking.nights === 1 ? '' : 's'}`}
             value={`$${(booking.subtotal / 100).toFixed(2)}`} />
        <Row label="Service fee" value={`$${(booking.serviceFee / 100).toFixed(2)}`} />
        <View style={styles.totalRow}>
          <Text style={styles.totalText}>Total</Text>
          <Text style={styles.totalText}>${(booking.total / 100).toFixed(2)}</Text>
        </View>
      </View>

      <Pressable
        disabled={!ready || presenting}
        onPress={onPay}
        style={[styles.payBtn, (!ready || presenting) && styles.disabled]}
      >
        {presenting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.payText}>Pay now</Text>
        )}
      </Pressable>

      {!ready && (
        <Text style={styles.muted}>
          Payment sheet not ready. Check your server response and Stripe setup.
        </Text>
      )}
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text>{label}</Text>
      <Text>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 22, fontWeight: '700' },
  card: { backgroundColor: '#f6f6f6', borderRadius: 12, padding: 16, gap: 6 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ddd',
    paddingTop: 10,
    marginTop: 10,
  },
  totalText: { fontWeight: '700', fontSize: 16 },
  payBtn: {
    backgroundColor: '#111',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  disabled: { opacity: 0.5 },
  payText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  muted: { color: '#666', marginTop: 8 },
});
