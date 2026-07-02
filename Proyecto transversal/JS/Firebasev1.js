// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAIxUOpEjRwtxMHPicFOMqscxqb-nWYEYA",
  authDomain: "conexion-vital-cdb49.firebaseapp.com",
  projectId: "conexion-vital-cdb49",
  storageBucket: "conexion-vital-cdb49.firebasestorage.app",
  messagingSenderId: "1067275843636",
  appId: "1:1067275843636:web:3dd0074322cd11d6df7261",
  measurementId: "G-F9X355WRZW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);