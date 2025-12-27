import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Card, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList, Booking, Listing } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'HostDashboard'>;
};

interface DashboardStats {
  totalListings: number;
  activeListings: number;
  totalBookings: number;
  pendingBookings: number;
  upcomingCheckIns: number;
  upcomingCheckOuts: number;
  totalEarnings: number;
  pendingEarnings: number;
  averageRating: number;
  totalReviews: number;
}

const { width } = Dimensions.get('window');

export default function HostDashboardScreen({ navigation }: Props) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    activeListings: 0,
    totalBookings: 0,
    pendingBookings: 0,
    upcomingCheckIns: 0,
    upcomingCheckOuts: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    averageRating: 0,
    totalReviews: 0,
  });
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);

  // Get greeting based on time of day
  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      const now = Timestamp.now();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = Timestamp.fromDate(today);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekTimestamp = Timestamp.fromDate(nextWeek);

      // Fetch listings
      const listingsQuery = query(
        collection(db, 'listings'),
        where('hostId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const listingsSnapshot = await getDocs(listingsQuery);
      const fetchedListings: Listing[] = [];
      let totalRating = 0;
      let totalReviews = 0;

      listingsSnapshot.forEach((doc) => {
        const data = doc.data() as Listing;
        fetchedListings.push({ ...data, id: doc.id });
        if (data.averageRating && data.reviewCount) {
          totalRating += data.averageRating * data.reviewCount;
          totalReviews += data.reviewCount;
        }
      });

      setListings(fetchedListings.slice(0, 5));

      // Fetch bookings
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('hostId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      const allBookings: Booking[] = [];
      let pendingCount = 0;
      let totalEarnings = 0;
      let pendingEarnings = 0;
      let upcomingCheckIns = 0;
      let upcomingCheckOuts = 0;

      bookingsSnapshot.forEach((doc) => {
        const data = doc.data() as Booking;
        const booking = { ...data, id: doc.id };
        allBookings.push(booking);

        // Count pending bookings
        if (data.status === 'pending') {
          pendingCount++;
          pendingEarnings += data.hostPayout || 0;
        }

        // Count completed earnings
        if (data.status === 'completed') {
          totalEarnings += data.hostPayout || 0;
        }

        // Check for upcoming check-ins (next 7 days)
        if (data.checkIn && data.status === 'confirmed') {
          const checkInDate = data.checkIn.toDate ? data.checkIn.toDate() : new Date(data.checkIn);
          if (checkInDate >= today && checkInDate <= nextWeek) {
            upcomingCheckIns++;
          }
        }

        // Check for upcoming check-outs (next 7 days)
        if (data.checkOut && data.status === 'confirmed') {
          const checkOutDate = data.checkOut.toDate ? data.checkOut.toDate() : new Date(data.checkOut);
          if (checkOutDate >= today && checkOutDate <= nextWeek) {
            upcomingCheckOuts++;
          }
        }
      });

      // Filter upcoming and recent bookings
      const upcoming = allBookings
        .filter((b) => {
          if (b.status !== 'confirmed' && b.status !== 'pending') return false;
          const checkIn = b.checkIn?.toDate ? b.checkIn.toDate() : new Date(b.checkIn);
          return checkIn >= today;
        })
        .slice(0, 5);

      const recent = allBookings
        .filter((b) => b.status === 'pending')
        .slice(0, 5);

      setUpcomingBookings(upcoming);
      setRecentBookings(recent);

      // Update stats
      setStats({
        totalListings: fetchedListings.length,
        activeListings: fetchedListings.filter((l) => l.isActive && l.status === 'active').length,
        totalBookings: allBookings.length,
        pendingBookings: pendingCount,
        upcomingCheckIns,
        upcomingCheckOuts,
        totalEarnings,
        pendingEarnings,
        averageRating: totalReviews > 0 ? totalRating / totalReviews : 0,
        totalReviews,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh on screen focus
  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [user?.uid])
  );

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Format date
  const formatDate = (timestamp: any): string => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    if (currency === 'ETB') {
      return `ETB ${amount.toLocaleString()}`;
    }
    return `$${amount.toLocaleString()}`;
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6366F1']}
            tintColor="#6366F1"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user?.displayName || 'Host'} 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.notificationIcon}>🔔</Text>
            {stats.pendingBookings > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {stats.pendingBookings > 9 ? '9+' : stats.pendingBookings}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Quick Stats Cards */}
        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={[styles.statCard, styles.statCardPrimary]}
            onPress={() => navigation.navigate('Earnings')}
          >
            <Text style={styles.statCardIcon}>💰</Text>
            <Text style={styles.statCardValue}>
              {formatCurrency(stats.totalEarnings)}
            </Text>
            <Text style={styles.statCardLabel}>Total Earnings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, styles.statCardSecondary]}
            onPress={() => navigation.navigate('HostBookings')}
          >
            <Text style={styles.statCardIcon}>📋</Text>
            <Text style={styles.statCardValueDark}>{stats.pendingBookings}</Text>
            <Text style={styles.statCardLabelDark}>Pending</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, styles.statCardSecondary]}
            onPress={() => navigation.navigate('ManageListings')}
          >
            <Text style={styles.statCardIcon}>🏠</Text>
            <Text style={styles.statCardValueDark}>{stats.activeListings}</Text>
            <Text style={styles.statCardLabelDark}>Active Listings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, styles.statCardSecondary]}
            onPress={() => navigation.navigate('ManageListings')}
          >
            <Text style={styles.statCardIcon}>⭐</Text>
            <Text style={styles.statCardValueDark}>
              {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
            </Text>
            <Text style={styles.statCardLabelDark}>Rating</Text>
          </TouchableOpacity>
        </View>

        {/* Today's Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 This Week</Text>
          <View style={styles.activityRow}>
            <View style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: '#D1FAE5' }]}>
                <Text style={styles.activityIconText}>🔑</Text>
              </View>
              <Text style={styles.activityValue}>{stats.upcomingCheckIns}</Text>
              <Text style={styles.activityLabel}>Check-ins</Text>
            </View>
            <View style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: '#FEE2E2' }]}>
                <Text style={styles.activityIconText}>🚪</Text>
              </View>
              <Text style={styles.activityValue}>{stats.upcomingCheckOuts}</Text>
              <Text style={styles.activityLabel}>Check-outs</Text>
            </View>
            <View style={styles.activityCard}>
              <View style={[styles.activityIcon, { backgroundColor: '#FEF3C7' }]}>
                <Text style={styles.activityIconText}>⏳</Text>
              </View>
              <Text style={styles.activityValue}>
                {formatCurrency(stats.pendingEarnings)}
              </Text>
              <Text style={styles.activityLabel}>Pending</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('CreateListingStep1', {})}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#EEF2FF' }]}>
                <Text style={styles.quickActionIconText}>➕</Text>
              </View>
              <Text style={styles.quickActionLabel}>New Listing</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('HostCalendar', {})}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
                <Text style={styles.quickActionIconText}>📅</Text>
              </View>
              <Text style={styles.quickActionLabel}>Calendar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('Messages')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#D1FAE5' }]}>
                <Text style={styles.quickActionIconText}>💬</Text>
              </View>
              <Text style={styles.quickActionLabel}>Messages</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('Earnings')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#FCE7F3' }]}>
                <Text style={styles.quickActionIconText}>💵</Text>
              </View>
              <Text style={styles.quickActionLabel}>Earnings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pending Bookings */}
        {recentBookings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🔔 Needs Attention</Text>
              <TouchableOpacity onPress={() => navigation.navigate('HostBookings')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {recentBookings.map((booking) => (
              <TouchableOpacity
                key={booking.id}
                style={styles.bookingCard}
                onPress={() => navigation.navigate('HostBookingDetails', { bookingId: booking.id })}
              >
                <View style={styles.bookingCardLeft}>
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingBadgeText}>Pending</Text>
                  </View>
                  <Text style={styles.bookingTitle} numberOfLines={1}>
                    {booking.listingTitle}
                  </Text>
                  <Text style={styles.bookingGuest}>
                    👤 {booking.guestName} • {booking.guestCount} guest{booking.guestCount > 1 ? 's' : ''}
                  </Text>
                  <Text style={styles.bookingDates}>
                    {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
                  </Text>
                </View>
                <View style={styles.bookingCardRight}>
                  <Text style={styles.bookingPrice}>
                    {formatCurrency(booking.totalPrice, booking.currency)}
                  </Text>
                  <Text style={styles.reviewAction}>Review →</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Upcoming Bookings */}
        {upcomingBookings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📆 Upcoming Bookings</Text>
              <TouchableOpacity onPress={() => navigation.navigate('HostBookings')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {upcomingBookings.map((booking) => (
              <TouchableOpacity
                key={booking.id}
                style={styles.upcomingCard}
                onPress={() => navigation.navigate('HostBookingDetails', { bookingId: booking.id })}
              >
                {booking.listingPhoto && (
                  <Image
                    source={{ uri: booking.listingPhoto }}
                    style={styles.upcomingImage}
                  />
                )}
                <View style={styles.upcomingContent}>
                  <Text style={styles.upcomingTitle} numberOfLines={1}>
                    {booking.listingTitle}
                  </Text>
                  <Text style={styles.upcomingGuest}>
                    👤 {booking.guestName}
                  </Text>
                  <Text style={styles.upcomingDates}>
                    {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
                  </Text>
                </View>
                <View style={styles.upcomingBadge}>
                  <Text style={styles.upcomingBadgeText}>
                    {booking.status === 'confirmed' ? '✓ Confirmed' : '⏳ Pending'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Your Listings */}
        {listings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🏠 Your Listings</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ManageListings')}>
                <Text style={styles.seeAllText}>Manage All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listingsScroll}
            >
              {listings.map((listing) => (
                <TouchableOpacity
                  key={listing.id}
                  style={styles.listingCard}
                  onPress={() => navigation.navigate('EditListing', { listingId: listing.id })}
                >
                  {listing.coverPhoto || listing.photos?.[0]?.url ? (
                    <Image
                      source={{ uri: listing.coverPhoto || listing.photos?.[0]?.url }}
                      style={styles.listingImage}
                    />
                  ) : (
                    <View style={[styles.listingImage, styles.listingImagePlaceholder]}>
                      <Text style={styles.listingImagePlaceholderText}>🏠</Text>
                    </View>
                  )}
                  <View style={styles.listingContent}>
                    <Text style={styles.listingTitle} numberOfLines={1}>
                      {listing.title}
                    </Text>
                    <Text style={styles.listingLocation} numberOfLines={1}>
                      {listing.city}
                    </Text>
                    <View style={styles.listingFooter}>
                      <Text style={styles.listingPrice}>
                        {listing.currency === 'USD' ? '$' : 'ETB '}{listing.pricePerNight}
                        <Text style={styles.listingPriceUnit}>/night</Text>
                      </Text>
                      <View
                        style={[
                          styles.listingStatus,
                          { backgroundColor: listing.isActive ? '#D1FAE5' : '#FEE2E2' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.listingStatusText,
                            { color: listing.isActive ? '#059669' : '#DC2626' },
                          ]}
                        >
                          {listing.isActive ? 'Active' : 'Inactive'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}

              {/* Add New Listing Card */}
              <TouchableOpacity
                style={styles.addListingCard}
                onPress={() => navigation.navigate('CreateListingStep1', {})}
              >
                <Text style={styles.addListingIcon}>➕</Text>
                <Text style={styles.addListingText}>Add New Listing</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {/* Empty State for New Hosts */}
        {listings.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🏠</Text>
            <Text style={styles.emptyTitle}>Start Your Hosting Journey</Text>
            <Text style={styles.emptyText}>
              Create your first listing and start earning from your property today!
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('CreateListingStep1', {})}
              style={styles.emptyButton}
              buttonColor="#6366F1"
            >
              Create Your First Listing
            </Button>
          </View>
        )}

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>💡 Hosting Tips</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>📸</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Quality photos matter</Text>
              <Text style={styles.tipText}>
                Listings with professional photos get 40% more bookings
              </Text>
            </View>
          </View>
          <View style={styles.tipCard}>
            <Text style={styles.tipIcon}>⚡</Text>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Respond quickly</Text>
              <Text style={styles.tipText}>
                Hosts who respond within 1 hour get more bookings
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#6366F1',
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#E0E7FF',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 10,
  },
  statCard: {
    width: (width - 44) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statCardPrimary: {
    backgroundColor: '#6366F1',
  },
  statCardSecondary: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statCardValueDark: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statCardLabel: {
    fontSize: 13,
    color: '#E0E7FF',
    marginTop: 4,
  },
  statCardLabelDark: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  // Section
  section: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  // Activity Row
  activityRow: {
    flexDirection: 'row',
    gap: 12,
  },
  activityCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityIconText: {
    fontSize: 18,
  },
  activityValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  activityLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    width: (width - 64) / 4,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionIconText: {
    fontSize: 24,
  },
  quickActionLabel: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
  },
  // Booking Cards
  bookingCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingCardLeft: {
    flex: 1,
  },
  pendingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 8,
  },
  pendingBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D97706',
  },
  bookingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  bookingGuest: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  bookingDates: {
    fontSize: 13,
    color: '#6B7280',
  },
  bookingCardRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  bookingPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  reviewAction: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  // Upcoming Card
  upcomingCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  upcomingImage: {
    width: 80,
    height: 80,
  },
  upcomingContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  upcomingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  upcomingGuest: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  upcomingDates: {
    fontSize: 12,
    color: '#6B7280',
  },
  upcomingBadge: {
    padding: 12,
    justifyContent: 'center',
  },
  upcomingBadgeText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
  },
  // Listings Scroll
  listingsScroll: {
    paddingRight: 20,
  },
  listingCard: {
    width: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  listingImage: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
  },
  listingImagePlaceholder: {
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingImagePlaceholderText: {
    fontSize: 32,
  },
  listingContent: {
    padding: 12,
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  listingLocation: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  listingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listingPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  listingPriceUnit: {
    fontSize: 11,
    fontWeight: '400',
    color: '#6B7280',
  },
  listingStatus: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  listingStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  addListingCard: {
    width: 180,
    height: 180,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6366F1',
    borderStyle: 'dashed',
  },
  addListingIcon: {
    fontSize: 32,
    color: '#6366F1',
    marginBottom: 8,
  },
  addListingText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  // Empty State
  emptyState: {
    padding: 40,
    alignItems: 'center',
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
  emptyButton: {
    paddingHorizontal: 24,
  },
  // Tips
  tipsSection: {
    margin: 20,
    padding: 16,
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 12,
  },
  tipCard: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 2,
  },
  tipText: {
    fontSize: 13,
    color: '#B45309',
    lineHeight: 18,
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
});
