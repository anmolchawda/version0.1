
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  memoryLocalCache,
  enableNetwork,
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

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

// This check ensures we only initialize the app once,
// which is important for client-side navigation in Next.js.
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

auth = getAuth(app);
storage = getStorage(app);

// Firestore initialization with offline persistence handling
// This needs to be handled carefully because it can only run on the client.
if (typeof window !== 'undefined') {
  try {
    // initializeFirestore can be called multiple times, it will return the same instance.
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({})
    });
    // Explicitly re-enable the network to ensure connection on subsequent visits.
    enableNetwork(db).catch((err) => {
        console.error("Firebase: Network enable failed, maybe already online.", err);
    });
  } catch (error) {
    console.error("Firebase: Could not initialize Firestore with persistent cache, falling back to memory cache.", error);
    db = initializeFirestore(app, {
      localCache: memoryLocalCache()
    });
  }
} else {
  // For server-side rendering, use a simpler Firestore instance.
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
