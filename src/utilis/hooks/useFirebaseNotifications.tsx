import { useEffect } from 'react';
import { messaging, getToken, onMessage } from '../firebase';
import UserService from '@/services/user';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import TelegramIcon from '../../assets/icons/telegram_icon.png';
import Image from 'next/image';

const userService = new UserService();

export const useFirebaseNotifications = () => {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!('Notification' in window)) {
      console.warn('This browser does not support desktop notifications');
      return;
    }

    Notification.requestPermission()
      .then(async (permission) => {
        if (permission === 'granted') {
          const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
          });

          console.log('FCM token:', token);

          await userService.saveFCMToken({ fcmToken: token });
        }
      })
      .catch((error) => console.log('Error getting permission for notifications:', error));
  }, []);

  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('FCM message received:', payload);

      const title = payload.notification?.title || 'Notification';
      const description = payload.notification?.body || '';
      const link = payload.fcmOptions?.link || '/';

      toast(title, {
        description,
        action: {
          label: 'Open Chat',
          onClick: () => {
            router.push(link);
          }
        }
      });
    });

    return () => unsubscribe();
  }, []);
};
