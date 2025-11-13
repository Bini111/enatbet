export type MessageType = 'text' | 'booking_request' | 'system';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  read: boolean;
  metadata?: {
    bookingId?: string;
    listingId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  participants: string[]; // [guestId, hostId]
  listingId: string;
  lastMessage?: {
    content: string;
    senderId: string;
    createdAt: Date;
  };
  unreadCount: {
    [userId: string]: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMessageInput {
  conversationId: string;
  content: string;
  type?: MessageType;
  metadata?: {
    bookingId?: string;
    listingId?: string;
  };
}

export interface CreateConversationInput {
  participants: string[];
  listingId: string;
  initialMessage?: string;
}
