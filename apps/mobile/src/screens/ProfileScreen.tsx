import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Avatar, List, Divider } from 'react-native-paper';
import { useAuthStore } from '../store/authStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Profile'>;
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
    navigation.navigate('Home');
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text variant="headlineMedium" style={styles.title}>
            Sign in to continue
          </Text>
          <Button mode="contained" onPress={() => navigation.navigate('Login')}>
            Sign In
          </Button>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text size={80} label={user.displayName.substring(0, 2).toUpperCase()} />
        <Text variant="headlineMedium" style={styles.name}>
          {user.displayName}
        </Text>
        <Text variant="bodyLarge" style={styles.email}>
          {user.email}
        </Text>
      </View>

      <Divider />

      <List.Section>
        <List.Item
          title="My Bookings"
          left={props => <List.Icon {...props} icon="calendar" />}
          onPress={() => navigation.navigate('MyBookings')}
        />
        <List.Item
          title="Favorites"
          left={props => <List.Icon {...props} icon="heart" />}
        />
        <List.Item
          title="Settings"
          left={props => <List.Icon {...props} icon="cog" />}
        />
        <List.Item
          title="Help & Support"
          left={props => <List.Icon {...props} icon="help-circle" />}
        />
      </List.Section>

      <View style={styles.footer}>
        <Button mode="outlined" onPress={handleSignOut}>
          Sign Out
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  header: {
    alignItems: 'center',
    padding: 32,
  },
  name: {
    marginTop: 16,
    fontWeight: 'bold',
  },
  email: {
    color: '#717171',
    marginTop: 4,
  },
  title: {
    marginBottom: 24,
  },
  footer: {
    padding: 16,
    marginTop: 32,
  },
});
