export type NotificationType = 'BOOKING_CONFIRMED' | 'BOOKING_CANCELLED' | 'MESSAGE' | 'SYSTEM';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string; // ISO
  read: boolean;
}
