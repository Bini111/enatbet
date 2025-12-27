import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { signOut, deleteUser } from 'firebase/auth';
import { db, auth } from '../../lib/firebase';
import { useAuthStore } from '../store/authStore';
import { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

interface SettingsState {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  bookingReminders: boolean;
  messageAlerts: boolean;
  priceAlerts: boolean;
  darkMode: boolean;
  currency: 'USD' | 'ETB';
  language: string;
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'am', label: 'አማርኛ (Amharic)' },
  { code: 'ti', label: 'ትግርኛ (Tigrinya)' },
];

export default function SettingsScreen({ navigation }: Props) {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsState>({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    bookingReminders: true,
    messageAlerts: true,
    priceAlerts: false,
    darkMode: false,
    currency: 'USD',
    language: 'en',
  });

  // Load settings from AsyncStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('userSettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save settings to AsyncStorage
  const saveSettings = async (newSettings: SettingsState) => {
    try {
      await AsyncStorage.setItem('userSettings', JSON.stringify(newSettings));
    } catch (err) {
      console.error('Error saving settings:', err);
    }
  };

  // Update a setting
  const updateSetting = <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);

    // Sync notification preferences to Firestore
    if (user?.uid && key.includes('Notification') || key.includes('Alerts') || key.includes('Reminders')) {
      updateDoc(doc(db, 'users', user.uid), {
        notificationPreferences: {
          push: newSettings.pushNotifications,
          email: newSettings.emailNotifications,
          sms: newSettings.smsNotifications,
          marketing: newSettings.marketingEmails,
          bookingReminders: newSettings.bookingReminders,
          messageAlerts: newSettings.messageAlerts,
          priceAlerts: newSettings.priceAlerts,
        },
        updatedAt: Timestamp.now(),
      }).catch(console.error);
    }
  };

  // Sign out
  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              setUser(null);
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              });
            } catch (err) {
              console.error('Sign out error:', err);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Delete account
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone and all your data will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'Please type DELETE to confirm account deletion.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Confirm Delete',
                  style: 'destructive',
                  onPress: async () => {
                    if (!user?.uid || !auth.currentUser) {
                      Alert.alert('Error', 'No user signed in.');
                      return;
                    }

                    setSaving(true);
                    try {
                      // Mark user as deleted in Firestore
                      await updateDoc(doc(db, 'users', user.uid), {
                        deleted: true,
                        deletedAt: Timestamp.now(),
                        email: `deleted_${user.uid}@deleted.com`,
                        displayName: 'Deleted User',
                      });

                      // Delete Firebase auth user
                      await deleteUser(auth.currentUser);

                      // Clear local storage
                      await AsyncStorage.clear();

                      setUser(null);
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'MainTabs' }],
                      });

                      Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
                    } catch (err: any) {
                      console.error('Delete account error:', err);
                      if (err.code === 'auth/requires-recent-login') {
                        Alert.alert(
                          'Re-authentication Required',
                          'For security, please sign out and sign back in before deleting your account.'
                        );
                      } else {
                        Alert.alert('Error', 'Failed to delete account. Please try again.');
                      }
                    } finally {
                      setSaving(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  // Open external links
  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open link.');
    });
  };

  // Clear cache
  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear cached data. You may need to re-download some content.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: async () => {
            try {
              // Clear only cache-related storage, not user settings
              const keys = await AsyncStorage.getAllKeys();
              const cacheKeys = keys.filter(k => k.startsWith('cache_'));
              await AsyncStorage.multiRemove(cacheKeys);
              Alert.alert('Done', 'Cache cleared successfully.');
            } catch (err) {
              console.error('Clear cache error:', err);
              Alert.alert('Error', 'Failed to clear cache.');
            }
          },
        },
      ]
    );
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>👤</Text>
              <Text style={styles.settingLabel}>Edit Profile</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => Alert.alert('Coming Soon', 'Password change will be available soon.')}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>🔒</Text>
              <Text style={styles.settingLabel}>Change Password</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate('PayoutSettings')}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>💳</Text>
              <Text style={styles.settingLabel}>Payment Methods</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>🔔</Text>
              <View>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingHint}>Receive alerts on your device</Text>
              </View>
            </View>
            <Switch
              value={settings.pushNotifications}
              onValueChange={(value) => updateSetting('pushNotifications', value)}
              trackColor={{ false: '#D1D5DB', true: '#C7D2FE' }}
              thumbColor={settings.pushNotifications ? '#6366F1' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>📧</Text>
              <View>
                <Text style={styles.settingLabel}>Email Notifications</Text>
                <Text style={styles.settingHint}>Booking updates via email</Text>
              </View>
            </View>
            <Switch
              value={settings.emailNotifications}
              onValueChange={(value) => updateSetting('emailNotifications', value)}
              trackColor={{ false: '#D1D5DB', true: '#C7D2FE' }}
              thumbColor={settings.emailNotifications ? '#6366F1' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>📱</Text>
              <View>
                <Text style={styles.settingLabel}>SMS Notifications</Text>
                <Text style={styles.settingHint}>Important alerts via text</Text>
              </View>
            </View>
            <Switch
              value={settings.smsNotifications}
              onValueChange={(value) => updateSetting('smsNotifications', value)}
              trackColor={{ false: '#D1D5DB', true: '#C7D2FE' }}
              thumbColor={settings.smsNotifications ? '#6366F1' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>⏰</Text>
              <View>
                <Text style={styles.settingLabel}>Booking Reminders</Text>
                <Text style={styles.settingHint}>Upcoming trip reminders</Text>
              </View>
            </View>
            <Switch
              value={settings.bookingReminders}
              onValueChange={(value) => updateSetting('bookingReminders', value)}
              trackColor={{ false: '#D1D5DB', true: '#C7D2FE' }}
              thumbColor={settings.bookingReminders ? '#6366F1' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>💬</Text>
              <View>
                <Text style={styles.settingLabel}>Message Alerts</Text>
                <Text style={styles.settingHint}>New message notifications</Text>
              </View>
            </View>
            <Switch
              value={settings.messageAlerts}
              onValueChange={(value) => updateSetting('messageAlerts', value)}
              trackColor={{ false: '#D1D5DB', true: '#C7D2FE' }}
              thumbColor={settings.messageAlerts ? '#6366F1' : '#9CA3AF'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>📢</Text>
              <View>
                <Text style={styles.settingLabel}>Marketing Emails</Text>
                <Text style={styles.settingHint}>Promotions and news</Text>
              </View>
            </View>
            <Switch
              value={settings.marketingEmails}
              onValueChange={(value) => updateSetting('marketingEmails', value)}
              trackColor={{ false: '#D1D5DB', true: '#C7D2FE' }}
              thumbColor={settings.marketingEmails ? '#6366F1' : '#9CA3AF'}
            />
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => {
              Alert.alert(
                'Select Currency',
                'Choose your preferred currency',
                [
                  {
                    text: '🇺🇸 USD ($)',
                    onPress: () => updateSetting('currency', 'USD'),
                  },
                  {
                    text: '🇪🇹 ETB (Birr)',
                    onPress: () => updateSetting('currency', 'ETB'),
                  },
                  { text: 'Cancel', style: 'cancel' },
                ]
              );
            }}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>💱</Text>
              <Text style={styles.settingLabel}>Currency</Text>
            </View>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>
                {settings.currency === 'USD' ? '🇺🇸 USD' : '🇪🇹 ETB'}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => {
              Alert.alert(
                'Select Language',
                'Choose your preferred language',
                [
                  ...LANGUAGES.map((lang) => ({
                    text: lang.label,
                    onPress: () => updateSetting('language', lang.code),
                  })),
                  { text: 'Cancel', style: 'cancel' },
                ]
              );
            }}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>🌍</Text>
              <Text style={styles.settingLabel}>Language</Text>
            </View>
            <View style={styles.settingValue}>
              <Text style={styles.settingValueText}>
                {LANGUAGES.find((l) => l.code === settings.language)?.label || 'English'}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate('HelpCenter')}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>❓</Text>
              <Text style={styles.settingLabel}>Help Center</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate('Contact')}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>📞</Text>
              <Text style={styles.settingLabel}>Contact Support</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => openLink('mailto:feedback@enatbet.app')}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>💡</Text>
              <Text style={styles.settingLabel}>Send Feedback</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => openLink('https://apps.apple.com/app/enatbet')}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>⭐</Text>
              <Text style={styles.settingLabel}>Rate the App</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate('TermsOfService')}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>📄</Text>
              <Text style={styles.settingLabel}>Terms of Service</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>🔐</Text>
              <Text style={styles.settingLabel}>Privacy Policy</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate('CancellationPolicy')}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>↩️</Text>
              <Text style={styles.settingLabel}>Cancellation Policy</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Data & Storage Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Storage</Text>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={handleClearCache}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>🗑️</Text>
              <Text style={styles.settingLabel}>Clear Cache</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate('About')}
          >
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>ℹ️</Text>
              <Text style={styles.settingLabel}>About Enatbet</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>📱</Text>
              <Text style={styles.settingLabel}>App Version</Text>
            </View>
            <Text style={styles.versionText}>1.0.0 (1)</Text>
          </View>
        </View>

        {/* Sign Out */}
        {user && (
          <View style={styles.section}>
            <Button
              mode="outlined"
              onPress={handleSignOut}
              style={styles.signOutButton}
              textColor="#DC2626"
            >
              Sign Out
            </Button>
          </View>
        )}

        {/* Danger Zone */}
        {user && (
          <View style={styles.dangerSection}>
            <Text style={styles.dangerTitle}>Danger Zone</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteAccount}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#DC2626" />
              ) : (
                <>
                  <Text style={styles.deleteIcon}>⚠️</Text>
                  <Text style={styles.deleteText}>Delete Account</Text>
                </>
              )}
            </TouchableOpacity>
            <Text style={styles.deleteHint}>
              This will permanently delete your account and all associated data.
            </Text>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Section
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingVertical: 12,
    paddingTop: 16,
  },
  // Setting Row
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 14,
    width: 28,
    textAlign: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#111827',
  },
  settingHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueText: {
    fontSize: 15,
    color: '#6B7280',
    marginRight: 4,
  },
  chevron: {
    fontSize: 22,
    color: '#9CA3AF',
  },
  versionText: {
    fontSize: 15,
    color: '#6B7280',
  },
  // Sign Out Button
  signOutButton: {
    marginVertical: 16,
    borderColor: '#DC2626',
  },
  // Danger Zone
  dangerSection: {
    backgroundColor: '#FEF2F2',
    marginTop: 24,
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  deleteIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  deleteHint: {
    fontSize: 12,
    color: '#991B1B',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 16,
  },
  bottomSpacing: {
    height: 40,
  },
});
