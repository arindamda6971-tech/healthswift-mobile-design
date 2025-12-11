import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAy4WgLMuhghJMtSFdsbrj0wefHblEH4E4",
  authDomain: "health-swift.firebaseapp.com",
  databaseURL: "https://health-swift-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "health-swift",
  storageBucket: "health-swift.firebasestorage.app",
  messagingSenderId: "381108928902",
  appId: "1:381108928902:web:360397286d97e700d22c07",
  measurementId: "G-L061CM0ZZ0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const database = getDatabase(app);

export default app;
