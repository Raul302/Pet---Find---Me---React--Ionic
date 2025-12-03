import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { io } from 'socket.io-client';

// Conexión al servidor WebSocket
const socket = io('https://api.lrpm.space', {
  transports: ['websocket', 'polling']
});

socket.on('connect_error', err => {
  console.error('Socket connection error:', err.message);
});

// Función para emitir coordenadas
const emitLocationUpdate = (payload: { userId: number; coords: { lat: number; lng: number }; shareToken: string }) => {
  if (!payload.shareToken) return;
  console.log('Emitiendo ubicación:', payload);
  socket.emit('sendLocation', payload, (ack: any) => {
    if (ack?.ok) {
      console.log('Ubicación enviada correctamente');
    } else {
      console.warn('Error al enviar ubicación:', ack?.error);
    }
  });
};

export function useShareLocation(userId: number, durationMinutes: number, shareToken: string) {
  useEffect(() => {
    if (!userId || !shareToken) return;

    // A: Unirse a la sala del token (emisor también)
    socket.emit('joinLiveLocation', shareToken);

    let isCancelled = false;
    let nativeWatchId: string | null = null;
    let webWatchId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const clearWatchers = () => {
      if (nativeWatchId) {
        Geolocation.clearWatch({ id: nativeWatchId }).catch(err => console.warn('Failed to clear native watch', err));
        nativeWatchId = null;
      }
      if (webWatchId !== null) {
        navigator.geolocation.clearWatch(webWatchId);
        webWatchId = null;
      }
    };

    const emitFromPosition = (position: GeolocationPosition | Position | null) => {
      if (!position || isCancelled) return;
      const { latitude, longitude } = position.coords;
      if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
        emitLocationUpdate({ userId, shareToken, coords: { lat: latitude, lng: longitude } });
      }
    };

    const startNativeWatch = async () => {
      const permissions = await Geolocation.checkPermissions();
      if (permissions.location !== 'granted') {
        const requested = await Geolocation.requestPermissions();
        if (requested.location !== 'granted') {
          console.warn('Location permission not granted on native platform');
          return;
        }
      }

      const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true }).catch(err => {
        console.warn('Unable to get current position', err);
        return null;
      });
      emitFromPosition(position);

      nativeWatchId = await Geolocation.watchPosition({ enableHighAccuracy: true }, watchPosition => {
        if (watchPosition) emitFromPosition(watchPosition);
      });
    };

    const startWebWatch = () => {
      if (!navigator.geolocation) {
        console.warn('Geolocation not supported in this browser');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        position => emitFromPosition(position),
        err => console.warn('Unable to get current position', err),
        { enableHighAccuracy: true }
      );

      webWatchId = navigator.geolocation.watchPosition(
        position => emitFromPosition(position),
        err => console.warn('Geolocation watch error', err),
        { enableHighAccuracy: true }
      );
    };

    const startWatching = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          await startNativeWatch();
        } else {
          startWebWatch();
        }
      } catch (err) {
        console.error('Failed to start location sharing', err);
      }

      // Detener después de durationMinutes
      timeoutId = setTimeout(() => {
        isCancelled = true;
        clearWatchers();
      }, durationMinutes * 60000);
    };

    startWatching();

    return () => {
      isCancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      clearWatchers();
    };
  }, [userId, durationMinutes, shareToken]); // incluye shareToken
}
