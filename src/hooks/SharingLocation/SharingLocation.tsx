import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

function getSocket() {
  if (!socket) {
    socket = io('https://api.lrpm.space', { transports: ['websocket'] });
  }
  return socket;
}

type StopFn = () => void;

/**
 * Start sharing location imperatively. Returns a stop function.
 * This avoids calling hooks from event handlers and gives explicit control.
 */
export function startShareLocation(userId: number, durationMinutes: number, shareToken: string): StopFn {
  const sock = getSocket();

  const watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      sock.emit('sendLocation', { userId, coords, shareToken }, () => {
        // no-op
      });
    },
    (err) => console.error('geo err', err),
    { enableHighAccuracy: true }
  );

    const timer = setTimeout(() => {
      navigator.geolocation.clearWatch(watchId);
    }, durationMinutes * 60000);

    return () => {
      clearTimeout(timer);
      navigator.geolocation.clearWatch(watchId);
    };
}
