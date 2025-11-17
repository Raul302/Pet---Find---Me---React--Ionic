import {
  IonPage,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonInput,
  IonButton,
  IonText
} from '@ionic/react';
import './Login.css';
import { useState } from 'react';
import { useHistory } from 'react-router';


const Login: React.FC = () => {

  
const [ email , set_email ] = useState('');
const [ password , set_password ] = useState('');

// Manejar errores de session
const [errors, set_errors] = useState<{ email?: string; password?: string }>({});


const history = useHistory();


const handleLogin = () => {
  if (!validate_form()) return;

  history.push('/tabs/board');
  //call API 

  // if( response.ok ) {
    
  //   //redirect to Board
  //   history.push('/board'); // o la ruta que desees

  // }


}
const validate_form = () => {

    const newErrors: typeof errors = {};

  if (!email.trim()) {
    newErrors.email = 'El correo es obligatorio';
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    newErrors.email = 'Correo inválido';
  }

  if (!password.trim()) {
    newErrors.password = 'La contraseña es obligatoria';
  } else if (password.length < 6) {
    newErrors.password = 'Debe tener al menos 6 caracteres';
  }

  set_errors(newErrors);
  return Object.keys(newErrors).length === 0;
};



  return (
    <IonPage >
      <IonContent fullscreen className="login-page ion-padding">
        <IonGrid className="login-grid">
          <IonRow className="ion-justify-content-center ion-align-items-center">
            <IonCol sizeXs="12" sizeSm="8" sizeMd="6" sizeLg="4">
              <div className="centered-img-container">
                <img src="/assets/images/pet_find_me_logo.png" alt="Logo Pet find me" className="login-img" />
              </div>


              <IonCard className='bck-white nobox'>
                <IonCardHeader>
                  <IonCardTitle className="mntop text-color-black ion-text-center">Login</IonCardTitle>
                  
                </IonCardHeader>
                <IonCardContent>

                <div className="centered-text-block">
  <IonText className="text-color-black">¿No tienes una cuenta?</IonText>
  <IonText className="underline-blue"> Crea una cuenta y únete hoy mismo a la comunidad</IonText>
</div>
                  <IonInput
                    label="Correo electrónico"
                    labelPlacement="floating"
                    fill="outline"
                    type="email"
                    value={email}
                      onIonChange={(e) => set_email(e.detail.value!)}
                    className="top-spacing ion-margin-bottom"
                  />
                  {errors.email && <IonText color="danger"><p>{errors.email}</p></IonText>}

                  <IonInput
                    label="Contraseña"
                    labelPlacement="floating"
                    fill="outline"
                    type="password"
                    value={password}
                      onIonChange={(e) => set_password(e.detail.value!)}
                    className="ion-margin-bottom"
                  />
                  {errors.password && <IonText color="danger"><p>{errors.password}</p></IonText>}

                  <IonButton expand="block"  onClick={handleLogin} className="text-wh-bol ion-margin-top">Entrar</IonButton>
                  <IonText color="medium">
                    <p className="ion-text-center ion-margin-top">¿Olvidaste tu contraseña?</p>
                  </IonText>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Login;
