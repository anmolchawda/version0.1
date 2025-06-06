
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
      console.log("Firestore initialized with persistentLocalCache (client-side).");
    } catch (e: any) {
      console.error("Error initializing Firestore with persistentLocalCache on client, falling back to memory cache:", e.message, e);
      // Fallback to memory cache if IndexedDB fails (e.g., in some private browsing modes or due to errors)
      db = initializeFirestore(app, { localCache: memoryLocalCache() });
      console.log("Firestore initialized with memory cache (client-side fallback).");
    }
  } else {
    // Server-side environment or non-browser (e.g., during SSR build)
    // Use memory cache for server-side rendering
    db = initializeFirestore(app, { localCache: memoryLocalCache() });
    console.log("Firestore initialized with memory cache (server-side).");
  }

  authInstance = getAuth(app);
  storageInstance = getStorage(app);
  console.log("Firebase Auth and Storage initialized (singleton).");

} else {
  app = getApp(); // Get existing app
  // Retrieve the ALREADY initialized instances.
  // getFirestore(app) should return the same instance that was configured with persistence
  // if the FirebaseApp instance 'app' is the same.
  db = getFirestore(app);
  authInstance = getAuth(app);
  storageInstance = getStorage(app);
  console.log("Firebase app already initialized. Using existing service instances.");
}

// Ensure network is enabled for the db instance on the client side,
// after db has been assigned, regardless of first init or HMR.
if (typeof window !== 'undefined' && db) {
  enableNetwork(db)
    .then(() => {
      console.log("Firebase Firestore network connection explicitly enabled/re-affirmed (client-side).");
    })
    .catch((error) => {
      console.error("Error explicitly enabling/re-affirming Firebase Firestore network (client-side):", error);
    });
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
