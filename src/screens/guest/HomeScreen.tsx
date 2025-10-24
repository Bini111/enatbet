import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  ActivityIndicator,
  Card,
  Chip,
  IconButton,
  Searchbar,
  Surface,
  Text,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import ListingCard from '../../components/listing/ListingCard';
import SearchFiltersModal from '../../components/search/FilterModal';
import { spacing, theme, typography } from '../../config/theme';
import { useAuthStore } from '../../store/authStore';
import { useListingStore } from '../../store/listingStore';
import { Listing } from '../../types';

const { width: screenWidth } = Dimensions.get('window');

// Popular destinations for Ethiopian/Eritrean diaspora
const POPULAR_DESTINATIONS = [
  { id: '1', city: 'Washington DC', country: 'USA', icon: 'city' },
  { id: '2', city: 'Dallas', country: 'USA', icon: 'city' },
  { id: '3', city: 'Atlanta', country: 'USA', icon: 'city' },
  { id: '4', city: 'London', country: 'UK', icon: 'city' },
  { id: '5', city: 'Addis Ababa', country: 'Ethiopia', icon: 'home' },
  { id: '6', city: 'Asmara', country: 'Eritrea', icon: 'home' },
];

const CATEGORIES = [
  { id: '1', label: 'Entire Place', value: 'entire_place', icon: 'home' },
  { id: '2', label: 'Private Room', value: 'private_room', icon: 'bed' },
  { id: '3', label: 'Shared Room', value: 'shared_room', icon: 'account-group' },
  { id: '4', label: 'Instant Book', value: 'instant_book', icon: 'lightning-bolt' },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const {
    featuredListings,
    searchResults,
    isLoading,
    searchFilters,
    fetchFeaturedListings,
    searchListings,
    setSearchFilters,
  } = useListingStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await fetchFeaturedListings();
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFeaturedListings();
    setRefreshing(false);
  }, []);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await searchListings({
        ...searchFilters,
        location: searchQuery,
      });
      navigation.navigate('SearchResults');
    }
  };

  const handleDestinationPress = (destination: any) => {
    setSearchFilters({ location: destination.city });
    searchListings({ location: destination.city });
    navigation.navigate('SearchResults');
  };

  const handleCategoryPress = (category: any) => {
    setSelectedCategory(category.value);
    if (category.value === 'instant_book') {
      setSearchFilters({ instantBook: true });
    } else {
      setSearchFilters({ roomType: category.value });
    }
    searchListings({
      ...searchFilters,
      roomType: category.value === 'instant_book' ? undefined : category.value,
      instantBook: category.value === 'instant_book',
    });
    navigation.navigate('SearchResults');
  };

  const handleListingPress = (listing: Listing) => {
    navigation.navigate('ListingDetail', { listingId: listing.id });
  };

  const renderDestination = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => handleDestinationPress(item)} style={styles.destinationCard}>
      <Surface style={styles.destinationSurface} elevation={2}>
        <Icon name={item.icon} size={32} color={theme.colors.primary} />
        <Text style={styles.destinationCity}>{item.city}</Text>
        <Text style={styles.destinationCountry}>{item.country}</Text>
      </Surface>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }: { item: any }) => (
    <Chip
      selected={selectedCategory === item.value}
      onPress={() => handleCategoryPress(item)}
      icon={item.icon}
      style={styles.categoryChip}
      selectedColor={theme.colors.primary}
    >
      {item.label}
    </Chip>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>
                {user ? `Hello, ${user.displayName}` : 'Welcome to EnatBet'}
              </Text>
              <Text style={styles.subGreeting}>Find your home away from home</Text>
            </View>
            <IconButton
              icon="bell-outline"
              size={28}
              onPress={() => navigation.navigate('Notifications')}
            />
          </View>

          {/* Search Bar */}
          <Searchbar
            placeholder="Where are you going?"
            onChangeText={setSearchQuery}
            value={searchQuery}
            onSubmitEditing={handleSearch}
            onIconPress={handleSearch}
            style={styles.searchBar}
            icon="map-marker"
            right={() => <IconButton icon="tune" onPress={() => setShowFilters(true)} />}
          />
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <FlatList
            data={CATEGORIES}
            renderItem={renderCategory}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Popular Destinations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Destinations</Text>
          <Text style={styles.sectionSubtitle}>
            Cities with large Ethiopian & Eritrean communities
          </Text>
          <FlatList
            data={POPULAR_DESTINATIONS}
            renderItem={renderDestination}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.destinationsList}
          />
        </View>

        {/* Featured Listings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Stays</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" style={styles.loader} />
          ) : featuredListings.length > 0 ? (
            <FlatList
              data={featuredListings}
              renderItem={({ item }) => (
                <ListingCard listing={item} onPress={() => handleListingPress(item)} />
              )}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listingsList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Icon name="home-search" size={48} color={theme.colors.onSurfaceVariant} />
              <Text style={styles.emptyText}>No featured listings available</Text>
            </View>
          )}
        </View>

        {/* Community Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community</Text>
          <View style={styles.communityCards}>
            <TouchableOpacity
              style={styles.communityCard}
              onPress={() => navigation.navigate('Events')}
            >
              <Surface style={styles.communityCardSurface} elevation={2}>
                <Icon name="calendar-star" size={32} color={theme.colors.secondary} />
                <Text style={styles.communityCardTitle}>Events</Text>
                <Text style={styles.communityCardText}>Discover cultural events and festivals</Text>
              </Surface>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.communityCard}
              onPress={() => navigation.navigate('Resources')}
            >
              <Surface style={styles.communityCardSurface} elevation={2}>
                <Icon name="map-marker-multiple" size={32} color={theme.colors.tertiary} />
                <Text style={styles.communityCardTitle}>Resources</Text>
                <Text style={styles.communityCardText}>Find restaurants, churches & more</Text>
              </Surface>
            </TouchableOpacity>
          </View>
        </View>

        {/* Host CTA */}
        {user && !user.isHost && (
          <Card style={styles.hostCTA}>
            <Card.Content>
              <View style={styles.hostCTAContent}>
                <View style={styles.hostCTAText}>
                  <Text style={styles.hostCTATitle}>Become a Host</Text>
                  <Text style={styles.hostCTASubtitle}>
                    Earn extra income by sharing your space
                  </Text>
                </View>
                <Icon name="home-plus" size={48} color={theme.colors.primary} />
              </View>
              <TouchableOpacity
                style={styles.hostCTAButton}
                onPress={() => navigation.navigate('CreateListing')}
              >
                <Text style={styles.hostCTAButtonText}>Get Started</Text>
              </TouchableOpacity>
            </Card.Content>
          </Card>
        )}

        {/* Spacing at bottom */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Filter Modal */}
      <SearchFiltersModal
        visible={showFilters}
        onDismiss={() => setShowFilters(false)}
        filters={searchFilters}
        onApply={filters => {
          setSearchFilters(filters);
          setShowFilters(false);
          if (filters.location || searchQuery) {
            searchListings(filters);
            navigation.navigate('SearchResults');
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    backgroundColor: theme.colors.surfaceVariant,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  greeting: {
    ...typography.h4,
    color: theme.colors.onBackground,
  },
  subGreeting: {
    ...typography.body2,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: theme.colors.background,
  },
  categoriesSection: {
    marginTop: spacing.md,
  },
  categoriesList: {
    paddingHorizontal: spacing.md,
  },
  categoryChip: {
    marginRight: spacing.sm,
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h5,
    color: theme.colors.onBackground,
  },
  sectionSubtitle: {
    ...typography.body2,
    color: theme.colors.onSurfaceVariant,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  seeAll: {
    ...typography.body2,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  destinationsList: {
    paddingVertical: spacing.sm,
  },
  destinationCard: {
    marginRight: spacing.md,
  },
  destinationSurface: {
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    width: 100,
    height: 100,
    justifyContent: 'center',
  },
  destinationCity: {
    ...typography.body2,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  destinationCountry: {
    ...typography.caption,
    color: theme.colors.onSurfaceVariant,
  },
  listingsList: {
    paddingVertical: spacing.sm,
  },
  loader: {
    padding: spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.body1,
    color: theme.colors.onSurfaceVariant,
    marginTop: spacing.md,
  },
  communityCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  communityCard: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  communityCardSurface: {
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 140,
    justifyContent: 'center',
  },
  communityCardTitle: {
    ...typography.body1,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  communityCardText: {
    ...typography.caption,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  hostCTA: {
    margin: spacing.md,
    marginTop: spacing.xl,
  },
  hostCTAContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hostCTAText: {
    flex: 1,
  },
  hostCTATitle: {
    ...typography.h5,
    color: theme.colors.onBackground,
  },
  hostCTASubtitle: {
    ...typography.body2,
    color: theme.colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  hostCTAButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
  hostCTAButtonText: {
    color: theme.colors.onPrimary,
    fontWeight: '600',
  },
});

export default HomeScreen;
