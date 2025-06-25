
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  collection,
  doc,
  enableNetwork,
  getDoc,
  getDocs, // Restored getDocs import
  increment,
  initializeFirestore,
  memoryLocalCache,
  onSnapshot,
  orderBy,
  persistentLocalCache,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  type Firestore,
  where,
  writeBatch,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, type FirebaseStorage } from "firebase/storage";
import { getAuth, type Auth } from "firebase/auth";
import { MOCK_USER_ID } from './placeholders'; // Import MOCK_USER_ID

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

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let authInstance: Auth | null = null;
let storageInstance: FirebaseStorage | null = null;

const USE_MOCK_DATA = false; // Master switch, set to false to enable Firebase

if (!USE_MOCK_DATA) {
  if (getApps().length === 0) {
    console.log("Firebase: Initializing new Firebase app instance...");
    app = initializeApp(firebaseConfig);
    console.log("Firebase: New Firebase app instance CREATED.");
  } else {
    console.log("Firebase: Re-using existing Firebase app instance.");
    app = getApp();
    console.log("Firebase: Existing Firebase app instance RETRIEVED.");
  }

  if (app) {
    authInstance = getAuth(app);
    storageInstance = getStorage(app);
    console.log("Firebase: Auth and Storage instances obtained/re-confirmed.");

    if (typeof window !== 'undefined') {
      try {
        console.log("Firebase: Attempting to initialize Firestore with persistentLocalCache (client-side)...");
        db = initializeFirestore(app, {
          localCache: persistentLocalCache({}),
        });
        console.log("Firebase: Firestore successfully initialized with persistentLocalCache (client-side).");
      } catch (e: any) {
        console.warn("Firebase: Error initializing Firestore with persistentLocalCache on client, falling back to memory cache:", e.message);
        db = initializeFirestore(app, { localCache: memoryLocalCache() });
        console.log("Firebase: Firestore initialized with memory cache (client-side fallback).");
      }
    } else {
      console.log("Firebase: Initializing Firestore with memoryLocalCache (server-side)...");
      db = initializeFirestore(app, { localCache: memoryLocalCache() });
      console.log("Firebase: Firestore successfully initialized with memoryLocalCache (server-side).");
    }

    if (typeof window !== 'undefined' && db) {
      console.log("Firebase: Attempting to enable network for Firestore instance on client...");
      enableNetwork(db)
        .then(() => {
          console.log("Firebase: Firestore network connection ENABLED/RE-AFFIRMED (client-side).");
        })
        .catch((error) => {
          console.error("Firebase: Error enabling/re-affirming Firestore network (client-side):", error);
        });
    } else if (typeof window !== 'undefined' && !db) {
      console.error("Firebase: DB instance NOT AVAILABLE for enableNetwork call on client. This is very unexpected if initializeFirestore succeeded.");
    }
  } else {
    console.error("Firebase: App could not be initialized. Firebase services (Firestore, Auth, Storage) will not be available.");
  }
} else {
  console.log("Firebase: MOCK_DATA mode is ON. Firebase services will not be initialized.");
}

export {
  db,
  authInstance as auth,
  storageInstance as storage,
  Timestamp,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  increment,
  getDocs, // Restored getDocs export
  enableNetwork,
  addDoc,
  deleteDoc,
  ref,
  uploadBytes,
  getDownloadURL,
};
