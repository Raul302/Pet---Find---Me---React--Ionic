// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/9.6.11/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.6.11/firebase-messaging-compat.js");

firebase.initializeApp({
   apiKey: "AIzaSyBz-7zob3ucnp_kSh_yV9RxF9kBfbPC93o",
  authDomain: "pet-find-m.firebaseapp.com",
  projectId: "pet-find-m",
  storageBucket: "pet-find-m.firebasestorage.app",
  messagingSenderId: "364370916980",
  appId: "1:364370916980:web:4337c1cdbb943957790321",
  measurementId: "G-HW82RQ40QK"

});

const messaging = firebase.messaging();

// Notificaciones en background (app cerrada o pestaña no activa)
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw] background message:", payload);
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || "Notificación", {
    body: body || "",
    icon: icon || "/icon.png",
    data: payload.data || {}
  });
});

// Click en notificación: abrir o enfocar la app con ruta relevante
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Siempre redirigir a /tabs/messages
  const targetUrl = "/tabs/messages";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(location.origin) && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
