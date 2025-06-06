
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
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
  persistentLocalCache, // Correct import for client-side persistence provider
  memoryLocalCache,    // Correct import for server-side/fallback persistence provider
  type Firestore
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDWF0xqZ7EPCZdfAXZfDoVmT6Tf4WaN3kY",
    authDomain: "fieldverse-m99ip.firebaseapp.com",
    databaseURL: "https://fieldverse-m99ip-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "fieldverse-m99ip",
    storageBucket: "fieldverse-m99ip.firebasestorage.app",
    messagingSenderId: "1084327516741",
    appId: "1:1084327516741:web:0eb1efac54766dc625612c",
    measurementId: "G-FVS7PM8WTB"
  };

let app: FirebaseApp;
let db: Firestore;
let authInstance: Auth;
let storageInstance: FirebaseStorage;

if (!getApps().length) {
  console.log("Firebase: Initializing new app and services...");
  app = initializeApp(firebaseConfig);

  if (typeof window !== 'undefined') {
    // Client-side environment
    try {
      // Initialize Firestore with IndexedDB persistence
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({ // Use persistentLocalCache
          // Optional: tabManager: new MemoryTabManager() for synchronizing multiple tabs
        }),
      });
      console.log("Firebase: Firestore initialized with persistentLocalCache (client-side).");
    } catch (e: any) {
      console.error("Firebase: Error initializing Firestore with persistentLocalCache on client, falling back to memory cache:", e.message, e);
      // Fallback to memory cache if IndexedDB fails (e.g., in some private browsing modes or due to errors)
      db = initializeFirestore(app, { localCache: memoryLocalCache() });
      console.log("Firebase: Firestore initialized with memory cache (client-side fallback).");
    }
  } else {
    // Server-side environment or non-browser (e.g., during SSR build)
    // Use memory cache for server-side rendering
    db = initializeFirestore(app, { localCache: memoryLocalCache() });
    console.log("Firebase: Firestore initialized with memory cache (server-side).");
  }

  authInstance = getAuth(app);
  storageInstance = getStorage(app);
  console.log("Firebase: Auth and Storage initialized (singleton).");

} else {
  console.log("Firebase: Using existing app instance.");
  app = getApp(); // Get existing app
  db = getFirestore(app); // Retrieve the already initialized Firestore instance
  authInstance = getAuth(app); // Retrieve the already initialized Auth instance
  storageInstance = getStorage(app); // Retrieve the already initialized Storage instance
  console.log("Firebase: Re-assigned existing service instances.");
}

// Ensure network is enabled for the db instance on the client side,
// after db has been assigned, regardless of first init or HMR.
if (typeof window !== 'undefined') {
  if (db) {
    console.log("Firebase: Attempting to enable network for Firestore instance on client...", db);
    enableNetwork(db)
      .then(() => {
        console.log("Firebase: Firestore network connection EXPLICITLY ENABLED/RE-AFFIRMED (client-side).");
      })
      .catch((error) => {
        console.error("Firebase: Error EXPLICITLY ENABLING/RE-AFFIRMING Firestore network (client-side):", error);
      });
  } else {
    console.error("Firebase: DB instance NOT AVAILABLE for enableNetwork call on client. This is unexpected.");
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
