import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        {/* Umbrella */}
        <View style={styles.umbrella}>
          <View style={styles.umbrellaTop} />
          <View style={styles.umbrellaHandle} />
        </View>
        
        {/* Bed */}
        <View style={styles.bed}>
          <View style={styles.bedFrame}>
            <View style={styles.pillow} />
            <View style={styles.mattress} />
          </View>
          <View style={styles.bedLegs}>
            <View style={styles.bedLeg} />
            <View style={styles.bedLeg} />
          </View>
        </View>
      </View>

      <Text style={styles.title}>Enat Bet</Text>
      <Text style={styles.subtitle}>Booking Platform</Text>
      <Text style={styles.tagline}>Book a home, not just a room</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF385C',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  
  // Umbrella styles
  umbrella: {
    alignItems: 'center',
    marginBottom: 10,
  },
  umbrellaTop: {
    width: 120,
    height: 60,
    backgroundColor: '#003D5C',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    borderWidth: 4,
    borderColor: 'white',
    borderBottomWidth: 0,
  },
  umbrellaHandle: {
    width: 4,
    height: 30,
    backgroundColor: '#003D5C',
    marginTop: -2,
  },
  
  // Bed styles
  bed: {
    alignItems: 'center',
  },
  bedFrame: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#003D5C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pillow: {
    width: 20,
    height: 12,
    backgroundColor: '#F4A460',
    borderRadius: 2,
    marginRight: 4,
    marginBottom: 2,
  },
  mattress: {
    width: 40,
    height: 8,
    backgroundColor: '#F4A460',
    borderRadius: 2,
  },
  bedLegs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 60,
    marginTop: 2,
  },
  bedLeg: {
    width: 4,
    height: 15,
    backgroundColor: '#003D5C',
  },
  
  // Text styles
  title: {
    fontSize: 56,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 20,
    color: 'white',
    marginTop: 8,
    fontWeight: '500',
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 6,
    fontStyle: 'italic',
  },
});