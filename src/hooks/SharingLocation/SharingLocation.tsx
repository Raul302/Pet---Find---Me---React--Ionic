import { useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io("https://api.lrpm.space", {
  transports: ["websocket", "polling"]});


socket.on("connect_error", (err) => {
  console.error("Socket connection error:", err.message);
});

export function useShareLocation(userId: number, durationMinutes: number, shareToken: string) {

  console.log('SharingLocation Called');
    useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        console.log("sendLocation", { userId, coords, shareToken } );
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
