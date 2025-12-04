/// <reference lib="webworker" />
console.log("[sw.js] Service Worker cargado");

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

// ================== CACHE / OFFLINE ==================
self.skipWaiting();
clientsClaim();

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST || []);

// ================== NOTIFICACIONES CUSTOM ==================
const DEFAULT_TITLE = 'PetFindMe';
const DEFAULT_ICON = 'favicon.png';
const DEFAULT_BODY = 'Tienes una nueva notificación';

function buildPayload(input) {
  if (!input) return {};
  if (typeof input === 'string') {
    try {
      return JSON.parse(input);
    } catch {
      return { body: input };
    }
  }
  if (typeof input === 'object') return input;
  return {};
}

async function showNotification(payload) {
  const title = payload.title || DEFAULT_TITLE;
  const options = {
    body: payload.body || DEFAULT_BODY,
    icon: payload.icon || DEFAULT_ICON,
    badge: payload.badge || payload.icon || DEFAULT_ICON,
    vibrate: payload.vibrate || [150, 75, 150],
    data: {
      url: payload.url || '/',
      notificationId: payload.notificationId,
      ...(payload.data || {})
    },
    tag: payload.notificationId ? `notif-${payload.notificationId}` : undefined
  };

  await self.registration.showNotification(title, options);
}

// Listener genérico de Push (útil si backend envía payload JSON directo)
self.addEventListener('push', event => {
  if (!event.data) return;
  let raw;
  try {
    raw = event.data.json();
  } catch {
    raw = event.data.text();
  }
  console.log("[sw.js] Push genérico recibido:", raw);
  const payload = buildPayload(raw);
  event.waitUntil(showNotification(payload));
});

// Click en notificación → abrir ventana
self.addEventListener('notificationclick', event => {
  const notification = event.notification;
  const targetUrl = (notification.data && notification.data.url) || '/';
  const normalizedTarget = new URL(targetUrl, self.location.origin).href;
  notification.close();

  event.waitUntil(
    (async () => {
      const windowClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      });

      for (const client of windowClients) {
        if ('focus' in client) {
          const view = client;
          if (view.url === normalizedTarget) {
            await view.focus();
            return;
          }
        }
      }

      if (self.clients.openWindow) {
        await self.clients.openWindow(normalizedTarget);
      }
    })()
  );
});

// ================== FIREBASE MESSAGING ==================
importScripts("https://www.gstatic.com/firebasejs/9.6.11/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.11/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBz-7zob3ucnp_kSh_yV9RxF9kBfbPC93o",
  authDomain: "pet-find-m.firebaseapp.com",
  projectId: "pet-find-m",
  storageBucket: "pet-find-m.firebasestorage.app",
  messagingSenderId: "364370916980",
  appId: "1:364370916980:web:4337c1cdbb943957790321",
  measurementId: "G-HW82RQ40QK"
});

const messaging = firebase.messaging();

// Notificaciones en background vía FCM
messaging.onBackgroundMessage(payload => {
  console.log("[sw.js] Mensaje en background:", payload);
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || DEFAULT_TITLE, {
    body: body || DEFAULT_BODY,
    icon: DEFAULT_ICON,
    data: payload.data || {}
  });
});
