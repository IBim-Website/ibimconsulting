import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyD9Ybdl2AxFRQB7Cx3cap9SVmSEc8Ld3YE",
  authDomain: "martial-peter.firebaseapp.com",
  projectId: "martial-peter",
  storageBucket: "martial-peter.firebasestorage.app",
  messagingSenderId: "13676873318",
  appId: "1:13676873318:web:e38d1a61febacfd7820fa7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
