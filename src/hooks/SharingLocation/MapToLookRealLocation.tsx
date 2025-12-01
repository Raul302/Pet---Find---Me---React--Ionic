import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Configurar íconos para que se vean correctamente en Vite/Ionic
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Conexión al servidor WebSocket
const socket = io("http://localhost:3000", {
  transports: ["websocket"],
});

// Log de conexión para verificar que el cliente se conecta
socket.on("connect", () => {
  console.log("Socket conectado:", socket.id);
});

export function LiveLocationViewer() {
  const [locations, setLocations] = useState<any[]>([]);

  useEffect(() => {
    socket.on("updateLocation", (data) => {
      console.log("Ubicación recibida:", data); // 👈 log para verificar datos
      setLocations((prev) => {
        const filtered = prev.filter(l => l.userId !== data.userId);
        return [...filtered, data];
      });
    });

    return () => {
      socket.off("updateLocation");
    };
  }, []);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer center={[25.601, -103.413]} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Marcadores recibidos por socket */}
        {locations.map(loc => (
          <Marker key={loc.userId} position={[loc.coords.lat, loc.coords.lng]}>
            <Popup>Usuario {loc.userId}</Popup>
          </Marker>
        ))}

        {/* Marcador fijo de prueba */}
        <Marker position={[25.601, -103.413]}>
          <Popup>Este soy yo</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
