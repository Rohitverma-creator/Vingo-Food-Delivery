// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "vingo-food-delivery-33130.firebaseapp.com",
  projectId: "vingo-food-delivery-33130",
  storageBucket: "vingo-food-delivery-33130.firebasestorage.app",
  messagingSenderId: "952077979000",
  appId: "1:952077979000:web:0f7f8c4610fa2d23d50c8d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth=getAuth(app)
export {app,auth};