
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
  persistentLocalCache, // Corrected import for client-side persistence provider
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
  // Firestore instance (db) should be set from the `if` block.
  // Re-getting might cause issues if persistence was already set.
  db = getFirestore(app); // Ensure db is assigned the existing instance.
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
};
