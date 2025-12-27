import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import { Text, Avatar, Badge, Searchbar } from "react-native-paper";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useAuth } from "../../contexts/AuthContext";

interface Conversation {
  id: string;
  participants: string[];
  participantNames: { [key: string]: string };
  participantPhotos: { [key: string]: string };
  lastMessage: string;
  lastMessageTime: Timestamp;
  unreadCount: { [key: string]: number };
  listingId: string;
  listingTitle: string;
  listingImage: string;
  bookingId?: string;
  bookingStatus?: string;
}

export default function MessagesScreen() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid),
      orderBy("lastMessageTime", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convos: Conversation[] = [];
      snapshot.forEach((doc) => {
        convos.push({ id: doc.id, ...doc.data() } as Conversation);
      });
      setConversations(convos);
      setIsLoading(false);
      setRefreshing(false);
    });

    return unsubscribe;
  }, [user]);

  const getOtherParticipant = (conversation: Conversation) => {
    if (!user) return { name: "Unknown", photo: null };
    const otherId = conversation.participants.find((p) => p !== user.uid);
    return {
      name: otherId ? conversation.participantNames?.[otherId] || "User" : "User",
      photo: otherId ? conversation.participantPhotos?.[otherId] : null,
    };
  };

  const formatTime = (timestamp: Timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const getUnreadCount = (conversation: Conversation) => {
    if (!user) return 0;
    return conversation.unreadCount?.[user.uid] || 0;
  };

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const other = getOtherParticipant(conv);
    return (
      other.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.listingTitle?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const renderConversation = ({ item }: { item: Conversation }) => {
    const other = getOtherParticipant(item);
    const unread = getUnreadCount(item);

    return (
      <TouchableOpacity
        style={[styles.conversationItem, unread > 0 && styles.unreadItem]}
        onPress={() => router.push(`/conversation/${item.id}`)}
      >
        <View style={styles.avatarContainer}>
          {other.photo ? (
            <Image source={{ uri: other.photo }} style={styles.avatar} />
          ) : (
            <Avatar.Text
              size={56}
              label={other.name.slice(0, 2).toUpperCase()}
              style={styles.avatarFallback}
            />
          )}
          {item.listingImage && (
            <Image source={{ uri: item.listingImage }} style={styles.listingThumb} />
          )}
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.name, unread > 0 && styles.unreadText]} numberOfLines={1}>
              {other.name}
            </Text>
            <Text style={styles.time}>{formatTime(item.lastMessageTime)}</Text>
          </View>
          
          {item.listingTitle && (
            <Text style={styles.listingTitle} numberOfLines={1}>
              {item.listingTitle}
            </Text>
          )}
          
          <View style={styles.messageRow}>
            <Text
              style={[styles.lastMessage, unread > 0 && styles.unreadText]}
              numberOfLines={1}
            >
              {item.lastMessage || "No messages yet"}
            </Text>
            {unread > 0 && (
              <Badge style={styles.badge}>{unread > 99 ? "99+" : unread}</Badge>
            )}
          </View>

          {item.bookingStatus && (
            <View style={[styles.statusBadge, styles[`status_${item.bookingStatus}`]]}>
              <Text style={styles.statusText}>
                {item.bookingStatus.charAt(0).toUpperCase() + item.bookingStatus.slice(1)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>Sign in to view messages</Text>
          <Text style={styles.emptySubtitle}>
            Connect with hosts and guests about your bookings
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <Searchbar
        placeholder="Search conversations"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        inputStyle={styles.searchInput}
      />

      {isLoading ? (
        <View style={styles.emptyContainer}>
          <Text>Loading conversations...</Text>
        </View>
      ) : filteredConversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySubtitle}>
            When you book a property or receive a booking, your conversations will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredConversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true)} />
          }
        />
      )}
    </SafeAreaView>
  );
}

const Ionicons = require("@expo/vector-icons").Ionicons;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1a1a1a",
  },
  searchBar: {
    marginHorizontal: 16,
    marginVertical: 12,
    elevation: 0,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
  },
  searchInput: {
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  conversationItem: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  unreadItem: {
    backgroundColor: "#f8f9ff",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarFallback: {
    backgroundColor: "#667eea",
  },
  listingThumb: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  conversationContent: {
    flex: 1,
    justifyContent: "center",
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 13,
    color: "#999",
  },
  listingTitle: {
    fontSize: 13,
    color: "#667eea",
    marginBottom: 4,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
    flex: 1,
    marginRight: 8,
  },
  unreadText: {
    fontWeight: "700",
    color: "#1a1a1a",
  },
  badge: {
    backgroundColor: "#667eea",
    fontSize: 11,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },
  status_confirmed: {
    backgroundColor: "#e8f5e9",
  },
  status_pending: {
    backgroundColor: "#fff3e0",
  },
  status_cancelled: {
    backgroundColor: "#ffebee",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    color: "#1a1a1a",
  },
  emptySubtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  signInButton: {
    marginTop: 24,
    backgroundColor: "#667eea",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  signInButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
