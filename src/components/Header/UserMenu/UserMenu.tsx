// UserMenu.tsx
import React, { useContext } from 'react';
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
import { close, logOut, ribbonOutline, ribbonSharp } from 'ionicons/icons';
import { menuController } from '@ionic/core';
import { api_endpoint } from '../../../config/api';
import { AuthContext } from '../../../hooks/Context/AuthContext/AuthContext';
import { useHistory } from 'react-router';

const UserMenu: React.FC = () => {

  const history = useHistory();
  const data_user = JSON.parse(localStorage.getItem('data_user') || '{}');
  const { logout } = useContext(AuthContext);
  const handleLogout = async () => {

    logout();
  };

  return (
    <IonMenu menuId="userMenu" side="end" contentId="main-content">
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
            <IonMenuToggle autoHide={true}>

            <IonButton fill="clear"

onClick={() => menuController.close('userMenu')}
>
              <IonIcon style={{ color: '#000' }} icon={close} />
            </IonButton>
          </IonMenuToggle>
          </IonItem>

          {/* divider line */}
          <IonItemDivider className="custom-divider" />

          {/* card with info */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Informacion</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div style={{display:'flex',justifyContent:'center',alignItems:'center',textAlign:'center'}}>
                  <IonIcon size='large' style={{
                    color: data_user?.score <= 10?'yellow' : data_user?.score <= 20 ? 'blue' : 'purple'
                    
                    }} slot="start" icon={ribbonSharp} />

              </div>
              <p><strong>Name:</strong> {data_user.fullname}</p>
              <p><strong>Email:</strong> {data_user.email}</p>
              <p><strong>Telefono:</strong> {data_user.phone}</p>
              <p><strong>Reputacion:</strong> {data_user.score}</p>
             
            </IonCardContent>
          </IonCard>



<IonMenuToggle autoHide={true}>

            <IonItem className='shotcut-personalized' button detail={true
              
            } 
            onClick={async () => {
              // optional: small delay to let the toggle finish closing animation
              await new Promise(r => setTimeout(r, 50));
              logout();
            }}
            
            >
              <IonIcon style={{ color: '#000' }} slot="start" icon={logOut} />
              <IonLabel>
                <h2>Cerrar sesion</h2>
              </IonLabel>
            </IonItem>
              </IonMenuToggle>


        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default UserMenu;
