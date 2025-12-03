import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { useParams } from 'react-router';

type LiveLocation = {
  userId: string;
  coords: { lat: number; lng: number };
};

const DEFAULT_CENTER = { lat: 25.601, lng: -103.413 };
const GOOGLE_MAPS_LIBRARIES: ('places')[] = ['places'];

// Conexión al servidor WebSocket
const socket = io('https://api.lrpm.space', {
  transports: ['websocket']
});

socket.on('connect', () => {
  console.log('Socket conectado:', socket.id);
});

export function LiveLocationViewer() {
  const { token } = useParams<{ token: string }>();

  const [locations, setLocations] = useState<LiveLocation[]>([]);
  const mapRef = useRef<google.maps.Map | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey ?? '',
    libraries: GOOGLE_MAPS_LIBRARIES,
    language: 'es'
  });

  useEffect(() => {
    const listener = (data: any) => {
      console.log('Ubicación recibida:', data);

      // Filtrar por el shareToken de la URL
      if (data.shareToken !== token) return;

      const normalized: LiveLocation | null = data && data.coords
        ? {
            userId: String(data.userId ?? ''),
            coords: {
              lat: Number(data.coords.lat),
              lng: Number(data.coords.lng)
            }
          }
        : null;

      if (!normalized || Number.isNaN(normalized.coords.lat) || Number.isNaN(normalized.coords.lng)) {
        return;
      }

      setLocations(prev => {
        const filtered = prev.filter(loc => loc.userId !== normalized.userId);
        return [...filtered, normalized];
      });
    };

    socket.on('updateLocation', listener);

    return () => {
      socket.off('updateLocation', listener);
    };
  }, [token]);

  useEffect(() => {
    if (!mapRef.current || locations.length === 0) return;
    const latest = locations[locations.length - 1];
    mapRef.current.panTo(latest.coords);
  }, [locations]);

  const containerStyle = useMemo(() => ({ height: '100vh', width: '100%' }), []);
  const mapOptions = useMemo<google.maps.MapOptions>(() => ({
    disableDefaultUI: false,
    fullscreenControl: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false
  }), []);

  if (!apiKey) {
    return (
      <div style={{ padding: 24 }}>
        Falta configurar <code>VITE_GOOGLE_MAPS_API_KEY</code> para mostrar el mapa.
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ padding: 24 }}>
        No se pudo cargar Google Maps: {String(loadError)}
      </div>
    );
  }

  if (!isLoaded) {
    return <div style={{ padding: 24 }}>Cargando mapa...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={DEFAULT_CENTER}
      zoom={13}
      options={mapOptions}
      onLoad={map => { mapRef.current = map; }}
      onUnmount={() => { mapRef.current = null; }}
    >
      {locations.map(location => (
        <Marker
          key={location.userId}
          position={location.coords}
          title={`Usuario ${location.userId}`}
          label={location.userId}
        />
      ))}
    </GoogleMap>
  );
}
