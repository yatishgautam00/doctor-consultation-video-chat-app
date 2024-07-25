import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB5Ef0TYuoyAgQLTWJIb76Ta6a9U95CdiI",
  authDomain: "doctor-consultation-00.firebaseapp.com",
  projectId: "doctor-consultation-00",
  storageBucket: "doctor-consultation-00.appspot.com",
  messagingSenderId: "603963658490",
  appId: "1:603963658490:web:7370a1e7db0fed9f9e3943",
  measurementId: "G-9NKF859ZED",
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);

export { app, firestore, auth };
