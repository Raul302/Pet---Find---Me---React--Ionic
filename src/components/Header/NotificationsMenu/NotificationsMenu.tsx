// UserMenu.tsx
import React, { useRef } from 'react';
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
  IonLabel,
  IonMenuToggle
} from '@ionic/react';
import { cart, chatbubbleOutline, close, mailUnread, mailUnreadOutline, ribbonOutline, thumbsUp } from 'ionicons/icons';
import { menuController } from '@ionic/core';

const NotificationsMenu: React.FC = () => {
  const menuRef = useRef<HTMLIonMenuElement>(null);


  return (
<IonMenu ref={menuRef} menuId="notificationsMenu" side="end" contentId="main-content">
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
              onClick={async () => {
      await (menuRef.current as any)?.setOpen(false); // reliable close
    }}
              >
                <IonIcon style={{ color: '#000' }} icon={close} />
              </IonButton>

          </IonItem>

          {/* divider line */}
          <IonItemDivider className="custom-divider" />

          {/* menu options */}
          <IonItem routerLink="/perks" className='shotcut-personalized' button detail={true}>
            <IonIcon style={{ color: '#000' }} size='small' slot="start" icon={thumbsUp} />

            <IonLabel>
              <p>Paulina recomendo tu publicacion</p>
            </IonLabel>
          </IonItem>

          <IonItem routerLink="/perks" className='shotcut-personalized' button detail={true}>
            <IonIcon style={{ color: '#000' }} size='small' slot="start" icon={mailUnreadOutline} />

            <IonLabel>
              <p>Jorgais quiere ponerse en contacto contigo</p>
            </IonLabel>
          </IonItem>

          <IonItem className='shotcut-personalized' button detail={true}>
            <IonIcon style={{ color: '#000' }} size='small' slot="start" icon={chatbubbleOutline} />
            <IonLabel>
              <p>Gera comento</p>
            </IonLabel>
          </IonItem>

          <IonItem className='shotcut-personalized' button detail={true}>
            <IonIcon style={{ color: '#000' }} slot="start" icon={ribbonOutline} />
            <IonLabel>
              <p>Ganaste una insignia</p>
            </IonLabel>
          </IonItem>


        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default NotificationsMenu;
