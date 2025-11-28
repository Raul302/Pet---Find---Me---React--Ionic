// UserMenu.tsx
import React from 'react';
import {
  IonMenu,
  IonContent,
  IonList,
  IonItem,
  IonItemDivider,
  IonButton,
  IonIcon,
    IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonLabel
} from '@ionic/react';
import { close, logOut } from 'ionicons/icons';
import { menuController } from '@ionic/core';

const UserMenu: React.FC = () => {
  return (
    <IonMenu menuId="userMenu"  side="end" contentId="main-content">
      <IonContent className="item-personalized">
        <IonList className="list-customized">
          {/* header row */}
          <IonItem className="item-personalized" lines="none">
            <img
              src="/assets/images/logo_pet_find_me_sin_fondo_figma.png"
              alt="Logo Pet Find Me"
              style={{ height: '32px', marginRight: '8px' }}
            />
            <div style={{ flex: 1 }}></div>
            <IonButton fill="clear" 
            
              onClick={() => menuController.close('notificationsMenu')}
            >
              <IonIcon style={{ color: '#000' }} icon={close} />
            </IonButton>
          </IonItem>

          {/* divider line */}
          <IonItemDivider className="custom-divider" />

 {/* card with info */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Informacion</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p><strong>Name:</strong> Raul</p>
              <p><strong>Publciaciones:</strong> 54</p>
              <p><strong>Nivel:</strong> Platinum</p>
            </IonCardContent>
          </IonCard>



          {/* menu options */}
       <IonItem     routerLink="/perks" className='shotcut-personalized' button detail={true}>
        <IonLabel>
            <h2>Perfil</h2>
            <p>Edita tu informacion</p>
        </IonLabel>
        </IonItem>

  <IonItem  className='shotcut-personalized' button detail={true}>
        <IonLabel>
            <h2>Notificaciones</h2>
            <p>Visualiza tus notificaciones</p>
        </IonLabel>
        </IonItem>

         <IonItem  className='shotcut-personalized' button detail={true}>
          <IonIcon style={{color:'#000'}} slot="start" icon={logOut} />
        <IonLabel>
            <h2>Cerrar sesion</h2>
        </IonLabel>
        </IonItem>


        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default UserMenu;
