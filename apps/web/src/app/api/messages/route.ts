import { NextRequest, NextResponse } from 'next/server';
import {
  sendMessage,
  getUserConversations,
  getConversationMessages,
  getOrCreateConversation,
} from '@enatebet/firebase';
import type { MessageCreate } from '@enatebet/shared';

/**
 * POST /api/messages - Send a message
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, senderId, messageData, recipientId, listingId, bookingId } = body;

    // If no conversationId, create one
    let finalConversationId = conversationId;
    if (!finalConversationId && recipientId) {
      finalConversationId = await getOrCreateConversation(
        senderId,
        recipientId,
        listingId,
        bookingId
      );
    }

    if (!finalConversationId) {
      return NextResponse.json(
        { success: false, error: 'Conversation ID or recipient ID is required' },
        { status: 400 }
      );
    }

    if (!senderId) {
      return NextResponse.json(
        { success: false, error: 'Sender ID is required' },
        { status: 400 }
      );
    }

    if (!messageData || !messageData.text) {
      return NextResponse.json(
        { success: false, error: 'Message text is required' },
        { status: 400 }
      );
    }

    const messageId = await sendMessage(
      finalConversationId,
      senderId,
      messageData as MessageCreate
    );

    return NextResponse.json(
      { success: true, data: { id: messageId, conversationId: finalConversationId } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/messages - Get conversations or conversation messages
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const conversationId = searchParams.get('conversationId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // If conversationId provided, get messages; otherwise get conversations
    if (conversationId) {
      const messages = await getConversationMessages(conversationId);
      return NextResponse.json({ success: true, data: messages });
    } else {
      const conversations = await getUserConversations(userId);
      return NextResponse.json({ success: true, data: conversations });
    }
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
