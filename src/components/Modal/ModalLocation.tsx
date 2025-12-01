import React, { useRef, useState, useEffect, useContext } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonSpinner, IonGrid, IonRow, IonCol, IonInput, IonList, IonItem, IonToast, IonLabel, useIonViewWillLeave } from '@ionic/react';
import { mapsApiKey } from '../../assets/DontBackup/Credentials';
import { api_endpoint } from '../../config/api';
import { AuthContext } from '../../hooks/Context/AuthContext/AuthContext';

interface ModalLocationProps {
  isOpen: boolean;
  onDidDismiss: () => void;
  onClose: () => void;
}

const ModalLocation: React.FC<ModalLocationProps> = ({ isOpen, onDidDismiss , onClose  }) => {

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [query, setQuery] = useState('');
  const [addressFailed, setAddressFailed] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [options, setOptions] = useState<any[]>([]);
  const searchTimeout = useRef<number | null>(null);
  const queryRef = useRef(query);
  const [submitting, setSubmitting] = useState(false);
    const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const [address,address_formated] = useState('');

  const { fetchPets, updateUser } = useContext(AuthContext) as any;



  const cleanForm = () => {
    setCoords(null);
    setQuery('');
    setOptions([]);
    setAddressFailed(false);
    setLoadingAddress(false);
    setSubmitting(false);
    setToastOpen(false);
    setToastMsg('');    

  }
   // Clear form when the view is about to be left (user navigates away)
    useIonViewWillLeave(() => {
      cleanForm()
    });

  // Ensure toast is cleared when modal is opened so a leftover state
  // doesn't show a toast immediately on open.
  useEffect(() => {
    if (isOpen) {
      setToastOpen(false);
      setToastMsg('');
    }
  }, [isOpen]);
  

        async function canDismiss(data?: any, role?: string) {
        return role !== 'gesture';
    }

  const updateQuery = (val: string, source = 'unknown', coordenades: { lat: number; lng: number } | null = null) => {
    const safe = val == null ? '' : String(val);
    if (queryRef.current === safe) {
      console.debug('[QuestionPlace] updateQuery skipped (same)', { safe, source });
      return;
    }
    console.debug('[QuestionPlace] updateQuery', { from: source, value: safe });
    setQuery(safe);
    if (coordenades) setCoords(coordenades ?? null);
    queryRef.current = safe;
  };
  
  async function fetchAddress(lat: number, lng: number) {
    try {
      if (mapsApiKey) {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${mapsApiKey}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data && data.results && data.results.length > 0) return data.results[0].formatted_address;
        return '';
      }
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      return data?.display_name || '';
    } catch (err) {
      console.warn('fetchAddress error', err);
      return '';
    }
  }
  
  // Try reverse geocoding several times until a non-empty address is returned
  async function getAddressWithRetries(lat: number, lng: number, maxRetries = 3, delayMs = 700) {
    for (let i = 0; i < maxRetries; i++) {
      const addr = await fetchAddress(lat, lng);
      if (addr && addr.trim().length > 0) return addr;
      // wait before retrying
      await new Promise((r) => setTimeout(r, delayMs));
    }
    // final attempt
    return await fetchAddress(lat, lng);
  }
  
  
  // Search location by free text (debounced)
  const SearchLocation = (q: string) => {
    const query = q ?? '';
    if (searchTimeout.current) window.clearTimeout(searchTimeout.current);
    if (!query || query.trim().length === 0) {
      setOptions([]);
      return;
    }
    searchTimeout.current = window.setTimeout(async () => {
      try {
        // First try restricting to Mexico for better local results
        const base = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${mapsApiKey}`;
        const restrictedUrl = base + `&components=country:MX`;
  
        let data: any = null;
        try {
          const res = await fetch(restrictedUrl);
          data = await res.json();
        } catch (err) {
          console.warn('SearchLocation restricted fetch error', err);
        }
  
        // If restricted search didn't return usable results, fall back to general search
        if (!data || !data.results || data.results.length === 0) {
          try {
            const res2 = await fetch(base);
            data = await res2.json();
          } catch (err) {
            console.warn('SearchLocation fallback fetch error', err);
            data = { results: [] };
          }
        }
  
        const results = data.results || [];
  
        // Helper: check if a result is in Mexico
        const isMexico = (r: any) => {
          try {
            return (r.address_components || []).some((c: any) => Array.isArray(c.types) && c.types.includes('country') && (c.short_name === 'MX' || c.long_name === 'Mexico'));
          } catch (e) {
            return false;
          }
        };
  
        // Sort so Mexico results come first
        results.sort((a: any, b: any) => {
          const ma = isMexico(a) ? 0 : 1;
          const mb = isMexico(b) ? 0 : 1;
          return ma - mb;
        });
  
        setOptions(results);
      } catch (err) {
        console.warn('SearchLocation error', err);
        setOptions([]);
      }
    }, 500);
  };

  // Try to extract coordinates from a search result (Google Geocode or Nominatim)
  const getCoordsFromResult = (r: any): { lat: number; lng: number } | null => {
    try {
      // Google Geocode result
      if (r.geometry && r.geometry.location) {
        const { lat, lng } = r.geometry.location;
        return { lat: Number(lat), lng: Number(lng) };
      }
      // Nominatim result
      if (r.lat && r.lon) {
        return { lat: Number(r.lat), lng: Number(r.lon) };
      }
      // Some other providers may use 'latitude'/'longitude'
      if (r.latitude && r.longitude) {
        return { lat: Number(r.latitude), lng: Number(r.longitude) };
      }
    } catch (e) {
      // ignore
    }
    return null;
  };

  // Forward geocode a free-text address to coordinates (Google or Nominatim)
  const forwardGeocode = async (address: string) => {
    if (!address || address.trim().length === 0) return null;
    try {
      if (mapsApiKey) {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${mapsApiKey}`;
        const res = await fetch(url);
        const data = await res.json();
        const first = data?.results?.[0];
        if (first && first.geometry && first.geometry.location) {
          return { lat: Number(first.geometry.location.lat), lng: Number(first.geometry.location.lng) };
        }
        return null;
      }
      // Nominatim fallback
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
      const arr = await res.json();
      if (Array.isArray(arr) && arr.length > 0) {
        return { lat: Number(arr[0].lat), lng: Number(arr[0].lon) };
      }
      return null;
    } catch (err) {
      console.warn('forwardGeocode error', err);
      return null;
    }
  };
  
  
  
   
    // Submit address to backend. Called by both buttons (accept=true for 'Usar esta direccion', accept=false for 'No usar')
    const submitAddress = async (accept: boolean) => {
  
      // if still loading address, don't allow
      if (loadingAddress || submitting) return;
  
    
      setSubmitting(true);
        try {
          // If user accepts the address but we don't have coords yet,
          // attempt to forward-geocode the free-text query.
          let finalCoords = coords;
          if (accept && !finalCoords) {
            const f = await forwardGeocode(query);
            if (f) {
              finalCoords = f;
              setCoords(f);
            }
          }

          const payload = {
            address_preference: accept ? (query || null ) : "not_address",
            coords: accept ? (finalCoords || null ) : null,
            accepted: accept,
          };
  
        // Use centralized updateUser in AuthContext so localStorage and context stay in sync
        await updateUser?.(payload, true);
        setToastMsg('Dirección enviada correctamente.');
        setToastOpen(true);
        onClose();
       // esperar 3 segundos antes de redirigir
         
            
      } catch (err: any) {
        console.error('submitAddress error', err);
        setToastMsg('Error al enviar la dirección. Intenta nuevamente.');
        setToastOpen(true);
      } finally {
        setSubmitting(false);
      }
    };


  return (
     <IonModal
    
                        isOpen={isOpen}
                        backdropDismiss={false}
                        canDismiss={canDismiss}
                    >
                        <IonHeader>
                            <IonToolbar>
                                <IonTitle>Ubicacion</IonTitle>
                            </IonToolbar>
                        </IonHeader>
                        <IonContent className="custom-modal-location" style={{position: 'relative'}}>
                            {/* overlay to block interactions while loading or submitting */}
                            {(loadingAddress || submitting) && (
                              <div style={{position:'absolute',inset:0,background:'rgba(255,255,255,0.6)',zIndex:40,display:'flex',alignItems:'center',justifyContent:'center'}}>
                                <div style={{textAlign:'center'}}>
                                  <IonSpinner color="danger" />
                                  <div style={{marginTop:8,color:'#333'}}>{loadingAddress ? 'Obteniendo ubicación...' : 'Enviando...'}</div>
                                </div>
                              </div>
                            )}
                            <IonGrid  className="ion-text-center ion-align-items-center" style={{ height: '100%' }}>
                                <IonRow className="ion-justify-content-center ion-align-items-center" style={{ height: '100%' }}>
                                    <IonCol size="12">
                                        <IonRow>
                                            <IonCol>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                      {loadingAddress ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', padding: 12 }}>
                                                          <IonSpinner  color="danger" name="crescent" />
                                                          <div style={{color:'black'}}>Obteniendo ubicación y dirección...</div>
                                                        </div>
                                                      ) : null}
                                                      <IonInput
                                                        style={{fontSize:20}}
                                                        label="Ingresar manualmente"
                                                        labelPlacement="floating"
                                                        fill="outline"
                                                        value={query}
                                                        disabled={loadingAddress || submitting}
                                                        onIonInput={(e: any) => {
                                                          const raw = e?.detail?.value;
                                                          const val = raw == null ? '' : String(raw);
                                                          updateQuery(val, 'input');
                                                          SearchLocation(val);
                                                          if (val.trim().length > 0) setAddressFailed(false);
                                                        }}
                                                        placeholder="Ejemplo: Calle Falsa 123, Springfield"
                                                        className="black-text"
                                                      />
                                                                                  {options.length > 0 && (
                                                                                    <IonList>
                                                                                      {options.map((opt: any, idx: number) => (
                                                                                        <IonItem key={idx} button onClick={async () => {
                                                                                          const text = opt.formatted_address || opt.display_name || '';
                                                                                          updateQuery(text, 'suggestion');
                                                                                          // try to set coords from the suggestion result (Google/Nominatim)
                                                                                          const c = getCoordsFromResult(opt);
                                                                                          if (c) {
                                                                                            setCoords(c);
                                                                                          } else {
                                                                                            // fallback: forward-geocode the chosen text
                                                                                            const f = await forwardGeocode(text);
                                                                                            if (f) setCoords(f);
                                                                                          }
                                                                                          setOptions([]);
                                                                                        }}>
                                                                                          <IonLabel>{opt.formatted_address || opt.display_name}</IonLabel>
                                                                                        </IonItem>
                                                                                      ))}
                                                                                    </IonList>
                                                                                  )}
                                                     
                                                    </div>
                                            </IonCol>
                                        </IonRow>
                                        <IonButton disabled={loadingAddress || submitting || !query || query.trim().length===0} className='brown-element' onClick={() => submitAddress(true)} style={{color:'#fff',fontWeight:'600'}} expand="block">Usar esta direccion</IonButton>
                                        <IonButton disabled={loadingAddress || submitting} className='brown-element' onClick={() => submitAddress(false)} style={{color:'#fff',fontWeight:'600'}} expand="block">No usar</IonButton>
                                    </IonCol>
                                </IonRow>
                            </IonGrid>
                        </IonContent>
                        <IonToast
                          isOpen={toastOpen}
                          onDidDismiss={() => setToastOpen(false)}
                          message={toastMsg}
                          duration={5000}
                          position="top"
                          color="secondary"
                        />
    
                    </IonModal>
  );
};

export default ModalLocation;