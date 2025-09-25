// js/cadastro.js
import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

document.getElementById("cadastro-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();

    if (!nome || !email || !senha) {
        alert("⚠️ Preencha todos os campos.");
        return;
    }

    try {
        // Cria o usuário no Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;

        // Atualiza o nome de exibição do usuário
        await updateProfile(user, { displayName: nome });

        // Salva dados extras no Firestore
        await setDoc(doc(db, "usuarios", user.uid), {
            nome: nome,
            email: email,
            criadoEm: serverTimestamp()
        });

        alert("✅ Conta criada com sucesso!");
        window.location.href = "login.html";
    } catch (error) {
        console.error(error);
        if (error.code === "auth/email-already-in-use") {
            alert("❌ Este e-mail já está em uso.");
        } else if (error.code === "auth/weak-password") {
            alert("❌ A senha deve ter pelo menos 6 caracteres.");
        } else {
            alert("❌ Erro ao criar conta: " + error.message);
        }
    }
});
