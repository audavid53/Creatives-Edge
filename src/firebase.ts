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

const firebaseConfig = {
  apiKey: "AIzaSyDH3bQEgRuSgnwkcmjjapv6lwd4zMNfl70",
  authDomain: "consummate-atom-277815.firebaseapp.com",
  projectId: "consummate-atom-277815",
  storageBucket: "consummate-atom-277815.firebasestorage.app",
  messagingSenderId: "44104467096",
  appId: "1:44104467096:web:9760f6924febbdcc2506ed"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// IMPORTANT: Initialize Firestore with the exact databaseId provisioned by AI Studio
export const db = getFirestore(app, "ai-studio-4f2d4e7e-3512-49dd-844d-97163958c94b");

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
