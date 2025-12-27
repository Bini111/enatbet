import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { TextInput, Button, Searchbar } from 'react-native-paper';
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
  getDoc,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList, User, Listing, Report, AdminRequest } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AdminDashboard'>;
};

interface DashboardStats {
  totalUsers: number;
  totalHosts: number;
  totalListings: number;
  activeListings: number;
  totalBookings: number;
  pendingReports: number;
  pendingAdminRequests: number;
  bannedUsers: number;
}

const { width } = Dimensions.get('window');

export default function AdminDashboardScreen({ navigation }: Props) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalHosts: 0,
    totalListings: 0,
    activeListings: 0,
    totalBookings: 0,
    pendingReports: 0,
    pendingAdminRequests: 0,
    bannedUsers: 0,
  });

  // Data
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [adminRequests, setAdminRequests] = useState<AdminRequest[]>([]);

  // Search & Modals
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [warningReason, setWarningReason] = useState('');
  const [banReason, setBanReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Check if user is admin
  const isAdmin = user?.isAdmin || user?.role === 'admin';

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    try {
      // Fetch users count
      const usersSnapshot = await getDocs(collection(db, 'users'));
      let totalUsers = 0;
      let totalHosts = 0;
      let bannedUsers = 0;
      const recentUsersList: User[] = [];

      usersSnapshot.forEach((doc) => {
        const userData = doc.data() as User;
        totalUsers++;
        if (userData.isHost || userData.role === 'host') totalHosts++;
        if (userData.banned) bannedUsers++;
        if (recentUsersList.length < 10) {
          recentUsersList.push({ ...userData, uid: doc.id });
        }
      });

      setRecentUsers(recentUsersList);

      // Fetch listings count
      const listingsSnapshot = await getDocs(collection(db, 'listings'));
      let totalListings = 0;
      let activeListings = 0;

      listingsSnapshot.forEach((doc) => {
        totalListings++;
        const listing = doc.data();
        if (listing.isActive && listing.status === 'active') activeListings++;
      });

      // Fetch bookings count
      const bookingsSnapshot = await getDocs(collection(db, 'bookings'));
      const totalBookings = bookingsSnapshot.size;

      // Fetch pending reports
      const reportsQuery = query(
        collection(db, 'reports'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const reportsSnapshot = await getDocs(reportsQuery);
      const reportsList: Report[] = [];
      reportsSnapshot.forEach((doc) => {
        reportsList.push({ id: doc.id, ...doc.data() } as Report);
      });
      setRecentReports(reportsList);

      // Fetch pending admin requests
      const adminRequestsQuery = query(
        collection(db, 'adminRequests'),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const adminRequestsSnapshot = await getDocs(adminRequestsQuery);
      const requestsList: AdminRequest[] = [];
      adminRequestsSnapshot.forEach((doc) => {
        requestsList.push({ id: doc.id, ...doc.data() } as AdminRequest);
      });
      setAdminRequests(requestsList);

      // Update stats
      setStats({
        totalUsers,
        totalHosts,
        totalListings,
        activeListings,
        totalBookings,
        pendingReports: reportsList.length,
        pendingAdminRequests: requestsList.length,
        bannedUsers,
      });
    } catch (err) {
      console.error('Error fetching admin data:', err);
      Alert.alert('Error', 'Failed to load admin dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [isAdmin])
  );

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Search users
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Search by email
      const emailQuery = query(
        collection(db, 'users'),
        where('email', '>=', searchQuery.toLowerCase()),
        where('email', '<=', searchQuery.toLowerCase() + '\uf8ff'),
        limit(20)
      );
      const emailSnapshot = await getDocs(emailQuery);

      const results: User[] = [];
      emailSnapshot.forEach((doc) => {
        results.push({ ...doc.data(), uid: doc.id } as User);
      });

      // Also search by name if no email results
      if (results.length === 0) {
        const nameQuery = query(
          collection(db, 'users'),
          where('displayName', '>=', searchQuery),
          where('displayName', '<=', searchQuery + '\uf8ff'),
          limit(20)
        );
        const nameSnapshot = await getDocs(nameQuery);
        nameSnapshot.forEach((doc) => {
          results.push({ ...doc.data(), uid: doc.id } as User);
        });
      }

      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // View user details
  const handleViewUser = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setSelectedUser({ ...userDoc.data(), uid: userDoc.id } as User);
        setShowUserModal(true);
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      Alert.alert('Error', 'Failed to load user details.');
    }
  };

  // Issue warning to user
  const handleIssueWarning = async () => {
    if (!selectedUser || !warningReason.trim()) {
      Alert.alert('Error', 'Please enter a warning reason.');
      return;
    }

    setActionLoading(true);
    try {
      const userRef = doc(db, 'users', selectedUser.uid);
      const newWarning = {
        id: `warning_${Date.now()}`,
        reason: warningReason.trim(),
        issuedBy: user?.uid,
        issuedAt: Timestamp.now(),
      };

      const existingWarnings = selectedUser.warnings || [];
      await updateDoc(userRef, {
        warnings: [...existingWarnings, newWarning],
        updatedAt: Timestamp.now(),
      });

      // Create notification for user
      await createNotification(selectedUser.uid, 'account_warning', 'Account Warning', 
        `You have received a warning: ${warningReason.trim()}`);

      Alert.alert('Success', 'Warning issued successfully.');
      setShowWarningModal(false);
      setWarningReason('');
      setSelectedUser((prev) =>
        prev ? { ...prev, warnings: [...existingWarnings, newWarning] } : null
      );
    } catch (err) {
      console.error('Error issuing warning:', err);
      Alert.alert('Error', 'Failed to issue warning.');
    } finally {
      setActionLoading(false);
    }
  };

  // Ban user
  const handleBanUser = async () => {
    if (!selectedUser || !banReason.trim()) {
      Alert.alert('Error', 'Please enter a ban reason.');
      return;
    }

    Alert.alert(
      'Confirm Ban',
      `Are you sure you want to ban ${selectedUser.displayName || selectedUser.email}? This will prevent them from using the platform.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Ban User',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              const userRef = doc(db, 'users', selectedUser.uid);
              await updateDoc(userRef, {
                banned: true,
                banReason: banReason.trim(),
                bannedAt: Timestamp.now(),
                bannedBy: user?.uid,
                updatedAt: Timestamp.now(),
              });

              // Deactivate all user's listings
              const listingsQuery = query(
                collection(db, 'listings'),
                where('hostId', '==', selectedUser.uid)
              );
              const listingsSnapshot = await getDocs(listingsQuery);
              const updatePromises: Promise<void>[] = [];
              listingsSnapshot.forEach((listingDoc) => {
                updatePromises.push(
                  updateDoc(doc(db, 'listings', listingDoc.id), {
                    isActive: false,
                    status: 'suspended',
                    updatedAt: Timestamp.now(),
                  })
                );
              });
              await Promise.all(updatePromises);

              // Create notification for user
              await createNotification(selectedUser.uid, 'account_banned', 'Account Banned',
                `Your account has been banned: ${banReason.trim()}`);

              Alert.alert('Success', 'User has been banned.');
              setShowBanModal(false);
              setBanReason('');
              setSelectedUser((prev) => (prev ? { ...prev, banned: true } : null));
              fetchDashboardData();
            } catch (err) {
              console.error('Error banning user:', err);
              Alert.alert('Error', 'Failed to ban user.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  // Unban user
  const handleUnbanUser = async () => {
    if (!selectedUser) return;

    Alert.alert(
      'Confirm Unban',
      `Are you sure you want to unban ${selectedUser.displayName || selectedUser.email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unban User',
          onPress: async () => {
            setActionLoading(true);
            try {
              const userRef = doc(db, 'users', selectedUser.uid);
              await updateDoc(userRef, {
                banned: false,
                banReason: null,
                bannedAt: null,
                bannedBy: null,
                updatedAt: Timestamp.now(),
              });

              Alert.alert('Success', 'User has been unbanned.');
              setSelectedUser((prev) => (prev ? { ...prev, banned: false } : null));
              fetchDashboardData();
            } catch (err) {
              console.error('Error unbanning user:', err);
              Alert.alert('Error', 'Failed to unban user.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  // Approve admin request
  const handleApproveAdminRequest = async (request: AdminRequest) => {
    Alert.alert(
      'Approve Admin Request',
      `Make ${request.userName} a sub-admin?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              // Update user role
              await updateDoc(doc(db, 'users', request.userId), {
                isAdmin: true,
                role: 'admin',
                updatedAt: Timestamp.now(),
              });

              // Update request status
              await updateDoc(doc(db, 'adminRequests', request.id), {
                status: 'approved',
                reviewedBy: user?.uid,
                reviewedAt: Timestamp.now(),
              });

              // Create notification
              await createNotification(request.userId, 'admin_request',
                'Admin Request Approved', 'Your request to become an admin has been approved!');

              Alert.alert('Success', `${request.userName} is now an admin.`);
              setAdminRequests((prev) => prev.filter((r) => r.id !== request.id));
              fetchDashboardData();
            } catch (err) {
              console.error('Error approving admin:', err);
              Alert.alert('Error', 'Failed to approve admin request.');
            }
          },
        },
      ]
    );
  };

  // Reject admin request
  const handleRejectAdminRequest = async (request: AdminRequest) => {
    try {
      await updateDoc(doc(db, 'adminRequests', request.id), {
        status: 'rejected',
        reviewedBy: user?.uid,
        reviewedAt: Timestamp.now(),
      });

      Alert.alert('Done', 'Admin request rejected.');
      setAdminRequests((prev) => prev.filter((r) => r.id !== request.id));
    } catch (err) {
      console.error('Error rejecting admin:', err);
    }
  };

  // Revoke admin access
  const handleRevokeAdmin = async () => {
    if (!selectedUser) return;

    Alert.alert(
      'Revoke Admin Access',
      `Remove admin privileges from ${selectedUser.displayName || selectedUser.email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            try {
              await updateDoc(doc(db, 'users', selectedUser.uid), {
                isAdmin: false,
                role: selectedUser.isHost ? 'host' : 'guest',
                updatedAt: Timestamp.now(),
              });

              Alert.alert('Success', 'Admin access revoked.');
              setSelectedUser((prev) => (prev ? { ...prev, isAdmin: false } : null));
            } catch (err) {
              console.error('Error revoking admin:', err);
              Alert.alert('Error', 'Failed to revoke admin access.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  // Helper: Create notification
  const createNotification = async (
    userId: string,
    type: string,
    title: string,
    message: string
  ) => {
    try {
      const { addDoc } = await import('firebase/firestore');
      await addDoc(collection(db, 'notifications'), {
        userId,
        type,
        title,
        message,
        read: false,
        createdAt: Timestamp.now(),
      });
    } catch (err) {
      console.error('Error creating notification:', err);
    }
  };

  // Format date
  const formatDate = (timestamp: any): string => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Not authorized
  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notAuthorized}>
          <Text style={styles.notAuthorizedIcon}>🔒</Text>
          <Text style={styles.notAuthorizedTitle}>Admin Access Required</Text>
          <Text style={styles.notAuthorizedText}>
            You don't have permission to access the admin dashboard.
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            buttonColor="#6366F1"
          >
            Go Back
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  // Loading
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
          <Text style={styles.loadingText}>Loading admin dashboard...</Text>
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
          <Text style={styles.headerTitle}>🛡️ Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>Manage users, listings, and reports</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Users</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalHosts}</Text>
            <Text style={styles.statLabel}>Hosts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.activeListings}</Text>
            <Text style={styles.statLabel}>Active Listings</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalBookings}</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>
          <View style={[styles.statCard, stats.pendingReports > 0 && styles.statCardAlert]}>
            <Text style={styles.statValue}>{stats.pendingReports}</Text>
            <Text style={styles.statLabel}>Pending Reports</Text>
          </View>
          <View style={[styles.statCard, stats.bannedUsers > 0 && styles.statCardWarning]}>
            <Text style={styles.statValue}>{stats.bannedUsers}</Text>
            <Text style={styles.statLabel}>Banned</Text>
          </View>
        </View>

        {/* Search Users */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔍 Search Users</Text>
          <View style={styles.searchRow}>
            <Searchbar
              placeholder="Search by email or name..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              style={styles.searchBar}
            />
            <Button
              mode="contained"
              onPress={handleSearch}
              loading={isSearching}
              buttonColor="#6366F1"
              compact
            >
              Search
            </Button>
          </View>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <View style={styles.searchResults}>
              {searchResults.map((userItem) => (
                <TouchableOpacity
                  key={userItem.uid}
                  style={styles.userCard}
                  onPress={() => handleViewUser(userItem.uid)}
                >
                  <View style={styles.userAvatar}>
                    {userItem.photoURL ? (
                      <Image source={{ uri: userItem.photoURL }} style={styles.userAvatarImage} />
                    ) : (
                      <Text style={styles.userAvatarText}>
                        {(userItem.displayName || userItem.email || '?')[0].toUpperCase()}
                      </Text>
                    )}
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {userItem.displayName || 'No Name'}
                    </Text>
                    <Text style={styles.userEmail}>{userItem.email}</Text>
                  </View>
                  {userItem.banned && (
                    <View style={styles.bannedBadge}>
                      <Text style={styles.bannedBadgeText}>Banned</Text>
                    </View>
                  )}
                  {userItem.isAdmin && (
                    <View style={styles.adminBadge}>
                      <Text style={styles.adminBadgeText}>Admin</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Pending Admin Requests */}
        {adminRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👑 Admin Requests ({adminRequests.length})</Text>
            {adminRequests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestInfo}>
                  <Text style={styles.requestName}>{request.userName}</Text>
                  <Text style={styles.requestEmail}>{request.userEmail}</Text>
                  <Text style={styles.requestReason} numberOfLines={2}>
                    {request.reason}
                  </Text>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={styles.approveButton}
                    onPress={() => handleApproveAdminRequest(request)}
                  >
                    <Text style={styles.approveButtonText}>✓</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => handleRejectAdminRequest(request)}
                  >
                    <Text style={styles.rejectButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Pending Reports */}
        {recentReports.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🚨 Pending Reports</Text>
              <TouchableOpacity onPress={() => navigation.navigate('AdminReports')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            {recentReports.map((report) => (
              <TouchableOpacity
                key={report.id}
                style={styles.reportCard}
                onPress={() => navigation.navigate('AdminReportDetails', { reportId: report.id })}
              >
                <View style={styles.reportBadge}>
                  <Text style={styles.reportBadgeText}>{report.type}</Text>
                </View>
                <Text style={styles.reportReason} numberOfLines={2}>
                  {report.reason}
                </Text>
                <Text style={styles.reportMeta}>
                  By {report.reporterName} • {formatDate(report.createdAt)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('AdminUsers')}
            >
              <Text style={styles.quickActionIcon}>👥</Text>
              <Text style={styles.quickActionLabel}>All Users</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('AdminListings')}
            >
              <Text style={styles.quickActionIcon}>🏠</Text>
              <Text style={styles.quickActionLabel}>All Listings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('AdminReports')}
            >
              <Text style={styles.quickActionIcon}>🚨</Text>
              <Text style={styles.quickActionLabel}>Reports</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('AdminSubAdmins')}
            >
              <Text style={styles.quickActionIcon}>👑</Text>
              <Text style={styles.quickActionLabel}>Sub-Admins</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Users */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>👤 Recent Users</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AdminUsers')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentUsers.slice(0, 5).map((userItem) => (
            <TouchableOpacity
              key={userItem.uid}
              style={styles.userCard}
              onPress={() => handleViewUser(userItem.uid)}
            >
              <View style={styles.userAvatar}>
                {userItem.photoURL ? (
                  <Image source={{ uri: userItem.photoURL }} style={styles.userAvatarImage} />
                ) : (
                  <Text style={styles.userAvatarText}>
                    {(userItem.displayName || userItem.email || '?')[0].toUpperCase()}
                  </Text>
                )}
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{userItem.displayName || 'No Name'}</Text>
                <Text style={styles.userEmail}>{userItem.email}</Text>
              </View>
              <Text style={styles.userRole}>
                {userItem.isHost ? '🏠 Host' : '👤 Guest'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* User Details Modal */}
      <Modal
        visible={showUserModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUserModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.userModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>User Details</Text>
              <TouchableOpacity onPress={() => setShowUserModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedUser && (
              <ScrollView style={styles.userModalScroll}>
                {/* User Info */}
                <View style={styles.userModalHeader}>
                  <View style={styles.userModalAvatar}>
                    {selectedUser.photoURL ? (
                      <Image
                        source={{ uri: selectedUser.photoURL }}
                        style={styles.userModalAvatarImage}
                      />
                    ) : (
                      <Text style={styles.userModalAvatarText}>
                        {(selectedUser.displayName || selectedUser.email || '?')[0].toUpperCase()}
                      </Text>
                    )}
                  </View>
                  <Text style={styles.userModalName}>
                    {selectedUser.displayName || 'No Name'}
                  </Text>
                  <Text style={styles.userModalEmail}>{selectedUser.email}</Text>
                  <View style={styles.userModalBadges}>
                    {selectedUser.isHost && (
                      <View style={styles.hostBadge}>
                        <Text style={styles.hostBadgeText}>🏠 Host</Text>
                      </View>
                    )}
                    {selectedUser.isAdmin && (
                      <View style={styles.adminBadge}>
                        <Text style={styles.adminBadgeText}>👑 Admin</Text>
                      </View>
                    )}
                    {selectedUser.banned && (
                      <View style={styles.bannedBadge}>
                        <Text style={styles.bannedBadgeText}>🚫 Banned</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* User Details */}
                <View style={styles.userModalDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>User ID</Text>
                    <Text style={styles.detailValue}>{selectedUser.uid}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Phone</Text>
                    <Text style={styles.detailValue}>{selectedUser.phone || 'Not provided'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Joined</Text>
                    <Text style={styles.detailValue}>{formatDate(selectedUser.createdAt)}</Text>
                  </View>
                </View>

                {/* Warnings */}
                {selectedUser.warnings && selectedUser.warnings.length > 0 && (
                  <View style={styles.warningsSection}>
                    <Text style={styles.warningsTitle}>
                      ⚠️ Warnings ({selectedUser.warnings.length})
                    </Text>
                    {selectedUser.warnings.map((warning, index) => (
                      <View key={warning.id || index} style={styles.warningItem}>
                        <Text style={styles.warningReason}>{warning.reason}</Text>
                        <Text style={styles.warningDate}>{formatDate(warning.issuedAt)}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Ban Info */}
                {selectedUser.banned && selectedUser.banReason && (
                  <View style={styles.banInfoSection}>
                    <Text style={styles.banInfoTitle}>🚫 Ban Information</Text>
                    <Text style={styles.banInfoReason}>{selectedUser.banReason}</Text>
                    <Text style={styles.banInfoDate}>
                      Banned on {formatDate(selectedUser.bannedAt)}
                    </Text>
                  </View>
                )}

                {/* Action Buttons */}
                <View style={styles.userModalActions}>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      setShowUserModal(false);
                      setShowWarningModal(true);
                    }}
                    style={styles.actionButton}
                    textColor="#D97706"
                  >
                    ⚠️ Issue Warning
                  </Button>

                  {selectedUser.banned ? (
                    <Button
                      mode="contained"
                      onPress={handleUnbanUser}
                      style={styles.actionButton}
                      buttonColor="#10B981"
                      loading={actionLoading}
                    >
                      ✓ Unban User
                    </Button>
                  ) : (
                    <Button
                      mode="contained"
                      onPress={() => {
                        setShowUserModal(false);
                        setShowBanModal(true);
                      }}
                      style={styles.actionButton}
                      buttonColor="#DC2626"
                    >
                      🚫 Ban User
                    </Button>
                  )}

                  {selectedUser.isAdmin && selectedUser.uid !== user?.uid && (
                    <Button
                      mode="outlined"
                      onPress={handleRevokeAdmin}
                      style={styles.actionButton}
                      textColor="#DC2626"
                      loading={actionLoading}
                    >
                      Revoke Admin
                    </Button>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Warning Modal */}
      <Modal
        visible={showWarningModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWarningModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.inputModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Issue Warning</Text>
              <TouchableOpacity onPress={() => setShowWarningModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputModalBody}>
              <Text style={styles.inputLabel}>
                Warning to: {selectedUser?.displayName || selectedUser?.email}
              </Text>
              <TextInput
                value={warningReason}
                onChangeText={setWarningReason}
                placeholder="Enter warning reason..."
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.reasonInput}
              />
              <View style={styles.inputModalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowWarningModal(false)}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleIssueWarning}
                  buttonColor="#D97706"
                  style={styles.modalButton}
                  loading={actionLoading}
                >
                  Issue Warning
                </Button>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Ban Modal */}
      <Modal
        visible={showBanModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBanModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.inputModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ban User</Text>
              <TouchableOpacity onPress={() => setShowBanModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputModalBody}>
              <Text style={styles.inputLabel}>
                Banning: {selectedUser?.displayName || selectedUser?.email}
              </Text>
              <Text style={styles.banWarning}>
                ⚠️ This will prevent the user from logging in and deactivate all their listings.
              </Text>
              <TextInput
                value={banReason}
                onChangeText={setBanReason}
                placeholder="Enter ban reason..."
                mode="outlined"
                multiline
                numberOfLines={4}
                style={styles.reasonInput}
              />
              <View style={styles.inputModalActions}>
                <Button
                  mode="outlined"
                  onPress={() => setShowBanModal(false)}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleBanUser}
                  buttonColor="#DC2626"
                  style={styles.modalButton}
                  loading={actionLoading}
                >
                  Ban User
                </Button>
              </View>
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
    backgroundColor: '#1F2937',
    padding: 24,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 10,
    marginTop: -20,
  },
  statCard: {
    width: (width - 44) / 3,
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
  statCardAlert: {
    backgroundColor: '#FEE2E2',
  },
  statCardWarning: {
    backgroundColor: '#FEF3C7',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  // Section
  section: {
    padding: 20,
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
  // Search
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    elevation: 0,
  },
  searchResults: {
    marginTop: 16,
  },
  // User Card
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  userEmail: {
    fontSize: 13,
    color: '#6B7280',
  },
  userRole: {
    fontSize: 12,
    color: '#6B7280',
  },
  bannedBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  bannedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626',
  },
  adminBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 4,
  },
  adminBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6366F1',
  },
  hostBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 4,
  },
  hostBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  // Request Card
  requestCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  requestInfo: {
    flex: 1,
  },
  requestName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  requestEmail: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  requestReason: {
    fontSize: 13,
    color: '#374151',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  approveButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  approveButtonText: {
    fontSize: 18,
    color: '#059669',
  },
  rejectButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButtonText: {
    fontSize: 18,
    color: '#DC2626',
  },
  // Report Card
  reportCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  reportBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 8,
  },
  reportBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#DC2626',
    textTransform: 'capitalize',
  },
  reportReason: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 8,
  },
  reportMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    width: (width - 64) / 4,
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 28,
    marginBottom: 8,
    backgroundColor: '#F3F4F6',
    width: 56,
    height: 56,
    textAlign: 'center',
    lineHeight: 56,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickActionLabel: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
  },
  // Loading & Not Authorized
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
  notAuthorized: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  notAuthorizedIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  notAuthorizedTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  notAuthorizedText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  userModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
  },
  inputModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  userModalScroll: {
    padding: 20,
  },
  userModalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  userModalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userModalAvatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userModalAvatarText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  userModalName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  userModalEmail: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 12,
  },
  userModalBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  userModalDetails: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  warningsSection: {
    marginBottom: 20,
  },
  warningsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D97706',
    marginBottom: 12,
  },
  warningItem: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  warningReason: {
    fontSize: 14,
    color: '#92400E',
  },
  warningDate: {
    fontSize: 12,
    color: '#B45309',
    marginTop: 4,
  },
  banInfoSection: {
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  banInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
  },
  banInfoReason: {
    fontSize: 14,
    color: '#991B1B',
    marginBottom: 8,
  },
  banInfoDate: {
    fontSize: 12,
    color: '#B91C1C',
  },
  userModalActions: {
    gap: 10,
    paddingBottom: 20,
  },
  actionButton: {
    width: '100%',
  },
  // Input Modal
  inputModalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
  },
  banWarning: {
    fontSize: 13,
    color: '#DC2626',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  reasonInput: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  inputModalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});
