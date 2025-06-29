
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
  initializeFirestore,
  persistentLocalCache,
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

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth: Auth = getAuth(app);
const storage: FirebaseStorage = getStorage(app);
let db: Firestore;

// Safely initialize Firestore with offline persistence
// This check ensures we only run this code in the browser.
if (typeof window !== 'undefined') {
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({})
    });
  } catch (e: any) {
    // This can happen if the app is already initialized,
    // which is common with Next.js's fast refresh.
    // It can also happen with multiple tabs open.
    console.warn(`Firebase: (Code: ${e.code}) Could not enable offline persistence. Getting standard instance.`);
    db = getFirestore(app);
  }
} else {
  // For server-side rendering, initialize a standard instance
  db = getFirestore(app);
}


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
