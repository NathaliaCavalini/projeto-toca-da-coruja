// JS/firebase-config.js
// Versão robusta: inicializa o app apenas uma vez e exporta auth, db, storage
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

// Sua configuração (mantive os valores que você enviou)
const firebaseConfig = {
    apiKey: "AIzaSyAAejGKvCNE1o0NbXGxzh5lDLByzaePKX4",
    authDomain: "toca-da-coruja-79169.firebaseapp.com",
    projectId: "toca-da-coruja-79169",
    storageBucket: "toca-da-coruja-79169.firebasestorage.app",
    messagingSenderId: "301076436259",
    appId: "1:301076436259:web:9b1985516a85c2c8b6a896",
    measurementId: "G-8WCK816QDY"
};

let app;
try {
  // se já existir app inicializado, reutiliza; caso contrário inicializa um novo
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log("Firebase: app inicializado (new).");
  } else {
    app = getApp();
    console.log("Firebase: app existente reutilizado.");
  }
} catch (err) {
  // fallback: tenta inicializar (em casos raros)
  console.warn("Firebase: erro ao verificar apps existentes, tentando initializeApp() de qualquer forma.", err);
  app = initializeApp(firebaseConfig);
}

// inicializa serviços
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// pequenos helpers de debug (opcionais - remova se quiser)
// Exponha no global apenas para debug rápido no console: window.__fb = { auth, db, storage }
// Isso ajuda você a inspecionar se os objetos estão corretamente inicializados.
try {
  if (typeof window !== "undefined") {
    window.__fb = { auth, db, storage };
  }
} catch (e) {
  // ambiente sem window (ex.: node) — ignora
}
