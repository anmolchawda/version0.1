
import { initializeApp } from 'firebase/app';
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
  increment
} from 'firebase/firestore';
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export {
  db,
  auth,
  storage,
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
  increment
};
