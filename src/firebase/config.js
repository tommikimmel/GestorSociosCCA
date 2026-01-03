import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDa7eFFEhp215BchWl3N963pEOEeOdHYII",
    authDomain: "gestorsocios.firebaseapp.com",
    projectId: "gestorsocios",
    storageBucket: "gestorsocios.firebasestorage.app",
    messagingSenderId: "758443806552",
    appId: "1:758443806552:web:d404b525f4b2780ba95f2d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);