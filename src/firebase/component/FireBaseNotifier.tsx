import React, { useState, useEffect } from 'react';
import { IonToast } from '@ionic/react';
import { onMessage } from "firebase/messaging";
import { firebaseConfig } from "../firebaseConfig"; // importa tu instancia
import { initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";
interface NotificationPayload {
  notification?: {
    title?: string;
    body?: string;
  };
}

const FireBaseNotifier: React.FC = () => {

    
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const messaging = getMessaging(app);
    


  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    onMessage(messaging, (payload: NotificationPayload) => {
      console.log("Mensaje recibido en foreground:", payload);
      const { title, body } = payload.notification || {};
      setToastMessage(`${title || 'Notificación'}: ${body || ''}`);
      setShowToast(true);
    });
  }, []);

  return (
    <IonToast
      isOpen={showToast}
      message={toastMessage}
      duration={3000}
      color={"primary"}
      position='top'
      onDidDismiss={() => setShowToast(false)}
    />
  );
};

export default FireBaseNotifier;
