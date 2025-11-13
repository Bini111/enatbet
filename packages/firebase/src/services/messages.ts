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
  serverTimestamp,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type {
  Message,
  Conversation,
  CreateMessageInput,
  CreateConversationInput,
} from '@enatbet/shared';

/**
 * Message Service
 * Handles real-time messaging between guests and hosts
 */

// Convert Firestore document to Message
const convertToMessage = (docId: string, data: any): Message => {
  return {
    id: docId,
    conversationId: data.conversationId,
    senderId: data.senderId,
    content: data.content,
    type: data.type || 'text',
    read: data.read || false,
    metadata: data.metadata,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

// Convert Firestore document to Conversation
const convertToConversation = (docId: string, data: any): Conversation => {
  return {
    id: docId,
    participants: data.participants,
    listingId: data.listingId,
    lastMessage: data.lastMessage ? {
      content: data.lastMessage.content,
      senderId: data.lastMessage.senderId,
      createdAt: data.lastMessage.createdAt?.toDate() || new Date(),
    } : undefined,
    unreadCount: data.unreadCount || {},
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
};

// Create or get existing conversation
export const createConversation = async (
  input: CreateConversationInput
): Promise<string> => {
  try {
    // Check if conversation already exists
    const existingQuery = query(
      collection(db, 'conversations'),
      where('participants', '==', input.participants),
      where('listingId', '==', input.listingId),
      limit(1)
    );

    const existing = await getDocs(existingQuery);
    if (!existing.empty) {
      return existing.docs[0].id;
    }

    // Create new conversation
    const conversationData = {
      participants: input.participants,
      listingId: input.listingId,
      unreadCount: {
        [input.participants[0]]: 0,
        [input.participants[1]]: 0,
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'conversations'), conversationData);

    // Send initial message if provided
    if (input.initialMessage) {
      await sendMessage(docRef.id, input.participants[0], input.initialMessage);
    }

    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create conversation');
  }
};

// Send message
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  content: string,
  type: 'text' | 'booking_request' | 'system' = 'text',
  metadata?: any
): Promise<string> => {
  try {
    // Get conversation
    const conversationDoc = await getDoc(doc(db, 'conversations', conversationId));
    if (!conversationDoc.exists()) {
      throw new Error('Conversation not found');
    }

    const conversation = conversationDoc.data();

    // Create message in subcollection
    const messageData = {
      conversationId,
      senderId,
      content,
      type,
      read: false,
      metadata,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const messageRef = await addDoc(
      collection(db, 'conversations', conversationId, 'messages'),
      messageData
    );

    // Update conversation with last message and unread count
    const batch = writeBatch(db);
    const conversationRef = doc(db, 'conversations', conversationId);

    const recipientId = conversation.participants.find((p: string) => p !== senderId);
    const currentUnread = conversation.unreadCount?.[recipientId] || 0;

    batch.update(conversationRef, {
      lastMessage: {
        content,
        senderId,
        createdAt: serverTimestamp(),
      },
      [`unreadCount.${recipientId}`]: currentUnread + 1,
      updatedAt: serverTimestamp(),
    });

    await batch.commit();

    return messageRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to send message');
  }
};

// Get conversation by ID
export const getConversation = async (
  conversationId: string
): Promise<Conversation | null> => {
  try {
    const docSnap = await getDoc(doc(db, 'conversations', conversationId));
    if (!docSnap.exists()) return null;
    return convertToConversation(docSnap.id, docSnap.data());
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get conversation');
  }
};

// Get user conversations
export const getUserConversations = async (
  userId: string
): Promise<Conversation[]> => {
  try {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => convertToConversation(doc.id, doc.data()));
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get conversations');
  }
};

// Get messages in conversation
export const getMessages = async (
  conversationId: string,
  maxResults: number = 50
): Promise<Message[]> => {
  try {
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(maxResults)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => convertToMessage(doc.id, doc.data()));
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get messages');
  }
};

// Listen to conversation messages in real-time
export const listenToMessages = (
  conversationId: string,
  callback: (messages: Message[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc =>
      convertToMessage(doc.id, doc.data())
    );
    callback(messages);
  });
};

// Listen to user conversations in real-time
export const listenToConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map(doc =>
      convertToConversation(doc.id, doc.data())
    );
    callback(conversations);
  });
};

// Mark messages as read
export const markAsRead = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  try {
    // Get all unread messages
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      where('read', '==', false),
      where('senderId', '!=', userId)
    );

    const snapshot = await getDocs(q);

    // Batch update messages
    const batch = writeBatch(db);

    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { read: true });
    });

    // Reset unread count
    batch.update(doc(db, 'conversations', conversationId), {
      [`unreadCount.${userId}`]: 0,
    });

    await batch.commit();
  } catch (error: any) {
    throw new Error(error.message || 'Failed to mark as read');
  }
};

// Get unread message count for user
export const getUnreadCount = async (userId: string): Promise<number> => {
  try {
    const conversations = await getUserConversations(userId);
    return conversations.reduce((total, conv) => {
      return total + (conv.unreadCount[userId] || 0);
    }, 0);
  } catch (error: any) {
    return 0;
  }
};

// Find conversation between two users for a listing
export const findConversation = async (
  userId1: string,
  userId2: string,
  listingId: string
): Promise<string | null> => {
  try {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'in', [
        [userId1, userId2],
        [userId2, userId1],
      ]),
      where('listingId', '==', listingId),
      limit(1)
    );

    const snapshot = await getDocs(q);
    return snapshot.empty ? null : snapshot.docs[0].id;
  } catch (error: any) {
    return null;
  }
};
