import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { useParams } from 'react-router';

type LiveLocation = {
  userId: string;
  coords: { lat: number; lng: number };
};

const GOOGLE_MAPS_LIBRARIES: ('places')[] = ['places'];
const socket = io('https://api.lrpm.space', { transports: ['websocket'] });

socket.on('connect', () => {
  console.log('Socket conectado:', socket.id);
});

export function LiveLocationViewer() {
  const { token } = useParams<{ token: string }>();
  const [locations, setLocations] = useState<LiveLocation[]>([]);
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey ?? '',
    libraries: GOOGLE_MAPS_LIBRARIES,
    language: 'es'
  });

  // A: Unirse a la sala del token
  useEffect(() => {
    if (!token) return;
    socket.emit('joinLiveLocation', token);
  }, [token]);

  // B: Fetch inicial para centrar el mapa
useEffect(() => {
  if (!token) return;
  const apiEndpoint = import.meta.env.VITE_API_ENDPOINT || 'https://api.lrpm.space';
  fetch(`${apiEndpoint}/live-location/${token}`)
    .then(async (resp) => {
      if (!resp.ok) {
        // Manejar expiración
        console.warn('Ubicación expirada o no encontrada');
        setCenter(null); // no hay centro válido
        alert('Esta ubicación ya expiró'); // o mostrar un mensaje en UI
        return;
      }
      const data = await resp.json();
      const coords = data?.coords;
      if (coords && Number.isFinite(coords.lat) && Number.isFinite(coords.lng)) {
        setCenter({ lat: Number(coords.lat), lng: Number(coords.lng) });
      }
    })
    .catch(() => {});
}, [token]);

 // C: Escuchar actualizaciones del socket filtradas por token
useEffect(() => {
  const listener = (data: any) => {
    if (data?.shareToken !== token) return;

    // Log para verificar qué llega del backend
    console.log('Raw coords recibidas:', data.coords);

    const lat = Number(data?.coords?.lat ?? data?.coords?.latitude);
    const lng = Number(data?.coords?.lng ?? data?.coords?.longitude);
    const userId = String(data?.userId ?? '');

    console.log('Parsed coords -> lat:', lat, 'lng:', lng);

    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !userId) {
      console.warn('Coordenadas inválidas recibidas, se ignoran');
      return;
    }

    const normalized: LiveLocation = { userId, coords: { lat, lng } };

    setLocations(prev => {
      const filtered = prev.filter(loc => loc.userId !== normalized.userId);
      return [...filtered, normalized];
    });

    setCenter({ lat, lng });
  };

  socket.on('updateLocation', listener);
  return () => {
    socket.off('updateLocation', listener);
  };
}, [token]);


  // D: PanTo cuando haya center
  useEffect(() => {
    if (!mapRef.current || !center) return;
    mapRef.current.panTo(center);
  }, [center]);

  const containerStyle = useMemo(() => ({ height: '100vh', width: '100%' }), []);
  const mapOptions = useMemo<google.maps.MapOptions>(() => ({
    disableDefaultUI: false,
    fullscreenControl: false,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false
  }), []);

  if (!apiKey) {
    return <div style={{ padding: 24 }}>Falta configurar <code>VITE_GOOGLE_MAPS_API_KEY</code> para mostrar el mapa.</div>;
  }
  if (loadError) {
    return <div style={{ padding: 24 }}>No se pudo cargar Google Maps: {String(loadError)}</div>;
  }
  if (!isLoaded) {
    return <div style={{ padding: 24 }}>Cargando mapa...</div>;
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center ?? { lat: 25.601, lng: -103.413 }}
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
