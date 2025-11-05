
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  increment,
  Timestamp,
  limit,
  startAfter,
  type QueryDocumentSnapshot,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, type FirebaseStorage } from 'firebase/storage';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth: Auth = getAuth(app);
const storage: FirebaseStorage = getStorage(app);
// Connect to the specific Firestore database instance.
const db: Firestore = getFirestore(app, "krishix3090");


export {
  db,
  auth,
  storage,
  // Firestore specific exports
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  increment,
  Timestamp,
  limit,
  startAfter,
  // Storage specific exports
  ref,
  uploadBytes,
  getDownloadURL,
  // Firestore specific type exports
  type QueryDocumentSnapshot,
  type DocumentData,
};
