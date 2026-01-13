import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// TODO: Replace with your actual Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyAuRvDyTlGQY7pF0tZSjNL40ht7d94lBB0",
  authDomain: "bga-cs-talent-test-app.firebaseapp.com",
  projectId: "bga-cs-talent-test-app",
  storageBucket: "bga-cs-talent-test-app.firebasestorage.app",
  messagingSenderId: "588423733482",
  appId: "1:588423733482:web:c62cd3acf645875f77f793",
  measurementId: "G-2X6ZPX2Q5N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

export default app;
