import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration with hardcoded values for testing
// IMPORTANT: This is a temporary solution for debugging only
const firebaseConfig = {
  apiKey: "AIzaSyCBUYLNkxcz-VTEfr-6Vl9pvEcrXPs5Dog",
  authDomain: "casanova-dissy-reservations.firebaseapp.com",
  projectId: "casanova-dissy-reservations",
  storageBucket: "casanova-dissy-reservations.appspot.com",
  messagingSenderId: "22271318428",
  appId: "1:22271318428:web:d49f72542bfac044f49059"
};

// Log Firebase config (without sensitive values)
console.log('Firebase configuration (hardcoded for testing):', {
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
});

// Initialize Firebase with simplified error handling
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
console.log('Firebase initialized successfully');

// Initialize Firestore
const db = getFirestore(app);
console.log('Firestore initialized successfully');

export { db };
