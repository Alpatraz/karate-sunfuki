import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "karate-sunfuki-boutique.firebaseapp.com",
  projectId: "karate-sunfuki-boutique",
  storageBucket: "karate-sunfuki-boutique.appspot.com",
  messagingSenderId: "323637671299",
  appId: "1:323637671299:web:6c1fcf75f1cedcc633b2b6",
  measurementId: "G-KHGKGMKD1M"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
