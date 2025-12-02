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

  const timer = window.setTimeout(() => {
    try { navigator.geolocation.clearWatch(watchId); } catch (e) { }
  }, durationMinutes * 60000);

  const stop = () => {
    try { clearTimeout(timer); } catch (e) { }
    try { navigator.geolocation.clearWatch(watchId); } catch (e) { }
  };

  return stop;
}

export function disconnectSocket() {
  if (socket) {
    try { socket.disconnect(); } catch (e) { }
    socket = null;
  }
}
