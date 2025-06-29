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

// Firestore instance
let db: Firestore;

// This check ensures we only run this code in the browser.
// On the server, a standard instance will be used.
if (typeof window !== 'undefined') {
  try {
    // Initialize Firestore with offline persistence.
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({}),
    });
  } catch (e: any) {
    if (e.code === 'failed-precondition') {
        // This can happen with multiple tabs open.
        console.warn("Firebase: Multiple tabs open, persistence can only be enabled in one. Getting standard instance.");
        db = getFirestore(app);
    } else if (e.code === 'unimplemented') {
        // The browser doesn't support all of the features required for persistence.
        console.warn("Firebase: Browser does not support all features for persistence. Getting standard instance.");
        db = getFirestore(app);
    } else {
        // If it's already initialized, just get the instance. This can happen with Next.js fast refresh.
        console.warn("Firebase: Getting existing Firestore instance.");
        db = getFirestore(app);
    }
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
