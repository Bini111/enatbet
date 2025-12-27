import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Switch, Button, FAB } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList, Listing } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ManageListings'>;
};

type ListingWithStats = Listing & {
  pendingBookings?: number;
  totalEarnings?: number;
};

export default function ManageListingsScreen({ navigation }: Props) {
  const { user } = useAuthStore();
  const [listings, setListings] = useState<ListingWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Fetch host listings
  const fetchListings = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      const listingsQuery = query(
        collection(db, 'listings'),
        where('hostId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(listingsQuery);
      const fetchedListings: ListingWithStats[] = [];

      snapshot.forEach((doc) => {
        fetchedListings.push({
          id: doc.id,
          ...doc.data(),
        } as ListingWithStats);
      });

      setListings(fetchedListings);
    } catch (err) {
      console.error('Error fetching listings:', err);
      Alert.alert('Error', 'Failed to load listings. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      fetchListings();
    }, [user?.uid])
  );

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchListings();
  };

  // Toggle listing active status
  const toggleListingStatus = async (listingId: string, currentStatus: boolean) => {
    setTogglingId(listingId);

    try {
      const listingRef = doc(db, 'listings', listingId);
      await updateDoc(listingRef, {
        isActive: !currentStatus,
        status: !currentStatus ? 'active' : 'inactive',
        updatedAt: Timestamp.now(),
      });

      // Update local state
      setListings((prev) =>
        prev.map((listing) =>
          listing.id === listingId
            ? { ...listing, isActive: !currentStatus, status: !currentStatus ? 'active' : 'inactive' }
            : listing
        )
      );

      // Show feedback
      Alert.alert(
        'Success',
        !currentStatus
          ? 'Your listing is now visible to guests'
          : 'Your listing is now hidden from guests'
      );
    } catch (err) {
      console.error('Error toggling listing:', err);
      Alert.alert('Error', 'Failed to update listing status. Please try again.');
    } finally {
      setTogglingId(null);
    }
  };

  // Confirm before toggling off
  const handleToggle = (listing: ListingWithStats) => {
    if (listing.isActive) {
      Alert.alert(
        'Deactivate Listing',
        'This will hide your listing from guests. Existing bookings will not be affected. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Deactivate',
            style: 'destructive',
            onPress: () => toggleListingStatus(listing.id, listing.isActive),
          },
        ]
      );
    } else {
      toggleListingStatus(listing.id, listing.isActive);
    }
  };

  // Delete listing (soft delete)
  const handleDelete = (listing: ListingWithStats) => {
    Alert.alert(
      'Delete Listing',
      `Are you sure you want to delete "${listing.title}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const listingRef = doc(db, 'listings', listing.id);
              await updateDoc(listingRef, {
                status: 'deleted',
                isActive: false,
                updatedAt: Timestamp.now(),
              });
              setListings((prev) => prev.filter((l) => l.id !== listing.id));
              Alert.alert('Deleted', 'Listing has been deleted.');
            } catch (err) {
              console.error('Error deleting listing:', err);
              Alert.alert('Error', 'Failed to delete listing.');
            }
          },
        },
      ]
    );
  };

  // Get status badge color
  const getStatusColor = (status: string, isActive: boolean): { bg: string; text: string } => {
    if (!isActive || status === 'inactive') {
      return { bg: '#FEE2E2', text: '#DC2626' };
    }
    switch (status) {
      case 'active':
        return { bg: '#D1FAE5', text: '#059669' };
      case 'pending_approval':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'suspended':
        return { bg: '#FEE2E2', text: '#DC2626' };
      default:
        return { bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  // Render listing item
  const renderListing = ({ item }: { item: ListingWithStats }) => {
    const statusColor = getStatusColor(item.status, item.isActive);
    const currencySymbol = item.currency === 'USD' ? '$' : 'ETB ';
    const isToggling = togglingId === item.id;

    return (
      <View style={styles.listingCard}>
        {/* Cover Image */}
        <TouchableOpacity
          onPress={() => navigation.navigate('EditListing', { listingId: item.id })}
          activeOpacity={0.9}
        >
          {item.coverPhoto || item.photos?.[0]?.url ? (
            <Image
              source={{ uri: item.coverPhoto || item.photos?.[0]?.url }}
              style={styles.listingImage}
            />
          ) : (
            <View style={[styles.listingImage, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>🏠</Text>
            </View>
          )}

          {/* Status Badge */}
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
            <Text style={[styles.statusText, { color: statusColor.text }]}>
              {item.isActive ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.listingContent}>
          <View style={styles.listingHeader}>
            <View style={styles.listingInfo}>
              <Text style={styles.listingTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.listingLocation} numberOfLines={1}>
                📍 {item.city}, {item.country}
              </Text>
            </View>

            {/* Toggle Switch */}
            <View style={styles.toggleContainer}>
              {isToggling ? (
                <ActivityIndicator size="small" color="#6366F1" />
              ) : (
                <Switch
                  value={item.isActive}
                  onValueChange={() => handleToggle(item)}
                  color="#6366F1"
                />
              )}
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currencySymbol}{item.pricePerNight}</Text>
              <Text style={styles.statLabel}>/night</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{item.bookingCount || 0}</Text>
              <Text style={styles.statLabel}>Bookings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {item.averageRating ? item.averageRating.toFixed(1) : '—'}
              </Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{item.reviewCount || 0}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('EditListing', { listingId: item.id })}
            >
              <Text style={styles.actionButtonText}>✏️ Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('HostCalendar', { listingId: item.id })}
            >
              <Text style={styles.actionButtonText}>📅 Calendar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('ViewReviews', { 
                listingId: item.id, 
                listingTitle: item.title 
              })}
            >
              <Text style={styles.actionButtonText}>⭐ Reviews</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete(item)}
            >
              <Text style={styles.deleteButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🏠</Text>
      <Text style={styles.emptyTitle}>No Listings Yet</Text>
      <Text style={styles.emptyText}>
        Create your first listing and start earning from your property
      </Text>
      <Button
        mode="contained"
        onPress={() => navigation.navigate('CreateListingStep1', {})}
        style={styles.createButton}
        buttonColor="#6366F1"
      >
        Create Your First Listing
      </Button>
    </View>
  );

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading your listings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header Stats */}
      <View style={styles.headerStats}>
        <View style={styles.headerStatItem}>
          <Text style={styles.headerStatValue}>{listings.length}</Text>
          <Text style={styles.headerStatLabel}>Total Listings</Text>
        </View>
        <View style={styles.headerStatDivider} />
        <View style={styles.headerStatItem}>
          <Text style={styles.headerStatValue}>
            {listings.filter((l) => l.isActive).length}
          </Text>
          <Text style={styles.headerStatLabel}>Active</Text>
        </View>
        <View style={styles.headerStatDivider} />
        <View style={styles.headerStatItem}>
          <Text style={styles.headerStatValue}>
            {listings.filter((l) => !l.isActive).length}
          </Text>
          <Text style={styles.headerStatLabel}>Inactive</Text>
        </View>
      </View>

      {/* Listings List */}
      <FlatList
        data={listings}
        keyExtractor={(item) => item.id}
        renderItem={renderListing}
        contentContainerStyle={[
          styles.listContent,
          listings.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6366F1']}
            tintColor="#6366F1"
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB for creating new listing */}
      {listings.length > 0 && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate('CreateListingStep1', {})}
          color="#FFFFFF"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  // Header Stats
  headerStats: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  headerStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  headerStatLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  headerStatDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  // List Content
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyListContent: {
    flex: 1,
  },
  // Listing Card
  listingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  listingImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  placeholderImage: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listingContent: {
    padding: 16,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  listingInfo: {
    flex: 1,
    marginRight: 12,
  },
  listingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  listingLocation: {
    fontSize: 14,
    color: '#6B7280',
  },
  toggleContainer: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Stats Row
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
  },
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  deleteButton: {
    flex: 0,
    paddingHorizontal: 14,
    backgroundColor: '#FEE2E2',
  },
  deleteButtonText: {
    fontSize: 14,
  },
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  createButton: {
    paddingHorizontal: 24,
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#6366F1',
  },
});
