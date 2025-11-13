import { StripeProvider } from '@stripe/stripe-react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';

const STRIPE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!;

export default function App() {
  return (
    <StripeProvider publishableKey={STRIPE_KEY}>
      <NavigationContainer>
        <StatusBar style="auto" />
        {/* Your navigation here */}
      </NavigationContainer>
    </StripeProvider>
  );
}
