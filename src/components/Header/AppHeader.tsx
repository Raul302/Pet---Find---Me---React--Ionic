import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonPopover,
  IonList,
  IonItem,
  IonMenu,
  IonContent,
  IonMenuButton,
  IonItemDivider
} from '@ionic/react';
import { personCircleOutline, notificationsOutline, close } from 'ionicons/icons';
import React, { useState } from 'react';
import './AppHeader.css';
import UserMenu from './UserMenu/UserMenu';
import NotificationsMenu from './NotificationsMenu/NotificationsMenu';

const AppHeader: React.FC = () => {
  const [showPopoverUserProfile, setShowPopoverUserProfile] = useState(false);
  const [event, setEvent] = useState<MouseEvent | undefined>(undefined);

  return (
      <>
        <IonHeader>
          <IonToolbar  id="main-content" className="logo-toolbar">
            <IonButtons slot="start">
              <img
                src="/assets/images/logo_pet_find_me_sin_fondo_figma.png"
                alt="Logo Pet Find Me"
                className="logo-img"
              />
            </IonButtons>

            <IonButtons slot="end">
              <IonMenuButton menu="userMenu">
                <IonIcon style={{ color: 'var(--color-primary)' }} icon={personCircleOutline} />
            </IonMenuButton>
              <IonMenuButton menu="notificationsMenu">
                <IonIcon style={{ color: 'var(--color-primary)' }} icon={notificationsOutline} />
              </IonMenuButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

    <UserMenu/>
    {/* <NotificationsMenu/> */}
      </>
  );
};

export default AppHeader;
