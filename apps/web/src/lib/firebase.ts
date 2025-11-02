import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  Auth,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  query, 
  where, 
  Timestamp,
  Firestore 
} from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAy7T8dAvCVMJ0txqYr9xBm5xiqdOBp8ik",
  authDomain: "enatbet-906c4.firebaseapp.com",
  projectId: "enatbet-906c4",
  storageBucket: "enatbet-906c4.firebasestorage.app",
  messagingSenderId: "102221912302",
  appId: "1:102221912302:web:0966522ce66ac27051c9a6",
  measurementId: "G-MM63EBC9J3"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (typeof window !== 'undefined') {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  // 🔥 THE FIX: Target the named database explicitly
  db = getFirestore(app, 'enatbet-db');
  storage = getStorage(app);
}

export const COLLECTIONS = {
  USERS: 'users',
  PROPERTIES: 'properties',
  BOOKINGS: 'bookings',
  REVIEWS: 'reviews',
};

export const createUser = async (email: string, password: string, displayName: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  await updateProfile(userCredential.user, { displayName });
  
  const newUser = {
    id: userCredential.user.uid,
    email: userCredential.user.email!,
    displayName,
    role: 'guest',
    isVerified: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  
  const userRef = doc(db, COLLECTIONS.USERS, userCredential.user.uid);
  await setDoc(userRef, newUser);
  
  return {
    ...newUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

export const signIn = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const signOut = async () => {
  return await firebaseSignOut(auth);
};

export const getCurrentUser = async (uid: string) => {
  const userRef = doc(db, COLLECTIONS.USERS, uid);
  const userDoc = await getDoc(userRef);
  
  if (userDoc.exists()) {
    const data = userDoc.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  }
  return null;
};

export const getProperties = async (filters?: any) => {
  const propertiesRef = collection(db, COLLECTIONS.PROPERTIES);
  let q = query(propertiesRef, where('status', '==', 'active'));
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    };
  });
};

export { auth, db, storage, onAuthStateChanged };
