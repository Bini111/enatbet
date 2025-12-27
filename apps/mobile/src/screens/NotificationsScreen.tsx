import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Button } from 'react-native-paper';
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
  writeBatch,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList, Notification, NotificationType } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Notifications'>;
};

// Notification type configurations
const NOTIFICATION_CONFIG: Record
  NotificationType,
  { icon: string; color: string; bgColor: string }
> = {
  booking_request: { icon: '📋', color: '#D97706', bgColor: '#FEF3C7' },
  booking_confirmed: { icon: '✅', color: '#059669', bgColor: '#D1FAE5' },
  booking_cancelled: { icon: '❌', color: '#DC2626', bgColor: '#FEE2E2' },
  booking_completed: { icon: '🎉', color: '#6366F1', bgColor: '#EEF2FF' },
  new_message: { icon: '💬', color: '#3B82F6', bgColor: '#DBEAFE' },
  new_review: { icon: '⭐', color: '#F59E0B', bgColor: '#FEF3C7' },
  payout_sent: { icon: '💰', color: '#10B981', bgColor: '#D1FAE5' },
  listing_approved: { icon: '🏠', color: '#059669', bgColor: '#D1FAE5' },
  listing_suspended: { icon: '🚫', color: '#DC2626', bgColor: '#FEE2E2' },
  account_warning: { icon: '⚠️', color: '#D97706', bgColor: '#FEF3C7' },
  account_banned: { icon: '🔒', color: '#DC2626', bgColor: '#FEE2E2' },
  admin_request: { icon: '👑', color: '#6366F1', bgColor: '#EEF2FF' },
  system: { icon: '🔔', color: '#6B7280', bgColor: '#F3F4F6' },
};

export default function NotificationsScreen({ navigation }: Props) {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(notificationsQuery);
      const fetchedNotifications: Notification[] = [];

      snapshot.forEach((doc) => {
        fetchedNotifications.push({
          id: doc.id,
          ...doc.data(),
        } as Notification);
      });

      setNotifications(fetchedNotifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [user?.uid])
  );

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  // Mark single notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        readAt: Timestamp.now(),
      });

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true, readAt: Timestamp.now() } : n
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.read);
    if (unreadNotifications.length === 0) return;

    try {
      const batch = writeBatch(db);
      const now = Timestamp.now();

      unreadNotifications.forEach((notification) => {
        const notifRef = doc(db, 'notifications', notification.id);
        batch.update(notifRef, { read: true, readAt: now });
      });

      await batch.commit();

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, readAt: now }))
      );

      Alert.alert('Done', 'All notifications marked as read');
    } catch (err) {
      console.error('Error marking all as read:', err);
      Alert.alert('Error', 'Failed to mark notifications as read');
    }
  };

  // Handle notification press - navigate to relevant screen
  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read first
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    const { type, data } = notification;

    switch (type) {
      case 'booking_request':
      case 'booking_confirmed':
      case 'booking_cancelled':
      case 'booking_completed':
        if (data?.bookingId) {
          // Check if user is host or guest
          if (data?.isHost) {
            navigation.navigate('HostBookingDetails', { bookingId: data.bookingId });
          } else {
            navigation.navigate('TripDetails', { bookingId: data.bookingId });
          }
        }
        break;

      case 'new_message':
        if (data?.conversationId) {
          navigation.navigate('Chat', {
            conversationId: data.conversationId,
            recipientName: data.senderName,
          });
        } else {
          navigation.navigate('Messages');
        }
        break;

      case 'new_review':
        if (data?.listingId) {
          navigation.navigate('ViewReviews', {
            listingId: data.listingId,
            listingTitle: data.listingTitle || 'Reviews',
          });
        }
        break;

      case 'payout_sent':
        navigation.navigate('Earnings');
        break;

      case 'listing_approved':
      case 'listing_suspended':
        if (data?.listingId) {
          navigation.navigate('EditListing', { listingId: data.listingId });
        } else {
          navigation.navigate('ManageListings');
        }
        break;

      case 'account_warning':
      case 'account_banned':
        navigation.navigate('Settings');
        break;

      case 'admin_request':
        navigation.navigate('AdminDashboard');
        break;

      default:
        // No specific navigation
        break;
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { deleteDoc } = await import('firebase/firestore');
              await deleteDoc(doc(db, 'notifications', notificationId));
              setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
            } catch (err) {
              console.error('Error deleting notification:', err);
              Alert.alert('Error', 'Failed to delete notification');
            }
          },
        },
      ]
    );
  };

  // Format time ago
  const formatTimeAgo = (timestamp: any): string => {
    if (!timestamp) return '';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter notifications
  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications;

  // Count unread
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Render notification item
  const renderNotification = ({ item }: { item: Notification }) => {
    const config = NOTIFICATION_CONFIG[item.type] || NOTIFICATION_CONFIG.system;

    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          !item.read && styles.notificationCardUnread,
        ]}
        onPress={() => handleNotificationPress(item)}
        onLongPress={() => deleteNotification(item.id)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.notificationIcon,
            { backgroundColor: config.bgColor },
          ]}
        >
          <Text style={styles.notificationIconText}>{config.icon}</Text>
        </View>

        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <Text
              style={[
                styles.notificationTitle,
                !item.read && styles.notificationTitleUnread,
              ]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>

          <Text style={styles.notificationMessage} numberOfLines={2}>
            {item.message}
          </Text>

          <Text style={styles.notificationTime}>
            {formatTimeAgo(item.createdAt)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🔔</Text>
      <Text style={styles.emptyTitle}>
        {filter === 'unread' ? 'No Unread Notifications' : 'No Notifications Yet'}
      </Text>
      <Text style={styles.emptyText}>
        {filter === 'unread'
          ? "You're all caught up! Check back later for new updates."
          : "When you receive notifications, they'll appear here."}
      </Text>
      {filter === 'unread' && notifications.length > 0 && (
        <Button
          mode="outlined"
          onPress={() => setFilter('all')}
          style={styles.showAllButton}
        >
          Show All Notifications
        </Button>
      )}
    </View>
  );

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header Actions */}
      <View style={styles.headerActions}>
        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'all' && styles.filterTabTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'unread' && styles.filterTabActive]}
            onPress={() => setFilter('unread')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'unread' && styles.filterTabTextActive,
              ]}
            >
              Unread
              {unreadCount > 0 && (
                <Text style={styles.unreadBadgeText}> ({unreadCount})</Text>
              )}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Mark All Read Button */}
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllReadText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={[
          styles.listContent,
          filteredNotifications.length === 0 && styles.emptyListContent,
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
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Long press hint */}
      {notifications.length > 0 && (
        <View style={styles.hintBar}>
          <Text style={styles.hintText}>
            💡 Long press on a notification to delete it
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  // Header Actions
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 2,
  },
  filterTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  filterTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterTabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#6366F1',
    fontWeight: '600',
  },
  unreadBadgeText: {
    color: '#6366F1',
    fontWeight: '600',
  },
  markAllReadText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  // List
  listContent: {
    padding: 16,
  },
  emptyListContent: {
    flex: 1,
  },
  separator: {
    height: 8,
  },
  // Notification Card
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  notificationCardUnread: {
    backgroundColor: '#FAFBFF',
    borderLeftWidth: 3,
    borderLeftColor: '#6366F1',
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationIconText: {
    fontSize: 22,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  notificationTitleUnread: {
    fontWeight: '600',
    color: '#111827',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366F1',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
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
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  showAllButton: {
    marginTop: 8,
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
  // Hint Bar
  hintBar: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 12,
    color: '#6B7280',
  },
});
