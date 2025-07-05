// src/firebase-messaging-sw.js
import { precacheAndRoute } from 'workbox-precaching';

// ← this is the injection point for your `__WB_MANIFEST`:
precacheAndRoute(self.__WB_MANIFEST);
// public/sw.js
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js');
importScripts('swEnv.js');

firebase.initializeApp({
  apiKey: swEnv.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: swEnv.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: swEnv.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: swEnv.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: swEnv.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: swEnv.NEXT_PUBLIC_FIREBASE_APP_ID
});

console.log('Firebase Messaging Service Worker initialized', swEnv);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('[sw.js] Received background message ', payload);
  const { title, body } = payload.notification;
  const link = payload.fcmOptions?.link || payload.data?.link;

  self.registration.showNotification(title, {
    body,
    icon: '/icon.png',
    data: {
      url: link
    }
  });
});
