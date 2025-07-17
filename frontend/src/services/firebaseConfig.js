// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAT5b0RNNP06TGKN5n_TT5ZkPSI5xI9KBc",
  authDomain: "museek-3bc46.firebaseapp.com",
  projectId: "museek-3bc46",
  storageBucket: "museek-3bc46.firebasestorage.app",
  messagingSenderId: "307863704931",
  appId: "1:307863704931:web:2357f2fee3717b6fccef56",
  measurementId: "G-44GH8G16F3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export default app;