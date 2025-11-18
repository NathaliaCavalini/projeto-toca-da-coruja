import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { updateUserStatus } from "./user-sync.js";

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
        console.log(`📝 Iniciando cadastro para: ${email}`);
        
        // Cria o usuário no Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;

        // Atualiza o nome de exibição
        await updateProfile(user, { displayName: nome });

        // Salva dados extras no Firestore na coleção 'usuarios'
        await setDoc(doc(db, "usuarios", user.uid), {
            nome: nome,
            email: email.toLowerCase(),
            criadoEm: serverTimestamp(),
            bio: "",
            fotoURL: ""
        });

        console.log(`✅ Usuário criado em 'usuarios'`);

        // Sincroniza também em 'users-admin-control' para sistema de penalidades
        await updateUserStatus(email.toLowerCase(), 'ativo');
        
        console.log(`✅ Usuário sincronizado em 'users-admin-control'`);

        alert("✅ Conta criada com sucesso!");
        window.location.href = "pages/login.html";
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
