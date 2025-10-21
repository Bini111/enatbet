// src/store/chatStore.ts
import { create } from 'zustand';
import { Conversation, Message, User } from '../types/domain';
import { messagingService } from '../services/messaging.service';

interface ChatState {
  // Conversations
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  isLoadingConversations: boolean;

  // Messages with pagination
  messages: { [conversationId: string]: Message[] };
  messageCursors: { [conversationId: string]: any };
  isLoadingMessages: boolean;

  // Subscriptions management
  conversationsUnsubscribe: (() => void) | null;
  messageUnsubscribers: { [conversationId: string]: () => void };

  // Actions
  fetchConversations: (userId: string) => Promise<void>;
  selectConversation: (conversation: Conversation) => void;
  fetchMessages: (conversationId: string, loadMore?: boolean) => Promise<void>;
  sendMessage: (conversationId: string, text: string, senderId: string) => Promise<void>;
  markAsRead: (conversationId: string, userId: string) => Promise<void>;
  getOrCreateConversation: (currentUserId: string, otherUserId: string, listingId?: string) => Promise<Conversation>;
  
  // Subscription management
  subscribeToConversations: (userId: string) => void;
  subscribeToMessages: (conversationId: string) => void;
  unsubscribeFromMessages: (conversationId: string) => void;
  stopAllListening: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  selectedConversation: null,
  isLoadingConversations: false,
  messages: {},
  messageCursors: {},
  isLoadingMessages: false,
  conversationsUnsubscribe: null,
  messageUnsubscribers: {},

  fetchConversations: async (userId: string) => {
    set({ isLoadingConversations: true });
    try {
      const conversations = await messagingService.getUserConversations(userId);
      set({ conversations, isLoadingConversations: false });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      set({ isLoadingConversations: false });
    }
  },

  selectConversation: (conversation: Conversation) => {
    set({ selectedConversation: conversation });
  },

  fetchMessages: async (conversationId: string, loadMore: boolean = false) => {
    set({ isLoadingMessages: true });
    try {
      const state = get();
      const cursor = loadMore ? state.messageCursors[conversationId] : undefined;
      
      const { messages, nextCursor } = await messagingService.getMessages(
        conversationId,
        50,
        cursor
      );

      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: loadMore
            ? [...messages, ...(state.messages[conversationId] || [])]
            : messages,
        },
        messageCursors: {
          ...state.messageCursors,
          [conversationId]: nextCursor,
        },
        isLoadingMessages: false,
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      set({ isLoadingMessages: false });
    }
  },

  sendMessage: async (conversationId: string, text: string, senderId: string) => {
    try {
      // Optimistic update
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId,
        senderId,
        text,
        read: false,
        createdAt: new Date(),
      };

      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: [...(state.messages[conversationId] || []), tempMessage],
        },
      }));

      // Send to server
      const message = await messagingService.sendMessage(conversationId, senderId, text);

      // Replace temp message with real one
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: state.messages[conversationId].map((m) =>
            m.id === tempMessage.id ? message : m
          ),
        },
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  markAsRead: async (conversationId: string, userId: string) => {
    try {
      await messagingService.markMessagesAsRead(conversationId, userId);
      
      set((state) => ({
        conversations: state.conversations.map((conv) =>
          conv.id === conversationId
            ? { ...conv, unreadCount: { ...conv.unreadCount, [userId]: 0 } }
            : conv
        ),
      }));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  },

  getOrCreateConversation: async (currentUserId: string, otherUserId: string, listingId?: string) => {
    try {
      const conversation = await messagingService.getOrCreateConversation(
        currentUserId,
        otherUserId,
        listingId
      );
      return conversation;
    } catch (error) {
      console.error('Error getting/creating conversation:', error);
      throw error;
    }
  },

  // Subscription management
  subscribeToConversations: (userId: string) => {
    const state = get();
    
    // Unsubscribe from previous if exists
    if (state.conversationsUnsubscribe) {
      state.conversationsUnsubscribe();
    }

    const unsubscribe = messagingService.subscribeToConversations(userId, (conversations) => {
      set({ conversations });
    });

    set({ conversationsUnsubscribe: unsubscribe });
  },

  subscribeToMessages: (conversationId: string) => {
    const state = get();
    
    // Unsubscribe from previous if exists for this conversation
    if (state.messageUnsubscribers[conversationId]) {
      state.messageUnsubscribers[conversationId]();
    }

    const unsubscribe = messagingService.subscribeToMessages(conversationId, (messages) => {
      set((state) => ({
        messages: {
          ...state.messages,
          [conversationId]: messages,
        },
      }));
    });

    set((state) => ({
      messageUnsubscribers: {
        ...state.messageUnsubscribers,
        [conversationId]: unsubscribe,
      },
    }));
  },

  unsubscribeFromMessages: (conversationId: string) => {
    const state = get();
    
    if (state.messageUnsubscribers[conversationId]) {
      state.messageUnsubscribers[conversationId]();
      
      set((state) => {
        const { [conversationId]: removed, ...rest } = state.messageUnsubscribers;
        return { messageUnsubscribers: rest };
      });
    }
  },

  stopAllListening: () => {
    const state = get();
    
    // Unsubscribe from conversations
    if (state.conversationsUnsubscribe) {
      state.conversationsUnsubscribe();
    }

    // Unsubscribe from all message subscriptions
    Object.values(state.messageUnsubscribers).forEach((unsubscribe) => {
      unsubscribe();
    });

    set({
      conversationsUnsubscribe: null,
      messageUnsubscribers: {},
    });
  },
}));