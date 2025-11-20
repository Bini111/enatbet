import { create } from "zustand";
import { Conversation, Message } from "@enatbet/shared";
import {
  getUserConversations,
  getMessages,
  sendMessage,
  createConversation,
  markAsRead,
  listenToMessages,
  listenToConversations,
} from "@enatbet/firebase";
import { Unsubscribe } from "firebase/firestore";

interface MessageState {
  conversations: Conversation[];
  messages: Message[];
  selectedConversationId: string | null;
  isLoading: boolean;
  error: string | null;
  listeners: {
    conversations?: Unsubscribe;
    messages?: Unsubscribe;
  };

  // Actions
  fetchConversations: (userId: string) => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (
    conversationId: string,
    senderId: string,
    content: string,
  ) => Promise<void>;
  createConversation: (
    participants: string[],
    listingId: string,
    initialMessage?: string,
  ) => Promise<string>;
  markAsRead: (conversationId: string, userId: string) => Promise<void>;
  subscribeToConversations: (userId: string) => void;
  subscribeToMessages: (conversationId: string) => void;
  unsubscribeAll: () => void;
  setSelectedConversation: (conversationId: string) => void;
  clearError: () => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  conversations: [],
  messages: [],
  selectedConversationId: null,
  isLoading: false,
  error: null,
  listeners: {},

  fetchConversations: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const conversations = await getUserConversations(userId);
      set({ conversations, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchMessages: async (conversationId: string) => {
    set({ isLoading: true, error: null });
    try {
      const messages = await getMessages(conversationId);
      set({ messages, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  sendMessage: async (
    conversationId: string,
    senderId: string,
    content: string,
  ) => {
    set({ error: null });
    try {
      await sendMessage(conversationId, senderId, content);
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  createConversation: async (
    participants: string[],
    listingId: string,
    initialMessage?: string,
  ) => {
    set({ isLoading: true, error: null });
    try {
      const conversationId = await createConversation({
        participants,
        listingId,
        initialMessage,
      });
      set({ isLoading: false });
      return conversationId;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  markAsRead: async (conversationId: string, userId: string) => {
    try {
      await markAsRead(conversationId, userId);
    } catch (error: any) {
      console.error("Error marking as read:", error);
    }
  },

  subscribeToConversations: (userId: string) => {
    const unsubscribe = listenToConversations(userId, (conversations) => {
      set({ conversations });
    });
    set((state) => ({
      listeners: { ...state.listeners, conversations: unsubscribe },
    }));
  },

  subscribeToMessages: (conversationId: string) => {
    const unsubscribe = listenToMessages(conversationId, (messages) => {
      set({ messages });
    });
    set((state) => ({
      listeners: { ...state.listeners, messages: unsubscribe },
    }));
  },

  unsubscribeAll: () => {
    const { listeners } = get();
    if (listeners.conversations) listeners.conversations();
    if (listeners.messages) listeners.messages();
    set({ listeners: {} });
  },

  setSelectedConversation: (conversationId: string) => {
    set({ selectedConversationId: conversationId });
  },

  clearError: () => set({ error: null }),
}));
