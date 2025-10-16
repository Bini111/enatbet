// src/services/messaging.service.ts
import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter as firestoreStartAfter,
  Timestamp,
  onSnapshot,
  QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Conversation, Message } from '../types/domain';

/**
 * Generate canonical conversation key from two user IDs
 * Always returns the same key regardless of order
 */
const getConversationKey = (userId1: string, userId2: string): string => {
  const sorted = [userId1, userId2].sort();
  return `${sorted[0]}_${sorted[1]}`;
};

class MessagingService {
  private conversationsRef = collection(db, 'conversations');

  /**
   * Get or create a conversation between two users
   * Uses canonical key to prevent duplicates
   */
  async getOrCreateConversation(
    currentUserId: string,
    otherUserId: string,
    listingId?: string
  ): Promise<Conversation> {
    try {
      const conversationKey = getConversationKey(currentUserId, otherUserId);

      // Check if conversation exists by key
      const q = query(
        this.conversationsRef,
        where('conversationKey', '==', conversationKey)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Conversation;
      }

      // Create new conversation with canonical key
      const conversationData = {
        conversationKey,
        participantIds: [currentUserId, otherUserId],
        listingId: listingId || null,
        unreadCount: {
          [currentUserId]: 0,
          [otherUserId]: 0,
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const docRef = await addDoc(this.conversationsRef, conversationData);
      
      return {
        id: docRef.id,
        ...conversationData,
        participants: [],
      };
    } catch (error) {
      console.error('Error getting/creating conversation:', error);
      throw error;
    }
  }

  /**
   * Get all conversations for a user
   */
  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      const q = query(
        this.conversationsRef,
        where('participantIds', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      );

      const snapshot = await getDocs(q);
      const conversations: Conversation[] = [];

      snapshot.forEach((doc) => {
        conversations.push({
          id: doc.id,
          ...doc.data(),
        } as Conversation);
      });

      return conversations;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  }

  /**
   * Send a message in a conversation
   */
  async sendMessage(conversationId: string, senderId: string, text: string): Promise<Message> {
    try {
      const messagesRef = collection(db, `conversations/${conversationId}/messages`);
      
      const messageData = {
        senderId,
        text,
        read: false,
        createdAt: Timestamp.now(),
      };

      const docRef = await addDoc(messagesRef, messageData);

      // Update conversation's updatedAt and unread count
      const conversationRef = doc(db, 'conversations', conversationId);
      const conversationSnap = await getDoc(conversationRef);
      
      if (conversationSnap.exists()) {
        const conversation = conversationSnap.data();
        const otherUserId = conversation.participantIds.find((id: string) => id !== senderId);
        
        await updateDoc(conversationRef, {
          updatedAt: Timestamp.now(),
          [`unreadCount.${otherUserId}`]: (conversation.unreadCount[otherUserId] || 0) + 1,
        });
      }

      return {
        id: docRef.id,
        conversationId,
        senderId,
        text,
        read: false,
        createdAt: new Date(),
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get messages for a conversation with pagination
   */
  async getMessages(
    conversationId: string,
    limitCount: number = 50,
    cursor?: QueryDocumentSnapshot
  ): Promise<{ messages: Message[]; nextCursor?: QueryDocumentSnapshot }> {
    try {
      const messagesRef = collection(db, `conversations/${conversationId}/messages`);
      
      let q = query(messagesRef, orderBy('createdAt', 'desc'), limit(limitCount));
      
      if (cursor) {
        q = query(q, firestoreStartAfter(cursor));
      }

      const snapshot = await getDocs(q);
      const messages: Message[] = [];

      snapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          conversationId,
          ...doc.data(),
        } as Message);
      });

      const nextCursor = snapshot.docs[snapshot.docs.length - 1];

      return {
        messages: messages.reverse(), // Return in chronological order
        nextCursor: snapshot.docs.length === limitCount ? nextCursor : undefined,
      };
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      const conversationRef = doc(db, 'conversations', conversationId);
      
      await updateDoc(conversationRef, {
        [`unreadCount.${userId}`]: 0,
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time messages
   */
  subscribeToMessages(
    conversationId: string,
    callback: (messages: Message[]) => void
  ): () => void {
    const messagesRef = collection(db, `conversations/${conversationId}/messages`);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages: Message[] = [];
      snapshot.forEach((doc) => {
        messages.push({
          id: doc.id,
          conversationId,
          ...doc.data(),
        } as Message);
      });
      callback(messages);
    });

    return unsubscribe;
  }

  /**
   * Subscribe to real-time conversations
   */
  subscribeToConversations(
    userId: string,
    callback: (conversations: Conversation[]) => void
  ): () => void {
    const q = query(
      this.conversationsRef,
      where('participantIds', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversations: Conversation[] = [];
      snapshot.forEach((doc) => {
        conversations.push({
          id: doc.id,
          ...doc.data(),
        } as Conversation);
      });
      callback(conversations);
    });

    return unsubscribe;
  }
}

export const messagingService = new MessagingService();