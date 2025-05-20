import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB7HIu-9pMFZWdWWQV6g9a7BhP8vo8Ufw8",
  authDomain: "karate-sunfuki-boutique.firebaseapp.com",
  projectId: "karate-sunfuki-boutique",
  storageBucket: "karate-sunfuki-boutique.firebasestorage.app",
  messagingSenderId: "323637671299",
  appId: "1:323637671299:web:6c1fcf75f1cedcc633b2b6",
  measurementId: "G-KHGKGMKD1M"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
