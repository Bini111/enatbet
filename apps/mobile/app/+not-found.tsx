import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const BRAND_PRIMARY = '#667eea';

export default function NotFoundScreen(): JSX.Element {
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={styles.container}>
        <Ionicons name="alert-circle-outline" size={80} color={BRAND_PRIMARY} />
        <Text style={styles.title}>Page Not Found</Text>
        <Text style={styles.message}>
          Sorry, the page you're looking for doesn't exist or has been moved.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/')}
          activeOpacity={0.8}
        >
          <Ionicons name="home" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 300,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BRAND_PRIMARY,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
