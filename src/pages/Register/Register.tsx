import api, { api_endpoint } from '../../config/api';
import React, { useState } from 'react';
import { useIonViewWillLeave } from '@ionic/react';
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
  IonSpinner
} from '@ionic/react';
import './Register.css';
import { useHistory } from 'react-router';

const Register: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; password?: string; confirmPassword?: string }>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const history = useHistory();

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!fullName.trim()) newErrors.fullName = 'El nombre es obligatorio';
    if (!email.trim()) newErrors.email = 'El correo es obligatorio';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Correo inválido';
    if (!password.trim()) newErrors.password = 'La contraseña es obligatoria';
    else if (password.length < 6) newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    if (confirmPassword !== password) newErrors.confirmPassword = 'Las contraseñas no coinciden';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = () => {
    if (!validate()) return;
    setServerError('');
    setLoading(true);
    (async () => {
      try {
          const resp = await fetch(api_endpoint + '/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullname: fullName,
            email,
            phone: phone || null,
            password,
            confirm_password: confirmPassword
          })
        });
        const data = await resp.json().catch(() => ({}));
        if (!resp.ok) {
          // backend returns { error: '...' }
          setServerError(data?.error || 'Error al crear la cuenta');
          setLoading(false);
          return;
        }

        cleanForm();
      
        // Redirect to login
        history.push('/login');
      } catch (err) {
        setServerError('No se pudo conectar con el servidor');
      } finally {
        setLoading(false);
      }
    })();
  };


  const cleanForm = () => {
      // clear form state after successful registration
        setFullName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setConfirmPassword('');
        setErrors({});
        setServerError('');
  }
  // Clear form when the view is about to be left (user navigates away)
  useIonViewWillLeave(() => {
    cleanForm()
  });

  return (
    <IonPage>
      <IonContent fullscreen className="register-page ion-padding">
        <IonGrid className="register-grid">
          <IonRow className="ion-justify-content-center ion-align-items-center">
            <IonCol sizeXs="12" sizeSm="8" sizeMd="6" sizeLg="4">
              <div className="centered-img-container">
                <img src="/assets/images/pet_find_me_logo.png" alt="Logo" className="register-img" />
              </div>

              <IonCard className="bck-white nobox">
                <IonCardHeader>
                  <IonCardTitle className="mntop text-color-black ion-text-center">Crear cuenta</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>

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

                  <IonInput
                    label="Nombre completo"
                    labelPlacement="floating"
                    fill="outline"
                    value={fullName}
                    onIonChange={e => setFullName(e.detail.value!)}
                    className="ion-margin-bottom"
                  />
                  {errors.fullName && <IonText color="danger"><p>{errors.fullName}</p></IonText>}

                  <IonInput
                    label="Correo electrónico"
                    labelPlacement="floating"
                    fill="outline"
                    type="email"
                    value={email}
                    onIonChange={e => setEmail(e.detail.value!)}
                    className="ion-margin-bottom"
                  />
                  {errors.email && <IonText color="danger"><p>{errors.email}</p></IonText>}

                  <IonInput
                    label="Teléfono (opcional)"
                    labelPlacement="floating"
                    fill="outline"
                    type="tel"
                    value={phone}
                    onIonChange={e => setPhone(e.detail.value!)}
                    className="ion-margin-bottom"
                  />

                  <IonInput
                    label="Contraseña"
                    labelPlacement="floating"
                    fill="outline"
                    type="password"
                    value={password}
                    onIonChange={e => setPassword(e.detail.value!)}
                    className="ion-margin-bottom"
                  />
                  {errors.password && <IonText color="danger"><p>{errors.password}</p></IonText>}

                  <IonInput
                    label="Confirmar contraseña"
                    labelPlacement="floating"
                    fill="outline"
                    type="password"
                    value={confirmPassword}
                    onIonChange={e => setConfirmPassword(e.detail.value!)}
                    className="ion-margin-bottom"
                  />
                  {errors.confirmPassword && <IonText color="danger"><p>{errors.confirmPassword}</p></IonText>}

                  <IonButton expand="block" onClick={handleRegister} className="text-wh-bol ion-margin-top brown-element" disabled={loading}>
                    {loading ? (
                      <>
                        <IonSpinner name="crescent" />&nbsp;Creando...
                      </>
                    ) : (
                      'Crear cuenta'
                    )}
                  </IonButton>

                  <IonText color="small">
                    <IonText className="text-color-black"> ¿Ya tienes cuenta? </IonText>
                  <IonText
                    className="underline-blue"
                    style={{ cursor: 'pointer' }}
                    onClick={() => history.push('/login')}
                    role="button"
                    tabIndex={0}
                  >
                    {' '}Entrar
                  </IonText>
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

export default Register;
