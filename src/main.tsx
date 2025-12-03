import React, { useContext, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Font Awesome (icons as CSS classes)
import '@fortawesome/fontawesome-free/css/all.min.css';

import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { AuthContext, AuthProvider } from './hooks/Context/AuthContext/AuthContext';
import { IonReactRouter } from '@ionic/react-router';

// Service workers
import { registerSW } from 'virtual:pwa-register';

// Firebase
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { firebaseConfig } from "./firebase/firebaseConfig";


defineCustomElements(window);


// Service workers
const updateSW = registerSW({
  onNeedRefresh() {
    alert("Nueva versión disponible, actualizando...");
    updateSW(true);
    // if (confirm("Hay una nueva versión disponible. ¿Quieres actualizar?")) {
    //   updateSW(true); 
    // }
    console.log("PROBADO AUTOUPDATE SERVICE WORKERS");
  },
  onOfflineReady() {
    console.log("PROBANDO sin conexion - OFFLINE - TEST ");
  },
});


// ======================================== FIREBASE CONFIG =========================================================================

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Registrar el service worker de FCM y usarlo para obtener el token
async function registerFcmServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn("Service Workers no soportados en este navegador.");
    return null;
  }
  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log("FCM Service Worker registrado:", registration);
    return registration;
  } catch (err) {
    console.error("Error registrando FCM SW:", err);
    return null;
  }
}


const { user } = useContext(AuthContext);
useEffect(() => { 

  if(user){
    initFCM();
  }

}, [user]);

// Pedir permiso y obtener token FCM
async function initFCM() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn("Permiso de notificaciones no concedido:", permission);
      return;
    }

    const swReg = await registerFcmServiceWorker();
    const token = await getToken(messaging, {
      vapidKey: "BPojyZk6LJYkK-zr_U66xzueqx5akAL6WOw2mttaREftTk_TdQKkIaPefl_CShd7vkqhgMLbBl1r0BW6IzAz38g",
      serviceWorkerRegistration: swReg || undefined
    });

    if (!token) {
      console.warn("No se obtuvo token FCM (posible bloqueo del navegador).");
      return;
    }
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      console.error("No hay accessToken, el usuario no está autenticado.");
      return;
}
    console.log("FCM Token:", token);

    // Enviar token a tu backend para guardarlo por usuario
    await fetch("https://api.lrpm.space/api/save-fcm-token", {
      method: "POST",
      headers: { "Content-Type": "application/json",
        'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
       },
      body: JSON.stringify({ token })
    });
  } catch (err) {
    console.error("Error inicializando FCM:", err);
  }
}

// Mensajes en foreground (app visible)
interface NotificationPayload {
  notification?: {
    title?: string;
    body?: string;
  };
}

onMessage(messaging, (payload: NotificationPayload) => {
  console.log("Mensaje recibido en foreground:", payload);
  // Aquí puedes lanzar un toast, banner, o actualizar UI.
  // Para mostrar una notificación del sistema en foreground, usa el SW:
  if (Notification.permission === 'granted') {
    const { title, body } = payload.notification || {};
    new Notification(title || "Notificación", {
      body: body || "",
    });
  }
});

// initFCM();




const container = document.getElementById('root');
const root = createRoot(container!);



root.render(
   <React.StrictMode>
    <IonReactRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </IonReactRouter>
  </React.StrictMode>
);
