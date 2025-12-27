import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { Text, Avatar } from "react-native-paper";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "../../lib/firebase";

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: Timestamp;
  read: boolean;
}

interface ConversationData {
  participants: string[];
  participantNames: { [key: string]: string };
  participantPhotos: { [key: string]: string };
  listingId?: string;
  listingTitle?: string;
  listingImage?: string;
  bookingId?: string;
}

export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const functions = getFunctions();

  useEffect(() => {
    if (!id || !user) return;

    // Load conversation metadata
    const loadConversation = async () => {
      const convDoc = await getDoc(doc(db, "conversations", id));
      if (convDoc.exists()) {
        setConversation(convDoc.data() as ConversationData);
      }
    };
    loadConversation();

    // Subscribe to messages
    const messagesQuery = query(
      collection(db, "conversations", id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgs);

      // Mark as read
      const markReadFn = httpsCallable(functions, "markConversationRead");
      markReadFn({ conversationId: id, userId: user.uid }).catch(console.error);
    });

    return unsubscribe;
  }, [id, user]);

  const getOtherParticipant = () => {
    if (!conversation || !user) return { name: "User", photo: null };
    const otherId = conversation.participants.find((p) => p !== user.uid);
    return {
      name: otherId ? conversation.participantNames?.[otherId] || "User" : "User",
      photo: otherId ? conversation.participantPhotos?.[otherId] : null,
    };
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !user || !id) return;

    setIsSending(true);
    const messageText = newMessage.trim();
    setNewMessage("");

    try {
      const sendMessageFn = httpsCallable(functions, "sendMessage");
      await sendMessageFn({
        conversationId: id,
        senderId: user.uid,
        text: messageText,
      });
    } catch (error) {
      console.error("Send message error:", error);
      setNewMessage(messageText); // Restore message on error
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (timestamp: Timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
  };

  const shouldShowDate = (index: number) => {
    if (index === 0) return true;
    const currentDate = messages[index].createdAt?.toDate().toDateString();
    const prevDate = messages[index - 1].createdAt?.toDate().toDateString();
    return currentDate !== prevDate;
  };

  const other = getOtherParticipant();

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMe = item.senderId === user?.uid;

    return (
      <>
        {shouldShowDate(index) && (
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          </View>
        )}
        <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
          {!isMe && (
            other.photo ? (
              <Image source={{ uri: other.photo }} style={styles.messageAvatar} />
            ) : (
              <Avatar.Text size={32} label={other.name.slice(0, 1)} style={styles.avatarFallback} />
            )
          )}
          <View style={[styles.messageBubble, isMe ? styles.messageBubbleMe : styles.messageBubbleOther]}>
            <Text style={[styles.messageText, isMe && styles.messageTextMe]}>
              {item.text}
            </Text>
            <Text style={[styles.messageTime, isMe && styles.messageTimeMe]}>
              {formatTime(item.createdAt)}
            </Text>
          </View>
        </View>
      </>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: other.name,
          headerBackTitle: "Messages",
          headerRight: () => (
            conversation?.listingId ? (
              <TouchableOpacity
                onPress={() => router.push(`/property/${conversation.listingId}`)}
              >
                <Ionicons name="home-outline" size={24} color="#667eea" />
              </TouchableOpacity>
            ) : null
          ),
        }}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        {/* Listing Header */}
        {conversation?.listingTitle && (
          <TouchableOpacity
            style={styles.listingHeader}
            onPress={() => conversation.listingId && router.push(`/property/${conversation.listingId}`)}
          >
            {conversation.listingImage && (
              <Image source={{ uri: conversation.listingImage }} style={styles.listingImage} />
            )}
            <View style={styles.listingInfo}>
              <Text style={styles.listingTitle} numberOfLines={1}>
                {conversation.listingTitle}
              </Text>
              <Text style={styles.listingSubtitle}>View property details</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        )}

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          onLayout={() => flatListRef.current?.scrollToEnd()}
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!newMessage.trim() || isSending}
          >
            <Ionicons
              name="send"
              size={20}
              color={newMessage.trim() ? "#fff" : "#999"}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  listingHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  listingImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  listingInfo: {
    flex: 1,
  },
  listingTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  listingSubtitle: {
    fontSize: 13,
    color: "#667eea",
    marginTop: 2,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  dateContainer: {
    alignItems: "center",
    marginVertical: 16,
  },
  dateText: {
    fontSize: 13,
    color: "#999",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 8,
    alignItems: "flex-end",
  },
  messageRowMe: {
    justifyContent: "flex-end",
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  avatarFallback: {
    backgroundColor: "#667eea",
    marginRight: 8,
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  messageBubbleOther: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
  },
  messageBubbleMe: {
    backgroundColor: "#667eea",
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: "#1a1a1a",
    lineHeight: 22,
  },
  messageTextMe: {
    color: "#fff",
  },
  messageTime: {
    fontSize: 11,
    color: "#999",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  messageTimeMe: {
    color: "rgba(255,255,255,0.7)",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  input: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingRight: 12,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#f0f0f0",
  },
});
