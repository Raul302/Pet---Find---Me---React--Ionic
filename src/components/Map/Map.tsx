import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { IonContent } from '@ionic/react';
import '../../pages/pet-missing/PetMissing.css';

interface MapProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void
}

const Map: React.FC<MapProps> = ({ onLocationSelect }) => {

      //   Calling api to formate the coordenades to string address
    const fetchAddress = async (lat: number, lng: number) => {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await res.json();
        return data.display_name; // full address string
        };


  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current) return; // prevent re-init

    mapRef.current = L.map('map').setView([25.542, -103.406], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(mapRef.current);

    // ✅ Listen for clicks
    mapRef.current.on('click', async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      // Get address from API
  const address = await fetchAddress(lat, lng);


      // Add marker at clicked location
      L.marker([lat, lng]).addTo(mapRef.current!)
    .bindPopup(address)        .openPopup();

      // Pass coords back to parent
      onLocationSelect(lat, lng , address);
    });
  }, [onLocationSelect]);

  return (
  <IonContent fullscreen>
    <div id="map" ></div>
    </IonContent>
    )
};

export default Map;
