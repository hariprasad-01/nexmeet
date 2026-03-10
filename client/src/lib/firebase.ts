import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB1ED_SDykZ3Lda-NsByEKX3pw8bwcmW84",
  authDomain: "nexmeet-89881.firebaseapp.com",
  databaseURL: "https://nexmeet-89881-default-rtdb.firebaseio.com",
  projectId: "nexmeet-89881",
  storageBucket: "nexmeet-89881.firebasestorage.app",
  messagingSenderId: "750063617210",
  appId: "1:750063617210:web:062e758b0905681780ae83",
  measurementId: "G-9E3T1M3DFZ"
};

// Initialize Firebase (avoid duplicate initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
