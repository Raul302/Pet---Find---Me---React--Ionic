import React, { useCallback, useMemo, useState } from 'react';
import { IonContent } from '@ionic/react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import '../../pages/pet-missing/PetMissing.css';

interface MapProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  mapsApiKey?: string;
}

const DEFAULT_CENTER = { lat: 25.542, lng: -103.406 };

const mapContainerStyle = { height: '100%', width: '100%' } as const;
const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  zoomControl: true
};

const Map: React.FC<MapProps> = ({ onLocationSelect, mapsApiKey }) => {
  const [selectedPosition, setSelectedPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [selectedAddress, setSelectedAddress] = useState('');

  const apiKey = mapsApiKey ?? (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey ?? '',
    language: 'es'
  });

  const fetchAddress = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      if (apiKey) {
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`);
        const json = await response.json();
        if (json?.results?.length) return json.results[0].formatted_address;
        return '';
      }

      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const json = await response.json();
      return json?.display_name || '';
    } catch (error) {
      console.warn('Reverse geocode failed', error);
      return '';
    }
  }, [apiKey]);

  const handleMapClick = useCallback(async (event: google.maps.MapMouseEvent) => {
    const lat = event.latLng?.lat();
    const lng = event.latLng?.lng();
    if (lat == null || lng == null) return;

    const coords = { lat, lng };
    setSelectedPosition(coords);

    const address = await fetchAddress(lat, lng);
    setSelectedAddress(address);
    onLocationSelect(lat, lng, address);
  }, [fetchAddress, onLocationSelect]);

  const content = useMemo(() => {
    if (!apiKey) {
      return (
        <div className="map-fallback">
          Falta configurar <code>VITE_GOOGLE_MAPS_API_KEY</code> para mostrar el mapa interactivo.
        </div>
      );
    }

    if (loadError) {
      return (
        <div className="map-fallback">
          Error cargando Google Maps: {String(loadError)}
        </div>
      );
    }

    if (!isLoaded) {
      return <div className="map-fallback">Cargando mapa...</div>;
    }

    return (
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={selectedPosition ?? DEFAULT_CENTER}
        zoom={13}
        options={mapOptions}
        onClick={handleMapClick}
      >
        {selectedPosition && (
          <Marker
            position={selectedPosition}
            title={selectedAddress || 'Ubicación seleccionada'}
          />
        )}
      </GoogleMap>
    );
  }, [apiKey, handleMapClick, isLoaded, loadError, selectedAddress, selectedPosition]);

  return (
    <IonContent fullscreen>
      <div id="map" style={{ height: '100%', width: '100%' }}>
        {content}
      </div>
    </IonContent>
  );
};

export default Map;
