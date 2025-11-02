import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Searchbar } from 'react-native-paper';
import { usePropertyStore } from '../store/propertyStore';
import { PropertyCard } from '../components/property/PropertyCard';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';

type SearchScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Search'>;
  route: RouteProp<RootStackParamList, 'Search'>;
};

export const SearchScreen: React.FC<SearchScreenProps> = ({ navigation, route }) => {
  const [searchQuery, setSearchQuery] = useState(route.params?.location || '');
  const { properties, fetchProperties, isLoading } = usePropertyStore();

  useEffect(() => {
    if (searchQuery) {
      fetchProperties({ location: searchQuery });
    }
  }, [searchQuery]);

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search location..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <FlatList
        data={properties}
        renderItem={({ item }) => (
          <PropertyCard
            property={item}
            onPress={() => navigation.navigate('PropertyDetails', { propertyId: item.id })}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text>No properties found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    margin: 16,
    elevation: 4,
  },
  list: {
    paddingBottom: 16,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
});
