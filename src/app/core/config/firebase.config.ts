import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBm2tYegZdj5lk7yFcl_IYx2azEkIOcWEI",
  authDomain: "lamdriguerade4.firebaseapp.com",
  projectId: "lamdriguerade4",
  storageBucket: "lamdriguerade4.firebasestorage.app",
  messagingSenderId: "34609389664",
  appId: "1:34609389664:web:d6be4d46f2bcd489472305"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
