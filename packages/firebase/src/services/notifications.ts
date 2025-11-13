import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Notification, CreateNotificationInput } from '@enatbet/shared';

/**
 * Notification Service
 * Handles user notifications
 */

// Convert Firestore document to Notification
const convertToNotification = (docId: string, data: any): Notification => {
  return {
    id: docId,
    userId: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    read: data.read || false,
    data: data.data,
    createdAt: data.createdAt?.toDate() || new Date(),
  };
};

// Create notification
export const createNotification = async (
  input: CreateNotificationInput
): Promise<string> => {
  try {
    const notificationData = {
      ...input,
      read: false,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, 'notifications'),
      notificationData
    );

    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to create notification');
  }
};

// Get user notifications
export const getUserNotifications = async (
  userId: string,
  maxResults: number = 50
): Promise<Notification[]> => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(maxResults)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc =>
      convertToNotification(doc.id, doc.data())
    );
  } catch (error: any) {
    throw new Error(error.message || 'Failed to get notifications');
  }
};

// Listen to user notifications in real-time
export const listenToNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void
): Unsubscribe => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc =>
      convertToNotification(doc.id, doc.data())
    );
    callback(notifications);
  });
};

// Mark notification as read
export const markNotificationAsRead = async (
  notificationId: string
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true,
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to mark notification as read');
  }
};

// Mark all notifications as read
export const markAllAsRead = async (userId: string): Promise<void> => {
  try {
    const notifications = await getUserNotifications(userId);
    const unread = notifications.filter(n => !n.read);

    const promises = unread.map(n => markNotificationAsRead(n.id));
    await Promise.all(promises);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to mark all as read');
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (
  userId: string
): Promise<number> => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error: any) {
    return 0;
  }
};

// Helper functions to create specific notification types

export const notifyBookingRequest = async (
  hostId: string,
  bookingId: string,
  guestName: string
): Promise<void> => {
  await createNotification({
    userId: hostId,
    type: 'booking_request',
    title: 'New Booking Request',
    message: `${guestName} has requested to book your property`,
    data: { bookingId },
  });
};

export const notifyBookingConfirmed = async (
  guestId: string,
  bookingId: string,
  listingTitle: string
): Promise<void> => {
  await createNotification({
    userId: guestId,
    type: 'booking_confirmed',
    title: 'Booking Confirmed',
    message: `Your booking for ${listingTitle} has been confirmed`,
    data: { bookingId },
  });
};

export const notifyBookingCancelled = async (
  userId: string,
  bookingId: string,
  listingTitle: string
): Promise<void> => {
  await createNotification({
    userId,
    type: 'booking_cancelled',
    title: 'Booking Cancelled',
    message: `The booking for ${listingTitle} has been cancelled`,
    data: { bookingId },
  });
};

export const notifyNewMessage = async (
  recipientId: string,
  conversationId: string,
  senderName: string
): Promise<void> => {
  await createNotification({
    userId: recipientId,
    type: 'new_message',
    title: 'New Message',
    message: `${senderName} sent you a message`,
    data: { conversationId },
  });
};

export const notifyNewReview = async (
  hostId: string,
  reviewId: string,
  listingId: string,
  rating: number
): Promise<void> => {
  await createNotification({
    userId: hostId,
    type: 'new_review',
    title: 'New Review',
    message: `You received a ${rating}-star review for your listing`,
    data: { reviewId, listingId },
  });
};

export const notifyPayoutCompleted = async (
  hostId: string,
  amount: number,
  currency: string
): Promise<void> => {
  await createNotification({
    userId: hostId,
    type: 'payout_completed',
    title: 'Payout Completed',
    message: `Your payout of ${currency} ${amount} has been processed`,
  });
};
