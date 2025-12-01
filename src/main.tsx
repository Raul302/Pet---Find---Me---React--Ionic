import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Font Awesome (icons as CSS classes)
import '@fortawesome/fontawesome-free/css/all.min.css';

import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { AuthProvider } from './hooks/Context/AuthContext/AuthContext';
import { IonReactRouter } from '@ionic/react-router';

defineCustomElements(window);

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
