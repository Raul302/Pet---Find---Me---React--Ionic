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
  IonText,
  IonSpinner,
  useIonViewWillLeave
} from '@ionic/react';
import api, { api_endpoint } from '../../config/api';
import './Login.css';
import { useState } from 'react';
import { useHistory } from 'react-router';


const Login: React.FC = () => {

  
const [ email , set_email ] = useState('');
const [ password , set_password ] = useState('');

// Manejar errores de session
const [errors, set_errors] = useState<{ email?: string; password?: string }>({});
const [loading, set_loading] = useState(false);
const [serverError, setServerError] = useState('');


const history = useHistory();

const cleanForm = () => {
  set_email('');
  set_password('');
  set_errors({});
  setServerError('');
  set_loading(false);
}


const handleLogin = () => {
  if (!validate_form()) return;
  setServerError('');
  set_loading(true);
  (async () => {
    try {
      const resp = await fetch(api_endpoint + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setServerError(data?.error || 'Error en inicio de sesión');
        set_loading(false);
        return;
      }
      // store tokens if provided
      if (data.accessToken) localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      cleanForm();
      history.push('/location');
    } catch (err) {
      setServerError('No se pudo conectar con el servidor');
    } finally {
      set_loading(false);
    }
  })();
};

  // Clear form when the view is about to be left (user navigates away)
  useIonViewWillLeave(() => {
    cleanForm()
  });


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
                     {serverError && (
                                  <div style={{ marginBottom: 8 ,
                                    display:'flex', justifyContent: 'center',
                                    alignItems: 'center',
                                   backgroundColor: '#ffe6e6', padding: 8, borderRadius: 4 }}>
                                    <IonText
                                     style={{fontWeight: 'bold', justifyContent: 'center' , alignItems: 'center',
                                        textAlign: 'center'
                                     }} color="danger">{serverError}</IonText>
                                  </div>
                                )}
                <IonCardHeader>
                  <IonCardTitle className="mntop text-color-black ion-text-center">Login</IonCardTitle>
                  
                </IonCardHeader>
                <IonCardContent>

                <div className="centered-text-block">
                  <IonText className="text-color-black">¿No tienes una cuenta?</IonText>
                  <IonText
                    className="underline-blue"
                    style={{ cursor: 'pointer' }}
                    onClick={() => history.push('/register')}
                    role="button"
                    tabIndex={0}
                  >
                    {' '}Crea una cuenta y únete hoy mismo a la comunidad
                  </IonText>
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

                  <IonButton expand="block"  onClick={handleLogin} className="text-wh-bol ion-margin-top brown-element">Entrar</IonButton>
                  <IonText color="medium">
                    {/* <p className="ion-text-center ion-margin-top">¿Olvidaste tu contraseña?</p> */}
                  </IonText>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
        <div className="login-footer">Kiba Studios S.A de C.V <sup>®</sup></div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
