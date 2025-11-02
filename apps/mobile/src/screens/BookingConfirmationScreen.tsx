import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';

export const BookingConfirmationScreen = ({ navigation }: any) => (
  <View style={styles.container}>
    <Text variant="headlineMedium">Booking Confirmed!</Text>
    <Text style={styles.text}>Your booking has been successfully created.</Text>
    <Button mode="contained" onPress={() => navigation.navigate('Home')}>
      Back to Home
    </Button>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  text: {
    marginVertical: 24,
  },
});
