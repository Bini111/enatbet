import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  increment,
  Timestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Conversation, Message, MessageCreate } from '@enatebet/shared';

/**
 * Messaging Service
 * Handles real-time messaging between guests and hosts
 */

// Convert Firestore document to Conversation
const convertToConversation = (docId: string, data: any): Conversation => {
  return {
    id: docId,
    participants: data.participants || [],
    listingId: data.listingId,
    bookingId: data.bookingId,
    lastMessage: data.lastMessage ? convertMessageData(data.lastMessage) : undefined,
    unreadCount: data.unreadCount || {},
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

// Convert message data
const convertMessageData = (data: any): Message => {
  return {
    id: data.id,
    conversationId: data.conversationId,
    senderId: data.senderId,
    text: data.text,
    type: data.type || 'text',
    metadata: data.metadata,
    readBy: data.readBy || [],
    createdAt: data.createdAt?.toDate() || new Date(),
  };
};

// Convert Firestore document to Message
const convertToMessage = (docId: string, data: any): Message => {
  return {
    id: docId,
    conversationId: data.conversationId,
    senderId: data.senderId,
    text: data.text,
    type: data.type || 'text',
    metadata: data.metadata,
    readBy: data.readBy || [],
    createdAt: data.createdAt?.toDate() || new Date(),
  };
};

/**
 * Get or create conversation between two users
 */
export const getOrCreateConversation = async (
  userId1: string,
  userId2: string,
  listingId?: string,
  bookingId?: string
): Promise<string> => {
  try {
    // Check if conversation already exists
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId1)
    );

    const snapshot = await getDocs(q);
    const existingConversation = snapshot.docs.find((doc) => {
      const participants = doc.data().participants;
      return participants.includes(userId2);
    });

    if (existingConversation) {
      return existingConversation.id;
    }

    // Create new conversation
    const conversationData = {
      participants: [userId1, userId2],
      listingId,
      bookingId,
      unreadCount: {
        [userId1]: 0,
        [userId2]: 0,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'conversations'), conversationData);
    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get or create conversation');
  }
};

/**
 * Send a message
 */
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  messageData: MessageCreate
): Promise<string> => {
  try {
    // Get conversation to find recipient
    const conversationDoc = await getDoc(doc(db, 'conversations', conversationId));
    if (!conversationDoc.exists()) {
      throw new Error('Conversation not found');
    }

    const conversation = conversationDoc.data();
    const recipientId = conversation.participants.find((p: string) => p !== senderId);

    // Create message
    const messageDoc = {
      conversationId,
      senderId,
      text: messageData.text,
      type: messageData.type || 'text',
      metadata: messageData.metadata,
      readBy: [senderId],
      createdAt: serverTimestamp(),
    };

    const messageRef = await addDoc(collection(db, 'messages'), messageDoc);

    // Update conversation with last message and increment unread count
    await updateDoc(doc(db, 'conversations', conversationId), {
      lastMessage: {
        id: messageRef.id,
        text: messageData.text,
        senderId,
        createdAt: serverTimestamp(),
      },
      [`unreadCount.${recipientId}`]: increment(1),
      updatedAt: serverTimestamp(),
    });

    return messageRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to send message');
  }
};

/**
 * Get conversation by ID
 */
export const getConversation = async (conversationId: string): Promise<Conversation | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'conversations', conversationId));
    if (!docSnap.exists()) return null;
    return convertToConversation(docSnap.id, docSnap.data());
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get conversation');
  }
};

/**
 * Get user conversations
 */
export const getUserConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => convertToConversation(doc.id, doc.data()));
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get conversations');
  }
};

/**
 * Get conversation messages
 */
export const getConversationMessages = async (
  conversationId: string,
  limitCount: number = 50
): Promise<Message[]> => {
  try {
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => convertToMessage(doc.id, doc.data())).reverse();
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get messages');
  }
};

/**
 * Mark conversation as read
 */
export const markConversationAsRead = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'conversations', conversationId), {
      [`unreadCount.${userId}`]: 0,
    });

    // Mark all messages as read by this user
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId)
    );

    const snapshot = await getDocs(q);
    const batch = snapshot.docs.map((doc) => {
      const message = doc.data();
      if (!message.readBy.includes(userId)) {
        return updateDoc(doc.ref, {
          readBy: arrayUnion(userId),
        });
      }
      return Promise.resolve();
    });

    await Promise.all(batch);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to mark as read');
  }
};

/**
 * Listen to conversation messages in real-time
 */
export const listenToConversationMessages = (
  conversationId: string,
  callback: (messages: Message[]) => void,
  limitCount: number = 50
): Unsubscribe => {
  const q = query(
    collection(db, 'messages'),
    where('conversationId', '==', conversationId),
    orderBy('createdAt', 'asc'),
    limit(limitCount)
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => convertToMessage(doc.id, doc.data()));
    callback(messages);
  });
};

/**
 * Listen to user conversations in real-time
 */
export const listenToUserConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map((doc) => convertToConversation(doc.id, doc.data()));
    callback(conversations);
  });
};

/**
 * Get unread message count for user
 */
export const getUnreadMessageCount = async (userId: string): Promise<number> => {
  try {
    const conversations = await getUserConversations(userId);
    return conversations.reduce((total, conv) => {
      return total + (conv.unreadCount[userId] || 0);
    }, 0);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get unread count');
  }
};

/**
 * Delete conversation (soft delete - mark as deleted)
 */
export const deleteConversation = async (conversationId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'conversations', conversationId), {
      status: 'deleted',
      updatedAt: serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete conversation');
  }
};
