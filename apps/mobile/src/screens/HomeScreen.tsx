import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Text, Searchbar, Button } from 'react-native-paper';
import { usePropertyStore } from '../store/propertyStore';
import { PropertyCard } from '../components/property/PropertyCard';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const { featuredProperties, fetchFeaturedProperties, isLoading } = usePropertyStore();

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Find Your Next Stay
        </Text>
        
        <Searchbar
          placeholder="Where are you going?"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          onSubmitEditing={() => navigation.navigate('Search', { location: searchQuery })}
        />
      </View>

      <View style={styles.section}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Featured Properties
        </Text>
        
        {featuredProperties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onPress={() => navigation.navigate('PropertyDetails', { propertyId: property.id })}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 16,
    paddingTop: 60,
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  searchBar: {
    elevation: 4,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginBottom: 16,
    fontWeight: 'bold',
  },
});
