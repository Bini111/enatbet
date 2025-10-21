import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, collections } from '../config/firebase';

class NotificationService {
  /**
   * Persist a notification in Firestore and log to console.
   * This is a minimal implementation used by BookingService and others.
   * Later you can expand to send push notifications via FCM, Expo Push, or a Cloud Function.
   */
  async sendNotification(
    userId: string,
    type: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<string> {
    try {
      const notifRef = doc(collection(db, collections.notifications));
      const payload = {
        userId,
        type,
        title,
        body,
        data: data || {},
        read: false,
        createdAt: serverTimestamp(),
      };

      await setDoc(notifRef, payload);

      // TODO: Trigger push notification delivery (FCM / Expo) via Cloud Function or direct send
      console.log('[NotificationService] queued notification for user', userId, payload);

      return notifRef.id;
    } catch (error) {
      console.error('[NotificationService] sendNotification error:', error);
      throw error;
    }
  }
}

const notificationService = new NotificationService();
export default notificationService;
