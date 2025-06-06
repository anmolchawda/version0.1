
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
  indexedDbLocalCache, // Correct import for client-side persistence provider
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
      db = initializeFirestore(app, {
        localCache: indexedDbLocalCache({
          // Optional: configure tab synchronization if needed, e.g.
          // tabManager: new MemoryTabManager() or new WebStorageTabManager()
          // forceOwnership: true // This option is not directly available for indexedDbLocalCache.
                                 // Tab management is more complex if needed.
        }),
      });
      console.log("Firestore initialized with IndexedDB persistence (client-side).");
    } catch (e: any) {
      console.error("Error initializing Firestore with IndexedDB on client, falling back to memory cache:", e.message, e);
      db = initializeFirestore(app, { localCache: memoryLocalCache() });
      console.log("Firestore initialized with memory cache (client-side fallback).");
    }
  } else {
    // Server-side environment or non-browser (e.g., during SSR build)
    db = initializeFirestore(app, { localCache: memoryLocalCache() });
    console.log("Firestore initialized with memory cache (server-side).");
  }

  authInstance = getAuth(app);
  storageInstance = getStorage(app);
  console.log("Firebase services initialized (singleton).");

  // Enable network AFTER db instance is configured with persistence,
  // and only on the client-side.
  if (typeof window !== 'undefined') {
      enableNetwork(db)
        .then(() => {
          console.log("Firebase Firestore network connection explicitly enabled (client-side).");
        })
        .catch((error) => {
          console.error("Error explicitly enabling Firebase Firestore network (client-side):", error);
        });
  }

} else {
  app = getApp(); // Get existing app
  // Retrieve the ALREADY initialized instances
  db = getFirestore(app); 
  authInstance = getAuth(app);
  storageInstance = getStorage(app);
  console.log("Firebase app already initialized. Using existing service instances.");
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
  // enableNetwork and persistence providers (indexedDbLocalCache, memoryLocalCache)
  // are used internally during setup and usually don't need to be exported
  // unless explicitly needed by other parts of the app for advanced control.
};
