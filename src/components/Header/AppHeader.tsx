import React from 'react';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon
} from '@ionic/react';
import { personCircleOutline, notificationsOutline } from 'ionicons/icons';

const AppHeader: React.FC = () => (
  <IonHeader>
    <IonToolbar className="logo-toolbar">
      <IonButtons slot="start">
        <img
          src="/assets/images/logo_pet_find_me_sin_fondo_figma.png"
          alt="Logo Pet Find Me"
          className="logo-img"
        />
      </IonButtons>

      <IonButtons slot="end">
        <IonButton>
          <IonIcon style={{ color: '#4ca5f8' }} icon={personCircleOutline} />
        </IonButton>
        <IonButton>
          <IonIcon style={{ color: '#4ca5f8' }} icon={notificationsOutline} />
        </IonButton>
      </IonButtons>
    </IonToolbar>
  </IonHeader>
);

export default AppHeader;