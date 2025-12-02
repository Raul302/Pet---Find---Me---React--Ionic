import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Font Awesome (icons as CSS classes)
import '@fortawesome/fontawesome-free/css/all.min.css';

import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { AuthProvider } from './hooks/Context/AuthContext/AuthContext';
import { IonReactRouter } from '@ionic/react-router';

// Service workers
import { registerSW } from 'virtual:pwa-register';

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
