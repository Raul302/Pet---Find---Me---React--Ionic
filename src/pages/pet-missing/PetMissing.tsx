import React, { useState, useRef } from 'react';
import { IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonHeader, IonIcon, IonImg, IonInput, IonItem, IonList, IonPage, IonRow, IonSelect, IonSelectOption, IonText, IonTextarea, IonTitle, IonToolbar, IonButton, IonLabel, useIonViewWillLeave } from '@ionic/react';
import { IonToast } from '@ionic/react';
import './PetMissing.css';
import AppHeader from '../../components/Header/AppHeader';
import { camera, images } from 'ionicons/icons';
import { usePhotoGallery } from '../../hooks/Gallery/UsePhotoGallery';
import Map from '../../components/Map/Map'
import { mapsApiKey } from '../../assets/DontBackup/Credentials';
import api, { api_endpoint } from '../../config/api';


const PetMissing: React.FC = () => {

  const { photos, takePhoto, clearPhotos } = usePhotoGallery();
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState<string>('');
  const inputRef = useRef<any>(null);
  const [address, setAddress] = useState('');
  const [showFab, setShowFab] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rewardValue, setRewardValue] = useState('no');
  const [submitting, setSubmitting] = useState(false);
  const [coordsState, setCoordsState] = useState<{ lat: number, lng: number } | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const [location_options, set_location_options] = useState<Object[]>([]);
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<any[]>([]);
  const [selected, setSelected] = useState('');

  let timeout: NodeJS.Timeout;
  const SearchLocation = (e: string) => {
    const query = e;
    clearTimeout(timeout);

    timeout = setTimeout(async () => {
      if (!query) return;

      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=` + mapsApiKey
      );

      const data = await res.json();
      setOptions(data.results || []);
    }, 500); // espera 500ms antes de llamar
  };


  const addKeyword = async () => {
    const kw = (newKeyword || '').trim();
    if (!kw) return;
    if (keywords.includes(kw)) { setNewKeyword(''); return; }
    setKeywords((prev) => [kw, ...prev]);
    setNewKeyword('');

  };

  const removeKeyword = (kw: string) => setKeywords((prev) => prev.filter((k) => k !== kw));



  const cleanForm = () => {

    // clear stored photos and optional form state
    try {
      if (clearPhotos) clearPhotos();
    } catch (e) {
      console.warn('cleanForm error', e);
    }
  }

  // Validate required fields: all fields must be present
  const getMissingFields = (): string[] => {
    const missing: string[] = [];
    if (!name || !name.trim()) missing.push('Nombre');
    if (!description || !description.trim()) missing.push('Descripción');
    if (!rewardValue || !String(rewardValue).trim()) missing.push('Recompensa');
    if (!keywords || keywords.length === 0) missing.push('Señas particulares');
    if (!(query || address)) missing.push('Última ubicación conocida');
    if (!photos || photos.length === 0) missing.push('Fotos');
    return missing;
  };

  const isFormValid = getMissingFields().length === 0;


   useIonViewWillLeave(() => {
      cleanForm()
    });
  
  
  const submitReport = async () => {
    if (submitting) return;
    const missing = getMissingFields();
    if (missing.length > 0) {
      setToastMsg('Faltan campos obligatorios: ' + missing.join(', '));
      setToastOpen(true);
      return;
    }
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('name', name || '');
      form.append('description', description || '');
      form.append('reward', rewardValue || 'no');

      // Hardcoded properties
      form.append('status_pet','desaparecido');
      form.append('status_post','pendiente');
      if (keywords && keywords.length > 0) form.append('keywords', JSON.stringify(keywords));
      form.append('address', query || address || '');
      if (coordsState) form.append('coords', JSON.stringify(coordsState));

      // photos array processed for upload

      // Attach photos robustly
      for (const p of photos) {
        // Case A: p is a File (browser file input)
        if (p instanceof File) {
          form.append('photos', p, p.name);
          continue;
        }

        // Case B: object with file prop (maybe wrapped File)
        if ((p as any).file && (p as any).file instanceof File) {
          form.append('photos', (p as any).file, (p as any).file.name);
          continue;
        }

        // Case C: URI (public url). Try fetch -> blob (may fail with CORS)
        const uri = p.webviewPath || p.filepath;
        if (uri && typeof uri === 'string') {
          try {
            const r = await fetch(uri);
            if (!r.ok) throw new Error('Fetch image failed: ' + r.status);
            const blob = await r.blob();
            const name = p.filepath ? p.filepath.split('/').pop() || `photo-${Date.now()}.jpg` : `photo-${Date.now()}.jpg`;
            form.append('photos', blob, name);
            continue;
          } catch (e) {
            console.warn('No se pudo fetch la URI de la foto, se omitirá:', uri, e);
            continue;
          }
        }

        console.warn('Foto con formato no soportado, omitiendo:', p);
      }

      // Debug: list FormData entries (not all browsers allow iterating files in console but good for quick check)
      // Do not log FormData entries in production

      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {};

      // Send token to Endpoint -> Mandatory
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const resp = await fetch(`${api_endpoint}/pets`, {
        method: 'POST',
        headers, // NO Content-Type
        body: form,
      });

      const text = await resp.text();

      if (!resp.ok) {
        let errMsg = text;
        try { const json = JSON.parse(text); errMsg = json.error || JSON.stringify(json); } catch (e) { }
        throw new Error(errMsg || `HTTP ${resp.status}`);
      }

      let created;
      try { created = JSON.parse(text); } catch (e) { created = text; }

      setToastMsg('Reporte publicado correctamente');
      setToastOpen(true);
      setName(''); setDescription(''); setKeywords([]); setQuery(''); setCoordsState(null);
      // clear local photos after successful submit
      try { if (clearPhotos) await clearPhotos(); } catch (e) { console.warn('clearPhotos after submit', e); }
    } catch (err) {
      console.error('submitReport error', err);
      setToastMsg('Error al publicar el reporte: ' + ((err as Error)?.message || ''));
      setToastOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <IonPage>
      <AppHeader />

      <IonContent fullscreen
        scrollEvents={true}

        onIonScroll={(e) => {
          const scrollTop = e.detail.scrollTop;
          setShowFab(scrollTop < 50); // solo mostrar si está cerca del top
        }}
      >
        <IonGrid className='carousel-wrapper'>
          <IonRow>
            {photos.length > 0 ? (
              photos.map((photo) => (
                <IonCol size="3" key={photo.filepath}>
                  <IonImg src={photo.webviewPath} />
                </IonCol>
              ))
            ) : (
              <IonCol size="12" className="ion-text-center">
                <img src="/assets/images/not_image_example.png" alt="Pet profile Image" />
              </IonCol>
            )}
          </IonRow>
        </IonGrid>

        <div className='carousel-wrapper paddding-report'>
          <IonRow>
            <IonCol>
              <h2 className='subtitle'>Nombre</h2>
              <div className="input-box top-spacing ion-margin-bottom">
                <IonInput
                  label="Nombre de la mascota"
                  labelPlacement="floating"
                  fill="outline"
                  value={name}
                  onIonInput={(e: any) => setName(e.detail.value ?? '')}
                  placeholder='Rufino'
                  className="black-text"
                />
              </div>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2 className='subtitle'>Descripcion</h2>
              <div className="input-box top-spacing ion-margin-bottom">
                <IonTextarea
                  label="Descripcion"
                  labelPlacement="floating"
                  fill="outline"
                  autoGrow={true}
                  placeholder='Responde al nombre de _____ , caucasico , tiene un lunar en ____'
                  value={description}
                  onIonInput={(e: any) => setDescription(e.detail.value ?? '')}
                  className='black-text custom-outline'
                />
              </div>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2 className='subtitle'>Recompensa</h2>
              <IonItem>
                <div style={{ width: '100%' }}>
                  <IonSelect value={rewardValue} onIonChange={(e: any) => setRewardValue(e.detail.value)} fill='outline' label="Recompensa" placeholder="Recompensa">
                    <IonSelectOption value="si">Si</IonSelectOption>
                    <IonSelectOption value="no">No</IonSelectOption>
                  </IonSelect>
                </div>
              </IonItem>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <h2 className='subtitle'>Señas particulares</h2>

              <IonItem>
                <div style={{ flex: 1, marginRight: 8 }}>
                  <IonInput
                    ref={inputRef}
                    placeholder="Agregar palabra clave"
                    value={newKeyword}
                    onIonChange={(e) => setNewKeyword(e.detail.value ?? '')}
                    onKeyDown={(e: any) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
                    onKeyUp={(e: any) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
                  />
                </div>
                <IonButton onClick={(e) => addKeyword()}>Agregar</IonButton>
              </IonItem>

              <div className="keywords-row">
                {keywords.map((kw, kidx) => (
                  <div className="keyword-wrapper" key={kidx}>
                    <IonButton
                      fill="clear"
                      className="keyword-chip"
                      // onClick={() => setSearchText(kw.toString())}
                      aria-label={`Filtrar por ${kw}`}
                    >
                      <i className="fa-solid fa-hashtag" aria-hidden="true" />
                      <span style={{ fontSize: 12 }} className="keyword-text">{kw}</span>
                    </IonButton>
                    <button className="remove-keyword" onClick={() => removeKeyword(kw)} aria-label={`Eliminar ${kw}`}>&times;</button>
                  </div>
                ))}
              </div>
            </IonCol>
          </IonRow>


          <IonRow>
            <IonCol>
              <div className="input-box top-spacing ion-margin-bottom">
                <IonInput
                  label="Última ubicación conocida"
                  labelPlacement="floating"
                  fill="outline"
                  value={query}
                  onIonInput={(e: any) => {
                    const val = e.detail.value;
                    setQuery(val);
                    SearchLocation(val);
                  }}
                  placeholder="Ejemplo: Calle Falsa 123, Springfield"
                  className="black-text"
                />
              </div>
            </IonCol>
          </IonRow>

          {/* Lista de sugerencias debajo del input */}
          {options.length > 0 && (
            <IonList>
              {options.map((opt, idx) => (
                <IonItem
                  key={idx}
                  button
                  onClick={() => {
                    setQuery(opt.formatted_address);
                    // save coords if returned by Google
                    try {
                      const loc = opt.geometry && opt.geometry.location;
                      if (loc && typeof loc.lat === 'number' && typeof loc.lng === 'number') {
                        setCoordsState({ lat: loc.lat, lng: loc.lng });
                      }
                    } catch (e) {
                      // ignore
                    }
                    setOptions([]); // limpia la lista
                  }}
                >
                  <IonLabel>{opt.formatted_address}</IonLabel>
                </IonItem>
              ))}
            </IonList>
          )}

                    // {/* Here we are going to show the map */}
          <IonRow>
            <IonCol style={{ justifyContent: 'center', aligItems: 'center', textAlign: 'center', marginBottom: '20px' }} size='12'>
              {/* <h2 className='subtitle'>Ultima Ubicacion conocida</h2>
                            <Map onLocationSelect={(lat, lng, addr) => setAddress(addr)} /> */}

              <IonButton color="success" disabled={submitting || !isFormValid} onClick={submitReport}>Publicar</IonButton>
              <IonToast isOpen={toastOpen} message={toastMsg} onDidDismiss={() => setToastOpen(false)} duration={4000} />


            </IonCol>
          </IonRow>




        </div>

        {showFab &&

          <IonFab vertical="bottom" horizontal="center" slot="fixed">
            <IonFabButton onClick={() => takePhoto()}>
              <IonIcon style={{ color: '#fff' }} icon={camera} />
            </IonFabButton>
          </IonFab>

        }
      </IonContent>
    </IonPage>
  );
};

export default PetMissing;

