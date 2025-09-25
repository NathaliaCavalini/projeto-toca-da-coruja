// Importar os módulos do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// Configuração do Firebase (a SUA que você já tem)
const firebaseConfig = {
    apiKey: "AIzaSyAAejGKvCNE1o0NbXGxzh5lDLByzaePKX4",
    authDomain: "toca-da-coruja-79169.firebaseapp.com",
    projectId: "toca-da-coruja-79169",
    storageBucket: "toca-da-coruja-79169.firebasestorage.app",
    messagingSenderId: "301076436259",
    appId: "1:301076436259:web:9b1985516a85c2c8b6a896",
    measurementId: "G-8WCK816QDY"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Escuta o formulário de login
document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("✅ Login realizado com sucesso!");
        window.location.href = "home.html"; // redireciona
    } catch (error) {
        console.error(error);
        alert("❌ Erro: " + error.message);
    }
});
