import { useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io("https://api.lrpm.space", {
    transports: ["websocket"],
});

export function useShareLocation(userId: number, durationMinutes: number) {
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        socket.emit("sendLocation", { userId, coords });
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );

    const timer = setTimeout(() => {
      navigator.geolocation.clearWatch(watchId);
    }, durationMinutes * 60000);

    return () => {
      clearTimeout(timer);
      navigator.geolocation.clearWatch(watchId);
    };
  }, [userId, durationMinutes]);
}
