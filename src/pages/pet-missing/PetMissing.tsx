import React, { useState, useRef } from 'react';
import { IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonHeader, IonIcon, IonImg, IonInput, IonItem, IonList, IonPage, IonRow, IonSelect, IonSelectOption, IonText, IonTextarea, IonTitle, IonToolbar, IonButton, IonLabel } from '@ionic/react';
import './PetMissing.css';
import AppHeader from '../../components/Header/AppHeader';
import { camera, images } from 'ionicons/icons';
import { usePhotoGallery } from '../../hooks/Gallery/UsePhotoGallery';
import Map from '../../components/Map/Map'
import { mapsApiKey } from '../../assets/DontBackup/Credentials';


const PetMissing: React.FC = () => {

    const { photos, takePhoto } = usePhotoGallery();
    const [keywords, setKeywords] = useState<string[]>([]);
    const [newKeyword, setNewKeyword] = useState<string>('');
    const inputRef = useRef<any>(null);
    const [address, setAddress] = useState('');
    const [showFab, setShowFab] = useState(true);

    const [ location_options , set_location_options]  = useState<Object[]>([]);
    const [query, setQuery] = useState('');
  const [options, setOptions] = useState<any[]>([]);
  const [selected, setSelected] = useState('');

let timeout: NodeJS.Timeout;
  const SearchLocation = (e: string) => {

    console.log('E',e);
  const query = e;
  clearTimeout(timeout);

  timeout = setTimeout(async () => {
    if (!query ) return;

    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=`+mapsApiKey
    );

   const data = await res.json();
   console.log('DATA',data);
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

    console.log('PHOTOS', photos.length, 'KEYWORDS', keywords);

    return (
        <IonPage>
            <AppHeader />

            <IonContent fullscreen
            scrollEvents={true}

                              onIonScroll={(e) => {
                        const scrollTop = e.detail.scrollTop;
                        setShowFab(scrollTop < 50) ; // solo mostrar si está cerca del top
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
                            <IonInput
                                label="Nombre de la mascota"
                                labelPlacement="floating"
                                fill="outline"
                                placeholder='Rufino'
                                className="top-spacing ion-margin-bottom black-text"
                            />
                        </IonCol>
                    </IonRow>

                    <IonRow
                      
  >
                        <IonCol >
                            <h2 className='subtitle'>Descripcion</h2>
                            <IonTextarea
                                label="Descripcion"
                                labelPlacement="floating"
                                fill="outline"
                                autoGrow={true}
                                placeholder='Responde al nombre de _____ , caucasico , tiene un lunar en ____'
                                className='top-spacing ion-margin-bottom black-text custom-outline'
                            />
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol>
                            <h2 className='subtitle'>Recompensa</h2>
                            <IonItem>
                                <IonSelect fill='outline' label="Recompensa" placeholder="Recompensa">
                                    <IonSelectOption value="si">Si</IonSelectOption>
                                    <IonSelectOption value="no">No</IonSelectOption>
                                </IonSelect>
                            </IonItem>
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        <IonCol>
                            <h2 className='subtitle'>Señas particulares</h2>

                            <IonItem>
                                <IonInput
                                    ref={inputRef}
                                    placeholder="Agregar palabra clave"
                                    value={newKeyword}
                                    onIonChange={(e) => setNewKeyword(e.detail.value ?? '')}
                                    onKeyDown={(e: any) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
                                    onKeyUp={(e: any) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
                                />
                                <IonButton onClick={(e) => addKeyword()}>Agregar</IonButton>
                            </IonItem>

                            <div className="keywords-row">
                                {keywords.map((kw, kidx) => (
                                    <div className="keyword-wrapper" key={kidx}>
                                        <IonButton
                                            fill="clear"
                                            className="keyword-chip"
                                            onClick={() => console.log('keyword clicked', kw)}
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
                        className="top-spacing ion-margin-bottom black-text"
                        />
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
                  setQuery(opt.formatted_address); // ✅ llena el input con la opción elegida
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
                        <IonCol style={{ justifyContent:'center',aligItems:'center',textAlign:'center' , marginBottom:'20px'}} size='12'>
                            {/* <h2 className='subtitle'>Ultima Ubicacion conocida</h2>
                            <Map onLocationSelect={(lat, lng, addr) => setAddress(addr)} /> */}

                            <IonButton color="success">Publicar</IonButton>
                                                

                        </IonCol>
                    </IonRow>
                    

                      

                </div>

               { showFab &&
               
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

