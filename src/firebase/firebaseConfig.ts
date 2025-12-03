// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyBz-7zob3ucnp_kSh_yV9RxF9kBfbPC93o",
  authDomain: "pet-find-m.firebaseapp.com",
  projectId: "pet-find-m",
  storageBucket: "pet-find-m.firebasestorage.app",
  messagingSenderId: "364370916980",
  appId: "1:364370916980:web:4337c1cdbb943957790321",
  measurementId: "G-HW82RQ40QK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);




