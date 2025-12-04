import {
  IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonModal,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonInput,
  IonToast,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/react';
import { useContext, useEffect, useState } from 'react';
import './QuestionPlace.css';
import { Geolocation } from '@capacitor/geolocation';
import { mapsApiKey } from '../../assets/DontBackup/Credentials';
import { useRef } from 'react';
import { IonSpinner } from '@ionic/react';
import api, { api_endpoint } from '../../config/api';

import { Capacitor } from '@capacitor/core';
import { useHistory } from 'react-router';
import { AuthContext } from '../../hooks/Context/AuthContext/AuthContext';

const QuestionPlace: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [query, setQuery] = useState('');
  const [addressFailed, setAddressFailed] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const mountedRef = useRef(true);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [options, setOptions] = useState<any[]>([]);
  const searchTimeout = useRef<number | null>(null);
  const queryRef = useRef(query);
  const [submitting, setSubmitting] = useState(false);
  const { updateUser } = useContext(AuthContext) as any;

  const [address,address_formated] = useState('');

  // keep ref in sync
  useEffect(() => { queryRef.current = query; }, [query]);

  // central setter to help diagnose/avoid overwrites
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

  // debug: use updateQuery logs instead of global query log

  const history = useHistory();


    async function canDismiss(data?: any, role?: string) {
        return role !== 'gesture';
    }

 useEffect(() => {
  if (isOpen) {
    setLoadingAddress(true);
    if (Capacitor.getPlatform() === 'web') {
      // navegador
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCoords(c);
          const coordStr = `${c.lat.toFixed(6)}, ${c.lng.toFixed(6)}`;
          const addr = await getAddressWithRetries(c.lat, c.lng, 3, 700);
            if (addr) {
              setQuery(addr);
              // updateQuery(addr);
              setAddressFailed(false);
            } else {
             if (!toastOpen) {
                setToastMsg('No se pudo obtener la dirección automáticamente. Por favor, escríbela manualmente.');
                setToastOpen(true);
              }
            }
          setLoadingAddress(false);
        },
        (err) => {
          console.error('Error web:', err);
          // PERMISSION_DENIED === 1
          if (err && err.code === 1) {
            setAddressFailed(true);
            setToastMsg('No se concedieron permisos de ubicación. Por favor, escribe la dirección manualmente.');
            setToastOpen(true);
          }
          setLoadingAddress(false);
        }
      );
    } else {
      // móvil con Capacitor
      
    (async () => {

        try {
          setLoadingAddress(true);
          // 🔑 Verificar permisos actuales
          const permStatus = await Geolocation.checkPermissions();

          if (permStatus.location !== 'granted') {
            // 🔑 Si no están concedidos, pedirlos
            const req = await Geolocation.requestPermissions();
            if (req.location !== 'granted') {
              // usuario negó permisos
              setAddressFailed(true);
              setToastMsg('No se concedieron permisos de ubicación. Por favor, escribe la dirección manualmente.');
              setToastOpen(true);
              setLoadingAddress(false);
              return;
            }
          }

          // 🔑 Obtener ubicación
          const pos = await Geolocation.getCurrentPosition();
          const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCoords(c);
          const coordStr = `${c.lat.toFixed(6)}, ${c.lng.toFixed(6)}`;
          const addr = await getAddressWithRetries(c.lat, c.lng, 3, 700);
          if (mountedRef.current) {
            if (addr ) {
              updateQuery(addr, 'geolocation', c);
              setAddressFailed(false);
            } else {
              updateQuery(addr, 'geolocation', c);
              setAddressFailed(true);
              if (!toastOpen) {
                setToastMsg('No se pudo obtener la dirección automáticamente. Por favor, escríbela manualmente.');
                setToastOpen(true);
              }
            }
          }
          // mobile position received
          setLoadingAddress(false);
        } catch (err) {
          console.error("Error al obtener ubicación:", err);
          setLoadingAddress(false);
        }
      })();
    }
  }
}, [isOpen]);

useEffect(() => {
  return () => {
    mountedRef.current = false;
  };
}, []);

// end debug
// reverse geocode helper
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



 
  // Submit address to backend. Called by both buttons (accept=true for 'Usar esta direccion', accept=false for 'No usar')
  const submitAddress = async (accept: boolean) => {

    // if still loading address, don't allow
    if (loadingAddress || submitting) return;

  
    setSubmitting(true);
    try {
      const payload = {
        address_preference: accept ? (query || null ) : "not_address",
        coords: accept ? (coords || null ) : null, 
        accepted: accept,
      };

      // NOTE: adjust endpoint to your backend. Current default: `${api_endpoint}/location/update`
     
        await updateUser?.(payload, true);

      setToastMsg('Dirección enviada correctamente.');
      setToastOpen(true);
     // esperar 3 segundos antes de redirigir
          setTimeout(() => {
           setIsOpen(false);
            history.push('/tabs/board');

          }, 2000);
          
    } catch (err: any) {
      console.error('submitAddress error', err);
      setToastMsg('Error al enviar la dirección. Intenta nuevamente.');
      setToastOpen(true);
    } finally {
      setSubmitting(false);
    }
  };
    return (
        <IonPage >
            <IonContent fullscreen>

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
                        <IonGrid className="ion-text-center ion-align-items-center" style={{ height: '100%' }}>
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

                                                  <IonLabel style={{ fontWeight: '600', fontSize: 16, color: addressFailed ? 'red' : 'black' }}>
                                                    Los resultados se basan en tu ubicación actual ( Radio de 5KM). Si no es correcta, ingresa la dirección manualmente o elige ver sin reestricciones de ubicacion
                                                  </IonLabel>
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
                                                        <IonItem key={idx} button onClick={() => { updateQuery(opt.formatted_address || opt.display_name || '', 'suggestion',opt.geometry.location); setOptions([]); }}>
                                                          <IonLabel>{opt.formatted_address || opt.display_name}</IonLabel>
                                                        </IonItem>
                                                      ))}
                                                    </IonList>
                                                  )}
                                                 
                                                </div>
                                        </IonCol>
                                    </IonRow>
                                    <IonButton disabled={loadingAddress || submitting || !query || query.trim().length===0} className='brown-element' onClick={() => submitAddress(true)} style={{color:'#fff',fontWeight:'600'}} expand="block">Usar esta direccion</IonButton>
                                    <IonButton disabled={loadingAddress || submitting} className='brown-element' 
                                    onClick={() => submitAddress(false)} style={{color:'#fff',fontWeight:'600'}} expand="block">Sin direccion</IonButton>
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
            </IonContent>
        </IonPage>
    );
};

export default QuestionPlace;
