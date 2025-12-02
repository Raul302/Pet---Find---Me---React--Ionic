import { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { api_endpoint } from '../../config/api';

type PushState = 'idle' | 'pending' | 'subscribed' | 'blocked' | 'unsupported' | 'error';

type VapidResponse = {
  publicKey?: string | null;
};

type SubscriptionPayload = {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

const VAPID_CACHE: { key?: Uint8Array<ArrayBuffer> } = {};

const supportsWebPush = () => {
  if (typeof window === 'undefined') return false;
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
};

const urlBase64ToUint8Array = (base64String: string): Uint8Array<ArrayBuffer> => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer) as Uint8Array<ArrayBuffer>;
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const getAuthHeaders = () => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const fetchVapidKey = async () => {
  if (VAPID_CACHE.key) return VAPID_CACHE.key;

  const response = await fetch(`${api_endpoint}/notifications/vapidPublicKey`, {
    credentials: 'include'
  });

  if (!response.ok) throw new Error(`Failed to load VAPID key (${response.status})`);

  const data = (await response.json()) as VapidResponse;
  if (!data.publicKey) throw new Error('VAPID public key missing');

  VAPID_CACHE.key = urlBase64ToUint8Array(data.publicKey);
  return VAPID_CACHE.key;
};

const normalizeSubscription = (subscription: PushSubscription): SubscriptionPayload => {
  const json = subscription.toJSON();
  return {
    endpoint: subscription.endpoint,
    expirationTime: subscription.expirationTime ?? null,
    keys: {
      p256dh: json.keys?.p256dh ?? '',
      auth: json.keys?.auth ?? ''
    }
  };
};

export const registerPushSubscription = async (userId: number) => {
  if (!supportsWebPush()) return 'unsupported' as PushState;
  if (!userId) return 'idle' as PushState;

  if (Notification.permission === 'denied') return 'blocked' as PushState;

  const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
  if (permission !== 'granted') return 'blocked' as PushState;

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();

  const applicationServerKey = await fetchVapidKey();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    });
  }

  const payload = normalizeSubscription(subscription);

  await fetch(`${api_endpoint}/notifications/subscribe`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ subscription: payload, userId })
  });

  return 'subscribed' as PushState;
};

export const unregisterPushSubscription = async () => {
  if (!supportsWebPush()) return;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) return;

  const endpoint = subscription.endpoint;

  try {
    await fetch(`${api_endpoint}/notifications/subscribe`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ endpoint })
    });
  } catch (err) {
    console.warn('Failed to unregister push subscription on server', err);
  }

  try {
    await subscription.unsubscribe();
  } catch (err) {
    console.warn('Failed to unsubscribe push subscription locally', err);
  }
};

export const usePushNotifications = (userId: number | null | undefined) => {
  const [state, setState] = useState<PushState>('idle');
  const lastUserId = useRef<number | null>(null);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      setState('unsupported');
      return;
    }

    if (!supportsWebPush()) {
      setState('unsupported');
      return;
    }

    if (!userId) {
      setState('idle');
      lastUserId.current = null;
      return;
    }

    if (lastUserId.current === userId && state === 'subscribed') return;

    let active = true;
    setState('pending');

    registerPushSubscription(userId)
      .then(result => {
        if (!active) return;
        setState(result === 'subscribed' ? 'subscribed' : result);
        lastUserId.current = userId;
      })
      .catch(err => {
        console.warn('Push registration failed', err);
        if (active) setState('error');
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return state;
};
