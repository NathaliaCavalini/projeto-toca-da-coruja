// js/user-info.js
import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// Este módulo precisa ser importado em cada página HTML (ex: <script type="module" src="../js/user-info.js"></script>)
// Ele procura por um elemento com id="user-info" e o atualiza (ou cria fallback)
const userInfoEl = document.getElementById("user-info");

// Se a página não tiver o elemento #user-info, não fazer nada
if (!userInfoEl) {
    // Página não tem elemento #user-info, nada a fazer
} else {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const nome = user.displayName || user.email.split("@")[0];
            const foto = user.photoURL || "/imagens/user.png";

            userInfoEl.innerHTML = `
          <img src="${foto}" alt="Foto do usuário" style="width:32px;height:32px;border-radius:50%;object-fit:cover;margin-right:8px;">
          <span>${nome}</span>
        `;
            userInfoEl.setAttribute("href", "perfil.html"); // link local dentro /html
        } else {
            userInfoEl.innerHTML = `
          <img src="../imagens/user.png" alt="Ícone de usuário" style="width:20px;height:20px;margin-right:8px;">
          <span>Cadastre-se</span>
        `;
            userInfoEl.setAttribute("href", "login.html");
        }
    });
}