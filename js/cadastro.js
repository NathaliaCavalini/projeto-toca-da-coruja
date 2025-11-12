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

        // Atualiza o nome de exibição
        await updateProfile(user, { displayName: nome });

        // Salva dados extras no Firestore
        await setDoc(doc(db, "usuarios", user.uid), {
            nome: nome,
            email: email,
            criadoEm: serverTimestamp(),
            bio: "",
            fotoURL: ""
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

import { auth } from "./firebase-config.js";
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

document.getElementById("cadastro-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Atualiza perfil com nome
        await updateProfile(userCredential.user, {
            displayName: nome,
            photoURL: "https://via.placeholder.com/150" // imagem padrão
        });

        alert("✅ Conta criada com sucesso!");
        window.location.href = "home.html";
    } catch (error) {
        console.error(error);
        alert("❌ Erro: " + error.message);
    }
});
