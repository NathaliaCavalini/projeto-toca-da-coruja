// JS/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyAAejGKvCNE1o0NbXGxzh5lDLByzaePKX4",
    authDomain: "toca-da-coruja-79169.firebaseapp.com",
    projectId: "toca-da-coruja-79169",
    storageBucket: "toca-da-coruja-79169.firebasestorage.app",
    messagingSenderId: "301076436259",
    appId: "1:301076436259:web:9b1985516a85c2c8b6a896",
    measurementId: "G-8WCK816QDY"
};

// inicializa uma vez
const app = initializeApp(firebaseConfig);

// exports
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
