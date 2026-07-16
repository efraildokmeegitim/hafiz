import { initializeApp, getApps } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  projectId: "hafiz-asistan-v5",
  appId: "1:558991276601:web:aacb88fcc1df0e8237ebe8",
  storageBucket: "hafiz-asistan-v5.firebasestorage.app",
  apiKey: "AIzaSyCwVppsL2fixOd7ArqpbrkyQoOz3xV9p2Y",
  authDomain: "hafiz-asistan-v5.firebaseapp.com",
  messagingSenderId: "558991276601",
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
});
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
