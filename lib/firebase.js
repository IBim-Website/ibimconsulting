import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAZd3tcRovZWmvqpOm3iviI9xXlGPwe6H0",
  authDomain: "bendstack-7e417.firebaseapp.com",
  projectId: "bendstack-7e417",
  storageBucket: "bendstack-7e417.firebasestorage.app",
  messagingSenderId: "725195510747",
  appId: "1:725195510747:web:02d9ec1efab6d0f39b0dfe",
  measurementId: "G-HQ90PGQ8SS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);
