import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInAnonymously, 
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Config is read from env vars (set these in Vercel/your host) so the app isn't
// tied to hardcoded AI Studio project values. Falls back to the original
// AI Studio project so local dev keeps working without a .env file.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDH3bQEgRuSgnwkcmjjapv6lwd4zMNfl70",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "consummate-atom-277815.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "consummate-atom-277815",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "consummate-atom-277815.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "44104467096",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:44104467096:web:9760f6924febbdcc2506ed"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// IMPORTANT: Initialize Firestore with the exact databaseId provisioned by AI Studio
export const db = getFirestore(app, import.meta.env.VITE_FIREBASE_FIRESTORE_DB_ID || "ai-studio-4f2d4e7e-3512-49dd-844d-97163958c94b");

// Firebase Storage: holds practice videos and lesson images as real files
// instead of base64 strings crammed into Firestore documents.
export const storage = getStorage(app);

// Authentication helper functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error during Google Sign-In:", error);
    throw error;
  }
};

export const signInAsGuest = async () => {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error("Error during Guest Sign-In:", error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};
