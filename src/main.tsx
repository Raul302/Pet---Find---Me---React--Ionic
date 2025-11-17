import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';


// Font Awesome (icons as CSS classes)
import '@fortawesome/fontawesome-free/css/all.min.css';

import{ defineCustomElements }  from '@ionic/pwa-elements/loader';


defineCustomElements(window);

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);