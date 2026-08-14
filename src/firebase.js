import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBo0jfwG1LGfB5S_nQla4D1GEHpDze9pes",
  authDomain: "guardiaodigital-46064.firebaseapp.com",
  projectId: "guardiaodigital-46064",
  storageBucket: "guardiaodigital-46064.firebasestorage.app",
  messagingSenderId: "783260734188",
  appId: "1:783260734188:web:decca2e8eb811328720bc9"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);