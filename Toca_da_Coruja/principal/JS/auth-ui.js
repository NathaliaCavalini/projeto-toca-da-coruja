// js/auth-ui.js
import { auth } from '/Toca_da_Coruja/JS/firebase-config.js'; // caminho root-relative - ajuste se necessário
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

function applyUserUI() {
    const userInfo = document.getElementById('user-info');
    if (!userInfo) return; // nada a fazer se não existir no DOM

    onAuthStateChanged(auth, (user) => {
        if (user) {
            const nome = user.displayName || (user.email ? user.email.split('@')[0] : 'Usuário');
            const foto = user.photoURL || '/Toca_da_Coruja/imagens/user.png';
            userInfo.innerHTML = `
        <img src="${foto}" class="user-thumb" alt="Avatar do usuário" />
        <span class="user-name">${nome}</span>
      `;
            // leva pro perfil
            userInfo.setAttribute('href', '/Toca_da_Coruja/html/perfil.html');
        } else {
            userInfo.innerHTML = `
        <img src="/Toca_da_Coruja/imagens/user.png" class="user-thumb" alt="Ícone usuário" />
        <span class="user-name">Cadastre-se</span>
      `;
            userInfo.setAttribute('href', '/Toca_da_Coruja/html/login.html');
        }
    });
}

// inicializa quando DOM pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyUserUI);
} else {
    applyUserUI();
}
