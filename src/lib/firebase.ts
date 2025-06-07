
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import {
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
  enableNetwork,
  initializeFirestore,
  persistentLocalCache, 
  memoryLocalCache,    
  type Firestore
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getAuth, type Auth } from "firebase/auth";

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

let app: FirebaseApp;
let db: Firestore;
let authInstance: Auth;
let storageInstance: FirebaseStorage;

if (getApps().length === 0) {
  console.log("Firebase: Initializing new Firebase app instance...");
  app = initializeApp(firebaseConfig);
  console.log("Firebase: New Firebase app instance CREATED.");
} else {
  console.log("Firebase: Re-using existing Firebase app instance.");
  app = getApp();
  console.log("Firebase: Existing Firebase app instance RETRIEVED.");
}

// Initialize Firestore with persistence options
// This section will run every time the module is evaluated,
// but initializeFirestore is idempotent for a given app instance.
if (typeof window !== 'undefined') {
  // Client-side environment
  try {
    console.log("Firebase: Attempting to initialize Firestore with persistentLocalCache (client-side)...");
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        // Optional: tabManager for synchronizing multiple tabs
      }),
    });
    console.log("Firebase: Firestore successfully initialized with persistentLocalCache (client-side).");
  } catch (e: any) {
    console.warn("Firebase: Error initializing Firestore with persistentLocalCache on client, falling back to memory cache:", e.message);
    // Fallback to memory cache if IndexedDB fails
    db = initializeFirestore(app, { localCache: memoryLocalCache() });
    console.log("Firebase: Firestore initialized with memory cache (client-side fallback).");
  }
} else {
  // Server-side environment
  console.log("Firebase: Initializing Firestore with memoryLocalCache (server-side)...");
  db = initializeFirestore(app, { localCache: memoryLocalCache() });
  console.log("Firebase: Firestore successfully initialized with memoryLocalCache (server-side).");
}

// Initialize other Firebase services (Auth, Storage)
// These are generally safe to call multiple times as they return the existing instance for the given app.
authInstance = getAuth(app);
storageInstance = getStorage(app);
console.log("Firebase: Auth and Storage instances obtained/re-confirmed.");


// Explicitly enable network for Firestore on the client-side, after db is initialized.
// This is crucial to ensure Firestore attempts to connect.
if (typeof window !== 'undefined') {
  if (db) {
    console.log("Firebase: Attempting to enable network for Firestore instance on client...");
    enableNetwork(db)
      .then(() => {
        console.log("Firebase: Firestore network connection ENABLED/RE-AFFIRMED (client-side).");
      })
      .catch((error) => {
        console.error("Firebase: Error enabling/re-affirming Firestore network (client-side):", error);
      });
  } else {
    console.error("Firebase: DB instance NOT AVAILABLE for enableNetwork call on client. This is very unexpected if initializeFirestore succeeded.");
  }
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
};
