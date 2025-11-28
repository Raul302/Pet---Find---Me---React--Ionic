import { IonCol, IonContent, IonHeader, IonPage, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import './Profile.css';
import AppHeader from '../../components/Header/AppHeader';

const Profile: React.FC = () => {
  return (
    <IonPage className="blank_page">
      <AppHeader />

      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Perfil</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonRow >
          <IonCol  size="12" className="ion-text-center">
            <img  width={'150px'} height={'150px'} src="/assets/images/not_image_example_user.png" alt="User profile Image" />
         </IonCol>
        </IonRow>
      </IonContent>

    
    </IonPage>
  );
};

export default Profile;
