// Export configured Firebase instances
export { auth, db, storage, app } from './config';

// Export only specific Firebase functions we need
export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  User as FirebaseUser,
  AuthError,
  Auth,
} from 'firebase/auth';

export {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  DocumentReference,
  CollectionReference,
  QuerySnapshot,
  DocumentSnapshot,
} from 'firebase/firestore';

export {
  ref,
  uploadBytes,
  uploadString,
  getDownloadURL,
  deleteObject,
  StorageReference,
} from 'firebase/storage';

// Export services - THESE MUST BE UNCOMMENTED
export * from './services/auth';
export * from './services/listings';
export * from './services/bookings';
export * from './services/users';
export * from './services/reviews';
export * from './services/messages';
export * from './services/notifications';
export * from './services/storage';