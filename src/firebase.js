import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDeP-FMzfZoSqaTGg2rB-hyGq4_-TKauUk",
  authDomain: "gouno-5c62e.firebaseapp.com",
  projectId: "gouno-5c62e",
  storageBucket: "gouno-5c62e.firebasestorage.app",
  messagingSenderId: "738051284493",
  appId: "1:738051284493:web:e58231a966756864d93f44"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
