import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCbo735tCAI9-8tIDLfdJh5VP-Y1DXgUN4",
  authDomain: "fintracpro.firebaseapp.com",
  projectId: "fintracpro",
  storageBucket: "fintracpro.firebasestorage.app",
  messagingSenderId: "76744500849",
  appId: "1:76744500849:web:4032255fe380871f331dd0",
  measurementId: "G-92XSSJ7DP1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Analytics is optional and only works in certain environments
let analytics;
try {
  analytics = getAnalytics(app);
} catch (e) {
  console.warn("Analytics failed to initialize", e);
}
export { analytics };