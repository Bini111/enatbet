import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useAuthStore } from "../stores/authStore";
import { useMessageStore } from "../stores/messageStore";

export const MessagesScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { conversations, isLoading, subscribeToConversations, unsubscribeAll } =
    useMessageStore();

  useEffect(() => {
    if (user) {
      subscribeToConversations(user.id);
    }

    return () => {
      unsubscribeAll();
    };
  }, [user]);

  const renderConversationItem = ({ item }: any) => {
    const unreadCount = user ? item.unreadCount[user.id] || 0 : 0;

    return (
      <TouchableOpacity
        style={styles.conversationCard}
        onPress={() => navigation.navigate("Chat", { conversationId: item.id })}
      >
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.conversationTitle}>Conversation</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>

          {item.lastMessage && (
            <>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {item.lastMessage.content}
              </Text>
              <Text style={styles.timestamp}>
                {new Date(item.lastMessage.createdAt).toLocaleDateString()}
              </Text>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF385C" />
      </View>
    );
  }

  if (conversations.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No messages yet</Text>
        <Text style={styles.emptySubtext}>
          Start a conversation with a host when you find a property you like
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  list: {
    padding: 16,
  },
  conversationCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  badge: {
    backgroundColor: "#FF385C",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});
