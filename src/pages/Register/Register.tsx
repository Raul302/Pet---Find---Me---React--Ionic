import React, { useState } from 'react';
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

    const payload = { fullName, email, password, phone };
    console.log('Register payload (mock):', payload);
    alert('Cuenta creada (mock). Serás redirigido al login.');
    // en producción aquí llamarías a la API de registro
    history.push('/login');
  };

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

                  <IonButton expand="block" onClick={handleRegister} className="text-wh-bol ion-margin-top brown-element">Crear cuenta</IonButton>

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
