import { NextRequest, NextResponse } from 'next/server';
import {
  sendMessage,
  createConversation,
  getUserConversations,
} from '@enatbet/firebase';
import { adminAuth } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

// GET /api/messages - Get user's conversations
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const conversations = await getUserConversations(userId);

    return NextResponse.json({ conversations }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

// POST /api/messages - Send message or create conversation
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await request.json();
    const { conversationId, content, recipientId, listingId } = body;

    if (!content) {
      return NextResponse.json(
        { error: 'Message content required' },
        { status: 400 }
      );
    }

    let finalConversationId = conversationId;

    // Create conversation if it doesn't exist
    if (!conversationId) {
      if (!recipientId || !listingId) {
        return NextResponse.json(
          { error: 'recipientId and listingId required for new conversation' },
          { status: 400 }
        );
      }

      finalConversationId = await createConversation({
        participants: [userId, recipientId],
        listingId,
      });
    }

    const messageId = await sendMessage(finalConversationId, userId, content);

    return NextResponse.json(
      {
        messageId,
        conversationId: finalConversationId,
        message: 'Message sent successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}
