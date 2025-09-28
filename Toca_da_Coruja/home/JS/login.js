import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("⚠️ Preencha todos os campos.");
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("✅ Login realizado com sucesso!");
        window.location.href = "../html/home.html";

    } catch (error) {
        console.error(error);
        if (error.code === "auth/invalid-credential") {
            alert("❌ E-mail ou senha incorretos.");
        } else {
            alert("❌ Erro: " + error.message);
        }
    }
});
