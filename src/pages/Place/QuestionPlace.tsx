import {
    IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonModal,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    IonInput,
} from '@ionic/react';
import { useEffect, useState } from 'react';
import './QuestionPlace.css';
import { Geolocation } from '@capacitor/geolocation';

import { Capacitor } from '@capacitor/core';
import { useHistory } from 'react-router';

const QuestionPlace: React.FC = () => {

    console.log('QUESTIONPLACE MOUNTED');

  const [isOpen, setIsOpen] = useState(true);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const history = useHistory();


    async function canDismiss(data?: any, role?: string) {
        return role !== 'gesture';
    }

 useEffect(() => {
  if (isOpen) {
    if (Capacitor.getPlatform() === 'web') {
      // navegador
      navigator.geolocation.getCurrentPosition(
        (pos) => console.log("Web:", pos.coords),
        (err) => console.error("Error web:", err)
      );
    } else {
      // móvil con Capacitor
      (async () => {
        try {
          // 🔑 Verificar permisos actuales
          const permStatus = await Geolocation.checkPermissions();
          console.log("Estado de permisos:", permStatus);

          if (permStatus.location !== 'granted') {
            // 🔑 Si no están concedidos, pedirlos
            await Geolocation.requestPermissions();
          }

          // 🔑 Obtener ubicación
          const pos = await Geolocation.getCurrentPosition();
          setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          console.log("Móvil:", pos.coords);
        } catch (err) {
          console.error("Error al obtener ubicación:", err);
        }
      })();
    }
  }
}, [isOpen]);



  const saveAddressUser = () => {
    setIsOpen(false);
      history.push('/tabs/board');
  }
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
                    <IonContent className="custom-modal-location">
                        <IonGrid className="ion-text-center ion-align-items-center" style={{ height: '100%' }}>
                            <IonRow className="ion-justify-content-center ion-align-items-center" style={{ height: '100%' }}>
                                <IonCol size="12">
                                    <IonRow>
                                        <IonCol>
                                            <IonInput
                                            style={{fontSize:20}}
                                                label="Ingresar manualmente"
                                                labelPlacement="floating"
                                                fill="outline"
                                                // value={query}
                                                // onIonInput={(e: any) => {
                                                //     const val = e.detail.value;
                                                //     setQuery(val);
                                                //     SearchLocation(val);
                                                // }}
                                                placeholder="Ejemplo: Calle Falsa 123, Springfield"
                                                className="black-text"
                                            />
                                        </IonCol>
                                    </IonRow>
                                    <IonButton  className='brown-element' onClick={saveAddressUser} style={{color:'#fff',fontWeight:'600'}} expand="block">Recordar</IonButton>
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    </IonContent>

                </IonModal>
            </IonContent>
        </IonPage>
    );
};

export default QuestionPlace;
