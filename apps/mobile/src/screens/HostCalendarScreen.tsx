import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/native';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList, Listing, Booking, CustomPricing } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'HostCalendar'>;
  route: RouteProp<RootStackParamList, 'HostCalendar'>;
};

interface DayData {
  date: Date;
  dateString: string;
  isToday: boolean;
  isCurrentMonth: boolean;
  isBlocked: boolean;
  isBooked: boolean;
  booking?: Booking;
  customPrice?: number;
  isSelected: boolean;
}

const { width } = Dimensions.get('window');
const DAY_WIDTH = (width - 48) / 7;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function HostCalendarScreen({ navigation, route }: Props) {
  const { user } = useAuthStore();
  const listingIdParam = route.params?.listingId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(listingIdParam || null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [customPricing, setCustomPricing] = useState<CustomPricing[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Modals
  const [showListingPicker, setShowListingPicker] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [customPriceInput, setCustomPriceInput] = useState('');

  // Fetch host listings
  const fetchListings = async () => {
    if (!user?.uid) return;

    try {
      const listingsQuery = query(
        collection(db, 'listings'),
        where('hostId', '==', user.uid)
      );
      const snapshot = await getDocs(listingsQuery);
      const fetchedListings: Listing[] = [];

      snapshot.forEach((doc) => {
        fetchedListings.push({ id: doc.id, ...doc.data() } as Listing);
      });

      setListings(fetchedListings);

      // Auto-select first listing if none selected
      if (!selectedListingId && fetchedListings.length > 0) {
        setSelectedListingId(fetchedListings[0].id);
      }
    } catch (err) {
      console.error('Error fetching listings:', err);
    }
  };

  // Fetch selected listing details and bookings
  const fetchListingData = async () => {
    if (!selectedListingId) {
      setLoading(false);
      return;
    }

    try {
      // Fetch listing
      const listingDoc = await getDoc(doc(db, 'listings', selectedListingId));
      if (listingDoc.exists()) {
        const listingData = { id: listingDoc.id, ...listingDoc.data() } as Listing;
        setSelectedListing(listingData);
        setBlockedDates(listingData.blockedDates || []);
        setCustomPricing(listingData.customPricing || []);
      }

      // Fetch bookings for this listing
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('listingId', '==', selectedListingId),
        where('status', 'in', ['confirmed', 'pending'])
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      const fetchedBookings: Booking[] = [];

      bookingsSnapshot.forEach((doc) => {
        fetchedBookings.push({ id: doc.id, ...doc.data() } as Booking);
      });

      setBookings(fetchedBookings);
    } catch (err) {
      console.error('Error fetching listing data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useFocusEffect(
    useCallback(() => {
      fetchListings();
    }, [user?.uid])
  );

  // Fetch listing data when selection changes
  useEffect(() => {
    if (selectedListingId) {
      setLoading(true);
      fetchListingData();
    }
  }, [selectedListingId]);

  // Generate calendar days for current month view
  const generateCalendarDays = (): DayData[] => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: DayData[] = [];

    // Previous month padding
    const prevMonth = new Date(year, month, 0);
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i);
      days.push(createDayData(date, false, today));
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      days.push(createDayData(date, true, today));
    }

    // Next month padding
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push(createDayData(date, false, today));
    }

    return days;
  };

  // Create day data object
  const createDayData = (date: Date, isCurrentMonth: boolean, today: Date): DayData => {
    const dateString = formatDateString(date);
    const isBlocked = blockedDates.includes(dateString);
    const customPriceEntry = customPricing.find((p) => p.date === dateString);

    // Check if date is booked
    let isBooked = false;
    let booking: Booking | undefined;
    for (const b of bookings) {
      const checkIn = b.checkIn?.toDate ? b.checkIn.toDate() : new Date(b.checkIn);
      const checkOut = b.checkOut?.toDate ? b.checkOut.toDate() : new Date(b.checkOut);
      checkIn.setHours(0, 0, 0, 0);
      checkOut.setHours(0, 0, 0, 0);

      if (date >= checkIn && date < checkOut) {
        isBooked = true;
        booking = b;
        break;
      }
    }

    return {
      date,
      dateString,
      isToday: date.getTime() === today.getTime(),
      isCurrentMonth,
      isBlocked,
      isBooked,
      booking,
      customPrice: customPriceEntry?.price,
      isSelected: selectedDates.includes(dateString),
    };
  };

  // Format date to YYYY-MM-DD
  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // Handle day selection
  const handleDayPress = (day: DayData) => {
    if (!day.isCurrentMonth) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (day.date < today) return; // Can't select past dates

    if (day.isBooked) {
      // Show booking details
      if (day.booking) {
        Alert.alert(
          'Booked',
          `This date is booked by ${day.booking.guestName}.\n\nCheck-in: ${formatDisplayDate(day.booking.checkIn)}\nCheck-out: ${formatDisplayDate(day.booking.checkOut)}`,
          [
            { text: 'OK' },
            {
              text: 'View Booking',
              onPress: () => navigation.navigate('HostBookingDetails', { bookingId: day.booking!.id }),
            },
          ]
        );
      }
      return;
    }

    // Toggle selection
    if (selectedDates.includes(day.dateString)) {
      setSelectedDates((prev) => prev.filter((d) => d !== day.dateString));
    } else {
      setSelectedDates((prev) => [...prev, day.dateString]);
    }
  };

  // Format date for display
  const formatDisplayDate = (timestamp: any): string => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Show action modal when dates are selected
  const handleShowActions = () => {
    if (selectedDates.length === 0) {
      Alert.alert('Select Dates', 'Please tap on dates to select them first.');
      return;
    }
    setShowActionModal(true);
  };

  // Block selected dates
  const handleBlockDates = async () => {
    setSaving(true);
    try {
      const newBlockedDates = [...new Set([...blockedDates, ...selectedDates])];
      await updateDoc(doc(db, 'listings', selectedListingId!), {
        blockedDates: newBlockedDates,
        updatedAt: Timestamp.now(),
      });
      setBlockedDates(newBlockedDates);
      setSelectedDates([]);
      setShowActionModal(false);
      Alert.alert('Success', `${selectedDates.length} date(s) blocked.`);
    } catch (err) {
      console.error('Error blocking dates:', err);
      Alert.alert('Error', 'Failed to block dates. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Unblock selected dates
  const handleUnblockDates = async () => {
    setSaving(true);
    try {
      const newBlockedDates = blockedDates.filter((d) => !selectedDates.includes(d));
      await updateDoc(doc(db, 'listings', selectedListingId!), {
        blockedDates: newBlockedDates,
        updatedAt: Timestamp.now(),
      });
      setBlockedDates(newBlockedDates);
      setSelectedDates([]);
      setShowActionModal(false);
      Alert.alert('Success', `${selectedDates.length} date(s) unblocked.`);
    } catch (err) {
      console.error('Error unblocking dates:', err);
      Alert.alert('Error', 'Failed to unblock dates. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Set custom price for selected dates
  const handleSetCustomPrice = async () => {
    const price = parseFloat(customPriceInput);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price.');
      return;
    }

    setSaving(true);
    try {
      // Remove existing custom prices for selected dates
      let newCustomPricing = customPricing.filter((p) => !selectedDates.includes(p.date));

      // Add new prices
      selectedDates.forEach((dateString) => {
        newCustomPricing.push({ date: dateString, price });
      });

      await updateDoc(doc(db, 'listings', selectedListingId!), {
        customPricing: newCustomPricing,
        updatedAt: Timestamp.now(),
      });

      setCustomPricing(newCustomPricing);
      setSelectedDates([]);
      setCustomPriceInput('');
      setShowPriceModal(false);
      setShowActionModal(false);
      Alert.alert('Success', `Custom price set for ${selectedDates.length} date(s).`);
    } catch (err) {
      console.error('Error setting custom price:', err);
      Alert.alert('Error', 'Failed to set custom price. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Clear custom price for selected dates
  const handleClearCustomPrice = async () => {
    setSaving(true);
    try {
      const newCustomPricing = customPricing.filter((p) => !selectedDates.includes(p.date));
      await updateDoc(doc(db, 'listings', selectedListingId!), {
        customPricing: newCustomPricing,
        updatedAt: Timestamp.now(),
      });
      setCustomPricing(newCustomPricing);
      setSelectedDates([]);
      setShowActionModal(false);
      Alert.alert('Success', 'Custom pricing cleared for selected dates.');
    } catch (err) {
      console.error('Error clearing custom price:', err);
      Alert.alert('Error', 'Failed to clear custom price. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedDates([]);
  };

  const calendarDays = generateCalendarDays();
  const currencySymbol = selectedListing?.currency === 'USD' ? '$' : 'ETB ';

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading calendar...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // No listings state
  if (listings.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📅</Text>
          <Text style={styles.emptyTitle}>No Listings Yet</Text>
          <Text style={styles.emptyText}>
            Create a listing first to manage its calendar and availability.
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('CreateListingStep1', {})}
            buttonColor="#6366F1"
          >
            Create Listing
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Listing Selector */}
      <TouchableOpacity
        style={styles.listingSelector}
        onPress={() => setShowListingPicker(true)}
      >
        <View style={styles.listingSelectorContent}>
          <Text style={styles.listingSelectorLabel}>Selected Listing</Text>
          <Text style={styles.listingSelectorTitle} numberOfLines={1}>
            {selectedListing?.title || 'Select a listing'}
          </Text>
        </View>
        <Text style={styles.listingSelectorArrow}>▼</Text>
      </TouchableOpacity>

      {/* Calendar Header */}
      <View style={styles.calendarHeader}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goToToday}>
          <Text style={styles.monthTitle}>
            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Text style={styles.navButtonText}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Weekday Headers */}
      <View style={styles.weekdayHeader}>
        {WEEKDAYS.map((day) => (
          <Text key={day} style={styles.weekdayText}>
            {day}
          </Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <ScrollView style={styles.calendarScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.calendarGrid}>
          {calendarDays.map((day, index) => (
            <TouchableOpacity
              key={`${day.dateString}-${index}`}
              style={[
                styles.dayCell,
                !day.isCurrentMonth && styles.dayCellOtherMonth,
                day.isToday && styles.dayCellToday,
                day.isSelected && styles.dayCellSelected,
                day.isBlocked && styles.dayCellBlocked,
                day.isBooked && styles.dayCellBooked,
              ]}
              onPress={() => handleDayPress(day)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayText,
                  !day.isCurrentMonth && styles.dayTextOtherMonth,
                  day.isToday && styles.dayTextToday,
                  day.isSelected && styles.dayTextSelected,
                  day.isBlocked && styles.dayTextBlocked,
                  day.isBooked && styles.dayTextBooked,
                ]}
              >
                {day.date.getDate()}
              </Text>

              {/* Custom Price Badge */}
              {day.customPrice && !day.isBlocked && !day.isBooked && (
                <Text style={styles.customPriceBadge}>
                  {currencySymbol}{day.customPrice}
                </Text>
              )}

              {/* Status Indicators */}
              {day.isBlocked && (
                <View style={styles.statusIndicator}>
                  <Text style={styles.statusIndicatorText}>🚫</Text>
                </View>
              )}
              {day.isBooked && (
                <View style={styles.statusIndicator}>
                  <Text style={styles.statusIndicatorText}>📅</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#D1FAE5' }]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#DBEAFE' }]} />
            <Text style={styles.legendText}>Booked</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FEE2E2' }]} />
            <Text style={styles.legendText}>Blocked</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#6366F1' }]} />
            <Text style={styles.legendText}>Selected</Text>
          </View>
        </View>

        {/* Base Price Info */}
        {selectedListing && (
          <View style={styles.priceInfo}>
            <Text style={styles.priceInfoLabel}>Base Price:</Text>
            <Text style={styles.priceInfoValue}>
              {currencySymbol}{selectedListing.pricePerNight}/night
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Selection Actions */}
      {selectedDates.length > 0 && (
        <View style={styles.selectionBar}>
          <Text style={styles.selectionText}>
            {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''} selected
          </Text>
          <View style={styles.selectionActions}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClearSelection}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
            <Button
              mode="contained"
              onPress={handleShowActions}
              buttonColor="#6366F1"
              compact
            >
              Actions
            </Button>
          </View>
        </View>
      )}

      {/* Listing Picker Modal */}
      <Modal
        visible={showListingPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowListingPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Listing</Text>
              <TouchableOpacity onPress={() => setShowListingPicker(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              {listings.map((listing) => (
                <TouchableOpacity
                  key={listing.id}
                  style={[
                    styles.listingOption,
                    selectedListingId === listing.id && styles.listingOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedListingId(listing.id);
                    setSelectedDates([]);
                    setShowListingPicker(false);
                  }}
                >
                  <View style={styles.listingOptionContent}>
                    <Text style={styles.listingOptionTitle} numberOfLines={1}>
                      {listing.title}
                    </Text>
                    <Text style={styles.listingOptionLocation}>
                      {listing.city}, {listing.country}
                    </Text>
                  </View>
                  {selectedListingId === listing.id && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Action Modal */}
      <Modal
        visible={showActionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.actionModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDates.length} Date{selectedDates.length > 1 ? 's' : ''} Selected
              </Text>
              <TouchableOpacity onPress={() => setShowActionModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleBlockDates}
                disabled={saving}
              >
                <Text style={styles.actionButtonIcon}>🚫</Text>
                <Text style={styles.actionButtonLabel}>Block Dates</Text>
                <Text style={styles.actionButtonHint}>Prevent bookings</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleUnblockDates}
                disabled={saving}
              >
                <Text style={styles.actionButtonIcon}>✅</Text>
                <Text style={styles.actionButtonLabel}>Unblock Dates</Text>
                <Text style={styles.actionButtonHint}>Allow bookings</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  setShowActionModal(false);
                  setShowPriceModal(true);
                }}
                disabled={saving}
              >
                <Text style={styles.actionButtonIcon}>💰</Text>
                <Text style={styles.actionButtonLabel}>Set Price</Text>
                <Text style={styles.actionButtonHint}>Custom nightly rate</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleClearCustomPrice}
                disabled={saving}
              >
                <Text style={styles.actionButtonIcon}>🔄</Text>
                <Text style={styles.actionButtonLabel}>Reset Price</Text>
                <Text style={styles.actionButtonHint}>Use base price</Text>
              </TouchableOpacity>
            </View>

            {saving && (
              <View style={styles.savingOverlay}>
                <ActivityIndicator size="small" color="#6366F1" />
                <Text style={styles.savingText}>Saving...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Custom Price Modal */}
      <Modal
        visible={showPriceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPriceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.priceModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Custom Price</Text>
              <TouchableOpacity onPress={() => setShowPriceModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.priceInputContainer}>
              <Text style={styles.priceInputLabel}>
                Price per night for {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''}
              </Text>
              <View style={styles.priceInputRow}>
                <Text style={styles.currencyPrefix}>{currencySymbol}</Text>
                <TextInput
                  value={customPriceInput}
                  onChangeText={setCustomPriceInput}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  style={styles.priceInput}
                  mode="outlined"
                />
              </View>
              <Text style={styles.priceHint}>
                Base price: {currencySymbol}{selectedListing?.pricePerNight}/night
              </Text>
            </View>

            <View style={styles.priceModalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowPriceModal(false)}
                style={styles.priceModalButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSetCustomPrice}
                buttonColor="#6366F1"
                style={styles.priceModalButton}
                loading={saving}
                disabled={saving}
              >
                Set Price
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
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
  emptyContainer: {
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
  },
  // Listing Selector
  listingSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  listingSelectorContent: {
    flex: 1,
  },
  listingSelectorLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  listingSelectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  listingSelectorArrow: {
    fontSize: 14,
    color: '#6B7280',
  },
  // Calendar Header
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  navButton: {
    padding: 8,
  },
  navButtonText: {
    fontSize: 24,
    color: '#6366F1',
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  // Weekday Header
  weekdayHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  weekdayText: {
    width: DAY_WIDTH,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  // Calendar Grid
  calendarScroll: {
    flex: 1,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  dayCell: {
    width: DAY_WIDTH,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dayCellOtherMonth: {
    opacity: 0.3,
  },
  dayCellToday: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  dayCellSelected: {
    backgroundColor: '#6366F1',
    borderRadius: 8,
  },
  dayCellBlocked: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  dayCellBooked: {
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
  },
  dayText: {
    fontSize: 16,
    color: '#111827',
  },
  dayTextOtherMonth: {
    color: '#9CA3AF',
  },
  dayTextToday: {
    fontWeight: '700',
    color: '#6366F1',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dayTextBlocked: {
    color: '#DC2626',
  },
  dayTextBooked: {
    color: '#1D4ED8',
  },
  customPriceBadge: {
    position: 'absolute',
    bottom: 4,
    fontSize: 9,
    color: '#059669',
    fontWeight: '600',
  },
  statusIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  statusIndicatorText: {
    fontSize: 10,
  },
  // Legend
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
  },
  // Price Info
  priceInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  priceInfoLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  priceInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  // Selection Bar
  selectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#EEF2FF',
    borderTopWidth: 1,
    borderTopColor: '#C7D2FE',
  },
  selectionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4338CA',
  },
  selectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#6366F1',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  actionModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  priceModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalClose: {
    fontSize: 20,
    color: '#6B7280',
    padding: 4,
  },
  modalScroll: {
    maxHeight: 400,
  },
  // Listing Options
  listingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  listingOptionSelected: {
    backgroundColor: '#EEF2FF',
  },
  listingOptionContent: {
    flex: 1,
  },
  listingOptionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  listingOptionLocation: {
    fontSize: 13,
    color: '#6B7280',
  },
  checkmark: {
    fontSize: 20,
    color: '#6366F1',
    fontWeight: 'bold',
  },
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    width: '47%',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  actionButtonHint: {
    fontSize: 12,
    color: '#6B7280',
  },
  savingOverlay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  savingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6366F1',
  },
  // Price Modal
  priceInputContainer: {
    padding: 20,
  },
  priceInputLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyPrefix: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  priceHint: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
  },
  priceModalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  priceModalButton: {
    flex: 1,
  },
});
