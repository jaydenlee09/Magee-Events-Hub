// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBtkkgy2AzD-zRzNbM3lCFM_jO7EqLJvbc",
  authDomain: "magee-events-hub-57271.firebaseapp.com",
  projectId: "magee-events-hub-57271",
  storageBucket: "magee-events-hub-57271.firebasestorage.app",
  messagingSenderId: "263383380166",
  appId: "1:263383380166:web:887c1e6899f21eb26d67c7",
  measurementId: "G-Q7YD9H5KFW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, app, auth };