import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { IonContent } from '@ionic/react';
import '../../pages/pet-missing/PetMissing.css';

interface MapProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  mapsApiKey?: string; // optional Google Maps Geocoding API key
}

const Map: React.FC<MapProps> = ({ onLocationSelect, mapsApiKey }) => {

  // Reverse geocoding: use Google Geocoding API when mapsApiKey is provided,
  // otherwise fall back to Nominatim (OpenStreetMap).
  const fetchAddress = async (lat: number, lng: number): Promise<string> => {
    try {
      if (mapsApiKey) {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${mapsApiKey}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data && data.results && data.results.length > 0) {
          return data.results[0].formatted_address;
        }
        return '';
      }

      // fallback to Nominatim
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      return data?.display_name || '';
    } catch (err) {
      console.warn('Reverse geocode failed', err);
      return '';
    }
  };

  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current) return; // prevent re-init

    mapRef.current = L.map('map').setView([25.542, -103.406], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapRef.current);

    // Listen for clicks
    mapRef.current.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      // Get address from API
      const address = await fetchAddress(lat, lng);

      // Add marker at clicked location with a popup (address may be empty)
      L.marker([lat, lng]).addTo(mapRef.current!).bindPopup(address || 'Ubicación').openPopup();

      // Pass coords + address back to parent
      onLocationSelect(lat, lng, address);
    });
  }, [onLocationSelect, mapsApiKey]);

  return (
    <IonContent fullscreen>
      <div id="map"></div>
    </IonContent>
  );
};

export default Map;
