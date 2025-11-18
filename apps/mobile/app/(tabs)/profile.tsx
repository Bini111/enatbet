import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function Profile() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push('/login')}
      >
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.secondaryButton]}
        onPress={() => router.push('/signup')}
      >
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 32 },
  button: { 
    backgroundColor: '#667eea', 
    padding: 16, 
    borderRadius: 8,
    width: '100%',
    maxWidth: 300,
    marginBottom: 12,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600', textAlign: 'center' },
  secondaryButton: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#667eea' },
  secondaryButtonText: { color: '#667eea' },
});
