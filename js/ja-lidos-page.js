import { auth } from './firebase-config.js';

const container = document.getElementById('ja-li-container');
const emptyMsg = document.getElementById('empty-msg');

function getUserKey(){
    try { if(auth.currentUser && auth.currentUser.uid) return `user-${auth.currentUser.uid}`; } catch(e){}
    return 'guest';
}
function storageKey(){ return `${getUserKey()}::jaLi`; }
function loadList(){
    try { return JSON.parse(localStorage.getItem(storageKey())) || []; } catch(e){ return []; }
}
function esc(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function buildCard(b){
    const img = esc(b.img || 'imagens/sem-capa.png');
    return `
<article class="book-item" data-id="${esc(b.id)}" data-title="${esc(b.title)}">
    <div class="book-card"><img src="${img}" alt="${esc(b.title)}"></div>
    <div class="book-title">
        <p>${esc(b.title)}</p>
        <div class="book-actions">
            <button class="action-btn btn-quer-ler">Quero Ler</button>
            <button class="action-btn btn-ja-li">Já Li</button>
            <button class="action-btn btn-favorito">♥</button>
            <button class="action-btn btn-remove" data-book-id="${esc(b.id)}">Remover</button>
        </div>
    </div>
    <div class="book-action"><a class="action-link" href="vejamais.html?id=${encodeURIComponent(b.id)}">Veja mais</a></div>
</article>`;
}

function renderJaLidos(){
    if(!container) return;
    if(!auth.currentUser){
        container.innerHTML = `
            <div class="login-message">
                <h2>Faça login para ver seus livros lidos</h2>
                <p>Você precisa estar logado para acessar sua lista de livros já lidos.</p>
                <a href="/login.html" class="login-button">Fazer Login</a>
            </div>`;
        if(emptyMsg) emptyMsg.style.display='none';
        return;
    }
    const items = loadList();
    if(!items.length){
        container.innerHTML='';
        if(emptyMsg) emptyMsg.style.display='block';
        return;
    }
    if(emptyMsg) emptyMsg.style.display='none';
    container.innerHTML = items.map(buildCard).join('');
    setTimeout(()=>{ try{ window.__libraryActions.refreshAll(); }catch(e){} }, 60);
}

container?.addEventListener('click', ev => {
    const rem = ev.target.closest('.btn-remove');
    if(!rem) return;
    const id = rem.dataset.bookId;
    if(!id) return;
    let arr = loadList();
    arr = arr.filter(x => x.id !== id);
    localStorage.setItem(storageKey(), JSON.stringify(arr));
    renderJaLidos();
});

document.addEventListener('click', ev => {
    const btn = ev.target.closest && ev.target.closest('.btn-quer-ler, .btn-ja-li, .btn-favorito');
    if(!btn) return;
    if(container && container.contains(btn)){
        setTimeout(()=>{ renderJaLidos(); }, 160);
    }
});

document.addEventListener('DOMContentLoaded', renderJaLidos);
auth.onAuthStateChanged(()=> renderJaLidos());
window.__jaLiPage = { render: renderJaLidos };
