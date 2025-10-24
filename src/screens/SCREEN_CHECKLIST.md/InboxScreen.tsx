// src/screens/messaging/InboxScreen.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Badge, Searchbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InboxStackParamList } from '../../navigation/MainNavigator';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { Conversation } from '../../types/domain';
import { formatRelativeTime } from '../../utils/format';

type InboxScreenNavigationProp = StackNavigationProp<InboxStackParamList, 'InboxMain'>;

export default function InboxScreen() {
  const navigation = useNavigation<InboxScreenNavigationProp>();
  const { user } = useAuthStore();
  const {
    conversations,
    isLoadingConversations,
    fetchConversations,
    subscribeToConversations,
    stopAllListening,
  } = useChatStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);

  // Initialize conversations and subscribe to real-time updates
  useEffect(() => {
    if (!user?.uid) return;

    // Fetch initial conversations
    fetchConversations(user.uid);

    // Subscribe to real-time updates
    subscribeToConversations(user.uid);

    // Cleanup on unmount
    return () => {
      stopAllListening();
    };
  }, [user?.uid]);

  // Filter conversations based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredConversations(conversations);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = conversations.filter(conv => {
      // Search in participant names
      const participantMatch = conv.participants?.some(
        participant =>
          participant.firstName.toLowerCase().includes(query) ||
          participant.lastName.toLowerCase().includes(query),
      );

      // Search in last message
      const messageMatch = conv.lastMessage?.text.toLowerCase().includes(query);

      return participantMatch || messageMatch;
    });

    setFilteredConversations(filtered);
  }, [searchQuery, conversations]);

  const handleConversationPress = (conversation: Conversation) => {
    if (!user?.uid) return;

    // Get the other user's ID
    const otherUserId = conversation.participantIds.find(id => id !== user.uid);

    if (!otherUserId) return;

    navigation.navigate('Chat', {
      conversationId: conversation.id,
      otherUserId,
    });
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    if (!user?.uid) return null;

    const otherUser = item.participants?.find(p => p.uid !== user.uid);
    const unreadCount = item.unreadCount?.[user.uid] || 0;
    const hasUnread = unreadCount > 0;

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleConversationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {otherUser?.photoURL ? (
            <Image source={{ uri: otherUser.photoURL }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>
                {otherUser?.firstName?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
          {hasUnread && <View style={styles.onlineIndicator} />}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.userName, hasUnread && styles.unreadText]}>
              {otherUser?.firstName} {otherUser?.lastName}
            </Text>
            {item.lastMessage && (
              <Text style={styles.timestamp}>{formatRelativeTime(item.lastMessage.createdAt)}</Text>
            )}
          </View>

          <View style={styles.messagePreview}>
            <Text style={[styles.lastMessage, hasUnread && styles.unreadText]} numberOfLines={1}>
              {item.lastMessage?.text || 'No messages yet'}
            </Text>
            {hasUnread && (
              <Badge size={20} style={styles.badge}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="message-text-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No Messages</Text>
      <Text style={styles.emptyText}>
        Start a conversation by booking a property or messaging a host
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Messages</Text>
      <Searchbar
        placeholder="Search conversations"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={styles.searchInput}
        icon="magnify"
        clearIcon="close"
      />
    </View>
  );

  if (isLoadingConversations && conversations.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF385C" />
          <Text style={styles.loadingText}>Loading conversations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {renderHeader()}
      <FlatList
        data={filteredConversations}
        renderItem={renderConversationItem}
        keyExtractor={item => item.id}
        contentContainerStyle={filteredConversations.length === 0 ? styles.emptyList : styles.list}
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  searchInput: {
    fontSize: 16,
  },
  list: {
    paddingVertical: 8,
  },
  emptyList: {
    flexGrow: 1,
  },
  conversationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    backgroundColor: '#FF385C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4caf50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  conversationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  unreadText: {
    fontWeight: '700',
    color: '#222',
  },
  badge: {
    backgroundColor: '#FF385C',
    color: '#fff',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 84,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
