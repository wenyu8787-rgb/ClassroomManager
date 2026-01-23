import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDzoo0DgFUgYOetf9qffs_pj8EE2_rYLM0",
    authDomain: "school-b6685.firebaseapp.com",
    projectId: "school-b6685",
    storageBucket: "school-b6685.firebasestorage.app",
    messagingSenderId: "710940775985",
    appId: "1:710940775985:web:f6dc4dec9bcc7cf6876710"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
