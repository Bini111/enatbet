export type NotificationType =
  | 'booking_request'
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'new_message'
  | 'new_review'
  | 'payout_completed'
  | 'listing_approved'
  | 'listing_rejected';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  data?: {
    bookingId?: string;
    listingId?: string;
    conversationId?: string;
    reviewId?: string;
  };
  createdAt: Date;
}

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: {
    bookingId?: string;
    listingId?: string;
    conversationId?: string;
    reviewId?: string;
  };
}
