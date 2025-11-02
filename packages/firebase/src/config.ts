import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAy7T8dAvCVMJ0txqYr9xBm5xiqdOBp8ik",
  authDomain: "enatbet-906c4.firebaseapp.com",
  projectId: "enatbet-906c4",
  storageBucket: "enatbet-906c4.firebasestorage.app",
  messagingSenderId: "102221912302",
  appId: "1:102221912302:web:0966522ce66ac27051c9a6",
  measurementId: "G-MM63EBC9J3"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { app };
