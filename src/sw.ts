/// <reference lib="webworker" />

import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<any>;
};

type NotificationPayload = {
  notificationId?: number;
  title?: string;
  body?: string;
  icon?: string;
  badge?: string;
  url?: string;
  vibrate?: number[];
  data?: Record<string, unknown>;
};

const DEFAULT_TITLE = 'PetFindMe';
const DEFAULT_ICON = 'favicon.png';
const DEFAULT_BODY = 'Tienes una nueva notificacion';

self.skipWaiting();
clientsClaim();

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST || []);

const buildPayload = (input: unknown): NotificationPayload => {
  if (!input) return {};
  if (typeof input === 'string') {
    try {
      return JSON.parse(input) as NotificationPayload;
    } catch (err) {
      return { body: input };
    }
  }
  if (typeof input === 'object') return input as NotificationPayload;
  return {};
};

const showNotification = async (payload: NotificationPayload) => {
  const title = payload.title || DEFAULT_TITLE;
  const options: NotificationOptions & { vibrate?: number[] } = {
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
};

self.addEventListener('push', event => {
  if (!event.data) return;
  const raw = (() => {
    try {
      return event.data?.json();
    } catch (err) {
      return event.data?.text();
    }
  })();

  const payload = buildPayload(raw);
  event.waitUntil(showNotification(payload));
});

self.addEventListener('notificationclick', event => {
  const notification = event.notification;
  const targetUrl = (notification.data && (notification.data as any).url) || '/';
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
          const view = client as WindowClient;
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

export {};
