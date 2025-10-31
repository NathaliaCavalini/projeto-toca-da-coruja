import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

onAuthStateChanged(auth, (user) => {
    if (user) {
        document.getElementById("perfil-foto").src = user.photoURL || "../imagens/default-user.png";
        document.getElementById("novo-username").value = user.displayName || "";
    } else {
        window.location.href = "/login.html";
    }
});

document.getElementById("salvar").addEventListener("click", async () => {
    const user = auth.currentUser;
    if (!user) return;

    const novoNome = document.getElementById("novo-username").value.trim();
    const novaFoto = document.getElementById("nova-foto").files[0];

    let photoURL = user.photoURL;

    if (novaFoto) {
        // Para produção: subir em Firebase Storage
        photoURL = URL.createObjectURL(novaFoto); // preview local
    }

    // Atualiza Auth
    await updateProfile(user, {
        displayName: novoNome,
        photoURL: photoURL

    });

    // ... dentro do try, após obter photoURL via getDownloadURL()

    // LOG do download URL
    console.log('downloadURL obtido:', photoURL);

    // atualiza profile no Auth
    await updateProfile(user, {
        displayName: newName || user.displayName,
        photoURL: photoURL || user.photoURL || ""
    });

    // salva no Firestore
    await setDoc(doc(db, 'usuarios', user.uid), {
        displayName: newName || user.displayName || "",
        email: user.email || "",
        photoURL: photoURL || user.photoURL || "",
        updatedAt: new Date()
    }, { merge: true });

    // recarrega currentUser
    try {
        if (auth.currentUser && typeof auth.currentUser.reload === 'function') await auth.currentUser.reload();
    } catch (e) {
        console.warn('reload failed', e);
    }

    // atualiza preview com cache-buster
    if (photoURL) {
        userPhoto.src = photoURL + (photoURL.includes('?') ? '&' : '?') + 't=' + Date.now();
    }
    console.log('Foto atualizada e salva. photoURL salvo no Firestore/auth:', photoURL);


    try {
        if (auth.currentUser && typeof auth.currentUser.reload === 'function') {
            await auth.currentUser.reload();
        }
    } catch (e) {
        console.warn('reload currentUser falhou:', e);
    }


    // Atualiza Firestore
    await updateDoc(doc(db, "users", user.uid), {
        username: novoNome,
        photoURL: photoURL
    });

    alert("✅ Perfil atualizado!");
    window.location.href = "/home.html";
});
