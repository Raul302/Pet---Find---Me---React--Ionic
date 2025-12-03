import { Redirect, Route, useLocation, useHistory } from 'react-router-dom';
import {
  IonApp,
  IonButton,
  IonButtons,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonToolbar,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { alertCircleOutline, clipboardOutline, ellipse, grid, notificationsOutline, personCircleOutline, square, triangle } from 'ionicons/icons';
import Tab1 from './pages/Tab1';
import Tab2 from './pages/Tab2';
import Tab3 from './pages/Tab3';
import Login from  './pages/Login/Login';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import Board from './pages/Board/Board';
import PetMissing from './pages/pet-missing/PetMissing';

// import 'leaflet/dist/leaflet.css';
import PetsDetail from './pages/PetsDetail/PetsDetail';
import Profile from './pages/Profile/Profile';
import QuestionPlace from './pages/Place/QuestionPlace';
import ReportsPanel from './pages/ReportsPanel/ReportsPanel';
import Register from './pages/Register/Register';
import Messages from './pages/Messages/Messages';
import Conversation from './pages/Messages/Conversation';
import PrivateRoute from './Routers/PrivateRouter';
import AppHeader from './components/Header/AppHeader';
import { LiveLocationViewer } from './hooks/SharingLocation/MapToLookRealLocation';
import { useContext, useEffect } from 'react';
import { AuthContext } from './hooks/Context/AuthContext/AuthContext';


// Firebase
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { firebaseConfig } from "./firebase/firebaseConfig";



setupIonicReact();

const App: React.FC = () => {
const history = useHistory();
const data_user = localStorage.getItem('data_user') || '{}';
// const user = JSON.parse(data_user).id ? JSON.parse(data_user) : null;

  const ConditionalHeader: React.FC = () => {
    const location = useLocation();
    const hidePaths = ['/login', '/register', '/location', '/live/','/live/:token'];
    const pathname = location?.pathname || '';
    const shouldHide = hidePaths.some(p => pathname.startsWith(p));
    if (shouldHide) return null;
    return <AppHeader />;
  };



  const { user } = useContext(AuthContext);
  useEffect(() => { 
  if (user && user.id) {
    const alreadySent = localStorage.getItem('fcmTokenSent');
    if (!alreadySent) {
      initFCM().then(() => {
        localStorage.setItem('fcmTokenSent', 'true');
      });
    }
  }
  }, [user]);



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
        body: JSON.stringify({token, userId: user.id  })
      });
    } catch (err) {
      console.error("Error inicializando FCM:", err);
    }
  }



  return (
  <IonApp>

  <IonReactRouter>
    <ConditionalHeader />
    
    <IonRouterOutlet>

      {/* Ruta publica para mostrar mapas */}
      <Route path="/live/:token" component={LiveLocationViewer} />


      {/* Rutas fuera de las tabs */}
      <Route exact path="/login">
        <Login />
      </Route>
         <Route exact path="/register">
        <Register />
      </Route>
      <PrivateRoute path="/location">
      <QuestionPlace />
    </PrivateRoute>

     

      {/* Rutas con tabs */}
      <PrivateRoute path="/tabs">
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/tabs/board">
              <Board />
            </Route>
            <Route exact path="/tabs/report-missing">
              <PetMissing />
            </Route>

            <Route exact path="/tabs/reports-panel">
              <ReportsPanel />
            </Route>

            <Route exact path="/tabs/messages">
              <Messages />
            </Route>

            <Route exact path="/tabs/messages/conversation">
              <Conversation />
            </Route>
          
            {/* <Route exact path="/tabs/profile">
            <Profile />
            </Route> */}

             <Route exact path="/tabs/pets/:id">
              <PetsDetail />
            </Route>


            <Route exact path="/tabs">
              <Redirect to="/tabs/board" />
            </Route>
          </IonRouterOutlet>

          <IonTabBar slot="bottom">
            <IonTabButton tab="Board" href="/tabs/board">
              <IonIcon icon={grid} />
              <IonLabel>Tablero</IonLabel>
            </IonTabButton>
            <IonTabButton tab="report-missing" href="/tabs/report-missing">
              <IonIcon icon={alertCircleOutline} />
              <IonLabel>Reportar</IonLabel>
            </IonTabButton>

            <IonTabButton tab="messages" href="/tabs/messages" onClick={() => { history.push('/tabs/messages'); }}>
              <IonIcon icon={notificationsOutline} />
              <IonLabel>Mensajes</IonLabel>
            </IonTabButton>
            {/* <IonTabButton tab="profile" href="/tabs/profile">
              <IonIcon icon={personCircleOutline} />
              <IonLabel>Perfil</IonLabel>
            </IonTabButton> */}
          </IonTabBar>
        </IonTabs>
      </PrivateRoute>

      {/* Redirección raíz */}
      <Route exact path="/">
        <Redirect to="/login" />
      </Route>
    </IonRouterOutlet>
  </IonReactRouter>
</IonApp>);

};

export default App;
