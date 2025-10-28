// js/user-info-global.js
import { auth } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

function ensureUserInfoExists() {
    // tenta encontrar #user-info, se não existir, cria um link no sidebar se houver .sidebar
    let el = document.getElementById('user-info');
    if (!el) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            // cria link consistente
            el = document.createElement('a');
            el.id = 'user-info';
            el.className = 'btn-login';
            el.href = './html/login.html'; // ajuste relativo se necessário
            sidebar.insertBefore(el, sidebar.firstElementChild?.nextSibling || sidebar.firstChild);
        }
    }
    return el;
}

const userInfo = ensureUserInfoExists();

if (userInfo) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const nome = user.displayName || (user.email ? user.email.split('@')[0] : 'Usuário');
            const foto = user.photoURL || './imagens/user.png';
            userInfo.innerHTML = `<img src="${foto}" alt="Avatar" style="width:30px;height:30px;border-radius:50%;margin-right:8px;"> <span>${nome}</span>`;
            // garante link para perfil (ajuste conforme estrutura)
            userInfo.setAttribute('href', '../html/perfil.html');
        } else {
            userInfo.innerHTML = `<img src="./imagens/user.png" alt="Ícone" style="width:22px;height:22px;margin-right:8px;"> <span>Cadastre-se</span>`;
            userInfo.setAttribute('href', '/Toca_da_Coruja/html/login.html');
        }
    });
} else {
    console.warn('user-info não pôde ser criado/encontrado');
}
