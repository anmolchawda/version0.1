
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
  type Firestore,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, type FirebaseStorage } from 'firebase/storage';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDWF0xqZ7EPCZdfAXZfDoVmT6Tf4WaN3kY",
    authDomain: "fieldverse-m99ip.firebaseapp.com",
    databaseURL: "https://fieldverse-m99ip-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "fieldverse-m99ip",
    storageBucket: "fieldverse-m99ip.appspot.com",
    messagingSenderId: "1084327516741",
    appId: "1:1084327516741:web:0eb1efac54766dc625612c",
    measurementId: "G-FVS7PM8WTB"
};

// A more stable way to initialize for Next.js App Router.
// This prevents re-initialization and works on both server and client.
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

// The offline persistence logic is now handled in FirebaseProvider.tsx
// This keeps this file clean and avoids client/server initialization conflicts.

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
  // Storage specific exports
  ref,
  uploadBytes,
  getDownloadURL,
};
