// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAAejGKvCNE1o0NbXGxzh5lDLByzaePKX4",
    authDomain: "toca-da-coruja-79169.firebaseapp.com",
    projectId: "toca-da-coruja-79169",
    storageBucket: "toca-da-coruja-79169.firebasestorage.app",
    messagingSenderId: "301076436259",
    appId: "1:301076436259:web:9b1985516a85c2c8b6a896",
    measurementId: "G-8WCK816QDY"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Cadastro
const signupForm = document.getElementById("signupForm");
if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("signupEmail").value;
        const password = document.getElementById("signupPassword").value;

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            alert("✅ Cadastro realizado com sucesso!");
            window.location.href = "/home.html";
        } catch (error) {
            alert("❌ Erro: " + error.message);
        }
    });
}

// Login
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            alert("✅ Login bem-sucedido!");
            window.location.href = "/home.html";
        } catch (error) {
            alert("❌ Erro: " + error.message);
        }
    });
}
